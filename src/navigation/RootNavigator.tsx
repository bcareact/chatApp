import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import UserListScreen from '../screens/UserListScreen';
import ChatScreen from '../screens/ChatScreen';

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

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (initializing) setInitializing(false);
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
            <Stack.Screen name="Users" component={UserListScreen} options={{ headerShown: false }} />
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