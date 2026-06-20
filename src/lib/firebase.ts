import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, setLogLevel, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

setLogLevel('silent');

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC-y16RyMOBx8v51HOqEjM6V1uEuxbP-6M",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "the-english-institute.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "the-english-institute",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "the-english-institute.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "292163687236",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:292163687236:web:424d89276ab8be9116bd11",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-91FC6DEF74"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  experimentalAutoDetectLongPolling: true
});
export const storage = getStorage(app);
