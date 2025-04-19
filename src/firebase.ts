import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Read Firebase config from environment variables
// Vite exposes variables prefixed with VITE_ to the client-side code
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Basic check to ensure variables are loaded
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error("Firebase environment variables are not loaded correctly. Make sure VITE_ prefixes are used in your .env file.");
  // Optionally throw an error or handle this case appropriately
  // throw new Error("Firebase config is missing!");
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export { db }; // Export the Firestore instance 