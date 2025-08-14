// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "internshiptrack-iru7j",
  appId: "1:1048720408743:web:58b1531d3718caa97adb82",
  storageBucket: "internshiptrack-iru7j.firebasestorage.app",
  apiKey: "AIzaSyBIiLEPGIZAqO-JK9o_WK6v-1IjadVJpzM",
  authDomain: "internshiptrack-iru7j.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "1048720408743"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
