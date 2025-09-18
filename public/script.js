let firebaseConfig = null;
let auth = null;
let db = null;
let collection, getDocs, deleteDoc, updateDoc, doc; 

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
        
        // Import Firebase modules (add new ones)
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
        const { getAuth, createUserWithEmailAndPassword, updateProfile } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
        const { getFirestore, doc: firestoreDoc, setDoc, collection: firestoreCollection, getDocs: firestoreGetDocs, deleteDoc: firestoreDeleteDoc, updateDoc: firestoreUpdateDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');

        // Assign to globals (added doc assignment)
        collection = firestoreCollection;
        getDocs = firestoreGetDocs;
        deleteDoc = firestoreDeleteDoc;
        updateDoc = firestoreUpdateDoc;
        doc = firestoreDoc;  // Added this line

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);

        console.log('Firebase initialized successfully');
        
        // Setup form handler
        setupFormHandler(createUserWithEmailAndPassword, updateProfile, doc, setDoc);
        
        // Setup additional handlers
        setupUserManagementHandlers();
        
    } catch (error) {
        console.error('Error initializing Firebase:', error);
        showMessage('Error initializing Firebase. Please check your configuration.', 'error');
    }
}
function setupUserManagementHandlers() {
    // Refresh users button
    document.getElementById('refreshUsersBtn').addEventListener('click', fetchAndDisplayUsers);
    
    // Modal close
    document.getElementById('closeModal').addEventListener('click', () => {
        document.getElementById('editModal').style.display = 'none';
    });
    
    // Edit form submission
    document.getElementById('editForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveUserEdits();
    });
}

// New function: Fetch all users from Firestore
async function fetchUsers() {
    try {
        const usersCollection = collection(db, 'users');
        const querySnapshot = await getDocs(usersCollection);
        const users = [];
        querySnapshot.forEach((doc) => {
            users.push({ id: doc.id, ...doc.data() });
        });
        return users;
    } catch (error) {
        console.error('Error fetching users:', error);
        showMessage('Error loading users. Please try again.', 'error');
        return [];
    }
}

// New function: Display users in table
async function fetchAndDisplayUsers() {
    const users = await fetchUsers();
    const tableBody = document.getElementById('usersTableBody');
    tableBody.innerHTML = ''; // Clear existing rows
    
    if (users.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4">No users found.</td></tr>';
        return;
    }
    
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="border: 1px solid #ddd; padding: 8px;">${user.username || 'N/A'}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${user.email || 'N/A'}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">
                <button class="edit-btn" data-id="${user.id}" data-username="${user.username}" data-email="${user.email}">Edit</button>
                <button class="delete-btn" data-id="${user.id}">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // Attach event listeners to buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => openEditModal(e.target.dataset));
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => deleteUser(e.target.dataset.id));
    });
}

// New function: Open edit modal
function openEditModal(data) {
    document.getElementById('editUsername').value = data.username || '';
    document.getElementById('editEmail').value = data.email || '';
    document.getElementById('editForm').dataset.userId = data.id; // Store user ID
    document.getElementById('editModal').style.display = 'block';
}

// New function: Save user edits
async function saveUserEdits() {
    const userId = document.getElementById('editForm').dataset.userId;
    const newUsername = document.getElementById('editUsername').value.trim();
    const newEmail = document.getElementById('editEmail').value.trim();
    
    if (!newUsername || !newEmail) {
        showMessage('Please fill in all fields.', 'error');
        return;
    }
    
    try {
        setLoading(true);
        const userDoc = doc(db, 'users', userId);
        await updateDoc(userDoc, {
            username: newUsername,
            email: newEmail,
            displayName: newUsername
        });
        showMessage('User updated successfully!', 'success');
        document.getElementById('editModal').style.display = 'none';
        await fetchAndDisplayUsers(); // Refresh table
    } catch (error) {
        console.error('Error updating user:', error);
        showMessage('Error updating user. Please try again.', 'error');
    } finally {
        setLoading(false);
    }
}

// New function: Delete user
async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
        setLoading(true);
        const userDoc = doc(db, 'users', userId);
        await deleteDoc(userDoc);
        showMessage('User deleted successfully!', 'success');
        await fetchAndDisplayUsers(); // Refresh table
    } catch (error) {
        console.error('Error deleting user:', error);
        showMessage('Error deleting user. Please try again.', 'error');
    } finally {
        setLoading(false);
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
    
    // Fetch and display users (instead of hiding the form)
    fetchAndDisplayUsers();
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
