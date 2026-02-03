// add-invoice.js - Create Invoice with JWT Authentication
const API_BASE_URL = 'http://127.0.0.1:5000';

let currentUser = null;
let selectedFile = null;

// Get JWT headers
function getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Initialize
document.addEventListener('DOMContentLoaded', async function() {
    currentUser = await checkAuth();
    if (!currentUser) {
        alert('Please login first');
        window.location.href = '../login.html';
        return;
    }

    var today = new Date().toISOString().split('T')[0];
    document.getElementById('invoice-date').value = today;
    
    generateSerialNumber();
    setupFileUpload();

    var invoiceForm = document.getElementById('invoice-form');
    if (invoiceForm) {
        invoiceForm.addEventListener('submit', handleSubmit);
    }
});

// Check auth
async function checkAuth() {
    const token = localStorage.getItem('access_token');
    if (!token) return null;

    try {
        const response = await fetch(`${API_BASE_URL}/api/current-user`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            return data.user;
        }
        return null;
    } catch (error) {
        return null;
    }
}

// Generate serial number
function generateSerialNumber() {
    var year = new Date().getFullYear();
    var random = Math.floor(Math.random() * 10000);
    var serial = 'INV-' + year + '-' + String(random).padStart(4, '0');
    
    var serialInput = document.getElementById('serial-number');
    if (serialInput && !serialInput.value) {
        serialInput.value = serial;
    }
}

// Setup file upload
function setupFileUpload() {
    var uploadArea = document.getElementById('upload-area');
    var fileInput = document.getElementById('file-input');
    var previewSection = document.getElementById('preview-section');
    var fileName = document.getElementById('file-name');
    var fileSize = document.getElementById('file-size');
    var removeFileBtn = document.getElementById('remove-file');

    if (!uploadArea || !fileInput) return;

    uploadArea.addEventListener('click', function() {
        fileInput.click();
    });

    fileInput.addEventListener('change', function(e) {
        handleFile(e.target.files[0]);
    });

    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    if (removeFileBtn) {
        removeFileBtn.addEventListener('click', function() {
            selectedFile = null;
            fileInput.value = '';
            if (previewSection) previewSection.classList.remove('active');
        });
    }

    function handleFile(file) {
        if (!file) return;

        var maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            alert('File size exceeds 10MB');
            return;
        }

        var allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            alert('Invalid file type. Use PNG, JPG, or PDF');
            return;
        }

        selectedFile = file;

        if (fileName) fileName.textContent = file.name;
        if (fileSize) fileSize.textContent = formatFileSize(file.size);
        if (previewSection) previewSection.classList.add('active');
    }
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    var k = 1024;
    var sizes = ['Bytes', 'KB', 'MB', 'GB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Handle submit
async function handleSubmit(e) {
    e.preventDefault();

    var invoiceData = {
        serial_number: document.getElementById('serial-number').value,
        device_name: document.getElementById('device-name').value,
        customer_name: document.getElementById('customer-name').value,
        customer_email: document.getElementById('customer-email').value || '',
        customer_phone: document.getElementById('customer-phone').value || '',
        invoice_date: document.getElementById('invoice-date').value,
        amount: parseFloat(document.getElementById('amount').value),
        payment_status: document.getElementById('payment-status').value,
        payment_method: document.getElementById('payment-method').value,
        notes: document.getElementById('notes').value || ''
    };

    // Validate
    if (!invoiceData.serial_number || !invoiceData.device_name || 
        !invoiceData.customer_name || !invoiceData.amount) {
        alert('Please fill in all required fields');
        return;
    }

    var submitBtn = e.target.querySelector('button[type="submit"]');
    var originalText = submitBtn.textContent;
    submitBtn.textContent = 'Creating Invoice...';
    submitBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/api/invoices`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(invoiceData)
        });

        const data = await response.json();

        if (response.ok) {
            var successMessage = document.getElementById('success-message');
            if (successMessage) {
                successMessage.classList.add('show');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }

            setTimeout(function() {
                window.location.href = '../index.html';
            }, 2000);
        } else {
            alert('Error: ' + (data.error || 'Failed to create invoice'));
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    } catch (error) {
        console.error('Create error:', error);
        alert('Network error. Please try again.');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}