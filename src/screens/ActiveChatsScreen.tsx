import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useMemo, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, orderBy, query, where, doc, getDoc } from 'firebase/firestore';
import { useAtomValue, useSetAtom } from 'jotai';
import { selectedChatAtom, sessionUserAtom } from '../state/atoms';
import { useNavigation } from '@react-navigation/native';

export default function ActiveChatsScreen() {
  const sessionUser = useAtomValue(sessionUserAtom);
  const setSelected = useSetAtom(selectedChatAtom);
  const navigation = useNavigation();
  const [conversations, setConversations] = useState<any[]>([]);

  useEffect(() => {
    if (!sessionUser?.uid) return;
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', sessionUser.uid)
    );
    const unsub = onSnapshot(q, async (snap) => {
      const items = await Promise.all(
        snap.docs.map(async d => {
          const data: any = { id: d.id, ...d.data() };
          const otherId = (data.participants || []).find((id: string) => id !== sessionUser.uid);
          let otherName = otherId;
          if (otherId) {
            const u = await getDoc(doc(db, 'users', otherId));
            const ud: any = u.data();
            otherName = ud?.displayName || ud?.email || otherId;
          }
          return { ...data, otherId, otherName };
        })
      );
      items.sort((a, b) => (b.lastMessageAt?.toMillis?.() || 0) - (a.lastMessageAt?.toMillis?.() || 0));
      setConversations(items);
    });
    return unsub;
  }, [sessionUser?.uid]);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      className="bg-white rounded-xl shadow p-4 mb-2"
      onPress={() => {
        setSelected({ otherUserId: item.otherId });
        (navigation as any).navigate('Chat', { otherUserId: item.otherId });
      }}
    >
      <Text className="text-lg font-bold text-blue-700">{item.otherName}</Text>
      <Text className="text-gray-600" numberOfLines={1}>{item.lastMessage || ''}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-blue-50 to-purple-50">
      <View className="p-4">
        <Text className="text-2xl font-extrabold text-blue-700 mb-4">Chats</Text>
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </SafeAreaView>
  );
}


