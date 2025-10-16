import { useState, useMemo } from 'react';
import { View, TextInput, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import 'nativewind';
import '../../global.css';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();

  const isEmailValid = useMemo(() => /.+@.+\..+/.test(email.trim()), [email]);
  const isPasswordValid = useMemo(() => password.length >= 6, [password]);
  const canSubmit = useMemo(() => isEmailValid && isPasswordValid && !loading, [isEmailValid, isPasswordValid, loading]);

  const normalizeFirebaseError = (code?: string, message?: string) => {
    switch (code) {
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Invalid email or password.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Check your internet connection.';
      default:
        return message || 'Something went wrong. Please try again.';
    }
  };

  const ensureUserDocument = async (uid: string) => {
    const user = auth.currentUser;
    if (!user) return;
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      await updateDoc(userRef, { online: true, lastSeen: serverTimestamp(), email: user.email || '', displayName: user.displayName || '', photoURL: user.photoURL || '' });
    } else {
      await setDoc(userRef, {
        uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        lastSeen: serverTimestamp(),
        online: true,
      });
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const { user } = await signInWithEmailAndPassword(auth, email.trim(), password);
      await ensureUserDocument(user.uid);
      // Navigation is handled by auth-aware RootNavigator
    } catch (err: any) {
      setError(normalizeFirebaseError(err?.code, err?.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-gradient-to-br from-blue-100 to-purple-100">
      <View className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <Text className="text-3xl font-extrabold mb-6 text-center text-blue-700 tracking-wide">ChatApp Login</Text>
        <TextInput
          className="border-2 border-blue-200 focus:border-blue-500 p-4 mb-4 rounded-xl bg-gray-50 text-lg"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <View>
          <TextInput
            className="border-2 border-blue-200 focus:border-blue-500 p-4 mb-2 rounded-xl bg-gray-50 text-lg"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <View className="flex flex-row justify-end mb-2">
            <TouchableOpacity onPress={() => setShowPassword(v => !v)}>
              <Text className="text-blue-600 font-semibold">{showPassword ? 'Hide' : 'Show'} password</Text>
            </TouchableOpacity>
          </View>
        </View>
        {error ? (
          <Text className="text-red-500 mb-4 text-center">{error}</Text>
        ) : null}
        <View className="flex flex-row justify-between mb-2">
          <TouchableOpacity
            className="flex-1 mr-2 bg-blue-600 rounded-xl py-3"
            onPress={handleLogin}
            disabled={!canSubmit}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-center text-lg font-bold">Login</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 ml-2 bg-purple-600 rounded-xl py-3"
            onPress={() => navigation.navigate('Signup' as never)}
          >
            <Text className="text-white text-center text-lg font-bold">Sign Up</Text>
          </TouchableOpacity>
        </View>
        {!isEmailValid && email.length > 0 ? (
          <Text className="text-amber-600 text-sm text-center">Enter a valid email address.</Text>
        ) : null}
        {!isPasswordValid && password.length > 0 ? (
          <Text className="text-amber-600 text-sm text-center">Password must be at least 6 characters.</Text>
        ) : null}
      </View>
    </View>
  );
}