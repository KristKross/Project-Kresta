import defaultAvatarPath from '../assets/images/dashboard/user-pfp.png';
import creatorBusinessPath from '../assets/icons/workspace/creator-business.png';
import emptyWorkspacePath from '../assets/icons/workspace/empty-workspace.png';

// Workspace error handling constants
const WORKSPACE_ERRORS = {
    NETWORK: {
        code: 'NETWORK_ERROR',
        message: 'Network connection issue. Please check your internet connection and try again.',
        popup: 'network-error'
    },
    UNAUTHORIZED: {
        code: 'UNAUTHORIZED',
        message: 'You are not authorized to perform this action. Please log in again.'
    },
    FORBIDDEN: {
        code: 'FORBIDDEN',
        message: 'You do not have permission to access this workspace feature.',
        popup: 'permission-error'
    },
    NOT_FOUND: {
        code: 'NOT_FOUND',
        message: 'Workspace not found. It may have been deleted.'
    },
    SERVER_ERROR: {
        code: 'SERVER_ERROR',
        message: 'Server error occurred. Please try again later.',
        popup: 'server-error'
    },
    VALIDATION: {
        code: 'VALIDATION_ERROR',
        message: 'Please check your input and try again.'
    },
    INVITE_LIMIT: {
        code: 'INVITE_LIMIT',
        message: 'You have reached the maximum number of pending invites for your plan.',
        popup: 'invite-limit'
    },
    UNKNOWN: {
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred. Please try again.'
    }
};

// Enhanced error handling for workspace operations
function handleWorkspaceError(error, operation = '') {
    console.error(`Workspace operation failed (${operation}):`, error);
    
    // Determine error type and show appropriate notification
    let errorType = WORKSPACE_ERRORS.UNKNOWN;
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorType = WORKSPACE_ERRORS.NETWORK;
    } else if (error.status === 401) {
        errorType = WORKSPACE_ERRORS.UNAUTHORIZED;
    } else if (error.status === 403) {
        errorType = WORKSPACE_ERRORS.FORBIDDEN;
    } else if (error.status === 404) {
        errorType = WORKSPACE_ERRORS.NOT_FOUND;
    } else if (error.status >= 500) {
        errorType = WORKSPACE_ERRORS.SERVER_ERROR;
    } else if (error.status === 400) {
        errorType = WORKSPACE_ERRORS.VALIDATION;
    } else if (error.code === 'invite_limit') {
        errorType = WORKSPACE_ERRORS.INVITE_LIMIT;
    }
    
    const errorMessage = error.message || errorType.message;
    
    // Show notification
    showProfileNotification(
        `${operation ? operation + ': ' : ''}${errorMessage}`, 
        'error',
        'Workspace Error'
    );
    
    // Show error popup if available for this error type
    if (errorType.popup) {
        const errorPopup = document.querySelector(`.error-popup.${errorType.popup}`);
        if (errorPopup) {
            showErrorPopup(errorPopup, operation);
        }
    }
    
    // Return the error type for potential recovery actions
    return errorType.code;
}

// Show error popup with contextual information
function showErrorPopup(popup, operation = '') {
    // Update popup content if needed based on operation
    const popupTitle = popup.querySelector('h3');
    const popupMessage = popup.querySelector('p');
    const retryBtn = popup.querySelector('.retry-btn');
    
    // Add specific contextual information if needed
    if (operation && popupMessage) {
        // Store original message to restore later
        if (!popupMessage.dataset.originalMessage) {
            popupMessage.dataset.originalMessage = popupMessage.textContent;
        }
        
        // For specific operations, customize the message
        if (operation === 'Creating workspace') {
            popupMessage.textContent = `Error while creating workspace: ${popupMessage.dataset.originalMessage}`;
        } else if (operation === 'Inviting user') {
            popupMessage.textContent = `Error while inviting team member: ${popupMessage.dataset.originalMessage}`;
        } else if (operation === 'Removing member') {
            popupMessage.textContent = `Error while removing team member: ${popupMessage.dataset.originalMessage}`;
        } else {
            popupMessage.textContent = `Error during ${operation.toLowerCase()}: ${popupMessage.dataset.originalMessage}`;
        }
    }
    
    // Add retry functionality if available
    if (retryBtn) {
        // Remove previous listeners
        const newRetryBtn = retryBtn.cloneNode(true);
        retryBtn.parentNode.replaceChild(newRetryBtn, retryBtn);
        
        // Add new retry functionality
        newRetryBtn.addEventListener('click', () => {
            hidePopup(popup);
            if (operation === 'Fetching workspace') {
                window.location.reload();
            } else if (operation === 'Creating workspace') {
                document.querySelector('.create-workspace-btn')?.click();
            } else if (operation === 'Inviting user') {
                // Focus on the invite input
                document.querySelector('.invite-form input[type="email"]')?.focus();
            }
        });
    }
    
    // Show the popup
    showPopup(popup);
    
    // Add event listener to close button
    const closeBtn = popup.querySelector('.close-btn');
    if (closeBtn) {
        // Remove previous listeners
        const newCloseBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        
        newCloseBtn.addEventListener('click', () => {
            hidePopup(popup);
            
            // Reset message to original if we modified it
            if (popupMessage && popupMessage.dataset.originalMessage) {
                popupMessage.textContent = popupMessage.dataset.originalMessage;
            }
        });
    }
}

