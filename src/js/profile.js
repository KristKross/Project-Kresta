import defaultAvatarPath from '../assets/images/dashboard/user-pfp.png';
import creatorBusinessPath from '../assets/icons/workspace/creator-business.png';
import emptyWorkspacePath from '../assets/icons/workspace/empty-workspace.png';

// Move tab switching functionality to the beginning and make it independent 
// of other operations to ensure it works regardless of data loading
function setupTabSwitching() {
    console.log('Setting up tab switching...');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    console.log(`Found ${tabButtons.length} tab buttons and ${tabContents.length} tab contents`);

    function activateTab(tabId) {
        console.log(`Activating tab: ${tabId}`);
        
        // First deactivate all tabs
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Then activate the selected tab
        const activeTabButton = document.querySelector(`.tab-button[data-tab="${tabId}"]`);
        const activeTabContent = document.getElementById(tabId);
        
        console.log('Active tab button:', activeTabButton);
        console.log('Active tab content:', activeTabContent);
        
        if (activeTabButton && activeTabContent) {
            activeTabButton.classList.add('active');
            activeTabContent.classList.add('active');
            // Update URL without refreshing page
            history.replaceState(null, '', `?tab=${tabId}`);
        }
    }

    // Add click handlers to tab buttons
    tabButtons.forEach(button => {
        if (button.classList.contains('logout-btn')) return;
        
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            console.log(`Tab button clicked: ${tabId}`);
            if (tabId) {
                activateTab(tabId);
            }
        });
    });

    // Check URL for tab parameter
    const urlParams = new URLSearchParams(window.location.search);
    const selectedTab = urlParams.get('tab');

    if (selectedTab) {
        activateTab(selectedTab);
    }
}

async function fetchUserData() {
    try {
        const response = await fetch('/auth/user');
        if (!response.ok) throw new Error('Failed to fetch user data');

        const userData = await response.json();
        if (!userData) throw new Error('User data not available');

        return userData;
    } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
    }
}

