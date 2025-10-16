import { useMemo, useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import 'nativewind';
import '../../global.css';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();

  const isEmailValid = useMemo(() => /.+@.+\..+/.test(email.trim()), [email]);
  const isPasswordValid = useMemo(() => password.length >= 6, [password]);
  const isDisplayNameValid = useMemo(() => displayName.trim().length >= 2, [displayName]);
  const canSubmit = useMemo(() => isEmailValid && isPasswordValid && isDisplayNameValid && !loading, [isEmailValid, isPasswordValid, isDisplayNameValid, loading]);

  const normalizeFirebaseError = (code?: string, message?: string) => {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'This email is already in use.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/network-request-failed':
        return 'Network error. Check your internet connection.';
      default:
        return message || 'Something went wrong. Please try again.';
    }
  };

  const handleSignup = async () => {
    setLoading(true);
    setError('');
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(user, { displayName: displayName.trim() });
      // Store user data in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: displayName.trim(),
        photoURL: user.photoURL || '',
        lastSeen: serverTimestamp(),
        online: true,
      });
      // Navigation handled by auth-aware RootNavigator
    } catch (err: any) {
      setError(normalizeFirebaseError(err?.code, err?.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-gradient-to-br from-purple-100 to-blue-100">
      <View className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <Text className="text-3xl font-extrabold mb-6 text-center text-purple-700 tracking-wide">Create Account</Text>
        <TextInput
          className="border-2 border-purple-200 focus:border-purple-500 p-4 mb-4 rounded-xl bg-gray-50 text-lg"
          placeholder="Display Name"
          value={displayName}
          onChangeText={setDisplayName}
          autoCapitalize="words"
        />
        <TextInput
          className="border-2 border-purple-200 focus:border-purple-500 p-4 mb-4 rounded-xl bg-gray-50 text-lg"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <View>
          <TextInput
            className="border-2 border-purple-200 focus:border-purple-500 p-4 mb-2 rounded-xl bg-gray-50 text-lg"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <View className="flex flex-row justify-end mb-2">
            <TouchableOpacity onPress={() => setShowPassword(v => !v)}>
              <Text className="text-purple-600 font-semibold">{showPassword ? 'Hide' : 'Show'} password</Text>
            </TouchableOpacity>
          </View>
        </View>
        {error ? (
          <Text className="text-red-500 mb-4 text-center">{error}</Text>
        ) : null}
        <View className="flex flex-row justify-between mb-2">
          <TouchableOpacity
            className="flex-1 mr-2 bg-purple-600 rounded-xl py-3"
            onPress={handleSignup}
            disabled={!canSubmit}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-center text-lg font-bold">Sign Up</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 ml-2 bg-blue-600 rounded-xl py-3"
            onPress={() => navigation.navigate('Login' as never)}
          >
            <Text className="text-white text-center text-lg font-bold">Back to Login</Text>
          </TouchableOpacity>
        </View>
        {!isDisplayNameValid && displayName.length > 0 ? (
          <Text className="text-amber-600 text-sm text-center">Display name should be at least 2 characters.</Text>
        ) : null}
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