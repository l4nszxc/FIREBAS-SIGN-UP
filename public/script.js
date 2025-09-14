let firebaseConfig = null;
let auth = null;
let db = null;

// Load Firebase config from server
async function loadFirebaseConfig() {
    try {
        const response = await fetch('/api/firebase-config');
        firebaseConfig = await response.json();
        console.log('Firebase config loaded successfully');
        await initializeFirebase();
    } catch (error) {
        console.error('Error loading Firebase config:', error);
        showMessage('Error loading configuration. Please refresh the page.', 'error');
    }
}

// Initialize Firebase
async function initializeFirebase() {
    try {
        console.log('Initializing Firebase...');
        
        // Import Firebase modules
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
        const { getAuth, createUserWithEmailAndPassword, updateProfile } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
        const { getFirestore, doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);

        console.log('Firebase initialized successfully');
        
        // Setup form handler
        setupFormHandler(createUserWithEmailAndPassword, updateProfile, doc, setDoc);
        
    } catch (error) {
        console.error('Error initializing Firebase:', error);
        showMessage('Error initializing Firebase. Please check your configuration.', 'error');
    }
}

// Setup form submission handler
function setupFormHandler(createUserWithEmailAndPassword, updateProfile, doc, setDoc) {
    const form = document.getElementById('signupForm');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        // Validation
        if (!email || !username || !password) {
            showMessage('Please fill in all fields', 'error');
            return;
        }

        if (username.length < 3) {
            showMessage('Username must be at least 3 characters', 'error');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showMessage('Please enter a valid email address', 'error');
            return;
        }
        
        try {
            setLoading(true);
            console.log(`Creating user: ${username} with email: ${email}`);
            
            // Create user with email and password
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            console.log('User created:', user.uid);
            
            // Update user profile with username
            await updateProfile(user, { 
                displayName: username 
            });
            
            console.log('Profile updated');
            
            // Save user data to Firestore
            await setDoc(doc(db, 'users', user.uid), {
                username: username,
                email: email,
                displayName: username,
                createdAt: new Date(),
                uid: user.uid
            });
            
            console.log('User data saved to Firestore');
            
            // Show success
            showSuccess(username);
            form.reset();
            
        } catch (error) {
            console.error('Signup error:', error);
            handleSignupError(error);
        } finally {
            setLoading(false);
        }
    });
}

function handleSignupError(error) {
    let errorMessage = 'An error occurred during signup';
    
    switch (error.code) {
        case 'auth/email-already-in-use':
            errorMessage = 'This username is already taken';
            break;
        case 'auth/weak-password':
            errorMessage = 'Password is too weak';
            break;
        case 'auth/invalid-email':
            errorMessage = 'Invalid username format';
            break;
        case 'auth/operation-not-allowed':
            errorMessage = 'Email/password signup is not enabled';
            break;
        case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your connection';
            break;
        default:
            errorMessage = `Error: ${error.message}`;
    }
    
    showMessage(errorMessage, 'error');
}

function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.innerHTML = message;
    messageDiv.className = type;
    
    if (type === 'success') {
        setTimeout(() => {
            messageDiv.innerHTML = '';
            messageDiv.className = '';
        }, 5000);
    }
}

function showSuccess(username) {
    showMessage(`Welcome ${username}! Your account has been created successfully.`, 'success');
    
    // Show success section
    const successSection = document.getElementById('successSection');
    successSection.style.display = 'block';
    
    // Hide form temporarily
    setTimeout(() => {
        document.getElementById('signupForm').style.display = 'none';
    }, 2000);
}

function setLoading(loading) {
    const button = document.getElementById('submitBtn');
    const form = document.getElementById('signupForm');
    
    if (loading) {
        button.disabled = true;
        button.textContent = 'Creating Account...';
        button.classList.add('loading');
        form.style.pointerEvents = 'none';
    } else {
        button.disabled = false;
        button.textContent = 'Sign Up';
        button.classList.remove('loading');
        form.style.pointerEvents = 'auto';
    }
}

// Load config when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('App starting...');
    loadFirebaseConfig();
});