// Network status checking for workspace operations
function isOnline() {
    return navigator.onLine;
}

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
    if (!publicId) {
        return defaultAvatarPath;
    }
    try {
        const res = await fetch(`/auth/profile-picture/${publicId}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
            console.warn('Failed to retrieve profile picture, using default.');
            return defaultAvatarPath;
        }

        return data.imageUrl;
    } catch (error) {
        console.error('Error fetching profile picture:', error);
        return defaultAvatarPath;
    }
};

async function removeMember(email) {
    // Find the member element in the DOM
    const memberEl = document.querySelector(`.member[data-email="${email}"]`);
    if (!memberEl) {
        showProfileNotification("Member not found in the current view.", "error");
        return;
    }
    
    // Show loading state on the member element
    memberEl.classList.add('removing');
    const removeButton = memberEl.querySelector('.remove-member');
    if (removeButton) {
        removeButton.disabled = true;
        removeButton.innerHTML = '<i class="material-icons removing-icon">hourglass_empty</i>';
    }
    
    try {
        // Check network connectivity
        if (!isOnline()) {
            throw Object.assign(new Error(WORKSPACE_ERRORS.NETWORK.message), { status: 'offline' });
        }
        
        const response = await fetch('/api/workspace/remove', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        
        // Handle non-ok responses
        if (!response.ok) {
            // Get error status and message
            const statusCode = response.status;
            let errorMessage = 'Failed to remove member';
            
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (parseError) {
                // If JSON parsing fails, use default message with status code
                errorMessage = `Failed to remove member (${statusCode})`;
            }
            
            throw Object.assign(new Error(errorMessage), { status: statusCode });
        }
        
        const data = await response.json();
        
        // API success check
        if (!data.success) {
            // Reset member element state
            memberEl.classList.remove('removing');
            if (removeButton) {
                removeButton.disabled = false;
                removeButton.innerHTML = '<i class="material-icons">person_remove</i>';
            }
            
            // Handle specific error types
            if (data.code === 'not_found') {
                showProfileNotification("This user is no longer a member.", "warning");
                memberEl.remove(); // Remove from UI since they're not a member
            } else if (data.code === 'permission_denied') {
                showProfileNotification("You don't have permission to remove this member.", "error");
            } else {
                showProfileNotification(data.message || "Failed to remove member!", "error");
            }
            return;
        }
        
        // Success - show removal animation
        memberEl.classList.add('removed');
        
        // After animation completes, remove element and show success notification
        setTimeout(() => {
            memberEl.remove();
            showProfileNotification("Member removed successfully.", "success");
        }, 500);
        
    } catch (error) {
        // Reset member element state
        memberEl.classList.remove('removing');
        if (removeButton) {
            removeButton.disabled = false;
            removeButton.innerHTML = '<i class="material-icons">person_remove</i>';
        }
        
        // Handle errors
        const errorType = handleWorkspaceError(error, 'Removing member');
        
        // Recovery suggestions for specific error types
        if (errorType === WORKSPACE_ERRORS.UNAUTHORIZED.code) {
            // Create retry button
            const retryButton = document.createElement('button');
            retryButton.className = 'retry-removal-btn';
            retryButton.innerHTML = '<i class="material-icons">refresh</i>';
            retryButton.title = 'Try again';
            retryButton.addEventListener('click', () => removeMember(email));
            
            // Replace the original button temporarily
            if (removeButton) {
                removeButton.insertAdjacentElement('afterend', retryButton);
                removeButton.style.display = 'none';
                
                // Restore after 5 seconds
                setTimeout(() => {
                    retryButton.remove();
                    removeButton.style.display = '';
                }, 5000);
            }
        }
    }
};

function showPopup(popup) {
    popup.classList.add('active');
}

function hidePopup(popup) {
    popup.classList.remove('active');
}

async function addPendingInvite(data, membersList, deleteMemberPopup, setPendingInviteToDelete, isOwner, message = null) {
    const profilePicture = await fetchProfileImage(data.profilePicture);

    const memberElement = document.createElement('div');
    memberElement.className = 'member pending-invite';
    memberElement.dataset.email = data.email;
    
    // Determine if we have a message to display
    const messageHtml = message ? 
        `<div class="invite-message-indicator" title="This invitation includes a personal message">
            <i class="material-icons">message</i>
            <span class="tooltip-text">Personal message included</span>
         </div>` : '';
    
    memberElement.innerHTML = `
        <img src="${profilePicture || defaultAvatarPath}" alt="" class="member-avatar">
        <div class="member-info">
            <p class="member-name">Pending</p>
            <p class="member-email">${data.email}</p>
            ${messageHtml}
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
        // Create a fallback template for missing template types
        createFallbackTemplate(type);
        return;
    }

    // Update images and error messaging based on template type
    if (type === 'no-premium') {
        const img = document.getElementById('premium-feature-img');
        img && (img.src = creatorBusinessPath);
    } else if (type === 'no-workspace') {
        const img = document.getElementById('empty-workspace-img');
        img && (img.src = emptyWorkspacePath);
    } else if (type === 'error-state') {
        // Show retry button for error states
        const retryBtn = activeTemplate.querySelector('.retry-workspace-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                // Show loading state
                showWorkspaceLoading(true);
                // Retry operation after a short delay
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            });
        }
    } else if (type === 'auth-error') {
        // Show login button for authentication errors
        const loginBtn = activeTemplate.querySelector('.login-again-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                window.location.href = '/login';
            });
        }
    }

    activeTemplate.classList.add('active');
    
    // Hide loading spinner if it was showing
    showWorkspaceLoading(false);
}

