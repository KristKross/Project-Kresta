import defaultAvatarPath from '../assets/images/dashboard/user-pfp.png';
import creatorBusinessPath from '../assets/icons/workspace/creator-business.png';
import emptyWorkspacePath from '../assets/icons/workspace/empty-workspace.png';

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

function showPopup(popup) {
    popup.classList.add('active');
}

function hidePopup(popup) {
    popup.classList.remove('active');
}

// Function to add a pending invite member element
// Added isOwner parameter
async function addPendingInvite(data, membersList, deleteMemberPopup, setPendingInviteToDelete, isOwner) {
    // Fetch profile picture using the user's profilePicture publicId
    const profilePicture = await fetchProfileImage(data.profilePicture);

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
        <button class="remove-pending" title="Remove member">
            <i class="material-icons">person_remove</i>
        </button>
        ` : ''}
    `;

    // Only add event listener if the button exists (i.e., if isOwner is true)
    if (isOwner) {
        memberElement.querySelector('.remove-pending').addEventListener('click', () => {
            setPendingInviteToDelete(memberElement.dataset.email);
            showPopup(deleteMemberPopup);
        });
    }

    membersList.appendChild(memberElement);
}

// New function to display an existing workspace member
// Added isOwner parameter
async function displayMember(memberData, membersList, role, isOwner) {
    // Fetch profile picture using the member's profilePicture publicId
    const profilePicture = await fetchProfileImage(memberData.profilePicture);

    const memberElement = document.createElement('div');
    memberElement.className = 'member';
    memberElement.dataset.email = memberData.email; // Still useful for identification
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
        const usernameInput = document.querySelector('input[type="text"].form-input');
        const emailInput = document.querySelector('input[type="email"].form-input');

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

        // Tab switching logic is now handled by setupTabSwitching() at the beginning
        // Remove the duplicate tab switching code here


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

                alert('Profile picture updated successfully!');
                // Update the displayed profile pictures immediately after successful upload
                 const newImageUrl = await fetchProfileImage(newPublicId);
                 if(newImageUrl) {
                     document.querySelectorAll('.profile-picture').forEach(img => {
                         img.src = newImageUrl;
                     });
                 }

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
                    if (!data.success) return alert(data.message || 'Failed to create workspace!');

                    window.location.reload();

                } catch (err) {
                    console.error('Error creating workspace:', err);
                    alert('Error creating workspace');
                }
            }
        });

        let memberToDeleteEmail = null; // Use email instead of member element
        const removePendingInvite = async (email) => {
            fetch('/api/workspace/invite', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })
            .then(response => response.json())
            .then(data => {
                if (!data.success) return alert(data.message || "Failed to remove invite!");

                // Select and remove the element using the data-email attribute
                document.querySelector(`.member[data-email="${email}"]`)?.remove();
            })
            .catch(error => console.error("Error removing invite:", error));
        };

        // Accept email string
        const setPendingInviteToDelete = (email) => {
            if (email) {
                memberToDeleteEmail = email; // Store the email
            }
        };

        // Workspace Invite & Member Management
        const membersList = document.querySelector('.members-list');
        const deleteMemberPopup = document.querySelector('.delete-member-popup');
        const inviteSuccessPopup = document.querySelector('.workspace-popup.invite-success-popup');

        // Clear existing members list before populating
        if (membersList) {
            membersList.innerHTML = '';
        }


        if (workspaceData?.workspace) {
            const workspace = workspaceData.workspace;
            const isOwner = workspace.owner._id === user._id;

            // Combine owner and members into a single list for display
            // Ensure owner is included even if not in the members array
            const allMembers = [workspace.owner, ...workspace.members.filter(member => member._id !== workspace.owner._id)];


            // Display all members (owner included)
            if (allMembers.length > 0) {
                // Sort members to show owner first (optional, but good practice)
                allMembers.sort((a, b) => {
                    if (a._id === workspace.owner._id) return -1; // Owner comes first
                    if (b._id === workspace.owner._id) return 1; // Owner comes first
                    return 0; // Maintain original order for others
                });

                allMembers.forEach(member => {
                    const role = workspace.owner._id === member._id ? 'Owner' : 'Member';
                    // Pass isOwner (of the current user) to displayMember
                    displayMember(member, membersList, role, isOwner);
                });
            }

            // Display pending invites
            if (workspace.pendingInvites?.length > 0) {
                workspace.pendingInvites.forEach(invite => {
                    // Pass isOwner (of the current user) to addPendingInvite
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
                    if (!data.success) return alert(data.message || 'Failed to invite user!');
                    // Use addPendingInvite for new invites, pass isOwner
                    // isOwner status is based on the current user, which doesn't change here
                    const isOwnerCurrent = workspaceData?.workspace?.owner?._id === user._id;
                    addPendingInvite(data.user, membersList, deleteMemberPopup, setPendingInviteToDelete, isOwnerCurrent);
                    showPopup(inviteSuccessPopup);
                    emailInput.value = '';
                })
                .catch(err => {
                    console.error('Error inviting user:', err);
                    alert('Error inviting user');
                });
            }
        });

        deleteMemberPopup?.querySelector('.cancel-btn')?.addEventListener('click', () => {
            hidePopup(deleteMemberPopup);
            memberToDeleteEmail = null; // Clear the stored email
        });

        deleteMemberPopup?.querySelector('.confirm-btn')?.addEventListener('click', () => {
            if (memberToDeleteEmail) {
                removePendingInvite(memberToDeleteEmail); // Call remove with the stored email
            }
            memberToDeleteEmail = null; // Clear the stored email
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
        });        logoutPopup?.querySelector('.confirm-btn')?.addEventListener('click', () => {
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
                memberToDeleteEmail = null;
            }
        });
    } catch (error) {
        console.error('Error initializing profile page:', error);
    }
});
