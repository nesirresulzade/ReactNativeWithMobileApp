// Firebase SDK-larını import et
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyBEHo3xZwrqkPB3B6QPy8mUYHk8759bvf8",
    authDomain: "firstmobileapp-b3f56.firebaseapp.com",
    projectId: "firstmobileapp-b3f56",
    storageBucket: "firstmobileapp-b3f56.firebasestorage.app",
    messagingSenderId: "868651137249",
    appId: "1:868651137249:web:1cfd74054890f69a32dfa0"
};

// Firebase-i initialize et
const app = initializeApp(firebaseConfig);

// Auth servisini AsyncStorage persistence ilə initialize et
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

// Firestore çıxart
export const db = getFirestore(app);

export default app;
