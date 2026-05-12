// firebase.js - Apne React project mein src/ folder mein rakho

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBkfu9AVQ7n0bhpRr-2MfwlVNxTpYx3ld0",
  authDomain: "chhat-app-4aa91.firebaseapp.com",
  projectId: "chhat-app-4aa91",
  storageBucket: "chhat-app-4aa91.firebasestorage.app",
  messagingSenderId: "33595430475",
  appId: "1:33595430475:web:2a437f5690d1f7d09d1fce",
  measurementId: "G-16QKLJBCXE"
};

// Firebase initialize karo
const app = initializeApp(firebaseConfig);

// Auth aur Providers export karo
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
export const storage = getStorage(app);

export default app;