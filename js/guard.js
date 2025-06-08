// Guard Portal Functionality
import { getFirestore, collection, addDoc, query, where, getDocs, orderBy, limit } from 'https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js';
import { FaceRecognition } from './face.js';

const db = getFirestore();
const auth = getAuth();
const faceRecognition = new FaceRecognition();

// DOM Elements
const timeInBtn = document.getElementById('timeInBtn');
const timeOutBtn = document.getElementById('timeOutBtn');
const statusText = document.getElementById('statusText');
const statusDot = document.getElementById('statusDot');
const lastAction = document.getElementById('lastAction');
const gpsStatus = document.getElementById('gpsStatus');
const faceStatus = document.getElementById('faceStatus');
const faceModal = document.getElementById('faceModal');
const camera = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const verificationStatus = document.getElementById('verificationStatus');
const retryBtn = document.getElementById('retryBtn');
const cancelBtn = document.getElementById('cancelBtn');
const loadingOverlay = document.getElementById('loadingOverlay');
const loadingText = document.getElementById('loadingText');

let currentUser = null;
let currentLocation = null;
let map = null;
let marker = null;

// Initialize Guard Portal
document.addEventListener('DOMContentLoaded', async () => {
    await initializeGuardPortal();
    setupEventListeners();
    initializeMap();
    startLocationTracking();
});

// Initialize Guard Portal
async function initializeGuardPortal() {
    try {
        await faceRecognition.initialize();
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                currentUser = user;
                document.getElementById('guardName').textContent = user.displayName || user.email;
                await loadTodayAttendance();
                updateStatus();
            } else {
                window.location.href = 'index.html';
            }
        });
    } catch (error) {
        console.error('Error initializing guard portal:', error);
        showError('Failed to initialize guard portal');
    }
}

// Setup Event Listeners
function setupEventListeners() {
    timeInBtn.addEventListener('click', handleTimeIn);
    timeOutBtn.addEventListener('click', handleTimeOut);
    retryBtn.addEventListener('click', startFaceVerification);
    cancelBtn.addEventListener('click', () => {
        faceModal.style.display = 'none';
        stopCamera();
    });
}

// Initialize Google Maps
function initializeMap() {
    const mapContainer = document.getElementById('locationMap');
    map = new google.maps.Map(mapContainer, {
        zoom: 15,
        center: { lat: 0, lng: 0 },
        mapTypeControl: false,
        streetViewControl: false
    });
}

// Start Location Tracking
function startLocationTracking() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            handleLocationSuccess,
            handleLocationError,
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    } else {
        gpsStatus.textContent = 'GPS: Not supported';
    }
}

// Handle Location Success
function handleLocationSuccess(position) {
    currentLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
    };

    // Update UI
    document.getElementById('latitude').textContent = currentLocation.latitude.toFixed(6);
    document.getElementById('longitude').textContent = currentLocation.longitude.toFixed(6);
    document.getElementById('accuracy').textContent = Math.round(currentLocation.accuracy);
    gpsStatus.textContent = 'GPS: Active';

    // Update Map
    const pos = { lat: currentLocation.latitude, lng: currentLocation.longitude };
    if (marker) {
        marker.setPosition(pos);
    } else {
        marker = new google.maps.Marker({
            position: pos,
            map: map,
            title: 'Current Location'
        });
    }
    map.setCenter(pos);
}

// Handle Location Error
function handleLocationError(error) {
    console.error('Location error:', error);
    gpsStatus.textContent = 'GPS: Error';
    showError('Failed to get location: ' + error.message);
}

// Handle Time In
async function handleTimeIn() {
    if (!currentLocation) {
        showError('Please wait for GPS signal');
        return;
    }

    try {
        showLoading('Starting face verification...');
        const verified = await startFaceVerification();
        if (verified) {
            await recordTimeIn();
            updateStatus();
            await loadTodayAttendance();
        }
    } catch (error) {
        console.error('Time in error:', error);
        showError('Failed to record time in');
    } finally {
        hideLoading();
    }
}

// Handle Time Out
async function handleTimeOut() {
    if (!currentLocation) {
        showError('Please wait for GPS signal');
        return;
    }

    try {
        showLoading('Starting face verification...');
        const verified = await startFaceVerification();
        if (verified) {
            await recordTimeOut();
            updateStatus();
            await loadTodayAttendance();
        }
    } catch (error) {
        console.error('Time out error:', error);
        showError('Failed to record time out');
    } finally {
        hideLoading();
    }
}

