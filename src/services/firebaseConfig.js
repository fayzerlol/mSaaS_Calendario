// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCJuwpZ6bCYP1OakRWHLH0X_ZCRXToWLjc",
  authDomain: "msaascal.firebaseapp.com",
  projectId: "msaascal",
      storageBucket: "msaascal.appspot.com",
  messagingSenderId: "208111425167",
  appId: "1:208111425167:web:a27e5ad1bc158d427fc2fa",
  measurementId: "G-MPZ5Q9W4FY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
