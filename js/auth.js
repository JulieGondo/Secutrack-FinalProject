// Firebase Authentication Logic
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.x.x/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/10.x.x/firebase-auth.js';

// Initialize Firebase Auth
const auth = getAuth();

// Login function
export async function login(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        return user;
    } catch (error) {
        throw error;
    }
}

// Logout function
export async function logout() {
    try {
        await signOut(auth);
    } catch (error) {
        throw error;
    }
}

// Check authentication state
export function onAuthStateChanged(callback) {
    return auth.onAuthStateChanged(callback);
} 