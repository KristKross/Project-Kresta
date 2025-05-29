document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('.contact-form');
    const submitBtn = document.querySelector('.submit-btn');
    
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactFormSubmission);
    }

    async function handleContactFormSubmission(e) {
        e.preventDefault();
        
        // Get form data
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const subject = document.getElementById('subject').value.trim();
        const message = document.getElementById('message').value.trim();
        
        // Validate form
        if (!validateForm(name, email, subject, message)) {
            return;
        }
        
        // Show loading state
        setLoadingState(true);
        
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    email,
                    subject,
                    message
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                showSuccessMessage(data.message);
                contactForm.reset();
            } else {
                showErrorMessage(data.message || 'Failed to send message. Please try again.');
            }
            
        } catch (error) {
            console.error('Error sending message:', error);
            showErrorMessage('Network error. Please check your connection and try again.');
        } finally {
            setLoadingState(false);
        }
    }
    
    function validateForm(name, email, subject, message) {
        // Remove any existing error messages
        clearErrorMessages();
        
        let isValid = true;
        
        // Validate name
        if (!name) {
            showFieldError('name', 'Full name is required');
            isValid = false;
        } else if (name.length < 2) {
            showFieldError('name', 'Name must be at least 2 characters long');
            isValid = false;
        }
        
        // Validate email
        if (!email) {
            showFieldError('email', 'Email address is required');
            isValid = false;
        } else if (!isValidEmail(email)) {
            showFieldError('email', 'Please enter a valid email address');
            isValid = false;
        }
        
        // Validate subject
        if (!subject) {
            showFieldError('subject', 'Subject is required');
            isValid = false;
        } else if (subject.length < 5) {
            showFieldError('subject', 'Subject must be at least 5 characters long');
            isValid = false;
        }
        
        // Validate message
        if (!message) {
            showFieldError('message', 'Message is required');
            isValid = false;
        } else if (message.length < 10) {
            showFieldError('message', 'Message must be at least 10 characters long');
            isValid = false;
        } else if (message.length > 1000) {
            showFieldError('message', 'Message must be less than 1000 characters');
            isValid = false;
        }
        
        return isValid;
    }
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const formGroup = field.closest('.form-group');
        
        // Remove existing error
        const existingError = formGroup.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Add error class to field
        field.classList.add('error');
        
        // Create and add error message
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        errorElement.style.color = '#e74c3c';
        errorElement.style.fontSize = '14px';
        errorElement.style.marginTop = '5px';
        
        formGroup.appendChild(errorElement);
    }
    
    function clearErrorMessages() {
        // Remove error classes from all fields
        document.querySelectorAll('.form-input').forEach(field => {
            field.classList.remove('error');
        });
        
        // Remove all error messages
        document.querySelectorAll('.field-error').forEach(error => {
            error.remove();
        });
        
        // Remove any global messages
        const existingMessage = document.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }
    }
    
    function showSuccessMessage(message) {
        showFormMessage(message, 'success');
    }
    
    function showErrorMessage(message) {
        showFormMessage(message, 'error');
    }
    
    function showFormMessage(message, type) {
        // Remove any existing message
        const existingMessage = document.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = `form-message ${type}`;
        messageElement.textContent = message;
        
        // Style the message
        messageElement.style.padding = '15px';
        messageElement.style.borderRadius = '5px';
        messageElement.style.marginBottom = '20px';
        messageElement.style.fontSize = '14px';
        messageElement.style.fontWeight = '500';
        
        if (type === 'success') {
            messageElement.style.backgroundColor = '#d4edda';
            messageElement.style.color = '#155724';
            messageElement.style.border = '1px solid #c3e6cb';
        } else {
            messageElement.style.backgroundColor = '#f8d7da';
            messageElement.style.color = '#721c24';
            messageElement.style.border = '1px solid #f5c6cb';
        }
        
        // Insert message at the top of the form
        contactForm.insertBefore(messageElement, contactForm.firstChild);
        
        // Scroll to message
        messageElement.scrollIntoView({ behavior: 'smooth' });
        
        // Auto-remove success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.remove();
                }
            }, 5000);
        }
    }
    
    function setLoadingState(isLoading) {
        if (isLoading) {
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';
            submitBtn.innerHTML = 'Sending Message...';
            submitBtn.style.cursor = 'not-allowed';
        } else {
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.innerHTML = 'Send Message';
            submitBtn.style.cursor = 'pointer';
        }
    }
    
    // Add real-time validation feedback
    document.querySelectorAll('.form-input').forEach(input => {
        input.addEventListener('blur', function() {
            const fieldId = this.id;
            const value = this.value.trim();
            
            // Clear existing error for this field
            const formGroup = this.closest('.form-group');
            const existingError = formGroup.querySelector('.field-error');
            if (existingError) {
                existingError.remove();
            }
            this.classList.remove('error');
            
            // Validate individual field
            if (fieldId === 'name' && value && value.length < 2) {
                showFieldError(fieldId, 'Name must be at least 2 characters long');
            } else if (fieldId === 'email' && value && !isValidEmail(value)) {
                showFieldError(fieldId, 'Please enter a valid email address');
            } else if (fieldId === 'subject' && value && value.length < 5) {
                showFieldError(fieldId, 'Subject must be at least 5 characters long');
            } else if (fieldId === 'message' && value && value.length < 10) {
                showFieldError(fieldId, 'Message must be at least 10 characters long');
            } else if (fieldId === 'message' && value && value.length > 1000) {
                showFieldError(fieldId, 'Message must be less than 1000 characters');
            }
        });
    });
    
    // Character counter for message field
    const messageField = document.getElementById('message');
    if (messageField) {
        const characterCounter = document.createElement('div');
        characterCounter.className = 'character-counter';
        characterCounter.style.fontSize = '12px';
        characterCounter.style.color = '#666';
        characterCounter.style.marginTop = '5px';
        characterCounter.style.textAlign = 'right';
        
        messageField.parentNode.appendChild(characterCounter);
        
        function updateCharacterCount() {
            const count = messageField.value.length;
            const maxLength = 1000;
            characterCounter.textContent = `${count}/${maxLength} characters`;
            
            if (count > maxLength) {
                characterCounter.style.color = '#e74c3c';
            } else if (count > maxLength * 0.8) {
                characterCounter.style.color = '#f39c12';
            } else {
                characterCounter.style.color = '#666';
            }
        }
        
        messageField.addEventListener('input', updateCharacterCount);
        updateCharacterCount(); // Initial count
    }
});