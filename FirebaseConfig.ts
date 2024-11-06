import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCiko_NY6NmebcAiauXFMZXO6Rg_fjcNmg",
  authDomain: "disctrac-9911c.firebaseapp.com",
  projectId: "disctrac-9911c",
  storageBucket: "disctrac-9911c.firebasestorage.app",
  messagingSenderId: "275579281927",
  appId: "1:275579281927:web:997947b4b8431a2d9780a2"
};

export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIREBASE_DB = getFirestore(FIREBASE_APP);