// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDBdn8Mspc1j6Pq7ufhtqvArT0UdA5BmIQ",
  authDomain: "myvision-analivia-isadora.firebaseapp.com",
  projectId: "myvision-analivia-isadora",
  storageBucket: "myvision-analivia-isadora.firebasestorage.app",
  messagingSenderId: "30311720",
  appId: "1:30311720:web:dfa004e45aa8b5bd287c1d",
  measurementId: "G-X973C2Z9TR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);