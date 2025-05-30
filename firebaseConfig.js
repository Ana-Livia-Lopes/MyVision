// Ana Lívia dos Santos Lopes nº1 DS
// Isadora Gomes da Silva nº 9

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {   
  apiKey: "AIzaSyDBdn8Mspc1j6Pq7ufhtqvArT0UdA5BmIQ",
  authDomain: "myvision-analivia-isadora.firebaseapp.com",
  projectId: "myvision-analivia-isadora",
  storageBucket: "myvision-analivia-isadora.appspot.com",
  messagingSenderId: "30311720",
  appId: "1:30311720:web:dfa004e45aa8b5bd287c1d",
  measurementId: "G-X973C2Z9TR" 
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, collection, getDocs, addDoc, Timestamp};

