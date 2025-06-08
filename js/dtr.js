// DTR (Daily Time Record) Logic
import { getFirestore, collection, addDoc, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js';

const db = getFirestore();

// Get current location
async function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by your browser'));
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
            },
            (error) => {
                reject(error);
            }
        );
    });
}

// Record time in/out
export async function recordTimeInOut(userId, type) {
    try {
        const location = await getCurrentLocation();
        const timestamp = new Date();
        
        await addDoc(collection(db, 'attendance'), {
            userId,
            type, // 'timeIn' or 'timeOut'
            timestamp,
            location,
            verified: false // Will be set to true after facial recognition
        });
        
        return true;
    } catch (error) {
        throw error;
    }
}

// Get today's attendance
export async function getTodayAttendance(userId) {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const q = query(
            collection(db, 'attendance'),
            where('userId', '==', userId),
            where('timestamp', '>=', today)
        );
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw error;
    }
} 