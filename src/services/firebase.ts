import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "momentum-tracker.firebaseapp.com",
  projectId: "momentum-tracker",
  storageBucket: "momentum-tracker.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Note: In a real app, these would be in .env
// For this demo, we assume the user will configure their own Firebase project
// if they want to persist data beyond the session.
// We'll provide a mock implementation if Firebase isn't configured, 
// but the prompt asked for REAL integration.

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
