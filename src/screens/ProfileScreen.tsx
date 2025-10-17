import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAtom } from 'jotai';
import { sessionUserAtom } from '../state/atoms';
import { useState } from 'react';
import { auth, db } from '../lib/firebase';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';

export default function ProfileScreen() {
  const [sessionUser, setSessionUser] = useAtom(sessionUserAtom);
  const [displayName, setDisplayName] = useState(sessionUser?.displayName || '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!auth.currentUser) return;
    setSaving(true);
    try {
      await updateProfile(auth.currentUser, { displayName: displayName.trim() });
      await updateDoc(doc(db, 'users', auth.currentUser.uid), { displayName: displayName.trim() });
      setSessionUser(prev => prev ? { ...prev, displayName: displayName.trim() } : prev);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-blue-50 to-purple-50">
      <View className="p-4">
        <Text className="text-2xl font-extrabold text-blue-700 mb-4">Profile</Text>
        <Text className="text-gray-600 mb-2">Display Name</Text>
        <TextInput
          className="border border-gray-300 rounded-xl px-3 py-2 bg-white"
          value={displayName}
          onChangeText={setDisplayName}
        />
        <TouchableOpacity className="bg-blue-600 rounded-xl px-4 py-3 mt-4" onPress={save} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-semibold text-center">Save</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}


