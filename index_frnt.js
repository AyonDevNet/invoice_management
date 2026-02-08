// index_frnt.js - Dashboard with Auto-Sync to Backend
const API_BASE_URL = 'http://127.0.0.1:5000';

console.log('='.repeat(60));
console.log('📊 Dashboard Script Loaded');
console.log('📡 Backend URL:', API_BASE_URL);
console.log('='.repeat(60));

let currentUser = null;
let allInvoices = [];
let autoSyncInterval = null;

// Get JWT headers
function getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    if (!token) {
        console.warn('⚠️ No auth token found');
        return null;
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async function() {
    console.log('✅ Dashboard DOM loaded');
    
    // Check authentication
    currentUser = await checkAuth();
    
    if (!currentUser) {
        console.warn('❌ Not authenticated');
        showAuthWarning();
        loadDemoData();
    } else {
        console.log('✅ Authenticated as:', currentUser.name);
        hideAuthWarning();
        
        // Load data from backend
        await loadInvoicesFromBackend();
        
        // Start auto-sync (refresh every 30 seconds)
        startAutoSync();
    }
    
    // Setup logout button if exists
    setupLogout();
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

        console.log('📥 Auth check response:', response.status);

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Auth successful:', data.user);
            return data.user;
        }
        // 401 Unauthorized or 422 Unprocessable (invalid/malformed token)
        if (response.status === 401 || response.status === 422) {
            console.warn('❌ Auth failed (', response.status, '), clearing token');
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            return null;
        }
        console.warn('❌ Auth failed, clearing token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        return null;
    } catch (error) {
        console.error('💥 Auth check error:', error);
        return null;
    }
}

// Show authentication state in header (not logged in)
function showAuthWarning() {
    const signinLink = document.getElementById('auth-signin-link');
    const userSpan = document.getElementById('auth-user-span');
    const logoutLink = document.getElementById('auth-logout-link');
    if (signinLink) signinLink.classList.remove('hidden');
    if (userSpan) { userSpan.classList.add('hidden'); userSpan.textContent = ''; }
    if (logoutLink) logoutLink.classList.add('hidden');
}

// Hide auth warning and show logged-in state in header
function hideAuthWarning() {
    const signinLink = document.getElementById('auth-signin-link');
    const userSpan = document.getElementById('auth-user-span');
    const logoutLink = document.getElementById('auth-logout-link');
    if (signinLink) signinLink.classList.add('hidden');
    if (userSpan && currentUser) {
        userSpan.classList.remove('hidden');
        userSpan.textContent = 'Welcome, ' + (currentUser.name || currentUser.email || 'User');
    }
    if (logoutLink) {
        logoutLink.classList.remove('hidden');
        logoutLink.href = '#';
    }
}

// Load demo data (fallback)
function loadDemoData() {
    console.log('📦 Loading demo data...');
    allInvoices = [
        {
            id: 1,
            serial_number: 'DEMO-001',
            device_name: 'Demo Device',
            customer_name: 'Demo Customer',
            invoice_date: '2025-01-01',
            amount: 100.00,
            payment_status: 'pending'
        }
    ];
}

// Load invoices from backend
async function loadInvoicesFromBackend() {
    console.log('📡 Loading invoices from backend...');
    
    try {
        const headers = getAuthHeaders();
        if (!headers) {
            console.error('❌ No auth headers');
            loadDemoData();
            return;
        }
        
        const response = await fetch(`${API_BASE_URL}/api/invoices`, {
            method: 'GET',
            headers: headers
        });

        console.log('📥 Get invoices response:', response.status);

        if (response.ok) {
            const data = await response.json();
            allInvoices = data.invoices || [];
            console.log(`✅ Loaded ${allInvoices.length} invoices`);
            
            // Update UI if on view-all section
            if (!document.getElementById('view-all-section')?.classList.contains('hidden')) {
                displayAllInvoices();
            }
        } else {
            console.error('❌ Failed to load invoices:', response.status);
            const errorData = await response.json().catch(() => ({}));
            console.error('Error details:', errorData);
            loadDemoData();
        }
    } catch (error) {
        console.error('💥 Load invoices error:', error);
        loadDemoData();
    }
}

