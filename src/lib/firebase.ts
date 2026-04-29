import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDo4EEVBoGRggkt4MpNB_JaRfsle_GQw5Y",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "gym-app-olli.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "gym-app-olli",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "gym-app-olli.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "312237311667",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:312237311667:web:c51ca4b5e4debaaf0692c6",
};

// Check if config is present (at least the API key)
const isConfigValid = !!firebaseConfig.apiKey;

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

if (isConfigValid) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
} else {
  const missing = Object.entries(firebaseConfig)
    .filter(([_, v]) => !v)
    .map(([k]) => k);
  const availableKeys = Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC_FIREBASE'));
  console.warn('Firebase configuration is missing. Missing:', missing, 'Available on client:', availableKeys);
}

export { auth, db };

