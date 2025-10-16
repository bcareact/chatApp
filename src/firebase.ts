// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

