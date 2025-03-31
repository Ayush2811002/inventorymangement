import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";  // ✅ Import getAuth
import { getAnalytics, isSupported } from "firebase/analytics";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC3sPhr06WkDwGtVgQzMV1mK-e5ZSLaQRY",
  authDomain: "invoices-1a813.firebaseapp.com",
  databaseURL: "https://invoices-1a813-default-rtdb.firebaseio.com",
  projectId: "invoices-1a813",
  storageBucket: "invoices-1a813.firebasestorage.app",
  messagingSenderId: "87295492905",
  appId: "1:87295492905:web:51bdd976af755b66c9ed38",
  measurementId: "G-T3WNCFZZ44"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
export const db = getDatabase(app);
// ✅ Initialize Authentication
export const auth = getAuth(app);
// Initialize Analytics (only if supported)
let analytics;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) analytics = getAnalytics(app);
  });
}

export { app, analytics };