// Create a fallback template when the requested template doesn't exist
function createFallbackTemplate(type) {
    const workspaceArea = document.querySelector('.workspace-area') || document.querySelector('.workspace-templates');
    if (!workspaceArea) return;
    
    // First remove any previous fallback template
    const existingFallback = document.querySelector('.workspace-template.fallback');
    if (existingFallback) {
        existingFallback.remove();
    }
    
    // Create a new fallback template
    const fallbackTemplate = document.createElement('div');
    fallbackTemplate.className = `workspace-template fallback ${type}`;
    
    let templateContent = '';
    
    if (type === 'error-state') {
        templateContent = `
            <div class="workspace-error-container">
                <i class="material-icons error-icon">error_outline</i>
                <h2>Workspace Unavailable</h2>
                <p>We encountered an issue while loading your workspace</p>
                <button class="retry-workspace-btn">Retry</button>
            </div>
        `;
    } else if (type === 'auth-error') {
        templateContent = `
            <div class="workspace-error-container">
                <i class="material-icons error-icon">lock</i>
                <h2>Authentication Required</h2>
                <p>Please login again to access your workspace</p>
                <button class="login-again-btn">Login</button>
            </div>
        `;
    } else {
        templateContent = `
            <div class="workspace-error-container">
                <i class="material-icons error-icon">warning</i>
                <h2>Something Went Wrong</h2>
                <p>We encountered an unexpected issue (${type})</p>
                <button class="retry-workspace-btn">Retry</button>
            </div>
        `;
    }
    
    fallbackTemplate.innerHTML = templateContent;
    workspaceArea.appendChild(fallbackTemplate);
    
    // Add event listeners
    const retryBtn = fallbackTemplate.querySelector('.retry-workspace-btn');
    if (retryBtn) {
        retryBtn.addEventListener('click', () => window.location.reload());
    }
    
    const loginBtn = fallbackTemplate.querySelector('.login-again-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => window.location.href = '/login');
    }
    
    // Show the fallback
    fallbackTemplate.classList.add('active');
}

