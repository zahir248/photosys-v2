// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-analytics.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDCh_UZeQZSeMjNXFSs0WGfmsweesIXYrc",
    authDomain: "photosys-5454c.firebaseapp.com",
    projectId: "photosys-5454c",
    storageBucket: "photosys-5454c.firebasestorage.app",
    messagingSenderId: "194619075721",
    appId: "1:194619075721:web:35c8965bc9c1186b192a58",
    measurementId: "G-Q8HKB41QCH"
};

// Initialize Firebase
let app, analytics, auth, db;

try {
    app = initializeApp(firebaseConfig);
    analytics = getAnalytics(app);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Firebase initialization error:', error);
}

// Check if we're on login or register page
const isLoginPage = window.location.pathname.includes('login.html');
const isRegisterPage = window.location.pathname.includes('register.html');

// DOM Elements
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');

// Get form elements based on page
const signInForm = isLoginPage ? document.getElementById('loginForm') : null;
const signInEmail = isLoginPage ? document.getElementById('signInEmail') : null;
const signInPassword = isLoginPage ? document.getElementById('signInPassword') : null;
const signInBtn = isLoginPage ? document.getElementById('signInBtn') : null;

const registerForm = isRegisterPage ? document.getElementById('registerForm') : null;
const signUpName = isRegisterPage ? document.getElementById('signUpName') : null;
const signUpEmail = isRegisterPage ? document.getElementById('signUpEmail') : null;
const signUpPassword = isRegisterPage ? document.getElementById('signUpPassword') : null;
const signUpBtn = isRegisterPage ? document.getElementById('signUpBtn') : null;

// Utility Functions
function showLoading() {
    if (loadingSpinner) loadingSpinner.classList.remove('hidden');
}

function hideLoading() {
    if (loadingSpinner) loadingSpinner.classList.add('hidden');
}

function showError(message) {
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
        setTimeout(() => {
            errorMessage.classList.add('hidden');
        }, 5000);
    } else {
        alert(message);
    }
}

// Authentication Functions
function handleSignIn(event) {
    if (event) event.preventDefault();
    
    const email = signInEmail.value;
    const password = signInPassword.value;

    if (!email || !password) {
        showError('Please fill in all fields');
        return;
    }

    showLoading();
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            hideLoading();
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        })
        .catch((error) => {
            hideLoading();
            showError('Sign in failed: ' + error.message);
        });
}

function handleSignUp(event) {
    if (event) event.preventDefault();
    
    console.log('handleSignUp called');
    
    const name = signUpName.value;
    const email = signUpEmail.value;
    const password = signUpPassword.value;

    console.log('Form values:', { name, email, password: password ? '***' : '' });

    if (!name || !email || !password) {
        showError('Please fill in all fields');
        return;
    }

    if (password.length < 6) {
        showError('Password must be at least 6 characters');
        return;
    }

    if (!auth) {
        showError('Authentication service not initialized');
        return;
    }

    console.log('Calling createUserWithEmailAndPassword...');
    showLoading();
    createUserWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
            // Store user display name (optional)
            try {
                await updateProfile(userCredential.user, {
                    displayName: name
                });
            } catch (error) {
                console.warn('Could not update profile:', error);
            }
            
            // Try to create user document in Firestore (optional)
            try {
                const userData = {
                    uid: userCredential.user.uid,
                    name: name,
                    email: email,
                    createdAt: serverTimestamp()
                };
                console.log('Attempting to save to Firestore:', userData);
                await addDoc(collection(db, 'users'), userData);
                console.log('Successfully saved to Firestore');
            } catch (error) {
                console.warn('Could not save user to Firestore:', error);
                console.warn('This is OK - user account was created successfully');
                // Continue even if Firestore write fails
            }
        })
        .then(() => {
            hideLoading();
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        })
        .catch((error) => {
            hideLoading();
            console.error('Sign up error:', error);
            showError('Sign up failed: ' + error.message);
        });
}

// Event Listeners
if (signInForm) {
    signInForm.addEventListener('submit', handleSignIn);
}

if (registerForm) {
    registerForm.addEventListener('submit', handleSignUp);
    console.log('Register form found, event listener attached');
}

// Also add click handler as backup
if (signUpBtn) {
    signUpBtn.addEventListener('click', handleSignUp);
    console.log('Sign up button found, click handler attached');
}

if (signInBtn) {
    signInBtn.addEventListener('click', handleSignIn);
}

// Debug
console.log('Auth.js loaded');
console.log('Is register page:', isRegisterPage);
console.log('Register form:', registerForm);