// Start Face Verification
async function startFaceVerification() {
    return new Promise(async (resolve) => {
        try {
            faceModal.style.display = 'block';
            await startCamera();

            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            camera.srcObject = stream;

            const verificationResult = await faceRecognition.verifyFace();
            
            if (verificationResult.success) {
                verificationStatus.textContent = 'Verification successful!';
                setTimeout(() => {
                    stopCamera();
                    faceModal.style.display = 'none';
                    resolve(true);
                }, 1000);
            } else {
                verificationStatus.textContent = 'Verification failed. Please try again.';
                retryBtn.style.display = 'block';
                resolve(false);
            }
        } catch (error) {
            console.error('Face verification error:', error);
            verificationStatus.textContent = 'Error: ' + error.message;
            retryBtn.style.display = 'block';
            resolve(false);
        }
    });
}

// Record Time In
async function recordTimeIn() {
    const timestamp = new Date();
    await addDoc(collection(db, 'attendance'), {
        userId: currentUser.uid,
        type: 'timeIn',
        timestamp,
        location: currentLocation,
        verified: true
    });

    lastAction.textContent = `Time In: ${timestamp.toLocaleTimeString()}`;
}

// Record Time Out
async function recordTimeOut() {
    const timestamp = new Date();
    await addDoc(collection(db, 'attendance'), {
        userId: currentUser.uid,
        type: 'timeOut',
        timestamp,
        location: currentLocation,
        verified: true
    });

    lastAction.textContent = `Time Out: ${timestamp.toLocaleTimeString()}`;
}

// Load Today's Attendance
async function loadTodayAttendance() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const q = query(
            collection(db, 'attendance'),
            where('userId', '==', currentUser.uid),
            where('timestamp', '>=', today),
            orderBy('timestamp', 'asc')
        );

        const snapshot = await getDocs(q);
        let timeIn = null;
        let timeOut = null;

        snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.type === 'timeIn') {
                timeIn = data;
            } else if (data.type === 'timeOut') {
                timeOut = data;
            }
        });

        // Update UI
        if (timeIn) {
            document.getElementById('timeInTime').textContent = new Date(timeIn.timestamp).toLocaleTimeString();
            document.getElementById('timeInLocation').textContent = 
                `${timeIn.location.latitude.toFixed(4)}, ${timeIn.location.longitude.toFixed(4)}`;
        }

        if (timeOut) {
            document.getElementById('timeOutTime').textContent = new Date(timeOut.timestamp).toLocaleTimeString();
            document.getElementById('timeOutLocation').textContent = 
                `${timeOut.location.latitude.toFixed(4)}, ${timeOut.location.longitude.toFixed(4)}`;
        }
    } catch (error) {
        console.error('Error loading attendance:', error);
        showError('Failed to load attendance data');
    }
}

// Update Status
async function updateStatus() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const q = query(
            collection(db, 'attendance'),
            where('userId', '==', currentUser.uid),
            where('timestamp', '>=', today),
            orderBy('timestamp', 'desc'),
            limit(1)
        );

        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            const lastRecord = snapshot.docs[0].data();
            if (lastRecord.type === 'timeIn') {
                statusText.textContent = 'On Duty';
                statusDot.className = 'status-dot on-duty';
                timeInBtn.disabled = true;
                timeOutBtn.disabled = false;
            } else {
                statusText.textContent = 'Off Duty';
                statusDot.className = 'status-dot off-duty';
                timeInBtn.disabled = false;
                timeOutBtn.disabled = true;
            }
        } else {
            statusText.textContent = 'Not Clocked In';
            statusDot.className = 'status-dot off-duty';
            timeInBtn.disabled = false;
            timeOutBtn.disabled = true;
        }
    } catch (error) {
        console.error('Error updating status:', error);
    }
}

// Utility Functions
function startCamera() {
    return navigator.mediaDevices.getUserMedia({ video: true });
}

function stopCamera() {
    if (camera.srcObject) {
        camera.srcObject.getTracks().forEach(track => track.stop());
        camera.srcObject = null;
    }
}

function showLoading(message) {
    loadingText.textContent = message;
    loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    loadingOverlay.style.display = 'none';
}

function showError(message) {
    alert(message); // Replace with a better UI notification
} 