// Show/hide workspace loading spinner
function showWorkspaceLoading(show = true) {
    let loadingEl = document.querySelector('.workspace-loading');
    
    if (!loadingEl && show) {
        const workspaceArea = document.querySelector('.workspace-area') || document.querySelector('.workspace-templates');
        if (!workspaceArea) return;
        
        loadingEl = document.createElement('div');
        loadingEl.className = 'workspace-loading';
        loadingEl.innerHTML = `
            <div class="loading-spinner"></div>
            <p>Loading workspace...</p>
        `;
        workspaceArea.appendChild(loadingEl);
    }
    
    if (loadingEl) {
        if (show) {
            loadingEl.classList.add('active');
        } else {
            loadingEl.classList.remove('active');
        }
    }
}

async function checkUserPlanAndWorkspace() {
    try {
        // Check network status first
        if (!isOnline()) {
            showProfileNotification(WORKSPACE_ERRORS.NETWORK.message, 'error', 'Network Error');
            return showWorkspaceTemplate('error-state');
        }
        
        const response = await fetch('/api/workspace/my', {
            method: 'GET',
            credentials: 'include'
        });

        // Handle specific error states with appropriate templates and notifications
        if (response.status === 403) {
            showProfileNotification('Premium plan required for workspace features', 'warning', 'Subscription Required');
            return showWorkspaceTemplate('no-premium');
        }

        if (response.status === 401) {
            showProfileNotification(WORKSPACE_ERRORS.UNAUTHORIZED.message, 'error', 'Authentication Error');
            return showWorkspaceTemplate('error-state');
        }

        if (!response.ok) {
            const statusCode = response.status;
            const errorMessage = `Error fetching workspace (${statusCode}): ${response.statusText}`;
            console.error(errorMessage);
            
            // Show appropriate error notification based on status code
            if (statusCode >= 500) {
                showProfileNotification('Server error occurred. Our team has been notified.', 'error', 'Server Error');
            } else {
                showProfileNotification('Unable to load workspace at this time', 'warning', 'Loading Error');
            }
            
            return showWorkspaceTemplate('error-state');
        }

        const data = await response.json();

        if (!data.workspace) {
            return showWorkspaceTemplate('no-workspace');
        }

        return data;

    } catch (error) {
        const errorType = handleWorkspaceError(error, 'Fetching workspace');
        const template = errorType === WORKSPACE_ERRORS.UNAUTHORIZED.code ? 'auth-error' : 'error-state';
        return showWorkspaceTemplate(template);
    }
}

