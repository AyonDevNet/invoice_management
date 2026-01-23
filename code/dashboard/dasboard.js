
        // Current user role (will come from backend)
        var currentUserRole = 'super-admin'; // Options: 'super-admin', 'admin', 'user'

        // Switch tabs
        function switchTab(tabName) {
            // Remove active from all tabs
            var tabs = document.querySelectorAll('.tab');
            tabs.forEach(function(tab) {
                tab.classList.remove('active');
            });

            // Remove active from all sections
            var sections = document.querySelectorAll('.content-section');
            sections.forEach(function(section) {
                section.classList.remove('active');
            });

            // Add active to clicked tab
            event.target.classList.add('active');

            // Show corresponding section
            if (tabName === 'all-users') {
                document.getElementById('all-users-section').classList.add('active');
            } else if (tabName === 'roles') {
                document.getElementById('roles-section').classList.add('active');
            } else if (tabName === 'activity') {
                document.getElementById('activity-section').classList.add('active');
            }
        }

        // Open Add User Modal
        function openAddUserModal() {
            document.getElementById('add-user-modal').classList.add('active');
        }

        // Close Modal
        function closeModal(modalId) {
            document.getElementById(modalId).classList.remove('active');
        }

        // Edit User
        function editUser(userId) {
            alert('Edit user ' + userId + ' - This will be connected to backend');
        }

        // Delete User
        function deleteUser(userId, userName) {
            if (confirm('Are you sure you want to delete user "' + userName + '"? This action cannot be undone.')) {
                alert('Deleting user ' + userId + ' - This will be connected to backend');
            }
        }

        // Form submission
        document.getElementById('add-user-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            var userData = {
                name: document.getElementById('user-name').value,
                email: document.getElementById('user-email').value,
                role: document.getElementById('user-role').value,
                password: document.getElementById('user-password').value
            };

            console.log('Creating user:', userData);
            
            // This will be connected to backend API later
            alert('User will be created and added to the system');
            
            // Close modal and reset form
            closeModal('add-user-modal');
            document.getElementById('add-user-form').reset();
        });

        // Check user role and hide/show elements
        function initializePageBasedOnRole()