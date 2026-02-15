// add-invoice.js - Create Invoice with Auto Backend Sync
const API_BASE_URL = 'http://127.0.0.1:5000';

console.log('📄 Add Invoice Script Loaded');
console.log('📡 Backend URL:', API_BASE_URL);

let currentUser = null;
let selectedFile = null;

// Get JWT headers
function getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    if (!token) {
        console.warn('⚠️ No auth token');
        return null;
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async function() {
    console.log('✅ Add Invoice DOM loaded');
    
    // Check authentication
    currentUser = await checkAuth();
    
    if (!currentUser) {
        console.error('❌ Not authenticated');
        alert('Please login first to create invoices');
        window.location.href = '../login.html';
        return;
    }
    
    console.log('✅ Authenticated as:', currentUser.name);
    
    // Set today's date
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('invoice-date');
    if (dateInput) dateInput.value = today;
    
    // Generate serial number
    generateSerialNumber();
    
    // Setup file upload
    setupFileUpload();
    
    // Setup form submission
    const form = document.getElementById('invoice-form');
    if (form) {
        form.addEventListener('submit', handleSubmit);
        console.log('✅ Form submit handler attached');
    } else {
        console.error('❌ Invoice form not found');
    }
});

// Check authentication
async function checkAuth() {
    const token = localStorage.getItem('access_token');
    if (!token) {
        console.log('ℹ️ No token found');
        return null;
    }

    console.log('🔍 Checking authentication...');
    
    try {
        const headers = getAuthHeaders();
        if (!headers) return null;
        
        const response = await fetch(`${API_BASE_URL}/api/current-user`, {
            method: 'GET',
            headers: headers
        });

        console.log('📥 Auth response:', response.status);

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Auth successful');
            return data.user;
        } else {
            console.warn('❌ Auth failed');
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            return null;
        }
    } catch (error) {
        console.error('💥 Auth error:', error);
        return null;
    }
}

// Generate serial number
function generateSerialNumber() {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000);
    const serial = `INV-${year}-${String(random).padStart(4, '0')}`;
    
    const serialInput = document.getElementById('serial-number');
    if (serialInput && !serialInput.value) {
        serialInput.value = serial;
        console.log('🔢 Generated serial:', serial);
    }
}

// Setup file upload
function setupFileUpload() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const previewSection = document.getElementById('preview-section');
    const fileName = document.getElementById('file-name');
    const fileSize = document.getElementById('file-size');
    const removeBtn = document.getElementById('remove-file');

    if (!uploadArea || !fileInput) {
        console.log('ℹ️ File upload elements not found (optional feature)');
        return;
    }

    console.log('✅ Setting up file upload');

    uploadArea.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            selectedFile = null;
            fileInput.value = '';
            if (previewSection) previewSection.classList.remove('active');
            console.log('🗑️ File removed');
        });
    }

    function handleFile(file) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];

        if (file.size > maxSize) {
            alert('File too large (max 10MB)');
            return;
        }

        if (!allowedTypes.includes(file.type)) {
            alert('Invalid file type. Use PNG, JPG, or PDF');
            return;
        }

        selectedFile = file;
        console.log('📎 File selected:', file.name);

        if (fileName) fileName.textContent = file.name;
        if (fileSize) fileSize.textContent = formatFileSize(file.size);
        if (previewSection) previewSection.classList.add('active');
    }
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Handle form submission
async function handleSubmit(e) {
    e.preventDefault();
    console.log('📤 Submitting invoice...');

    // Collect form data
    const invoiceData = {
        serial_number: document.getElementById('serial-number')?.value,
        device_name: document.getElementById('device-name')?.value,
        customer_name: document.getElementById('customer-name')?.value,
        customer_email: document.getElementById('customer-email')?.value || '',
        customer_phone: document.getElementById('customer-phone')?.value || '',
        invoice_date: document.getElementById('invoice-date')?.value,
        amount: parseFloat(document.getElementById('amount')?.value || 0),
        payment_status: document.getElementById('payment-status')?.value || 'pending',
        payment_method: document.getElementById('payment-method')?.value || '',
        notes: document.getElementById('notes')?.value || ''
    };

    console.log('📦 Invoice data:', invoiceData);

    // Validation
    if (!invoiceData.serial_number || !invoiceData.device_name || 
        !invoiceData.customer_name || !invoiceData.amount) {
        alert('Please fill in all required fields');
        console.error('❌ Validation failed');
        return;
    }

    if (invoiceData.amount <= 0) {
        alert('Amount must be greater than 0');
        return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (!submitBtn) {
        console.error('❌ Submit button not found');
        return;
    }

    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Creating Invoice...';
    submitBtn.disabled = true;

    try {
        const headers = getAuthHeaders();
        if (!headers) {
            alert('Not authenticated. Please login again.');
            window.location.href = '../login.html';
            return;
        }

        console.log('📡 Sending POST to:', `${API_BASE_URL}/api/invoices`);

        const response = await fetch(`${API_BASE_URL}/api/invoices`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(invoiceData)
        });

        console.log('📥 Response status:', response.status);

        const data = await response.json();
        console.log('📦 Response data:', data);

        if (response.ok) {
            console.log('✅ Invoice created successfully!');
            
            // Show success message
            const successMsg = document.getElementById('success-message');
            if (successMsg) {
                successMsg.classList.add('show');
                successMsg.style.display = 'block';
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                alert('✅ Invoice created successfully!');
            }

            // Redirect after delay
            setTimeout(() => {
                console.log('🔄 Redirecting to dashboard...');
                window.location.href = '../index.html';
            }, 2000);
        } else {
            console.error('❌ Invoice creation failed:', data.error);
            alert('Error: ' + (data.error || 'Failed to create invoice'));
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    } catch (error) {
        console.error('💥 Network error:', error);
        alert('Cannot connect to server. Please ensure backend is running at ' + API_BASE_URL);
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Test backend connection
(async function testBackend() {
    try {
        const response = await fetch(`${API_BASE_URL}/`, { method: 'GET' });
        if (response.ok) {
            console.log('✅ Backend online');
        } else {
            console.warn('⚠️ Backend returned:', response.status);
        }
    } catch (error) {
        console.error('❌ Backend offline:', error.message);
        console.error('📍 Ensure backend is running at:', API_BASE_URL);
    }
})();