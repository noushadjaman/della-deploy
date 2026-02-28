// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC5KxJP_OCL3eazbkSoJmuWb3ISY6nuqOQ",
  authDomain: "dellabd-a6155.firebaseapp.com",
  projectId: "dellabd-a6155",
  storageBucket: "dellabd-a6155.firebasestorage.app",
  messagingSenderId: "642779997286",
  appId: "1:642779997286:web:ec8262cba68efd827879a7",
  measurementId: "G-54FTZTPZYS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export default app;
