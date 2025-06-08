// firebase-config.js

import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js';  
import { getFirestore } from 'https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js'; 

const firebaseConfig = {
    apiKey: "AIzaSyB9SuLxER2w9hxXOHDuwqNchA4YU6TKqzU",
    authDomain: "secutrack-c7e3d.firebaseapp.com",
    projectId: "ecutrack-c7e3d",
    storageBucket: "secutrack-c7e3d.firebasestorage.app",
    messagingSenderId: "889404562189",
    appId: "1:889404562189:web:7344115287eb2647512e44"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log("Firestore initialized:", db);
console.log("Is browser offline?", !navigator.onLine);
console.log("firebase-config.js loaded successfully");

export const isOffline = () => !navigator.onLine;
export { app, auth, db };