async function fetchProfileImage(publicId) {
    try {
        const res = await fetch(`/auth/profile-picture/${publicId}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
            throw new Error('Failed to retrieve profile picture');
        }

        return data.imageUrl;
    } catch (error) {
        console.error('Error fetching profile picture:', error);
        return null;
    }
};

function showPopup(popup) {
    popup.classList.add('active');
}

function hidePopup(popup) {
    popup.classList.remove('active');
}

function addMember(email, membersList, deleteMemberPopup, setMemberToDelete) {
    const memberElement = document.createElement('div');
    memberElement.className = 'member';
    memberElement.innerHTML = `
        <img src="${defaultAvatarPath}" alt="" class="member-avatar">
        <div class="member-info">
            <p class="member-name">Pending</p>
            <p class="member-email">${email}</p>
        </div>
        <span class="member-role">Pending</span>
        <button class="remove-member" title="Remove member">
            <i class="material-icons">person_remove</i>
        </button>
    `;

    memberElement.querySelector('.remove-member').addEventListener('click', () => {
        setMemberToDelete(memberElement);
        showPopup(deleteMemberPopup);
    });

    membersList.appendChild(memberElement);
}

function showWorkspaceTemplate(type) {
    const templates = document.querySelectorAll('.workspace-template');
    templates.forEach(template => template.classList.remove('active'));

    const activeTemplate = document.querySelector(`.workspace-template.${type}`);
    if (!activeTemplate) {
        console.warn(`Template not found for type: ${type}`);
        return;
    }

    if (type === 'no-premium') {
        const img = document.getElementById('premium-feature-img');
        img && (img.src = creatorBusinessPath);
    } else if (type === 'no-workspace') {
        const img = document.getElementById('empty-workspace-img');
        img && (img.src = emptyWorkspacePath);
    }

    activeTemplate.classList.add('active');
}

async function checkUserPlanAndWorkspace() {
    try {
        const response = await fetch('/api/workspace/my', {
            method: 'GET',
            credentials: 'include'
        });

        if (response.status === 403) return showWorkspaceTemplate('no-premium');

        if (!response.ok) {
            console.error(`Error fetching workspace: ${response.statusText}`);
            return showWorkspaceTemplate('no-workspace');
        }

        const data = await response.json();

        if (!data.workspace) {
            return showWorkspaceTemplate('no-workspace');
        }

        showWorkspaceTemplate('has-workspace');

    } catch (error) {
        console.error('Error fetching workspace:', error);
        return showWorkspaceTemplate('no-workspace');
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Setup tab switching first, before doing anything else
        setupTabSwitching();
        
        // Clear any popups that might be active from a previous session
        document.querySelectorAll('.workspace-popup').forEach(popup => {
            popup.classList.remove('active');
        });
        
        const userData = await fetchUserData();
        if (!userData) return;

        const { user, premium } = userData;
        const usernameInput = document.querySelector('input[type="text"].form-input');
        const emailInput = document.querySelector('input[type="email"].form-input');

        const memberSince = new Date(user.createdAt);

        const profileNameEl = document.getElementById('profile-name');
        const profileUsernameEl = document.getElementById('profile-username');
        const accountTypeEl = document.getElementById('account-type');
        const memberSinceEl = document.getElementById('member-since');

        profileNameEl.textContent = user.username;
        profileUsernameEl.textContent = `@${user.username}`;
        accountTypeEl.textContent = premium?.tier;
        usernameInput && (usernameInput.value = user.username);
        emailInput && (emailInput.value = user.email);

        if (memberSinceEl) {
            memberSinceEl.textContent = memberSince.toLocaleDateString();
        }

        // Profile picture upload
        const profilePictureInput = document.getElementById('profile-picture-input');
        const changePictureBtn = document.querySelector('.change-picture-btn');

        if (user.profilePicture) {
            const imageUrl = await fetchProfileImage(user.profilePicture);
            if (imageUrl) {
                document.querySelectorAll('.profile-picture').forEach(img => {
                    img.src = imageUrl;
                });
            }
        }

        changePictureBtn?.addEventListener('click', () => profilePictureInput?.click());

        profilePictureInput?.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const profilePicture = new FormData();
            profilePicture.append('imageFile', file);
            profilePicture.append('resourceType', 'image');

            try {
                const oldPublicId = user.profilePicture;

                if (oldPublicId) {
                    await fetch(`/api/delete-media/${oldPublicId}/image`, { method: 'DELETE' });
                }

                const uploadResponse = await fetch('/api/upload-media', {
                    method: 'POST',
                    body: profilePicture
                });

                const uploadResult = await uploadResponse.json();
                if (!uploadResponse.ok) {
                    throw new Error(uploadResult.error || 'Image upload failed');
                }

                const newPublicId = uploadResult.publicId;

                await fetch('/auth/update', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ profilePicturePublicId: newPublicId,  }),
                });

                alert('Profile picture updated successfully!');
            } catch (error) {
                console.error('Error uploading profile picture:', error);
                alert('Error uploading profile picture.');
            }
        });

        // Profile form
        document.querySelector('.profile-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();

            const res = await fetch('/auth/update', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailInput.value, username: usernameInput.value }),
            });

            const data = await res.json();
            if (!data.success) return alert('Failed to update profile!');
            window.location.reload();
        });

        // Password form
        document.querySelector('.security-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            if (newPassword !== confirmPassword) return alert('New password does not match confirm password!');

            try {
                const response = await fetch('/auth/update-password', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ currentPassword, newPassword }),
                });

                const data = await response.json();
                data.success ? alert('Password updated successfully!') : alert(data.message || 'Failed to update password!');
            } catch (err) {
                console.error('Error updating password:', err);
                alert('Error updating password');
            }
        });

        // Account Deletion
        document.querySelector('.delete-account-btn')?.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                fetch('/auth/delete', { 
                    method: 'DELETE' 
                })
                .then(res => res.json())
                .then(data => {
                    if (!data.success) return alert('Failed to delete account!');
                    window.location.href = '/home';
                })
                .catch(err => {
                    console.error('Error deleting account:', err);
                    alert('Error deleting account');
                });
            }
        });

        // Download Data
        document.querySelector('.download-data-btn')?.addEventListener('click', () => {
            alert('Your data is being prepared for download...');
        });

        // Workspace Invite & Member Management
        const membersList = document.querySelector('.members-list');
        const deleteMemberPopup = document.querySelector('.delete-member-popup');
        const inviteSuccessPopup = document.querySelector('.workspace-popup.invite-success-popup');

        let memberToDelete = null;
        const setMemberToDelete = (member) => (memberToDelete = member);

        document.querySelector('.invite-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = e.target.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            if (email) {
                addMember(email, membersList, deleteMemberPopup, setMemberToDelete);
                emailInput.value = '';
                showPopup(inviteSuccessPopup);
            }
        });

        deleteMemberPopup?.querySelector('.cancel-btn')?.addEventListener('click', () => {
            hidePopup(deleteMemberPopup);
            memberToDelete = null;
        });

        deleteMemberPopup?.querySelector('.confirm-btn')?.addEventListener('click', () => {
            memberToDelete?.remove();
            memberToDelete = null;
            hidePopup(deleteMemberPopup);
        });

        inviteSuccessPopup?.querySelector('.close-btn')?.addEventListener('click', () => {
            hidePopup(inviteSuccessPopup);
        });

        // Logout
        const logoutPopup = document.querySelector('.logout-popup');
        document.querySelector('.logout-btn')?.addEventListener('click', () => {
            showPopup(logoutPopup);
        });

        logoutPopup?.querySelector('.cancel-btn')?.addEventListener('click', () => {
            hidePopup(logoutPopup);
        });

        logoutPopup?.querySelector('.confirm-btn')?.addEventListener('click', () => {
            fetch('/auth/logout', { method: 'POST' })
                .then(res => res.json())
                .then(data => {
                    if (!data.success) return alert('Error logging out');
                    hidePopup(logoutPopup);
                    window.location.href = '/login';
                })
                .catch(err => {
                    console.error('Logout error:', err);
                    alert('Error logging out');
                });
        });

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('workspace-popup')) {
                hidePopup(e.target);
                memberToDelete = null;
            }
        });

        document.addEventListener('keydown', (e) => {
            // Fix: Added missing opening parenthesis
            if (e.key === 'Escape') {
                document.querySelectorAll('.workspace-popup.active').forEach(popup => {
                    hidePopup(popup);
                });
                memberToDelete = null;
            }
        });

        await checkUserPlanAndWorkspace();
    } catch (error) {
        console.error('Error initializing profile page:', error);
        // Fallback to ensure basic functionality works even if there are errors
        setupTabSwitching();
    }
});