// File upload functionality will be added later
// Get elements
        var uploadArea = document.getElementById('upload-area');
        var fileInput = document.getElementById('file-input');
        var previewSection = document.getElementById('preview-section');
        var fileName = document.getElementById('file-name');
        var fileSize = document.getElementById('file-size');
        var fileIcon = document.getElementById('file-icon');
        var imagePreview = document.getElementById('image-preview');
        var removeFileBtn = document.getElementById('remove-file');
        var selectedFile = null;

        // Click to upload
        uploadArea.addEventListener('click', function() {
            fileInput.click();
        });

        // File selected
        fileInput.addEventListener('change', function(e) {
            handleFile(e.target.files[0]);
        });

        // Drag and drop functionality
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
            
            var files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFile(files[0]);
            }
        });

        // Handle file
        function handleFile(file) {
            if (!file) return;

            // Check file size (10MB max)
            var maxSize = 10 * 1024 * 1024; // 10MB in bytes
            if (file.size > maxSize) {
                alert('File size exceeds 10MB. Please choose a smaller file.');
                return;
            }

            // Check file type
            var allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
            if (!allowedTypes.includes(file.type)) {
                alert('Invalid file type. Please upload PNG, JPG, JPEG, or PDF files only.');
                return;
            }

            selectedFile = file;

            // Display file info
            fileName.textContent = file.name;
            fileSize.textContent = formatFileSize(file.size);

            // Set icon based on file type
            if (file.type === 'application/pdf') {
                fileIcon.textContent = '📄';
            } else {
                fileIcon.textContent = '🖼️';
            }

            // Show preview section
            previewSection.classList.add('active');

            // Show image preview if it's an image
            if (file.type.startsWith('image/')) {
                var reader = new FileReader();
                reader.onload = function(e) {
                    imagePreview.innerHTML = '<img src="' + e.target.result + '" alt="Preview">';
                };
                reader.readAsDataURL(file);
            } else {
                imagePreview.innerHTML = '';
            }
        }

        // Remove file
        removeFileBtn.addEventListener('click', function() {
            selectedFile = null;
            fileInput.value = '';
            previewSection.classList.remove('active');
            imagePreview.innerHTML = '';
        });

        // Format file size
        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            var k = 1024;
            var sizes = ['Bytes', 'KB', 'MB', 'GB'];
            var i = Math.floor(Math.log(bytes) / Math.log(k));
            return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
        }

        // Form submission
        var invoiceForm = document.getElementById('invoice-form');
        var successMessage = document.getElementById('success-message');

        invoiceForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get form data
            var formData = {
                serialNumber: document.getElementById('serial-number').value,
                invoiceDate: document.getElementById('invoice-date').value,
                deviceName: document.getElementById('device-name').value,
                customerName: document.getElementById('customer-name').value,
                customerEmail: document.getElementById('customer-email').value,
                customerPhone: document.getElementById('customer-phone').value,
                amount: document.getElementById('amount').value,
                paymentStatus: document.getElementById('payment-status').value,
                paymentMethod: document.getElementById('payment-method').value,
                notes: document.getElementById('notes').value,
                file: selectedFile
            };

            // Here you will send data to backend (Python Flask)
            console.log('Form Data:', formData);

            // Show success message
            successMessage.classList.add('show');
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Hide message after 3 seconds
            setTimeout(function() {
                successMessage.classList.remove('show');
            }, 3000);

            // Reset form (optional)
            // invoiceForm.reset();
            // selectedFile = null;
            // previewSection.classList.remove('active');
        });

        // Set today's date as default
        var today = new Date().toISOString().split('T')[0];
        document.getElementById('invoice-date').value = today;