import defaultAvatarPath from '../assets/images/dashboard/user-pfp.png';
import creatorBusinessPath from '../assets/icons/workspace/creator-business.png';
import emptyWorkspacePath from '../assets/icons/workspace/empty-workspace.png';

// Notification system for profile page
function showProfileNotification(message, type = 'error', title = null) {
    const container = document.getElementById('notification-container');
    if (!container) return;

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `profile-notification ${type}`;
    
    // Determine icon based on type
    const iconMap = {
        success: 'check_circle',
        error: 'error',
        warning: 'warning',
        info: 'info'
    };
    
    // Determine title based on type if not provided
    const defaultTitles = {
        success: 'Success',
        error: 'Error',
        warning: 'Warning',
        info: 'Information'
    };
    
    const notificationTitle = title || defaultTitles[type] || 'Notification';
    const iconName = iconMap[type] || 'info';
    
    notification.innerHTML = `
        <i class="material-icons notification-icon">${iconName}</i>
        <div class="notification-content">
            <div class="notification-title">${notificationTitle}</div>
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close" type="button">
            <i class="material-icons">close</i>
        </button>
    `;
    
    // Add close functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        hideNotification(notification);
    });
    
    // Add to container
    container.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Auto-hide after 5 seconds for success/info, 7 seconds for error/warning
    const autoHideDelay = (type === 'success' || type === 'info') ? 5000 : 7000;
    setTimeout(() => {
        hideNotification(notification);
    }, autoHideDelay);
}

function hideNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
        if (notification.parentElement) {
            notification.parentElement.removeChild(notification);
        }
    }, 400);
}

