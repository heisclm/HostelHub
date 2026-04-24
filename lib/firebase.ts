import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Initialize Firebase SDK
// Attempt to load from environment variables first (Preferred for Vercel/Production)
const envConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Fallback to local config file if env vars are missing (for legacy or AI Studio execution)
let firebaseConfig = envConfig;
if (!envConfig.apiKey) {
  try {
    // Determine path dynamically to prevent webpack from statically complaining if the file is missing
    const configName = '../firebase-config.json';
    firebaseConfig = require(`${configName}`);
  } catch (e) {
    console.error("Firebase config not found. Please provide NEXT_PUBLIC_FIREBASE_* env vars or firebase-config.json");
  }
}

// We use getApps().length to prevent re-initializing the app during hot reloads in Next.js
const app = !getApps().length && firebaseConfig?.apiKey ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with the specific database ID if provided in the config
export const db = getFirestore(app, (firebaseConfig as any)?.firestoreDatabaseId || undefined);
export const auth = getAuth(app);
export const storage = getStorage(app);
