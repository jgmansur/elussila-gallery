import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

function getEnv(name: string, fallback: string): string {
  const value = process.env[name];
  if (value) return value;

  if (typeof window === "undefined") {
    console.warn(`[firebase] Missing ${name}. Using build fallback value.`);
  }

  return fallback;
}

const firebaseConfig = {
  apiKey: getEnv("NEXT_PUBLIC_FIREBASE_API_KEY", "AIzaSyAZtWRuTkH15uGh1usCGuIOedfoz9DjNR8"),
  authDomain: getEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", "elussila-gallery-2026.firebaseapp.com"),
  projectId: getEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID", "elussila-gallery-2026"),
  storageBucket: getEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET", "elussila-gallery-2026.firebasestorage.app"),
  messagingSenderId: getEnv("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID", "249350145101"),
  appId: getEnv("NEXT_PUBLIC_FIREBASE_APP_ID", "1:249350145101:web:8bc8548910264df463c804"),
};

// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, storage, googleProvider };
