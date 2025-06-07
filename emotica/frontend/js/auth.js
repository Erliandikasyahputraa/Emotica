import { showToast, getInitials, validateEmail, validatePassword } from './utils.js';

// API Base URL - Update this to your backend URL
const API_BASE_URL = 'http://localhost:3000/api/v1';

// DOM Elements
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const logoutBtn = document.getElementById('logout-btn');
const profileMenu = document.getElementById('profile-menu');
const dropdownMenu = document.getElementById('dropdown-menu');
const userInitial = document.getElementById('user-initial');

// Check if user is authenticated
function isAuthenticated() {
    return localStorage.getItem('token') !== null;
}

// Redirect if not authenticated
function requireAuth(redirectTo = 'login.html') {
    if (!isAuthenticated()) {
        window.location.href = redirectTo;
    }
}

// Redirect if already authenticated
function redirectIfAuthenticated(redirectTo = 'dashboard.html') {
    if (isAuthenticated()) {
        window.location.href = redirectTo;
    }
}

// Set up user session
function setUserSession(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    updateUIForAuthState(true);
}

// Clear user session
function clearUserSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    updateUIForAuthState(false);
}

// Get current user
function getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// Update UI based on authentication state
function updateUIForAuthState(isAuthenticated) {
    const authLinks = document.querySelectorAll('.auth-link');
    const protectedLinks = document.querySelectorAll('.protected-link');
    const user = getCurrentUser();

    authLinks.forEach(link => {
        link.style.display = isAuthenticated ? 'none' : 'block';
    });

    protectedLinks.forEach(link => {
        link.style.display = isAuthenticated ? 'block' : 'none';
    });

    if (profileMenu) {
        profileMenu.style.display = isAuthenticated ? 'block' : 'none';
    }

    if (userInitial && user) {
        userInitial.textContent = getInitials(user.name || user.email);
    }
}

// Toggle dropdown menu
function toggleDropdown() {
    if (dropdownMenu) {
        dropdownMenu.classList.toggle('hidden');
    }
}

// Close dropdown when clicking outside
function closeDropdown(e) {
    if (profileMenu && !profileMenu.contains(e.target)) {
        dropdownMenu.classList.add('hidden');
    }
}

// Handle login
async function handleLogin(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
            credentials: 'include' // Important for cookies
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        setUserSession(data.token, data.user);
        showToast('Login successful!', 'success');
        window.location.href = 'dashboard.html';
    } catch (error) {
        console.error('Login error:', error);
        showToast(error.message || 'Login failed. Please try again.', 'error');
    }
}

// Handle registration
async function handleRegister(name, email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }

        showToast('Registration successful! Please log in.', 'success');
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Registration error:', error);
        showToast(error.message || 'Registration failed. Please try again.', 'error');
    }
}

// Handle logout
function handleLogout() {
    clearUserSession();
    showToast('Logged out successfully', 'success');
    window.location.href = 'index.html';
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI based on auth state
    updateUIForAuthState(isAuthenticated());

    // Login form
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = loginForm.querySelector('input[name="email"]').value.trim();
            const password = loginForm.querySelector('input[name="password"]').value;
            
            if (!email || !password) {
                showToast('Please fill in all fields', 'warning');
                return;
            }
            
            if (!validateEmail(email)) {
                showToast('Please enter a valid email address', 'warning');
                return;
            }
            
            await handleLogin(email, password);
        });
    }

    // Register form
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = registerForm.querySelector('input[name="name"]').value.trim();
            const email = registerForm.querySelector('input[name="email"]').value.trim();
            const password = registerForm.querySelector('input[name="password"]').value;
            const confirmPassword = registerForm.querySelector('input[name="confirmPassword"]').value;
            
            if (!name || !email || !password || !confirmPassword) {
                showToast('Please fill in all fields', 'warning');
                return;
            }
            
            if (!validateEmail(email)) {
                showToast('Please enter a valid email address', 'warning');
                return;
            }
            
            if (password !== confirmPassword) {
                showToast('Passwords do not match', 'warning');
                return;
            }
            
            const passwordValidation = validatePassword(password);
            if (!passwordValidation.isValid) {
                showToast(passwordValidation.message, 'warning');
                return;
            }
            
            await handleRegister(name, email, password);
        });
    }

    // Logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }

    // Profile menu toggle
    if (profileMenu) {
        const menuButton = profileMenu.querySelector('button');
        if (menuButton) {
            menuButton.addEventListener('click', toggleDropdown);
        }
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', closeDropdown);
});

// Export functions for use in other modules
export {
    isAuthenticated,
    requireAuth,
    redirectIfAuthenticated,
    getCurrentUser,
    API_BASE_URL
};
