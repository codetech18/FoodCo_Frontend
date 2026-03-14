import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyABkyZWfoZPMx_uj31XA-5Lje6fNAwGwnk",
  authDomain: "foodco-8aa41.firebaseapp.com",
  projectId: "foodco-8aa41",
  storageBucket: "foodco-8aa41.firebasestorage.app",
  messagingSenderId: "996874694984",
  appId: "1:996874694984:web:bd86348a0eaa517bf0037d",
  measurementId: "G-QVR409698P",
};

const app = initializeApp(firebaseConfig);

export const db      = getFirestore(app);
export const auth    = getAuth(app);
export const storage = getStorage(app);
export default app;
