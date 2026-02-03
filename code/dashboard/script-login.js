// script-login.js - JWT Authentication (DEBUG VERSION)
const API_BASE_URL = 'http://127.0.0.1:5000';

// Switch between Login and Register tabs
function switchTab(tab) {
    var loginTab = document.getElementById('login-tab');
    var registerTab = document.getElementById('register-tab');
    var loginForm = document.getElementById('login-form');
    var registerForm = document.getElementById('register-form');

    loginTab.classList.remove('active');
    registerTab.classList.remove('active');
    loginForm.classList.remove('active');
    registerForm.classList.remove('active');

    if (tab === 'login') {
        loginTab.classList.add('active');
        loginForm.classList.add('active');
    } else {
        registerTab.classList.add('active');
        registerForm.classList.add('active');
    }
}

// Toggle password visibility
function togglePassword(inputId) {
    var input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
    } else {
        input.type = 'password';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 Login page initialized');
    console.log('📡 API URL:', API_BASE_URL);
    
    // Check if already logged in
    checkAuthAndRedirect();

    // Setup login form
    var loginFormElement = document.querySelector('#login-form form');
    if (loginFormElement) {
        console.log('✅ Login form found');
        loginFormElement.addEventListener('submit', handleLogin);
    } else {
        console.error('❌ Login form NOT found');
    }

    // Setup register form
    var registerFormElement = document.querySelector('#register-form form');
    if (registerFormElement) {
        console.log('✅ Register form found');
        registerFormElement.addEventListener('submit', handleRegister);
    }
});

// Check if already logged in
async function checkAuthAndRedirect() {
    const token = localStorage.getItem('access_token');
    console.log('🔍 Checking existing token:', token ? 'EXISTS' : 'NOT FOUND');
    
    if (!token) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/current-user`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            console.log('✅ Already logged in, redirecting...');
            window.location.href = 'index.html';
        } else {
            console.log('⚠️ Token invalid, clearing...');
            localStorage.removeItem('access_token');
        }
    } catch (error) {
        console.log('❌ Auth check failed:', error);
    }
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();
    console.log('🔐 Login attempt started');

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    console.log('📧 Email:', email);
    console.log('🔑 Password length:', password.length);

    if (!email || !password) {
        showMessage('Please enter both email and password', 'error');
        return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;

    try {
        console.log('📡 Sending login request to:', `${API_BASE_URL}/api/login`);
        
        const response = await fetch(`${API_BASE_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        console.log('📥 Response status:', response.status);
        
        const data = await response.json();
        console.log('📦 Response data:', data);

        if (response.ok) {
            console.log('✅ Login successful!');
            
            // Check if token exists
            if (data.access_token) {
                console.log('🔑 Token received:', data.access_token.substring(0, 20) + '...');
                
                // Store JWT token
                localStorage.setItem('access_token', data.access_token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                console.log('💾 Token saved to localStorage');
                
                // Verify it was saved
                const savedToken = localStorage.getItem('access_token');
                console.log('✓ Verification - Token in storage:', savedToken ? 'YES' : 'NO');

                showMessage('Login successful! Redirecting...', 'success');
                
                setTimeout(() => {
                    console.log(' Redirecting to dashboard...');
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                console.error(' No access_token in response!');
                console.log('Response keys:', Object.keys(data));
                showMessage('Login failed: No token received', 'error');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        } else {
            console.error('Login failed:', data.error);
            showMessage(data.error || 'Invalid email or password', 'error');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    } catch (error) {
        console.error('💥 Login error:', error);
        console.error('Error details:', error.message);
        showMessage('Network error. Please check if server is running at ' + API_BASE_URL, 'error');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Handle Register
async function handleRegister(e) {
    e.preventDefault();
    console.log('📝 Registration attempt started');

    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;

    console.log('📧 Email:', email);
    console.log('👤 Name:', name);

    if (!name || !email || !password || !confirmPassword) {
        showMessage('Please fill in all fields', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }

    if (password.length < 6) {
        showMessage('Password must be at least 6 characters', 'error');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage('Please enter a valid email', 'error');
        return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Creating Account...';
    submitBtn.disabled = true;

    try {
        console.log(' Sending registration request');
        
        const response = await fetch(`${API_BASE_URL}/api/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        console.log(' Response status:', response.status);
        
        const data = await response.json();
        console.log(' Response data:', data);

        if (response.ok) {
            console.log(' Registration successful!');
            showMessage('Account created! Please login.', 'success');
            
            setTimeout(() => {
                switchTab('login');
                document.getElementById('login-email').value = email;
            }, 1500);
        } else {
            console.error(' Registration failed:', data.error);
            showMessage(data.error || 'Registration failed', 'error');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    } catch (error) {
        console.error(' Registration error:', error);
        showMessage('Network error. Please try again.', 'error');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Show message
function showMessage(message, type) {
    console.log(' Showing message:', type, '-', message);
    
    var existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }

    var alert = document.createElement('div');
    alert.className = 'alert alert-' + type;
    alert.textContent = message;

    var activeForm = document.querySelector('.form-content.active');
    if (activeForm) {
        activeForm.insertBefore(alert, activeForm.firstChild);

        setTimeout(() => {
            alert.remove();
        }, 5000);
    } else {
        console.error(' Could not find active form to show message');
    }
}

// Add startup log
console.log('='.repeat(60));
console.log(' Invoice Management - Login Script Loaded');
console.log(' Backend API:', API_BASE_URL);
console.log('='.repeat(60));