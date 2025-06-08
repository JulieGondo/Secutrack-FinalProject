// auth.js

import { auth, db, isOffline } from '../firebase-config.js';
import { signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js';

export async function login(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Check if Firestore is online
        if (!db.app._offline) {
            console.log("Firestore is online. Proceeding with Firestore operations.");
            // Fetch user data from Firestore
            const userDoc = await getDoc(doc(db, "guards", user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                const role = userData.role;

                if (role === "admin") {
                    window.location.href = "admin.html"; // Redirect to admin page
                } else if (role === "guard") {
                    window.location.href = "guard.html"; // Redirect to guard page
                } else {
                    alert("Unauthorized access.");
                    await auth.signOut();
                }
            } else {
                alert("User data not found.");
                await auth.signOut();
            }
        } else {
            alert("Firestore is offline. Please check your internet connection.");
        }

    } catch (error) {
        console.error("Login error:", error.message);
        alert("Login failed: " + error.message);
    }
}