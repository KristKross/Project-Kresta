document.addEventListener('DOMContentLoaded', () => {
    // Tab switching functionality
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            document.getElementById(button.dataset.tab).classList.add('active');
        });
    });

    // Profile picture upload functionality
    const profilePictureInput = document.getElementById('profile-picture-input');
    const changePictureBtn = document.querySelector('.change-picture-btn');
    const profilePictures = document.querySelectorAll('.profile-picture');

    changePictureBtn?.addEventListener('click', () => {
        profilePictureInput?.click();
    });

    profilePictureInput?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                profilePictures.forEach(pic => {
                    pic.src = e.target.result;
                });
            };
            reader.readAsDataURL(file);
        }
    });

    // Form submission handlers
    const profileForm = document.querySelector('.profile-form');
    const securityForm = document.querySelector('.security-form');

    profileForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        // Add your profile update logic here
        alert('Profile updated successfully!');
    });

    securityForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        // Add your password change logic here
        alert('Password updated successfully!');
    });

    // Delete account handler
    const deleteAccountBtn = document.querySelector('.delete-account-btn');
    deleteAccountBtn?.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            // Add your account deletion logic here
            alert('Account deleted successfully!');
        }
    });

    // Download data handler
    const downloadDataBtn = document.querySelector('.download-data-btn');
    downloadDataBtn?.addEventListener('click', () => {
        // Add your data download logic here
        alert('Your data is being prepared for download...');
    });

    // Workspace management
    const inviteForm = document.querySelector('.invite-form');
    const membersList = document.querySelector('.members-list');
    const deleteMemberPopup = document.querySelector('.delete-member-popup');
    const inviteSuccessPopup = document.querySelector('.workspace-popup.invite-success-popup');

    let memberToDelete = null;

    function showPopup(popup) {
        popup.classList.add('active');
    }

    function hidePopup(popup) {
        popup.classList.remove('active');
    }

    function addMember(email) {
        const memberElement = document.createElement('div');
        memberElement.className = 'member';
        memberElement.innerHTML = `
            <img src="./assets/images/dashboard/default-avatar.png" alt="" class="member-avatar">
            <div class="member-info">
                <p class="member-name">Pending</p>
                <p class="member-email">${email}</p>
            </div>
            <span class="member-role">Pending</span>
            <button class="remove-member" title="Remove member">
                <i class="material-icons">person_remove</i>
            </button>
        `;

        // Add remove functionality
        const removeButton = memberElement.querySelector('.remove-member');
        removeButton.addEventListener('click', () => {
            memberToDelete = memberElement;
            showPopup(deleteMemberPopup);
        });

        membersList.appendChild(memberElement);
    }

    // Handle delete member popup actions
    deleteMemberPopup?.querySelector('.cancel-btn').addEventListener('click', () => {
        hidePopup(deleteMemberPopup);
        memberToDelete = null;
    });

    deleteMemberPopup?.querySelector('.confirm-btn').addEventListener('click', () => {
        if (memberToDelete) {
            memberToDelete.remove();
            memberToDelete = null;
        }
        hidePopup(deleteMemberPopup);
    });

    // Handle invite success popup close
    inviteSuccessPopup?.querySelector('.close-btn').addEventListener('click', () => {
        hidePopup(inviteSuccessPopup);
    });

    // Handle invite form submission
    inviteForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailInput = e.target.querySelector('input[type="email"]');
        const email = emailInput.value.trim();

        if (email) {
            addMember(email);
            emailInput.value = ''; // Clear input
            showPopup(inviteSuccessPopup);
        }
    });

    // Logout functionality
    const logoutBtn = document.querySelector('.logout-btn');
    const logoutPopup = document.querySelector('.logout-popup');
    
    logoutBtn?.addEventListener('click', () => {
        showPopup(logoutPopup);
    });
    
    logoutPopup?.querySelector('.cancel-btn').addEventListener('click', () => {
        hidePopup(logoutPopup);
    });
    
    logoutPopup?.querySelector('.confirm-btn').addEventListener('click', () => {
        // Add your logout logic here
        window.location.href = '/login.html'; // Redirect to login page
    });

    // Function to show specific workspace template
    function showWorkspaceTemplate(type) {
        // Hide all templates first
        const templates = document.querySelectorAll('.workspace-template');
        templates.forEach(template => template.classList.remove('active'));
        
        // Show the selected template
        const activeTemplate = document.querySelector(`.workspace-template.${type}`);
        if (activeTemplate) {
            activeTemplate.classList.add('active');
        }
    }

    // Example usage based on user's plan/status
    function checkUserPlanAndWorkspace() {
        // This is where you'd typically check the user's plan from your backend
        const userHasPremium = true; // Example: set to false to show premium upgrade template
        const hasWorkspace = true;   // Example: set to false to show empty workspace template

        if (!userHasPremium) {
            showWorkspaceTemplate('no-premium');
        } else if (!hasWorkspace) {
            showWorkspaceTemplate('no-workspace');
        } else {
            showWorkspaceTemplate('has-workspace');
        }
    }

    // Call this when the page loads
    checkUserPlanAndWorkspace();

    // Close popups when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('workspace-popup')) {
            hidePopup(e.target);
            memberToDelete = null;
        }
    });
});