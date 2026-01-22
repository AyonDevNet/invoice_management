        function switchTab(tab) {
            // Get all tabs and forms
            var loginTab = document.getElementById('login-tab');
            var registerTab = document.getElementById('register-tab');
            var loginForm = document.getElementById('login-form');
            var registerForm = document.getElementById('register-form');

            // Remove active class from both
            loginTab.classList.remove('active');
            registerTab.classList.remove('active');
            loginForm.classList.remove('active');
            registerForm.classList.remove('active');

            // Add active class to selected tab and form
            if (tab === 'login') {
                loginTab.classList.add('active');
                loginForm.classList.add('active');
            } else {
                registerTab.classList.add('active');
                registerForm.classList.add('active');
            }
        }

        function togglePassword(inputId) {
            var input = document.getElementById(inputId);
            if (input.type === 'password') {
                input.type = 'text';
            } else {
                input.type = 'password';
            }
        }
  