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
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Perform Search
        function performSearch(event) {
            if (event) event.preventDefault();
            
            var serial = document.getElementById('serial').value.toLowerCase();
            var device = document.getElementById('device').value.toLowerCase();
            var customer = document.getElementById('customer').value.toLowerCase();

            // Sample invoice data
            var invoices = [
                { serial: 'INV-2025-012', device: 'MacBook Pro M3', customer: 'Fatima Ali', date: '05 Jan 2025', amount: '$2,499.00' },
                { serial: 'INV-2024-156', device: 'Samsung Galaxy S24', customer: 'Karim Hassan', date: '10 Dec 2024', amount: '$1,099.99' },
                { serial: 'INV-2024-155', device: 'Apple Watch Series 9', customer: 'Sara Rahman', date: '05 Dec 2024', amount: '$399.00' },
                { serial: 'INV-2016-002', device: 'iPhone 7 Plus', customer: 'Sara Rahman', date: '20 Jan 2016', amount: '$869.00' },
                { serial: 'INV-2016-001', device: 'Laptop Dell XPS 15', customer: 'Ahmed Khan', date: '15 Jan 2016', amount: '$1,299.99' }
            ];

            // Filter invoices
            var filtered = invoices.filter(function(inv) {
                var matchSerial = !serial || inv.serial.toLowerCase().includes(serial);
                var matchDevice = !device || inv.device.toLowerCase().includes(device);
                var matchCustomer = !customer || inv.customer.toLowerCase().includes(customer);
                return matchSerial && matchDevice && matchCustomer;
            });

            // Display results
            var tbody = document.getElementById('search-results');
            if (filtered.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px; color: #6B7280;">No invoices found matching your criteria</td></tr>';
            } else {
                tbody.innerHTML = filtered.map(function(inv) {
                    return '<tr>' +
                        '<td>' + inv.serial + '</td>' +
                        '<td>' + inv.device + '</td>' +
                        '<td>' + inv.customer + '</td>' +
                        '<td>' + inv.date + '</td>' +
                        '<td>' + inv.amount + '</td>' +
                        '<td class="table-actions">' +
                        '<button class="action-btn view">View</button>' +
                        '<button class="action-btn edit">Edit</button>' +
                        '<button class="action-btn delete">Delete</button>' +
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
            document.getElementById('date-from').value = '';
            document.getElementById('date-to').value = '';
            document.getElementById('search-results').innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px; color: #6B7280;">Enter search criteria and click "Search" to find invoices</td></tr>';
        }
