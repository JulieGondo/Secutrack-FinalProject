<<<<<<< HEAD
# Secutrack

A modern security guard time tracking system with GPS location and facial recognition capabilities.

## Features

- Secure login system using Firebase Authentication
- Admin dashboard for managing guards and viewing attendance
- Guard portal for time-in/out with GPS location tracking
- Mock facial recognition system (can be replaced with actual implementation)
- Real-time attendance monitoring
- Modern and responsive UI

## Prerequisites

- Node.js (v14 or higher)
- Firebase account
- Modern web browser with geolocation support
- Webcam (for facial recognition)

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/secutrack.git
cd secutrack
```

2. Create a Firebase project and enable:
   - Authentication (Email/Password)
   - Firestore Database
   - Storage (if implementing actual facial recognition)

3. Update `firebase-config.js` with your Firebase project credentials:
```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-messaging-sender-id",
    appId: "your-app-id"
};
```

4. Start a local server (you can use any static file server):
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve
```

5. Open `http://localhost:8000` in your browser

## Project Structure

```
Secutrack/
│
├── index.html              # Login Page
├── admin.html              # Admin Dashboard
├── guard.html              # Guard Time-in/out
│
├── js/
│   ├── auth.js             # Firebase auth logic
│   ├── dtr.js              # GPS + time-in/out
│   └── face.js             # Mock facial recognition
│
├── css/
│   └── styles.css          # Styling
│
├── firebase-config.js      # Firebase setup
├── README.md               # Documentation
└── .gitignore
```

## Security Considerations

- All sensitive data is stored in Firebase
- GPS coordinates are required for time-in/out
- Facial recognition adds an extra layer of security
- HTTPS is required for geolocation API

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Firebase for backend services
- Modern web APIs for geolocation and camera access 
=======
# Secutrack-FinalProject
Final Project for IT Elective 1
>>>>>>> 528df195a0061473618fe845fd2bb17c4db2f335
