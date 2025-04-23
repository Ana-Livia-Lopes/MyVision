// firebase.config.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

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

export { db };
