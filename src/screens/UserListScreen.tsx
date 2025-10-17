// ...existing code...
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { auth, db, rtdb } from '../lib/firebase';
import { collection, doc, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useAtomValue, useSetAtom } from 'jotai';
import { selectedChatAtom, sessionUserAtom } from '../state/atoms';
import { onValue, ref } from 'firebase/database';

export default function UserListScreen() {
  const navigation = useNavigation();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const setSelectedChat = useSetAtom(selectedChatAtom);
  const sessionUser = useAtomValue(sessionUserAtom);
  const [presence, setPresence] = useState<Record<string, { state: string; lastChanged: number }>>({});

  // Header is hidden; moving Logout into screen content below

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => doc.data()));
      setLoading(false);
    });
    return unsub;
  }, []);

  // Subscribe to presence in RTDB for all users (lightweight for small lists)
  useEffect(() => {
    const offs: Array<() => void> = [];
    users.forEach((u) => {
      const r = ref(rtdb, `/status/${ u.uid }`);
      const handler = onValue(r, (snap) => {
        const val: any = snap.val();
        setPresence((prev) => ({ ...prev, [u.uid]: val || { state: 'offline', lastChanged: 0 } }));
      });
      offs.push(() => handler());
    });
    return () => offs.forEach((off) => off());
  }, [users]);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      className="bg-white rounded-xl shadow p-4 mb-2 flex-row items-center"
      onPress={() => {
        setSelectedChat({ otherUserId: item.uid });
        navigation.navigate('Chat', { otherUserId: item.uid });
      }}
    >
      <View className="flex-1">
        <Text className="text-lg font-bold text-blue-700">{item.displayName || item.email}</Text>
        <Text className="text-sm text-gray-500">{presence[item.uid]?.state === 'online' ? 'Online' : 'Offline'}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-blue-50 to-purple-50">
      <View className="p-4">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-extrabold text-blue-700">Users</Text>
          <TouchableOpacity
            className="px-3 py-2 bg-white rounded-lg shadow"
            onPress={async () => {
              const current = auth.currentUser;
              if (current) {
                try {
                  await updateDoc(doc(db, 'users', current.uid), {
                    online: false,
                    lastSeen: serverTimestamp(),
                  });
                } catch { }
              }
              try {
                await signOut(auth);
              } catch { }
            }}
          >
            <Text className="text-blue-600 font-semibold">Logout</Text>
          </TouchableOpacity>
        </View>
        {loading ? (
          <ActivityIndicator size="large" color="#2563EB" />
        ) : (
          <FlatList
            data={users.filter(u => u.uid !== sessionUser?.uid)}
            keyExtractor={item => item.uid}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

