import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBVMosrmaUhW8k8KB7Pg5sJAQMPw9IBmm4",
  authDomain: "vectiq-timesheeting.firebaseapp.com",
  projectId: "vectiq-timesheeting",
  storageBucket: "vectiq-timesheeting.firebasestorage.app",
  messagingSenderId: "563432118666",
  appId: "1:563432118666:web:752d2998f3ddfb0dc45073",
  measurementId: "G-97HHJR4V2M"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Connect to emulators in development
if (import.meta.env.DEV) {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
}