// Move tab switching functionality to the beginning and make it independent
// of other operations to ensure it works regardless of data loading
function setupTabSwitching() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    function activateTab(tabId) {

        // First deactivate all tabs
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // Then activate the selected tab
        const activeTabButton = document.querySelector(`.tab-button[data-tab="${tabId}"]`);
        const activeTabContent = document.getElementById(tabId);

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
    // If publicId is not available, return default path immediately
    if (!publicId) {
        return defaultAvatarPath;
    }
    try {
        const res = await fetch(`/auth/profile-picture/${publicId}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
            console.warn('Failed to retrieve profile picture, using default.');
            return defaultAvatarPath; // Return default on failure
        }

        return data.imageUrl;
    } catch (error) {
        console.error('Error fetching profile picture:', error);
        return defaultAvatarPath; // Return default on error
    }
};

async function removeMember(email) {
    fetch('/api/workspace/remove', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        if (!data.success) {
            showProfileNotification(data.message || "Failed to remove member!", "error");
            return;
        }
        document.querySelector(`.member[data-email="${email}"]`)?.remove();
        showProfileNotification("Member removed.", "success");
    })
    .catch(error => {
        console.error("Error removing member:", error);
        showProfileNotification("Error removing member.", "error");
    });
};

function showPopup(popup) {
    popup.classList.add('active');
}

function hidePopup(popup) {
    popup.classList.remove('active');
}

async function addPendingInvite(data, membersList, deleteMemberPopup, setPendingInviteToDelete, isOwner) {
    console.log("Adding pending invite data:", data.profilePicture);
    const profilePicture = await fetchProfileImage(data.profilePicture);

    console.log("Adding pending invite:", profilePicture);

    const memberElement = document.createElement('div');
    memberElement.className = 'member';
    memberElement.dataset.email = data.email;
    memberElement.innerHTML = `
        <img src="${profilePicture || defaultAvatarPath}" alt="" class="member-avatar">
        <div class="member-info">
            <p class="member-name">Pending</p>
            <p class="member-email">${data.email}</p>
        </div>
        <span class="member-role">Pending</span>
        ${isOwner ? `
        <button class="remove-pending" title="Remove pending invite">
            <i class="material-icons">person_remove</i>
        </button>
        ` : ''}
    `;

    if (isOwner) {
        memberElement.querySelector('.remove-pending').addEventListener('click', () => {
            setPendingInviteToDelete(memberElement.dataset.email);
            showPopup(deleteMemberPopup);
        });
    }

    membersList.appendChild(memberElement);
}

async function displayMember(memberData, membersList, role, isOwner) {
    const profilePicture = await fetchProfileImage(memberData.profilePicture);

    const memberElement = document.createElement('div');
    memberElement.className = 'member';
    memberElement.dataset.email = memberData.email
    memberElement.innerHTML = `
        <img src="${profilePicture || defaultAvatarPath}" alt="" class="member-avatar">
        <div class="member-info">
            <p class="member-name">${memberData.username}</p>
            <p class="member-email">${memberData.email}</p>
        </div>
        <span class="member-role">${role}</span>
        ${isOwner && role !== 'Owner' ? `
        <button class="remove-member" title="Remove member">
            <i class="material-icons">person_remove</i>
        </button>
        ` : ''}
    `;

    if (isOwner && role !== 'Owner') {
        memberElement.querySelector('.remove-member')?.addEventListener('click', () => {
            if (confirm(`Remove ${memberData.username} from workspace?`)) {
                removeMember(memberData.email);
            }
        });
    }

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

        return data;

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
        const workspaceData = await checkUserPlanAndWorkspace();

        if (!userData) return;
        if (workspaceData) {
            showWorkspaceTemplate('has-workspace')
        };

        const { user, premium } = userData;
        const usernameInput = document.getElementById('username-input');
        const emailInput = document.getElementById('email-input');

        const memberSince = new Date(user.createdAt);

        const profileNameEls = document.querySelectorAll('.profile-name');
        const profileUsernameEls = document.querySelectorAll('.profile-username');

        const ownerNameEl = document.querySelector(".owner-name");
        const ownerRoleEl = document.querySelector(".owner-role");

        const memberRoleEls = document.querySelectorAll('.member-role');

        const accountTypeEl = document.getElementById('account-type');
        const memberSinceEl = document.getElementById('member-since');

        profileNameEls.forEach(el => el.textContent = user.username);
        profileUsernameEls.forEach(el => el.textContent = `@${user.username}`);

        // Determine if the current user is the workspace owner
        const isOwner = workspaceData?.workspace?.owner?._id === user._id;

        if (workspaceData) {
            ownerNameEl.textContent = workspaceData.workspace.owner.username;
            ownerRoleEl.textContent = "Owner";
        }

        // This loop seems to update the current user's role display, not the member list
        if (workspaceData) {
            memberRoleEls.forEach(el => {
                el.textContent = isOwner ? 'Owner' : 'Member';
            });
        }

        accountTypeEl.textContent = premium?.tier;
        usernameInput && (usernameInput.value = user.username);
        emailInput && (emailInput.value = user.email);

        if (memberSinceEl) {
            memberSinceEl.textContent = memberSince.toLocaleDateString();
        }

        const workspaceNameEls = document.querySelectorAll('.workspace-name');
        if (workspaceData) {
            workspaceNameEls.forEach(el => el.textContent = workspaceData.workspace.name);
        }

        // Get profile picture
        const profilePictureInput = document.getElementById('profile-picture-input');
        const changePictureBtn = document.querySelector('.change-picture-btn');

        // Fetch and display the current user's profile picture
        if (user.profilePicture) {
            const imageUrl = await fetchProfileImage(user.profilePicture);
            if (imageUrl) {
                document.querySelectorAll('.profile-picture').forEach(img => {
                    img.src = imageUrl;
                });
            }
        }

        changePictureBtn?.addEventListener('click', () => profilePictureInput?.click());

        // Upload profile picture
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
                    body: JSON.stringify({ profilePicture: newPublicId }),
                });

                showProfileNotification('Profile picture updated successfully!', 'success');
                // Update the displayed profile pictures immediately after successful upload
                const newImageUrl = await fetchProfileImage(newPublicId);
                if(newImageUrl) {
                    document.querySelectorAll('.profile-picture').forEach(img => {
                        img.src = newImageUrl;
                    });
                }

            } catch (error) {
                console.error('Error uploading profile picture:', error);
                showProfileNotification('Error uploading profile picture.', 'error');
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
            if (!data.success) {
                showProfileNotification('Failed to update profile!', 'error');
                return;
            }
            window.location.reload();
        });

        // Password form
        document.querySelector('.security-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            if (newPassword !== confirmPassword) {
                showProfileNotification('New password does not match confirm password!', 'error');
                return;
            }

            try {
                const response = await fetch('/auth/update-password', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ currentPassword, newPassword }),
                });

                const data = await response.json();
                if (data.success) {
                    showProfileNotification('Password updated successfully!', 'success');
                } else {
                    showProfileNotification(data.message || 'Failed to update password!', 'error');
                }
            } catch (err) {
                console.error('Error updating password:', err);
                showProfileNotification('Error updating password', 'error');
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
                    if (!data.success) {
                        showProfileNotification('Failed to delete account!', 'error');
                        return;
                    }
                    window.location.href = '/home';
                })
                .catch(err => {
                    console.error('Error deleting account:', err);
                    showProfileNotification('Error deleting account', 'error');
                });
            }
        });

        // Download Data
        document.querySelector('.download-data-btn')?.addEventListener('click', () => {
            showProfileNotification('Your data is being prepared for download...', 'info');
        });

        // Create Workspace Form
        document.querySelector('.create-workspace-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const workspaceName = document.getElementById('workspace-creation').value.trim();
            if (workspaceName) {
                try {
                    const response = await fetch('api/workspace', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: workspaceName }),
                    });

                    const data = await response.json();
                    if (!data.success) {
                        showProfileNotification(data.message || 'Failed to create workspace!', 'error');
                        return;
                    }

                    window.location.reload();

                } catch (err) {
                    console.error('Error creating workspace:', err);
                    showProfileNotification('Error creating workspace', 'error');
                }
            }
        });

        // --- Remove Pending Invite ---
        const removePendingInvite = async (email) => {
            fetch('/api/workspace/invite', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })
            .then(response => response.json())
            .then(data => {
                if (!data.success) {
                    showProfileNotification(data.message || "Failed to remove invite!", "error");
                    return;
                }
                document.querySelector(`.member[data-email="${email}"]`)?.remove();
                showProfileNotification("Invite removed.", "success");
            })
            .catch(error => {
                console.error("Error removing invite:", error);
                showProfileNotification("Error removing invite.", "error");
            });
        };

        let memberToDeleteEmail = null;
        const setPendingInviteToDelete = (email) => {
            if (email) {
                memberToDeleteEmail = email;
            }
        };

        // Workspace Invite & Member Management
        const membersList = document.querySelector('.members-list');
        const deleteMemberPopup = document.querySelector('.delete-member-popup');
        const inviteSuccessPopup = document.querySelector('.workspace-popup.invite-success-popup');

        if (membersList) {
            membersList.innerHTML = '';
        }

        if (workspaceData?.workspace) {
            const workspace = workspaceData.workspace;
            const isOwner = workspace.owner._id === user._id;
            const allMembers = [workspace.owner, ...workspace.members.filter(member => member._id !== workspace.owner._id)];

            if (allMembers.length > 0) {
                allMembers.sort((a, b) => {
                    if (a._id === workspace.owner._id) return -1;
                    if (b._id === workspace.owner._id) return 1;
                    return 0;
                });

                allMembers.forEach(member => {
                    const role = workspace.owner._id === member._id ? 'Owner' : 'Member';
                    displayMember(member, membersList, role, isOwner);
                });
            }

            if (workspace.pendingInvites?.length > 0) {
                workspace.pendingInvites.forEach(invite => {
                    addPendingInvite(invite, membersList, deleteMemberPopup, setPendingInviteToDelete, isOwner);
                });
            }
        }

        document.querySelector('.invite-form')?.addEventListener('submit', (e) => {
            e.preventDefault();

            const emailInput = e.target.querySelector('input[type="email"]');
            const email = emailInput.value.trim();

            if (email) {
                fetch('/api/workspace/invite', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email }),
                })
                .then(response => response.json())
                .then(data => {
                    if (!data.success) {
                        showProfileNotification(data.message || 'Failed to invite user!', 'error');
                        return;
                    }
                    const isOwnerCurrent = workspaceData?.workspace?.owner?._id === user._id;
                    addPendingInvite(data.user, membersList, deleteMemberPopup, setPendingInviteToDelete, isOwnerCurrent);
                    showPopup(inviteSuccessPopup);
                    emailInput.value = '';
                })
                .catch(err => {
                    console.error('Error inviting user:', err);
                    showProfileNotification('Error inviting user', 'error');
                });
            }
        });

        deleteMemberPopup?.querySelector('.cancel-btn')?.addEventListener('click', () => {
            hidePopup(deleteMemberPopup);
            memberToDeleteEmail = null;
        });

        deleteMemberPopup?.querySelector('.confirm-btn')?.addEventListener('click', () => {
            if (memberToDeleteEmail) {
                removePendingInvite(memberToDeleteEmail);
            }
            memberToDeleteEmail = null;
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
                    if (!data.success) {
                        showProfileNotification('Error logging out', 'error');
                        return;
                    }
                    hidePopup(logoutPopup);
                    window.location.href = '/login';
                })
                .catch(err => {
                    console.error('Logout error:', err);
                    showProfileNotification('Error logging out', 'error');
                });
        });

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('workspace-popup')) {
                hidePopup(e.target);
                memberToDeleteEmail = null;
            }
        });
    } catch (error) {
        console.error('Error initializing profile page:', error);
    }
});

