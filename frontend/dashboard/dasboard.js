      // Switch tabs
        function switchTab(tabName) {
            var tabs = document.querySelectorAll('.tab');
            tabs.forEach(function(tab) {
                tab.classList.remove('active');
            });

            var sections = document.querySelectorAll('.content-section');
            sections.forEach(function(section) {
                section.classList.remove('active');
            });

            event.target.classList.add('active');

            if (tabName === 'all-users') {
                document.getElementById('all-users-section').classList.add('active');
            } else if (tabName === 'activity') {
                document.getElementById('activity-section').classList.add('active');
            } else if (tabName === 'settings') {
                document.getElementById('settings-section').classList.add('active');
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

        // Send Invitation
        function sendInvitation() {
            var name = document.getElementById('invite-name').value;
            var email = document.getElementById('invite-email').value;
            var department = document.getElementById('invite-department').value;
            var role = document.getElementById('invite-role').value;

            if (!name || !email || !department || !role) {
                alert('Please fill in all required fields');
                return;
            }

            // Get role display name
            var roleText = document.getElementById('invite-role').options[document.getElementById('invite-role').selectedIndex].text;
            roleText = roleText.split(' - ')[0]; // Get just "Super Admin", "Admin", or "User"

            var inviteData = {
                name: name,
                email: email,
                department: department,
                role: role
            };

            console.log('Sending invitation:', inviteData);
            
            // Show success message with role and department
            alert('✅ Invitation sent successfully!\n\nUser: ' + name + '\nEmail: ' + email + '\nDepartment: ' + document.getElementById('invite-department').options[document.getElementById('invite-department').selectedIndex].text + '\nRole: ' + roleText + '\n\nThe user will receive an email with instructions to set up their account.');
            
            // Close modal and reset form
            closeModal('add-user-modal');
            document.getElementById('invite-user-form').reset();
            
            // Update pending count
            var pendingCount = document.getElementById('pending-count');
            pendingCount.textContent = parseInt(pendingCount.textContent) + 1;
        }

        // Edit User
        function editUser(userId) {
            alert('Edit user ' + userId + ' - This will be connected to backend');
        }

        // Delete User
        function deleteUser(userId, userName) {
            if (confirm('Are you sure you want to delete user "' + userName + '"?\n\nThis action cannot be undone.')) {
                alert('User "' + userName + '" will be deleted - This will be connected to backend');
            }
        }

        // Resend Invite
        function resendInvite(userId) {
            if (confirm('Resend invitation email to this user?')) {
                alert('✉️ Invitation email has been resent!');
            }
        }

        // Profile form submission
        document.getElementById('profile-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            var currentPassword = document.getElementById('current-password').value;
            var newPassword = document.getElementById('new-password').value;
            var confirmPassword = document.getElementById('confirm-password').value;

            // Validate password change
            if (newPassword && newPassword !== confirmPassword) {
                alert('❌ New passwords do not match!');
                return;
            }

            if (newPassword && !currentPassword) {
                alert('❌ Please enter your current password to change password');
                return;
            }

            var profileData = {
                name: document.getElementById('profile-name').value,
                email: document.getElementById('profile-email').value,
                currentPassword: currentPassword,
                newPassword: newPassword
            };

            console.log('Updating profile:', profileData);
            
            alert('✅ Profile updated successfully!');
        });

        // Close modal when clicking outside
        window.addEventListener('click', function(event) {
            var modal = document.getElementById('add-user-modal');
            if (event.target === modal) {
                closeModal('add-user-modal');
            }
        });