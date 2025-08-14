import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth } from 'firebase/auth';
import { getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDwP0N_DGADoPOxYeaYeqJYkJTEajpol4I",
  authDomain: "unisol-7680e.firebaseapp.com",
  projectId: "unisol-7680e",
  storageBucket: "unisol-7680e.firebasestorage.app",
  messagingSenderId: "35239610553",
  appId: "1:35239610553:web:dca47d178fe96269103368",
  measurementId: "G-27ZZ49JEGE"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});