// Character counter for invitation message
function setupMessageCounter() {
    const messageField = document.getElementById('invite-message');
    const charCount = document.getElementById('char-count');
    const messageCounter = document.querySelector('.message-counter');
    
    if (messageField && charCount) {
        messageField.addEventListener('input', () => {
            const currentLength = messageField.value.length;
            charCount.textContent = currentLength;
            
            // Update counter styling based on length
            if (currentLength > 180) {
                messageCounter.classList.add('limit-approaching');
                
                if (currentLength >= 200) {
                    messageCounter.classList.add('limit-reached');
                } else {
                    messageCounter.classList.remove('limit-reached');
                }
            } else {
                messageCounter.classList.remove('limit-approaching', 'limit-reached');
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Setup tab switching first, before doing anything else
        setupTabSwitching();
        
        // Setup character counter for invite message
        setupMessageCounter();

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
        const ownerAvatarEl = document.querySelector(".owner-avatar");

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
        });        // Create Workspace Form
        document.querySelector('.create-workspace-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get workspace form elements
            const workspaceForm = e.target;
            const workspaceNameInput = document.getElementById('workspace-creation');
            const submitButton = workspaceForm.querySelector('button[type="submit"]');
            const workspaceName = workspaceNameInput.value.trim();
            
            // Form validation
            if (!workspaceName) {
                workspaceNameInput.classList.add('error');
                showProfileNotification('Please enter a workspace name', 'warning');
                return;
            }
            
            if (workspaceName.length < 3 || workspaceName.length > 50) {
                workspaceNameInput.classList.add('error');
                showProfileNotification('Workspace name must be between 3 and 50 characters', 'warning');
                return;
            }
            
            try {
                // Reset validation state
                workspaceNameInput.classList.remove('error');
                
                // Show loading state
                submitButton.disabled = true;
                submitButton.innerHTML = '<span class="spinner"></span> Creating...';
                
                // Check network connectivity
                if (!isOnline()) {
                    throw Object.assign(new Error(WORKSPACE_ERRORS.NETWORK.message), { status: 'offline' });
                }
                
                const response = await fetch('api/workspace', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: workspaceName }),
                });

                const data = await response.json();
                
                if (!response.ok) {
                    const errorMsg = data.message || `Failed to create workspace (${response.status})`;
                    throw Object.assign(new Error(errorMsg), { status: response.status });
                }
                
                if (!data.success) {
                    // Handle specific API error responses
                    if (data.code === 'name_exists') {
                        workspaceNameInput.classList.add('error');
                        showProfileNotification('A workspace with this name already exists', 'warning');
                        return;
                    } else if (data.code === 'premium_required') {
                        showProfileNotification('Workspace feature requires a premium subscription', 'warning', 'Upgrade Required');
                        showWorkspaceTemplate('no-premium');
                        return;
                    } else {
                        throw Object.assign(new Error(data.message || 'Failed to create workspace'), { status: response.status });
                    }
                }

                // Success
                showProfileNotification('Workspace created successfully!', 'success');
                
                // Briefly show success state before reloading
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="material-icons">check</i> Created!';
                submitButton.classList.add('success');
                
                setTimeout(() => {
                    window.location.reload();
                }, 1000);

            } catch (err) {
                // Reset button state
                submitButton.disabled = false;
                submitButton.innerHTML = 'Create Workspace';
                
                // Handle error with specific UI feedback
                const errorCode = handleWorkspaceError(err, 'Creating workspace');
                
                // Special handling based on error type
                if (errorCode === WORKSPACE_ERRORS.VALIDATION.code) {
                    workspaceNameInput.classList.add('error');
                    workspaceNameInput.focus();
                } else if (errorCode === WORKSPACE_ERRORS.UNAUTHORIZED.code) {
                    // Show login button
                    const loginBtn = document.createElement('button');
                    loginBtn.className = 'login-again-btn';
                    loginBtn.textContent = 'Login Again';
                    loginBtn.addEventListener('click', () => {
                        window.location.href = '/login';
                    });
                    
                    // Replace submit button temporarily
                    submitButton.insertAdjacentElement('afterend', loginBtn);
                    submitButton.style.display = 'none';
                    
                    // Restore after 5 seconds
                    setTimeout(() => {
                        loginBtn.remove();
                        submitButton.style.display = '';
                    }, 5000);
                }
            }
        });        // --- Remove Pending Invite ---
        const removePendingInvite = async (email) => {
            // Find the invite element
            const inviteEl = document.querySelector(`.member[data-email="${email}"]`);
            if (!inviteEl) {
                showProfileNotification("Invite not found in the current view.", "warning");
                return false;
            }
            
            // Show loading state
            inviteEl.classList.add('removing');
            const removeButton = inviteEl.querySelector('.remove-pending');
            if (removeButton) {
                removeButton.disabled = true;
                removeButton.innerHTML = '<i class="material-icons removing-icon">hourglass_empty</i>';
            }
            
            try {
                // Check network connectivity
                if (!isOnline()) {
                    throw Object.assign(new Error(WORKSPACE_ERRORS.NETWORK.message), { status: 'offline' });
                }
                
                const response = await fetch('/api/workspace/invite', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                
                if (!response.ok) {
                    // Handle non-OK responses
                    const statusCode = response.status;
                    let errorMessage = 'Failed to remove invitation';
                    
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.message || errorMessage;
                    } catch (parseError) {
                        errorMessage = `Failed to remove invitation (${statusCode})`;
                    }
                    
                    throw Object.assign(new Error(errorMessage), { status: statusCode });
                }
                
                const data = await response.json();
                
                if (!data.success) {
                    // Reset invite element state
                    inviteEl.classList.remove('removing');
                    if (removeButton) {
                        removeButton.disabled = false;
                        removeButton.innerHTML = '<i class="material-icons">person_remove</i>';
                    }
                    
                    // Handle specific API error types
                    if (data.code === 'not_found') {
                        showProfileNotification("This invitation no longer exists.", "info");
                        inviteEl.remove(); // Remove from UI since it's not there
                        return true;
                    } else {
                        showProfileNotification(data.message || "Failed to remove invitation!", "error");
                        return false;
                    }
                }
                
                // Success - show removal animation
                inviteEl.classList.add('removed');
                
                // After animation completes, remove element and show success notification
                setTimeout(() => {
                    inviteEl.remove();
                    showProfileNotification("Invitation cancelled successfully.", "success");
                }, 500);
                
                return true;
            } catch (error) {
                // Reset invite element state
                inviteEl.classList.remove('removing');
                if (removeButton) {
                    removeButton.disabled = false;
                    removeButton.innerHTML = '<i class="material-icons">person_remove</i>';
                }
                
                // Handle error with our utility
                handleWorkspaceError(error, 'Removing invitation');
                
                // Return failure
                return false;
            }
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

            if (ownerNameEl) ownerNameEl.textContent = workspace.owner.username;
            if (ownerRoleEl) ownerRoleEl.textContent = "Owner";
            if (ownerAvatarEl) ownerAvatarEl.src = await fetchProfileImage(workspace.owner.profilePicture) || defaultAvatarPath;

            const nonOwnerMembers = workspace.members.filter(member => member._id !== workspace.owner._id);

            if (membersList) membersList.innerHTML = '';
            nonOwnerMembers.forEach(member => {
                displayMember(member, membersList, 'Member', isOwner);
            });

            if (workspace.pendingInvites?.length > 0) {
                workspace.pendingInvites.forEach(invite => {
                    addPendingInvite(invite, membersList, deleteMemberPopup, setPendingInviteToDelete, isOwner);
                });
            }
        }        document.querySelector('.invite-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();

            const form = e.target;
            const emailInput = document.getElementById('invite-email');
            const messageInput = document.getElementById('invite-message');
            const submitButton = form.querySelector('button[type="submit"]');
            const email = emailInput.value.trim();
            const message = messageInput.value.trim();

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email || !emailRegex.test(email)) {
                emailInput.classList.add('error');
                showProfileNotification('Please enter a valid email address', 'warning');
                return;
            }
            
            // First show the invite preview popup
            const invitePreviewPopup = document.querySelector('.invite-preview-popup');
            if (invitePreviewPopup) {
                // Set the email in the preview
                document.getElementById('preview-email').textContent = email;
                
                // Set the personal message if provided
                const personalMsgElement = document.getElementById('preview-personal-message');
                if (message) {
                    personalMsgElement.innerHTML = `<p class="personal-message-label">Personal Message:</p>
                    <p class="personal-message-text">"${message}"</p>`;
                    personalMsgElement.style.display = 'block';
                } else {
                    personalMsgElement.style.display = 'none';
                }
                
                // Show the popup
                showPopup(invitePreviewPopup);
                
                // Handle the cancel button
                const cancelBtn = invitePreviewPopup.querySelector('.cancel-btn');
                cancelBtn.onclick = () => {
                    hidePopup(invitePreviewPopup);
                };
                
                // Handle the confirm button
                const confirmBtn = invitePreviewPopup.querySelector('.confirm-btn');
                confirmBtn.onclick = async () => {
                    hidePopup(invitePreviewPopup);
                    await sendInvitation(email, message);
                };
                
                return;
            }
            
            // If the preview popup doesn't exist, send directly
            await sendInvitation(email, message);
            
            // Function to send the invitation
            async function sendInvitation(email, message) {
                try {
                    // Reset error states
                    emailInput.classList.remove('error');
                    
                    // Show loading state
                    submitButton.disabled = true;
                    const originalButtonText = submitButton.innerHTML;
                    submitButton.innerHTML = '<span class="spinner"></span> Sending...';
                    
                    // Check network connectivity
                    if (!isOnline()) {
                        throw Object.assign(new Error(WORKSPACE_ERRORS.NETWORK.message), { status: 'offline' });
                    }

                    const response = await fetch('/api/workspace/invite', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, message }),
                    });
                    
                    // Error handling for non-ok responses
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw Object.assign(
                            new Error(errorData.message || `Failed to invite user (${response.status})`), 
                            { status: response.status, code: errorData.code }
                        );
                    }

                    const data = await response.json();
                    
                    // Error handling for API error responses
                    if (!data.success) {
                        // Handle known error types with specific messages
                        switch (data.code) {
                            case 'user_not_found':
                                emailInput.classList.add('error');
                                throw Object.assign(
                                    new Error('User with this email address was not found'), 
                                    { status: 404, code: data.code }
                                );
                            case 'already_invited':
                                emailInput.classList.add('warning');
                                throw Object.assign(
                                    new Error('This user has already been invited'), 
                                    { status: 400, code: data.code }
                                );
                            case 'already_member':
                                emailInput.classList.add('warning');
                                throw Object.assign(
                                    new Error('This user is already a member of your workspace'), 
                                    { status: 400, code: data.code }
                                );
                            case 'invite_limit':
                                throw Object.assign(
                                    new Error('You have reached the maximum number of pending invites for your plan'), 
                                    { status: 403, code: data.code }
                                );
                            default:
                                throw Object.assign(
                                    new Error(data.message || 'Failed to invite user'), 
                                    { status: 400, code: data.code }
                                );
                        }
                    }
                    
                    // Success handling
                    const isOwnerCurrent = workspaceData?.workspace?.owner?._id === user._id;
                    addPendingInvite(data.user, membersList, deleteMemberPopup, setPendingInviteToDelete, isOwnerCurrent);
                    
                    // Show success state
                    submitButton.innerHTML = '<i class="material-icons">check</i> Sent!';
                    submitButton.classList.add('success');
                    
                    // Show success popup
                    showPopup(inviteSuccessPopup);
                    emailInput.value = '';
                    messageInput.value = '';
                    
                    // Reset button after delay
                    setTimeout(() => {
                        submitButton.disabled = false;
                        submitButton.innerHTML = originalButtonText;
                        submitButton.classList.remove('success');
                    }, 2000);
                } catch (err) {
                    // Reset button state
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonText;
                    
                    // Special handling for specific error codes
                    if (err.code === 'already_invited' || err.code === 'already_member') {
                        showProfileNotification(err.message, 'warning');
                    } else if (err.code === 'invite_limit') {
                        showProfileNotification(err.message, 'warning', 'Plan Limit Reached');
                    } else {
                        // General error handling
                        handleWorkspaceError(err, 'Inviting user');
                    }
                    
                    // Recovery suggestions based on error
                    if (err.status === 401) {
                        // Auth error - show login button
                        const loginBtn = document.createElement('button');
                        loginBtn.className = 'login-again-btn';
                        loginBtn.textContent = 'Login Again';
                        loginBtn.addEventListener('click', () => window.location.href = '/login');
                        
                        form.appendChild(loginBtn);
                        setTimeout(() => loginBtn.remove(), 5000);                    }
                }
            }
        });

        deleteMemberPopup?.querySelector('.cancel-btn')?.addEventListener('click', () => {
            hidePopup(deleteMemberPopup);
            memberToDeleteEmail = null;
        });        deleteMemberPopup?.querySelector('.confirm-btn')?.addEventListener('click', async () => {
            const confirmBtn = deleteMemberPopup.querySelector('.confirm-btn');
            const cancelBtn = deleteMemberPopup.querySelector('.cancel-btn');
            
            if (memberToDeleteEmail) {
                // Disable buttons and show loading state
                confirmBtn.disabled = true;
                cancelBtn.disabled = true;
                confirmBtn.innerHTML = '<span class="spinner"></span> Removing...';
                
                // Try to remove the invitation
                const success = await removePendingInvite(memberToDeleteEmail);
                
                if (success) {
                    // Success state
                    confirmBtn.innerHTML = '<i class="material-icons">check</i> Removed';
                    confirmBtn.classList.add('success');
                    
                    // Hide popup after a short delay
                    setTimeout(() => {
                        hidePopup(deleteMemberPopup);
                        
                        // Reset button state after popup is hidden
                        setTimeout(() => {
                            confirmBtn.disabled = false;
                            cancelBtn.disabled = false;
                            confirmBtn.innerHTML = 'Remove';
                            confirmBtn.classList.remove('success');
                        }, 300);
                    }, 800);
                } else {
                    // Error state
                    confirmBtn.innerHTML = 'Error';
                    confirmBtn.classList.add('error');
                    
                    // Reset buttons after a delay
                    setTimeout(() => {
                        confirmBtn.disabled = false;
                        cancelBtn.disabled = false;
                        confirmBtn.innerHTML = 'Try Again';
                        confirmBtn.classList.remove('error');
                    }, 1000);
                }
            } else {
                hidePopup(deleteMemberPopup);
            }
            
            // Reset the email regardless of outcome
            memberToDeleteEmail = null;
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

