import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useSetAtom } from 'jotai';
import { sessionUserAtom } from '../state/atoms';
import { auth, rtdb, db } from '../lib/firebase';
import { onDisconnect, ref, set } from 'firebase/database';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import UserListScreen from '../screens/UserListScreen';
import ChatScreen from '../screens/ChatScreen';
import Tabs from './Tabs';

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Users: undefined;
  Chat: { otherUserId?: string } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const [initializing, setInitializing] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const setSessionUser = useSetAtom(sessionUserAtom);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setSessionUser(user ? { uid: user.uid, email: user.email, displayName: user.displayName, photoURL: user.photoURL } : null);
      if (initializing) setInitializing(false);
      // Presence via Realtime Database + mirror to Firestore
      if (user) {
        const userStatusRef = ref(rtdb, '/status/' + user.uid);
        set(userStatusRef, { state: 'online', lastChanged: Date.now() }).catch(() => { });
        onDisconnect(userStatusRef).set({ state: 'offline', lastChanged: Date.now() }).catch(() => { });
        updateDoc(doc(db, 'users', user.uid), { online: true, lastSeen: serverTimestamp() }).catch(() => { });
      }
    });
    return unsub;
  }, [initializing]);

  if (initializing) {
    return null; // could render a splash screen here
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={currentUser ? 'Users' : 'Login'}>
        {currentUser ? (
          <>
            <Stack.Screen name="Users" component={Tabs} options={{ headerShown: false }} />
            <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}