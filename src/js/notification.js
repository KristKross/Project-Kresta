document.addEventListener('DOMContentLoaded', () => {
    const notificationsList = document.querySelector('.notifications-list');
    const markAllReadBtn = document.querySelector('.mark-all-read');

    // Sample notifications data
    const notifications = [
        {
            id: 1,
            type: 'post',
            title: 'Post Scheduled',
            text: 'Your post "Summer Collection Launch" has been scheduled for tomorrow at 10:00 AM',
            time: '2 minutes ago',
            unread: true
        },
        {
            id: 2,
            type: 'analytics',
            title: 'Engagement Increase',
            text: 'Your recent post is performing well with 50% more engagement than usual',
            time: '1 hour ago',
            unread: true
        },
        {
            id: 3,
            type: 'task',
            title: 'Task Completed',
            text: 'Team member John completed the task "Create social media calendar"',
            time: '2 hours ago',
            unread: false
        }
    ];

    // Store invitation notifications separately
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
                if (data.success && data.notifications) {                    // Filter invitation notifications
                    invitationNotifications = data.notifications.filter(notification => 
                        notification.type === 'invite'
                    ).map(notification => ({
                        id: notification._id,
                        title: 'Workspace Invitation',
                        text: notification.message,
                        time: getTimeAgo(notification.createdAt),
                        unread: !notification.read,
                        workspaceName: notification.workspaceName || 'Unknown Workspace',
                        workspaceId: notification.workspaceId || null,
                        ownerEmail: notification.ownerEmail || 'unknown@email.com'
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
        
        try {            // Simulating a premium plan error for workspace feature
            // In a real application, this would be handled by the server response
            if (invitationId === 'invite-1' && action === 'accept') {
                // Show premium upgrade message for workspace feature specifically
                showPremiumUpgradeMessage('Workspace collaboration features require a premium plan');
                
                // Re-enable buttons
                setTimeout(() => {
                    allActionBtns.forEach(btn => btn.disabled = false);
                }, 500);
                
                return;
            }
            
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
            
            // Check if this is a premium plan error
            if (error.message && (error.message.includes('plan required') || error.message.includes('Pro or Business'))) {
                showPremiumUpgradeMessage();
            } else {
                showMessage(`Error ${action}ing invitation: ${error.message}`, 'error');
            }
            
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
    }    // Show message to user
    function showMessage(message, type = 'info') {
        // Check if this is a premium plan related error and customize based on feature
        if (message.includes('plan required') || message.includes('Pro or Business')) {
            let customMessage = "This feature requires a premium plan.";
            
            // Customize the message based on the specific feature that requires premium
            if (message.toLowerCase().includes('workspace')) {
                customMessage = "Workspace collaboration features require a premium plan.";
            } else if (message.toLowerCase().includes('task')) {
                customMessage = "Task management features require a premium plan.";
            }
            
            showPremiumUpgradeMessage(customMessage);
            return;
        }
        
        // Create a temporary message element for regular messages
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
            ${type === 'success' ? 'background: #4caf50;' : 'background: #f44336;'}
        `;
        
        document.body.appendChild(messageEl);
        
        // Animate in
        setTimeout(() => {
            messageEl.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            messageEl.style.transform = 'translateX(100%)';
            setTimeout(() => messageEl.remove(), 300);
        }, 3000);
    }
      // Show premium upgrade message with plan links
    function showPremiumUpgradeMessage(customMessage) {
        // Remove any existing premium notification
        const existingNotification = document.querySelector('.premium-upgrade-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const defaultMessage = "This feature requires a premium plan. Upgrade to access this and other advanced features.";
        const messageText = customMessage || defaultMessage;
        
        // Create premium upgrade notification
        const notificationEl = document.createElement('div');
        notificationEl.className = 'premium-upgrade-notification';
        notificationEl.innerHTML = `
            <div class="premium-content">
                <div class="premium-icon"></div>
                <div class="premium-text">
                    <div class="premium-title">Premium Feature</div>
                    <div class="premium-message">${messageText}</div>
                    <div class="premium-links">
                        <a href="pricing.html#creator" class="plan-link">Creator Plan</a>
                        <span class="separator">or</span>
                        <a href="pricing.html#business" class="plan-link">Business Plan</a>
                    </div>
                </div>
            </div>
        `;
        
        // Find insertion point - at the top of notifications list
        const notificationsList = document.querySelector('.notifications-list');
        if (notificationsList) {
            notificationsList.insertBefore(notificationEl, notificationsList.firstChild);
            
            // Scroll to top to ensure notification is visible
            notificationsList.scrollTop = 0;
            
            // Add click event listeners to plan links
            notificationEl.querySelectorAll('.plan-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    window.location.href = link.getAttribute('href');
                });
            });
        }
    }

    // Helper function to calculate time ago
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
    fetchInvitationNotifications(); // Fetch invitations first
    renderNotifications();
      /* 
    // FOR DEVELOPERS: Uncomment to add test buttons for premium feature errors
    const createTestBtn = (text, message, bottom) => {
        const btn = document.createElement('button');
        btn.textContent = text;
        btn.style.position = 'fixed';
        btn.style.bottom = bottom + 'px';
        btn.style.right = '20px';
        btn.style.padding = '10px 15px';
        btn.style.background = '#007bff';
        btn.style.color = 'white';
        btn.style.border = 'none';
        btn.style.borderRadius = '5px';
        btn.style.cursor = 'pointer';
        btn.onclick = () => showPremiumUpgradeMessage(message);
        document.body.appendChild(btn);
    };
    
    // Create test buttons for different premium features
    createTestBtn('Test Workspace Premium', 'Workspace collaboration features require a premium plan', 20);
    createTestBtn('Test Tasks Premium', 'Task management features require a premium plan', 70);
    */
});