// services/firebase.ts
import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAZ-eZlFRsobvGR8YW5tg4wAIxZismCQww",
  authDomain: "magazin-9e912.firebaseapp.com",
  projectId: "magazin-9e912",
  storageBucket: "magazin-9e912.firebasestorage.app",
  messagingSenderId: "615398100752",
  appId: "1:615398100752:web:bd5f6782a9757e62c39f95"
};


// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);
const db: Firestore = getFirestore(app);
const auth: Auth = getAuth(app);

export { db, auth };