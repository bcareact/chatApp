import { View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAtomValue, useSetAtom } from 'jotai';
import { selectedChatAtom, sessionUserAtom, typingAtom, readStateAtom } from '../state/atoms';
import { useEffect, useMemo, useRef, useState } from 'react';
import { db } from '../lib/firebase';
import { addDoc, collection, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';

export default function ChatScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const sessionUser = useAtomValue(sessionUserAtom);
  const selectedChat = useAtomValue(selectedChatAtom);
  const setTyping = useSetAtom(typingAtom);
  const setRead = useSetAtom(readStateAtom);
  const otherUserId = route.params?.otherUserId || selectedChat.otherUserId;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const listRef = useRef<FlatList>(null);
  const [otherUserName, setOtherUserName] = useState('');
  const [opponentTyping, setOpponentTyping] = useState(false);

  const conversationId = useMemo(() => {
    if (!sessionUser?.uid || !otherUserId) return null;
    return [sessionUser.uid, otherUserId].sort().join('_');
  }, [sessionUser?.uid, otherUserId]);

  useEffect(() => {
    if (!conversationId) return;
    const q = query(collection(db, 'conversations', conversationId, 'messages'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMessages(data as any[]);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 0);
      // Mark last message as read
      const last = data[data.length - 1];
      if (last && last.senderId !== sessionUser?.uid) {
        setRead(prev => ({ ...prev, [otherUserId!]: last.createdAt?.toMillis?.() || Date.now() }));
      }
    });
    return unsub;
  }, [conversationId]);

  // Fetch opponent display name
  useEffect(() => {
    const load = async () => {
      if (!otherUserId) return;
      const snap = await getDoc(doc(db, 'users', otherUserId));
      const d: any = snap.data();
      setOtherUserName(d?.displayName || d?.email || otherUserId);
    };
    load();
  }, [otherUserId]);

  // Listen to typing indicator in conversation doc
  useEffect(() => {
    if (!conversationId || !sessionUser?.uid) return;
    const unsub = onSnapshot(doc(db, 'conversations', conversationId), (d) => {
      const data: any = d.data();
      if (!data) return;
      const key = `typing_${ otherUserId }`;
      setOpponentTyping(!!data[key]);
    });
    return unsub;
  }, [conversationId, sessionUser?.uid, otherUserId]);

  const sendMessage = async () => {
    const text = message.trim();
    if (!text || !conversationId || !sessionUser?.uid) return;
    setMessage('');
    await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
      text,
      senderId: sessionUser.uid,
      receiverId: otherUserId,
      createdAt: serverTimestamp(),
      readBy: { [sessionUser.uid]: true },
    });
    // Upsert conversation metadata
    await setDoc(doc(db, 'conversations', conversationId), {
      participants: [sessionUser.uid, otherUserId],
      lastMessage: text,
      lastMessageAt: serverTimestamp(),
    }, { merge: true });
    // clear typing
    await updateDoc(doc(db, 'conversations', conversationId), { [`typing_${ sessionUser.uid }`]: false }).catch(() => { });
  };

  const onTyping = (value: string) => {
    setMessage(value);
    if (otherUserId) setTyping(prev => ({ ...prev, [otherUserId]: value.length > 0 }));
    if (conversationId && sessionUser?.uid) {
      updateDoc(doc(db, 'conversations', conversationId), { [`typing_${ sessionUser.uid }`]: value.length > 0 }).catch(() => { });
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isMine = item.senderId === sessionUser?.uid;
    return (
      <View className={`max-w-[80%] rounded-2xl px-4 py-2 mb-2 ${ isMine ? 'self-end bg-blue-600' : 'self-start bg-gray-200' }`}>
        <Text className={`${ isMine ? 'text-white' : 'text-gray-900' }`}>{item.text}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header with opponent name */}
      <View className="px-4 py-3 border-b border-gray-200 bg-white">
        <Text className="text-lg font-bold">{otherUserName || 'Chat'}</Text>
        {opponentTyping ? <Text className="text-xs text-amber-600 mt-1">Typing...</Text> : null}
      </View>
      <View className="flex-1 p-3">
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: 8 }}
        />
      </View>
      <View className="flex-row items-center p-3 border-t border-gray-200 bg-white">
        <TextInput
          className="flex-1 border border-gray-300 rounded-xl px-3 py-2 mr-2"
          placeholder="Type a message"
          value={message}
          onChangeText={onTyping}
          onSubmitEditing={sendMessage}
          returnKeyType="send"
        />
        <TouchableOpacity
          className="bg-blue-600 px-4 py-2 rounded-xl"
          onPress={sendMessage}
        >
          <Text className="text-white font-semibold">Send</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

