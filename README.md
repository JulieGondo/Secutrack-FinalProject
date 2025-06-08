# Secutrack - Security Guard Time Tracking System

Secutrack is a modern web-based time tracking system designed specifically for security guards. It combines GPS location tracking and facial recognition to ensure accurate and secure attendance monitoring.

## 🌟 Key Features

- **Secure Authentication**
  - Firebase-based user authentication
  - Role-based access (Admin/Guard)
  - Secure session management

- **Guard Portal**
  - Time-in/out functionality
  - GPS location tracking
  - Facial recognition verification
  - Real-time status updates
  - Daily attendance history

- **Admin Dashboard**
  - Guard management
  - Attendance monitoring
  - Real-time status tracking
  - Historical data access

## 🛠️ Technical Stack

- **Frontend**
  - HTML5
  - CSS3 (Modern styling with CSS variables)
  - Vanilla JavaScript (ES6+)

- **Backend**
  - Firebase Authentication
  - Firebase Firestore
  - Geolocation API
  - WebRTC (for facial recognition)

## 📋 Prerequisites

- Modern web browser with:
  - Geolocation support
  - Camera access (for facial recognition)
  - JavaScript enabled
- Firebase account
- Internet connection

## 🚀 Getting Started

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/secutrack.git
   cd secutrack
   ```

2. **Firebase Setup**
   - Create a new Firebase project
   - Enable Authentication (Email/Password)
   - Set up Firestore Database
   - Update `firebase-config.js` with your credentials:
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

3. **Run the Application**
   ```bash
   # Using Python
   python -m http.server 8000

   # Or using Node.js
   npx serve
   ```

4. **Access the Application**
   - Open `http://localhost:8000` in your browser
   - Login with your credentials

## 📁 Project Structure

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
└── .gitignore
```

## 🔒 Security Features

- **Location Verification**
  - GPS coordinates required for time-in/out
  - Location accuracy tracking
  - Geofencing support

- **Identity Verification**
  - Facial recognition for attendance
  - Real-time verification
  - Fallback options available

- **Data Security**
  - Secure Firebase authentication
  - Encrypted data transmission
  - Role-based access control

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Firebase for backend services
- Modern web APIs for geolocation and camera access
- Open source community for inspiration and support

## 👥 Contributors

- **Juliane Nicole Caballes**
- **Chloe Evangelista**
- **Sarah Beatrice Realubit** 
