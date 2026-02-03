// script-login.js - Complete Fixed Version with Backend Integration
const API_BASE_URL = 'http://127.0.0.1:5000';

console.log('🔐 Login Script Loaded');
console.log('📡 Backend URL:', API_BASE_URL);

// Switch between Login and Register tabs
function switchTab(tab) {
    var loginTab = document.getElementById('login-tab');
    var registerTab = document.getElementById('register-tab');
    var loginForm = document.getElementById('login-form');
    var registerForm = document.getElementById('register-form');

    if (!loginTab || !registerTab) {
        console.error('❌ Tab elements not found!');
        return;
    }

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
    if (input) {
        input.type = input.type === 'password' ? 'text' : 'password';
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM Loaded');
    
    // Check if already logged in
    checkAuthAndRedirect();

    // Setup login form
    var loginFormElement = document.querySelector('#login-form form');
    if (loginFormElement) {
        console.log('✅ Login form found');
        loginFormElement.addEventListener('submit', handleLogin);
    } else {
        console.warn('⚠️ Login form not found');
    }

    // Setup register form
    var registerFormElement = document.querySelector('#register-form form');
    if (registerFormElement) {
        console.log('✅ Register form found');
        registerFormElement.addEventListener('submit', handleRegister);
    } else {
        console.warn('⚠️ Register form not found');
    }
});

// Check if already logged in and redirect
async function checkAuthAndRedirect() {
    const token = localStorage.getItem('access_token');
    if (!token) {
        console.log('ℹ️ No token found, user not logged in');
        return;
    }

    console.log('🔍 Checking existing token...');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/current-user`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            console.log('✅ Valid token, redirecting to dashboard...');
            window.location.href = 'index.html';
        } else {
            console.log('❌ Invalid token, clearing...');
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
        }
    } catch (error) {
        console.error('❌ Auth check failed:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
    }
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();
    console.log('🔐 Login attempt started');

    const email = document.getElementById('login-email')?.value.trim();
    const password = document.getElementById('login-password')?.value;

    if (!email || !password) {
        showMessage('Please enter both email and password', 'error');
        console.error('❌ Email or password missing');
        return;
    }

    console.log('📧 Email:', email);

    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (!submitBtn) {
        console.error('❌ Submit button not found');
        return;
    }

    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;

    try {
        console.log('📡 Sending POST to:', `${API_BASE_URL}/api/login`);
        
        const response = await fetch(`${API_BASE_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                email: email, 
                password: password 
            })
        });

        console.log('📥 Response Status:', response.status);

        const data = await response.json();
        console.log('📦 Response Data:', data);

        if (response.ok) {
            if (data.access_token) {
                console.log('✅ Login successful!');
                console.log('🔑 Token received');
                
                // Store token and user data
                localStorage.setItem('access_token', data.access_token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                console.log('💾 Token saved to localStorage');
                
                // Verify storage
                const savedToken = localStorage.getItem('access_token');
                console.log('✓ Token verified in storage:', savedToken ? 'YES' : 'NO');

                showMessage('Login successful! Redirecting...', 'success');
                
                // Redirect after short delay
                setTimeout(() => {
                    console.log('🔄 Redirecting to dashboard...');
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                console.error('❌ No access_token in response');
                showMessage('Login failed: No token received', 'error');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        } else {
            console.error('❌ Login failed:', data.error);
            showMessage(data.error || 'Invalid email or password', 'error');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    } catch (error) {
        console.error('💥 Network Error:', error);
        console.error('Error message:', error.message);
        
        showMessage(
            'Cannot connect to server. Please ensure backend is running at ' + API_BASE_URL,
            'error'
        );
        
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Handle Register
async function handleRegister(e) {
    e.preventDefault();
    console.log('📝 Registration attempt started');

    const name = document.getElementById('register-name')?.value.trim();
    const email = document.getElementById('register-email')?.value.trim();
    const password = document.getElementById('register-password')?.value;
    const confirmPassword = document.getElementById('register-confirm-password')?.value;

    // Validation
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

    console.log('📧 Email:', email);
    console.log('👤 Name:', name);

    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (!submitBtn) return;

    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Creating Account...';
    submitBtn.disabled = true;

    try {
        console.log('📡 Sending POST to:', `${API_BASE_URL}/api/register`);
        
        const response = await fetch(`${API_BASE_URL}/api/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                name: name,
                email: email, 
                password: password 
            })
        });

        console.log('📥 Response Status:', response.status);

        const data = await response.json();
        console.log('📦 Response Data:', data);

        if (response.ok) {
            console.log('✅ Registration successful!');
            showMessage('Account created! Please login.', 'success');
            
            setTimeout(() => {
                switchTab('login');
                const loginEmail = document.getElementById('login-email');
                if (loginEmail) loginEmail.value = email;
            }, 1500);
        } else {
            console.error('❌ Registration failed:', data.error);
            showMessage(data.error || 'Registration failed', 'error');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    } catch (error) {
        console.error('💥 Network Error:', error);
        showMessage(
            'Cannot connect to server. Please ensure backend is running at ' + API_BASE_URL,
            'error'
        );
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Show message to user
function showMessage(message, type) {
    console.log('💬 Message:', type, '-', message);
    
    // Remove existing alert
    var existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }

    // Create new alert
    var alert = document.createElement('div');
    alert.className = 'alert alert-' + type;
    alert.textContent = message;
    alert.style.cssText = 'padding: 12px; margin: 10px 0; border-radius: 8px; font-size: 14px;';
    
    if (type === 'success') {
        alert.style.background = '#D1FAE5';
        alert.style.color = '#047857';
        alert.style.border = '1px solid #10B981';
    } else if (type === 'error') {
        alert.style.background = '#FEE2E2';
        alert.style.color = '#DC2626';
        alert.style.border = '1px solid #EF4444';
    }

    // Insert alert
    var activeForm = document.querySelector('.form-content.active');
    if (activeForm) {
        activeForm.insertBefore(alert, activeForm.firstChild);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            alert.remove();
        }, 5000);
    } else {
        // Fallback: use browser alert
        window.alert(message);
    }
}

// Test backend connection on load
(async function testBackend() {
    try {
        const response = await fetch(`${API_BASE_URL}/`, { method: 'GET' });
        if (response.ok) {
            console.log('✅ Backend connection successful');
        } else {
            console.warn('⚠️ Backend returned error:', response.status);
        }
    } catch (error) {
        console.error('❌ Cannot connect to backend:', error.message);
        console.error('📍 Make sure backend is running at:', API_BASE_URL);
    }
})();