// Start auto-sync with backend
function startAutoSync() {
    console.log('🔄 Starting auto-sync (every 30s)');
    
    // Clear any existing interval
    if (autoSyncInterval) {
        clearInterval(autoSyncInterval);
    }
    
    // Sync every 30 seconds
    autoSyncInterval = setInterval(async () => {
        console.log('🔄 Auto-syncing with backend...');
        await loadInvoicesFromBackend();
    }, 30000);
}

// Stop auto-sync
function stopAutoSync() {
    if (autoSyncInterval) {
        clearInterval(autoSyncInterval);
        autoSyncInterval = null;
        console.log('⏸️ Auto-sync stopped');
    }
}

// Show Dashboard
function showDashboard() {
    console.log('📊 Showing dashboard');
    document.getElementById('dashboard-section')?.classList.remove('hidden');
    document.getElementById('search-section')?.classList.add('hidden');
    document.getElementById('view-all-section')?.classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Show Search Section
function showSearchSection() {
    console.log('🔍 Showing search section');
    document.getElementById('dashboard-section')?.classList.add('hidden');
    document.getElementById('search-section')?.classList.remove('hidden');
    document.getElementById('view-all-section')?.classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Show View All Section
function showViewAllSection() {
    console.log('📋 Showing view all section');
    document.getElementById('dashboard-section')?.classList.add('hidden');
    document.getElementById('search-section')?.classList.add('hidden');
    document.getElementById('view-all-section')?.classList.remove('hidden');
    
    // Refresh data from backend
    if (currentUser) {
        loadInvoicesFromBackend().then(() => {
            displayAllInvoices();
        });
    } else {
        displayAllInvoices();
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Display all invoices
function displayAllInvoices() {
    console.log('📊 Displaying', allInvoices.length, 'invoices');
    
    const tbody = document.querySelector('#view-all-section tbody');
    if (!tbody) {
        console.error('❌ Table body not found');
        return;
    }

    if (allInvoices.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: #6B7280;">
                    ${currentUser ? 
                        'No invoices found. <a href="add-newinvoice/add-invoice.html">Create your first invoice</a>' :
                        'Please <a href="login.html">login</a> to view your invoices'}
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = allInvoices.map(inv => `
        <tr>
            <td>${inv.serial_number || inv.invoice_number || 'N/A'}</td>
            <td>${inv.device_name || inv.client_name || 'N/A'}</td>
            <td>${inv.customer_name || inv.client_name || 'N/A'}</td>
            <td>${formatDate(inv.invoice_date || inv.issue_date)}</td>
            <td>$${parseFloat(inv.amount || inv.total || 0).toFixed(2)}</td>
            <td class="table-actions">
                <button class="action-btn view" onclick="viewInvoice(${inv.id})">View</button>
                <button class="action-btn edit" onclick="editInvoice(${inv.id})">Edit</button>
                <button class="action-btn delete" onclick="deleteInvoice(${inv.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Perform Search
function performSearch(event) {
    if (event) event.preventDefault();
    
    console.log('🔍 Performing search...');
    
    const serial = document.getElementById('serial')?.value.toLowerCase() || '';
    const device = document.getElementById('device')?.value.toLowerCase() || '';
    const customer = document.getElementById('customer')?.value.toLowerCase() || '';

    const filtered = allInvoices.filter(inv => {
        const matchSerial = !serial || (inv.serial_number || inv.invoice_number || '').toLowerCase().includes(serial);
        const matchDevice = !device || (inv.device_name || inv.client_name || '').toLowerCase().includes(device);
        const matchCustomer = !customer || (inv.customer_name || inv.client_name || '').toLowerCase().includes(customer);
        return matchSerial && matchDevice && matchCustomer;
    });

    console.log(`✅ Found ${filtered.length} matches`);

    const tbody = document.getElementById('search-results');
    if (!tbody) return;

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px; color: #6B7280;">No invoices found</td></tr>';
    } else {
        tbody.innerHTML = filtered.map(inv => `
            <tr>
                <td>${inv.serial_number || inv.invoice_number || 'N/A'}</td>
                <td>${inv.device_name || inv.client_name || 'N/A'}</td>
                <td>${inv.customer_name || inv.client_name || 'N/A'}</td>
                <td>${formatDate(inv.invoice_date || inv.issue_date)}</td>
                <td>$${parseFloat(inv.amount || inv.total || 0).toFixed(2)}</td>
                <td class="table-actions">
                    <button class="action-btn view" onclick="viewInvoice(${inv.id})">View</button>
                    <button class="action-btn edit" onclick="editInvoice(${inv.id})">Edit</button>
                    <button class="action-btn delete" onclick="deleteInvoice(${inv.id})">Delete</button>
                </td>
            </tr>
        `).join('');
    }
}

// Clear Search
function clearSearch() {
    console.log('🗑️ Clearing search');
    ['serial', 'device', 'customer', 'date-from', 'date-to'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    
    const searchResults = document.getElementById('search-results');
    if (searchResults) {
        searchResults.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px; color: #6B7280;">Enter search criteria and click "Search"</td></tr>';
    }
}

// View Invoice
function viewInvoice(id) {
    console.log('👁️ View invoice:', id);
    alert('View invoice #' + id + ' - Feature coming soon!');
}

// Edit Invoice
function editInvoice(id) {
    console.log('✏️ Edit invoice:', id);
    alert('Edit invoice #' + id + ' - Feature coming soon!');
}

// Delete Invoice
async function deleteInvoice(id) {
    if (!confirm('Delete this invoice? This cannot be undone.')) {
        return;
    }

    if (!currentUser) {
        alert('Please login first');
        window.location.href = 'login.html';
        return;
    }

    console.log('🗑️ Deleting invoice:', id);

    try {
        const headers = getAuthHeaders();
        if (!headers) {
            alert('Not authenticated');
            return;
        }

        const response = await fetch(`${API_BASE_URL}/api/invoices/${id}`, {
            method: 'DELETE',
            headers: headers
        });

        if (response.ok) {
            console.log('✅ Invoice deleted');
            alert('Invoice deleted successfully!');
            
            // Reload from backend
            await loadInvoicesFromBackend();
            
            // Refresh display
            if (!document.getElementById('view-all-section')?.classList.contains('hidden')) {
                displayAllInvoices();
            }
        } else {
            const data = await response.json().catch(() => ({}));
            console.error('❌ Delete failed:', data);
            alert('Error: ' + (data.error || 'Failed to delete'));
        }
    } catch (error) {
        console.error('💥 Delete error:', error);
        alert('Network error. Please try again.');
    }
}

// Format date
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    } catch {
        return dateString;
    }
}

function doLogout(e) {
    if (e) e.preventDefault();
    console.log('🚪 Logging out...');
    try {
        const headers = getAuthHeaders();
        if (headers) {
            fetch(`${API_BASE_URL}/api/logout`, { method: 'POST', headers: headers }).catch(() => {});
        }
    } catch (err) { /* ignore */ }
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    stopAutoSync();
    window.location.href = 'login.html';
}

// Logout
function setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    const headerLogoutLink = document.getElementById('auth-logout-link');
    if (logoutBtn) logoutBtn.addEventListener('click', doLogout);
    if (headerLogoutLink) headerLogoutLink.addEventListener('click', doLogout);
}

async function logout() {
    await setupLogout();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    stopAutoSync();
});

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
    }
})();