// Admin Dashboard Functionality
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, deleteDoc, doc } from 'https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js';
import { getAuth, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js';

const db = getFirestore();
const auth = getAuth();

// DOM Elements
const guardsListBody = document.getElementById('guardsListBody');
const attendanceLogBody = document.getElementById('attendanceLogBody');
const onDutyCount = document.getElementById('onDutyCount');
const offDutyCount = document.getElementById('offDutyCount');
const lateCount = document.getElementById('lateCount');
const addGuardBtn = document.getElementById('addGuardBtn');
const addGuardModal = document.getElementById('addGuardModal');
const addGuardForm = document.getElementById('addGuardForm');

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
    loadGuards();
    loadAttendance();
    updateStatusCounts();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    addGuardBtn.addEventListener('click', () => {
        addGuardModal.style.display = 'block';
    });

    addGuardForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await addNewGuard();
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === addGuardModal) {
            closeModal('addGuardModal');
        }
    });
}

// Load Guards
async function loadGuards() {
    try {
        const guardsSnapshot = await getDocs(collection(db, 'guards'));
        guardsListBody.innerHTML = '';
        
        guardsSnapshot.forEach((doc) => {
            const guard = doc.data();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${doc.id}</td>
                <td>${guard.name}</td>
                <td>${guard.email}</td>
                <td>${guard.status || 'Off Duty'}</td>
                <td>
                    <button onclick="editGuard('${doc.id}')">Edit</button>
                    <button onclick="removeGuard('${doc.id}')">Remove</button>
                </td>
            `;
            guardsListBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading guards:', error);
    }
}

// Add New Guard
async function addNewGuard() {
    try {
        const name = document.getElementById('guardName').value;
        const email = document.getElementById('guardEmail').value;
        const password = document.getElementById('guardPassword').value;

        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Add guard to Firestore
        await addDoc(collection(db, 'guards'), {
            name,
            email,
            status: 'Off Duty',
            createdAt: new Date()
        });

        closeModal('addGuardModal');
        addGuardForm.reset();
        loadGuards();
    } catch (error) {
        console.error('Error adding guard:', error);
        alert('Error adding guard: ' + error.message);
    }
}

// Load Attendance
async function loadAttendance() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const q = query(
            collection(db, 'attendance'),
            where('timestamp', '>=', today)
        );

        const attendanceSnapshot = await getDocs(q);
        attendanceLogBody.innerHTML = '';

        attendanceSnapshot.forEach((doc) => {
            const record = doc.data();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${record.guardName}</td>
                <td>${record.timeIn ? new Date(record.timeIn).toLocaleTimeString() : '-'}</td>
                <td>${record.timeOut ? new Date(record.timeOut).toLocaleTimeString() : '-'}</td>
                <td>${record.location ? `${record.location.latitude}, ${record.location.longitude}` : '-'}</td>
                <td>${record.status}</td>
            `;
            attendanceLogBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading attendance:', error);
    }
}

// Update Status Counts
async function updateStatusCounts() {
    try {
        const guardsSnapshot = await getDocs(collection(db, 'guards'));
        let onDuty = 0;
        let offDuty = 0;
        let late = 0;

        guardsSnapshot.forEach((doc) => {
            const guard = doc.data();
            if (guard.status === 'On Duty') onDuty++;
            else if (guard.status === 'Late') late++;
            else offDuty++;
        });

        onDutyCount.textContent = onDuty;
        offDutyCount.textContent = offDuty;
        lateCount.textContent = late;
    } catch (error) {
        console.error('Error updating status counts:', error);
    }
}

// Generate Report
async function generateReport() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const reportType = document.getElementById('reportType').value;

    if (!startDate || !endDate) {
        alert('Please select both start and end dates');
        return;
    }

    try {
        const q = query(
            collection(db, 'attendance'),
            where('timestamp', '>=', new Date(startDate)),
            where('timestamp', '<=', new Date(endDate))
        );

        const snapshot = await getDocs(q);
        const reportData = [];

        snapshot.forEach((doc) => {
            const data = doc.data();
            if (reportType === 'attendance' || 
                (reportType === 'late' && data.status === 'Late') ||
                (reportType === 'overtime' && data.overtime)) {
                reportData.push(data);
            }
        });

        displayReport(reportData);
    } catch (error) {
        console.error('Error generating report:', error);
    }
}

// Display Report
function displayReport(data) {
    const reportContent = document.getElementById('reportContent');
    reportContent.innerHTML = '';

    if (data.length === 0) {
        reportContent.innerHTML = '<p>No data found for the selected criteria</p>';
        return;
    }

    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Date</th>
                <th>Guard Name</th>
                <th>Time In</th>
                <th>Time Out</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            ${data.map(record => `
                <tr>
                    <td>${new Date(record.timestamp).toLocaleDateString()}</td>
                    <td>${record.guardName}</td>
                    <td>${record.timeIn ? new Date(record.timeIn).toLocaleTimeString() : '-'}</td>
                    <td>${record.timeOut ? new Date(record.timeOut).toLocaleTimeString() : '-'}</td>
                    <td>${record.status}</td>
                </tr>
            `).join('')}
        </tbody>
    `;
    reportContent.appendChild(table);
}

// Export to CSV
function exportToCSV() {
    const reportContent = document.getElementById('reportContent');
    const table = reportContent.querySelector('table');
    
    if (!table) {
        alert('No data to export');
        return;
    }

    let csv = [];
    const rows = table.querySelectorAll('tr');

    for (const row of rows) {
        const cols = row.querySelectorAll('td,th');
        const rowData = Array.from(cols).map(col => col.textContent);
        csv.push(rowData.join(','));
    }

    const csvContent = csv.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'report.csv';
    link.click();
}

// Utility Functions
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Make functions available globally
window.editGuard = async (guardId) => {
    // Implement edit guard functionality
    console.log('Edit guard:', guardId);
};

window.removeGuard = async (guardId) => {
    if (confirm('Are you sure you want to remove this guard?')) {
        try {
            await deleteDoc(doc(db, 'guards', guardId));
            loadGuards();
        } catch (error) {
            console.error('Error removing guard:', error);
            alert('Error removing guard: ' + error.message);
        }
    }
};

window.updateAttendanceLog = loadAttendance;
window.generateReport = generateReport;
window.exportToCSV = exportToCSV; 