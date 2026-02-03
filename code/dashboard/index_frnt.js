// index_frnt.js - Dashboard with JWT Authentication
const API_BASE_URL = 'http://127.0.0.1:5000';

let currentUser = null;
let allInvoices = [];

// Get JWT token from localStorage
function getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Dashboard loading...');
    
    currentUser = await checkAuth();
    
    if (!currentUser) {
        console.warn('Not authenticated');
        showAuthWarning();
        loadDemoData();
    } else {
        console.log('Authenticated as:', currentUser);
        await loadInvoicesFromBackend();
    }
});

// Show authentication warning
function showAuthWarning() {
    var warning = document.createElement('div');
    warning.style.cssText = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #FEF3C7; color: #92400E; padding: 15px 30px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 9999; font-weight: 600;';
    warning.innerHTML = '⚠️ Not logged in. <a href="login.html" style="color: #3B82F6; text-decoration: underline; margin-left: 10px;">Click here to login</a>';
    document.body.appendChild(warning);
}

// Check authentication
async function checkAuth() {
    const token = localStorage.getItem('access_token');
    if (!token) return null;

    try {
        console.log('Checking authentication...');
        const response = await fetch(`${API_BASE_URL}/api/current-user`, {
            headers: getAuthHeaders()
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Auth successful:', data);
            return data.user;
        } else {
            console.warn('Auth failed:', response.status);
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            return null;
        }
    } catch (error) {
        console.error('Auth error:', error);
        return null;
    }
}

// Load demo data
function loadDemoData() {
    console.log('Loading demo data...');
    allInvoices = [
        { 
            id: 1,
            serial_number: 'INV-2025-001',
            device_name: 'MacBook Pro M3',
            customer_name: 'John Doe',
            invoice_date: '2025-01-15',
            amount: 2499.00,
            payment_status: 'paid'
        },
        { 
            id: 2,
            serial_number: 'INV-2025-002',
            device_name: 'iPhone 15 Pro',
            customer_name: 'Jane Smith',
            invoice_date: '2025-01-20',
            amount: 1099.00,
            payment_status: 'pending'
        }
    ];
}

// Load invoices from backend
async function loadInvoicesFromBackend() {
    try {
        console.log('Loading invoices from backend...');
        const response = await fetch(`${API_BASE_URL}/api/invoices`, {
            headers: getAuthHeaders()
        });

        if (response.ok) {
            const data = await response.json();
            allInvoices = data.invoices;
            console.log('Loaded invoices:', allInvoices.length);
        } else {
            console.error('Failed to load invoices');
            loadDemoData();
        }
    } catch (error) {
        console.error('Load error:', error);
        loadDemoData();
    }
}

// Show Dashboard
function showDashboard() {
    document.getElementById('dashboard-section').classList.remove('hidden');
    document.getElementById('search-section').classList.add('hidden');
    document.getElementById('view-all-section').classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Show Search Section
function showSearchSection() {
    document.getElementById('dashboard-section').classList.add('hidden');
    document.getElementById('search-section').classList.remove('hidden');
    document.getElementById('view-all-section').classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Show View All Section
function showViewAllSection() {
    document.getElementById('dashboard-section').classList.add('hidden');
    document.getElementById('search-section').classList.add('hidden');
    document.getElementById('view-all-section').classList.remove('hidden');
    displayAllInvoices();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Display all invoices
function displayAllInvoices() {
    var tbody = document.querySelector('#view-all-section tbody');
    
    if (!tbody) {
        console.error('Table body not found');
        return;
    }

    if (allInvoices.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px; color: #6B7280;">No invoices found. <a href="add-newinvoice/add-invoice.html">Create your first invoice</a></td></tr>';
        return;
    }

    tbody.innerHTML = allInvoices.map(function(inv) {
        return '<tr>' +
            '<td>' + inv.serial_number + '</td>' +
            '<td>' + inv.device_name + '</td>' +
            '<td>' + inv.customer_name + '</td>' +
            '<td>' + formatDate(inv.invoice_date) + '</td>' +
            '<td>$' + parseFloat(inv.amount).toFixed(2) + '</td>' +
            '<td class="table-actions">' +
            '<button class="action-btn view" onclick="viewInvoice(' + inv.id + ')">View</button>' +
            '<button class="action-btn edit" onclick="editInvoice(' + inv.id + ')">Edit</button>' +
            '<button class="action-btn delete" onclick="deleteInvoice(' + inv.id + ')">Delete</button>' +
            '</td>' +
            '</tr>';
    }).join('');
}

// Perform Search
function performSearch(event) {
    if (event) event.preventDefault();
    
    var serial = document.getElementById('serial').value.toLowerCase();
    var device = document.getElementById('device').value.toLowerCase();
    var customer = document.getElementById('customer').value.toLowerCase();

    console.log('Searching:', { serial, device, customer });

    var filtered = allInvoices.filter(function(inv) {
        var matchSerial = !serial || inv.serial_number.toLowerCase().includes(serial);
        var matchDevice = !device || inv.device_name.toLowerCase().includes(device);
        var matchCustomer = !customer || inv.customer_name.toLowerCase().includes(customer);
        return matchSerial && matchDevice && matchCustomer;
    });

    var tbody = document.getElementById('search-results');
    if (!tbody) return;

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px; color: #6B7280;">No invoices found</td></tr>';
    } else {
        tbody.innerHTML = filtered.map(function(inv) {
            return '<tr>' +
                '<td>' + inv.serial_number + '</td>' +
                '<td>' + inv.device_name + '</td>' +
                '<td>' + inv.customer_name + '</td>' +
                '<td>' + formatDate(inv.invoice_date) + '</td>' +
                '<td>$' + parseFloat(inv.amount).toFixed(2) + '</td>' +
                '<td class="table-actions">' +
                '<button class="action-btn view" onclick="viewInvoice(' + inv.id + ')">View</button>' +
                '<button class="action-btn edit" onclick="editInvoice(' + inv.id + ')">Edit</button>' +
                '<button class="action-btn delete" onclick="deleteInvoice(' + inv.id + ')">Delete</button>' +
                '</td>' +
                '</tr>';
        }).join('');
    }
}

// Clear Search
function clearSearch() {
    document.getElementById('serial').value = '';
    document.getElementById('device').value = '';
    document.getElementById('customer').value = '';
    if (document.getElementById('date-from')) document.getElementById('date-from').value = '';
    if (document.getElementById('date-to')) document.getElementById('date-to').value = '';
    document.getElementById('search-results').innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px; color: #6B7280;">Enter search criteria and click "Search"</td></tr>';
}

// View Invoice
function viewInvoice(id) {
    console.log('View invoice:', id);
    alert('View invoice #' + id + ' - Feature coming soon!');
}

// Edit Invoice
function editInvoice(id) {
    console.log('Edit invoice:', id);
    alert('Edit invoice #' + id + ' - Feature coming soon!');
}

// Delete Invoice
async function deleteInvoice(id) {
    if (!confirm('Delete this invoice?')) return;

    if (!currentUser) {
        alert('Please login first');
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/invoices/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (response.ok) {
            alert('Invoice deleted!');
            await loadInvoicesFromBackend();
            
            if (!document.getElementById('view-all-section').classList.contains('hidden')) {
                displayAllInvoices();
            }
        } else {
            const data = await response.json();
            alert('Error: ' + data.error);
        }
    } catch (error) {
        console.error('Delete error:', error);
        alert('Network error');
    }
}

// Format date
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

// Logout
async function logout() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/logout`, {
            method: 'POST',
            headers: getAuthHeaders()
        });

        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    } catch (error) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }
}

console.log('='.repeat(50));
console.log('Invoice Management - Dashboard');
console.log('Backend:', API_BASE_URL);
console.log('='.repeat(50));