// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDwP0N_DGADoPOxYeaYeqJYkJTEajpol4I",
  authDomain: "unisol-7680e.firebaseapp.com",
  projectId: "unisol-7680e",
  storageBucket: "unisol-7680e.firebasestorage.app",
  messagingSenderId: "35239610553",
  appId: "1:35239610553:web:dca47d178fe96269103368",
  measurementId: "G-27ZZ49JEGE"
};

// Initialize Firebase
 const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);