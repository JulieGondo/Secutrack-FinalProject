import { login } from './auth.js'; // Import the login function

// DOM Elements
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const rememberMeCheckbox = document.getElementById('rememberMe');
const togglePasswordBtn = document.querySelector('.toggle-password');
const forgotPasswordLink = document.getElementById('forgotPassword');
const contactAdminLink = document.getElementById('contactAdmin');
const loadingOverlay = document.getElementById('loadingOverlay');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');
const closeToastBtn = document.querySelector('.close-toast');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    checkRememberedUser();
    validateForm();
});

// Setup Event Listeners
function setupEventListeners() {
    loginForm.addEventListener('submit', handleLogin);
    togglePasswordBtn.addEventListener('click', togglePasswordVisibility);
    forgotPasswordLink.addEventListener('click', handleForgotPassword);
    closeToastBtn.addEventListener('click', hideToast);
    contactAdminLink.addEventListener('click', handleContactAdmin);
    // Real-time validation
    usernameInput.addEventListener('input', validateUsername);
    passwordInput.addEventListener('input', validatePassword);
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();

    if (!validateForm()) {
        return;
    }

    const email = usernameInput.value.trim();
    const password = passwordInput.value;

    try {
        showLoading();
        if (rememberMeCheckbox.checked) {
            localStorage.setItem('rememberMe', 'true');
            localStorage.setItem('username', email);
        } else {
            localStorage.removeItem('rememberMe');
            localStorage.removeItem('username');
        }
        await login(email, password); // Use login from auth.js, which handles redirect
    } catch (error) {
        console.error('Login error:', error);
        showError(getErrorMessage(error.code || error.message));
    } finally {
        hideLoading();
    }
}

// Handle Forgot Password
async function handleForgotPassword(e) {
    e.preventDefault();
    const email = usernameInput.value.trim();

    if (!email) {
        showError('Please enter your username');
        return;
    }

    try {
        showLoading();
        // Import sendPasswordResetEmail from Firebase Auth if needed
        const { sendPasswordResetEmail, getAuth } = await import('https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js');
        const auth = getAuth();
        await sendPasswordResetEmail(auth, email);
        showSuccess('Password reset email sent. Please check your inbox.');
    } catch (error) {
        console.error('Password reset error:', error);
        showError(getErrorMessage(error.code || error.message));
    } finally {
        hideLoading();
    }
}

// Toggle Password Visibility
function togglePasswordVisibility() {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    const icon = togglePasswordBtn.querySelector('i');
    icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
}

// Check Remembered User
function checkRememberedUser() {
    if (localStorage.getItem('rememberMe') === 'true') {
        usernameInput.value = localStorage.getItem('username') || '';
        rememberMeCheckbox.checked = true;
    }
}

// Form Validation
function validateForm() {
    let isValid = true;
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    // Reset error messages
    document.getElementById('usernameError').textContent = '';
    document.getElementById('passwordError').textContent = '';
    // Validate username
    if (!username) {
        document.getElementById('usernameError').textContent = 'Username is required';
        isValid = false;
    }
    // Validate password
    if (!password) {
        document.getElementById('passwordError').textContent = 'Password is required';
        isValid = false;
    } else if (password.length < 6) {
        document.getElementById('passwordError').textContent = 'Password must be at least 6 characters';
        isValid = false;
    }
    return isValid;
}

function validateUsername() {
    const username = usernameInput.value.trim();
    const usernameError = document.getElementById('usernameError');
    if (!username) {
        usernameError.textContent = 'Username is required';
        return false;
    }
    usernameError.textContent = '';
    return true;
}

function validatePassword() {
    const password = passwordInput.value;
    const passwordError = document.getElementById('passwordError');
    if (!password) {
        passwordError.textContent = 'Password is required';
        return false;
    }
    if (password.length < 6) {
        passwordError.textContent = 'Password must be at least 6 characters';
        return false;
    }
    passwordError.textContent = '';
    return true;
}

// Error Message Helper
function getErrorMessage(errorCode) {
    const errorMessages = {
        'auth/invalid-email': 'Invalid email address',
        'auth/user-disabled': 'This account has been disabled',
        'auth/user-not-found': 'No account found with this email',
        'auth/wrong-password': 'Incorrect password',
        'auth/too-many-requests': 'Too many failed attempts. Please try again later',
        'auth/network-request-failed': 'Network error. Please check your connection'
    };
    return errorMessages[errorCode] || 'An error occurred. Please try again.';
}

// UI Helpers
function showLoading() {
    if (loadingOverlay) loadingOverlay.style.display = 'flex';
}
function hideLoading() {
    if (loadingOverlay) loadingOverlay.style.display = 'none';
}
function showError(message) {
    if (toastMessage) toastMessage.textContent = message;
    if (toast) toast.className = 'toast show';
    setTimeout(hideToast, 5000);
}
function showSuccess(message) {
    if (toastMessage) toastMessage.textContent = message;
    if (toast) toast.className = 'toast success show';
    setTimeout(hideToast, 5000);
}
function hideToast() {
    if (toast) toast.classList.remove('show');
}
// Handle Contact Admin
function handleContactAdmin(e) {
    e.preventDefault();
    showError('Please contact your system administrator for account creation.');
} 