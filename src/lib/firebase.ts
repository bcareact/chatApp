// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDUpgs8t_6304LHg1WAwaGHJ8k4GmLEvlc",
  authDomain: "chatapp-7a737.firebaseapp.com",
  databaseURL: "https://chatapp-7a737-default-rtdb.firebaseio.com",
  projectId: "chatapp-7a737",
  storageBucket: "chatapp-7a737.firebasestorage.app",
  messagingSenderId: "309213919641",
  appId: "1:309213919641:web:556a95c8027367e8c37b08",
  measurementId: "G-Y1PC4KZF1S"
};

const app = initializeApp(firebaseConfig);

// Ensure React Native persistence so sessions survive app restarts
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
export const rtdb = getDatabase(app);

