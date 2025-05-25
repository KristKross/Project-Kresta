document.addEventListener('DOMContentLoaded', () => {
    const notificationsList = document.querySelector('.notifications-list');
    const markAllReadBtn = document.querySelector('.mark-all-read');

    let invitationNotifications = [];    function createNotificationItem(notification) {
        return `
            <div class="notification-item ${notification.unread ? 'unread' : ''}" data-id="${notification.id}">
                <div class="notification-icon">
                    <img src="./assets/icons/notifications/${notification.type}.png" alt="${notification.type}">
                </div>
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-text">${notification.text}</div>
                    <div class="notification-time">${notification.time}</div>
                </div>
            </div>
        `;
    }    function createInvitationItem(invitation) {
        return `
            <div class="notification-item invitation-notification ${invitation.unread ? 'unread' : ''}" data-id="${invitation.id}" data-workspace="${invitation.workspaceName}" data-workspace-id="${invitation.workspaceId}">
                <div class="notification-icon">
                    <img src="./assets/icons/notifications/invite.png" alt="invitation">
                </div>
                <div class="notification-content">
                    <div class="notification-title">${invitation.title}</div>
                    <div class="notification-text">${invitation.text}</div>
                    <div class="notification-time">${invitation.time}</div>
                </div>
                <div class="invitation-actions">
                    <button class="action-btn accept-btn" onclick="handleInvitationAction('${invitation.id}', 'accept', '${invitation.workspaceId}')">Accept</button>
                    <button class="action-btn decline-btn" onclick="handleInvitationAction('${invitation.id}', 'decline', '${invitation.workspaceId}')">Decline</button>
                </div>
            </div>
        `;
    }function renderNotifications() {
        // Create a separator between static and dynamic content
        const dynamicSection = document.createElement('div');
        dynamicSection.classList.add('dynamic-notifications');
        dynamicSection.innerHTML = `
            <div class="notifications-section-header">
                <h3>Dynamic Notifications</h3>
            </div>
            ${notifications.map(notification => createNotificationItem(notification)).join('')}
        `;
        
        // Append dynamic content after static content
        notificationsList.appendChild(dynamicSection);
    }

    // Fetch and render invitation notifications
    async function fetchInvitationNotifications() {
        try {
            const response = await fetch('/api/notifications/get', {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.notifications) {
                    invitationNotifications = data.notifications.filter(notification => 
                        notification.type === 'invite'
                    ).map(notification => ({
                        id: notification._id,
                        title: 'Workspace Invitation',
                        text: notification.message,
                        time: getTimeAgo(notification.createdAt),
                        unread: !notification.read,
                        workspaceId: notification.workspaceId || null,
                    }));

                    renderInvitationNotifications();
                }
            }
        } catch (error) {
            console.error('Error fetching invitation notifications:', error);
        }
    }

    function renderInvitationNotifications() {
        if (invitationNotifications.length > 0) {
            const invitationSection = document.createElement('div');
            invitationSection.classList.add('invitation-notifications');
            invitationSection.innerHTML = `
                <div class="notifications-section-header">
                    <h3>Workspace Invitations</h3>
                </div>
                ${invitationNotifications.map(invitation => createInvitationItem(invitation)).join('')}
            `;
            
            // Insert invitation section at the beginning of the list
            notificationsList.insertBefore(invitationSection, notificationsList.firstChild);
        }
    }    // Handle invitation actions (accept/decline)
    window.handleInvitationAction = async (invitationId, action, workspaceId) => {
        const actionBtn = event.target;
        const allActionBtns = actionBtn.parentElement.querySelectorAll('.action-btn');
        
        // Disable buttons to prevent multiple clicks
        allActionBtns.forEach(btn => btn.disabled = true);
        
        try {            
            // Continue with normal processing for other invitations
            const endpoint = action === 'accept' ? '/api/workspace/accept' : '/api/workspace/decline';
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ workspaceId: workspaceId })
            });

            const data = await response.json();
            
            if (data.success) {
                // Remove the invitation from the list with animation
                const invitationElement = document.querySelector(`[data-id="${invitationId}"]`);
                if (invitationElement) {
                    invitationElement.style.transform = 'translateX(-100%)';
                    invitationElement.style.opacity = '0';
                    setTimeout(() => {
                        invitationElement.remove();
                        
                        // Remove from local array
                        invitationNotifications = invitationNotifications.filter(inv => inv.id !== invitationId);
                        
                        // If no more invitations, remove the section
                        if (invitationNotifications.length === 0) {
                            const invitationSection = document.querySelector('.invitation-notifications');
                            if (invitationSection) invitationSection.remove();
                        }
                    }, 300);
                }
                
                // Show success message
                showMessage(`Invitation ${action}ed successfully!`, 'success');
                
            } else {
                throw new Error(data.message || `Failed to ${action} invitation`);
            }        } catch (error) {
            console.error(`Error ${action}ing invitation:`, error);
            
            // Show error message
            showMessage(`Error ${action}ing invitation: ${error.message}`, 'error');
            
            // Re-enable buttons on error
            allActionBtns.forEach(btn => btn.disabled = false);
        }
    };

    // Mark notification as read
    async function markNotificationAsRead(notificationId) {
        try {
            await fetch('/api/notifications/mark-read', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ notificationId })
            });
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }
    function showMessage(message, type = 'info') {
        const messageEl = document.createElement('div');
        messageEl.className = `notification-message ${type}`;
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 6px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            ${type === 'success' ? 'background: #4caf50;' : 'background: #f4436;'}
        `;
        
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            messageEl.style.transform = 'translateX(100%)';
            setTimeout(() => messageEl.remove(), 300);
        }, 3000);
    }
    function getTimeAgo(dateString) {
        const now = new Date();
        const past = new Date(dateString);
        const diffInSeconds = Math.floor((now - past) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
    }    // Mark individual notification as read
    notificationsList.addEventListener('click', (e) => {
        const notificationItem = e.target.closest('.notification-item');
        if (notificationItem && !notificationItem.classList.contains('invitation-notification')) {
            notificationItem.classList.remove('unread');
        }
    });

    // Mark all notifications as read
    markAllReadBtn.addEventListener('click', () => {
        document.querySelectorAll('.notification-item').forEach(item => {
            item.classList.remove('unread');
        });
    });

    // Show badge with count
    document.getElementById('sidebarNotifBadge').textContent = '5';
    document.getElementById('sidebarNotifBadge').style.display = 'inline-block';

    // Hide badge when count is 0
    document.getElementById('sidebarNotifBadge').style.display = 'none';

    // Initial render
    fetchInvitationNotifications();
    renderNotifications();
});
