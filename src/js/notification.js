document.addEventListener('DOMContentLoaded', () => {
    const notificationsList = document.querySelector('.notifications-list');
    const markAllReadBtn = document.querySelector('.mark-all-read');

    // Template notifications based on existing HTML
    const notifications = [
        {
            id: 'invite-1',
            type: 'invite',
            title: 'Workspace Invitation',
            text: 'You\'ve been invited to join Creative Agency workspace',
            time: '5 minutes ago',
            unread: true,
            icon: './assets/icons/notifications/invite-accepted.png'
        },
        {
            id: 'notif-2',
            type: 'task',
            title: 'Task Completed',
            text: 'Team member completed a task',
            time: '1 hour ago',
            unread: false,
            icon: './assets/icons/notifications/task-complete.png'
        }
    ];    // Create notification HTML template
    function createNotification(notification) {
        // Check if this is an invite type notification
        const isInviteNotification = notification.type === 'invite';
        
        return `
            <div class="notification-item ${notification.unread ? 'unread' : ''}" data-id="${notification.id}">
                <div class="notification-icon">
                    <img src="${notification.icon}" alt="${notification.type}">
                </div>
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-text">${notification.text}</div>
                    <div class="notification-time">${notification.time}</div>
                </div>
                ${isInviteNotification ? `
                    <div class="notification-actions">
                        <button class="action-btn accept-btn" onclick="handleInviteAction('${notification.id}', 'accept')">Accept</button>
                        <button class="action-btn decline-btn" onclick="handleInviteAction('${notification.id}', 'decline')">Decline</button>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // Render notifications
    function renderNotifications() {
        notificationsList.innerHTML = notifications.map(createNotification).join('');
    }    // Handle invitation actions (for invite type notifications)
    window.handleInviteAction = async (notificationId, action) => {
        const notification = document.querySelector(`[data-id="${notificationId}"]`);
        const actionBtns = notification.querySelectorAll('.action-btn');
        
        // Disable buttons
        actionBtns.forEach(btn => btn.disabled = true);
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
              // Remove notification
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(-20px)';
            setTimeout(() => notification.remove(), 300);
            
            // Show proper message with correct grammar
            const actionMessage = action === 'accept' ? 'accepted' : 'declined';
            showMessage(`Invitation ${actionMessage} successfully!`);
            
        } catch (error) {
            console.error('Error:', error);
            const actionMessage = action === 'accept' ? 'accepting' : 'declining';
            showMessage(`Error ${actionMessage} invitation`, 'error');
            actionBtns.forEach(btn => btn.disabled = false);
        }
    };

    // Handle task notifications (for task type notifications)
    function handleTaskNotification(notificationId) {
        const notification = document.querySelector(`[data-id="${notificationId}"]`);
        if (notification) {
            notification.classList.remove('unread');
            showMessage('Task notification marked as read');
        }
    }    // Show message with enhanced styling
    function showMessage(message, type = 'success') {
        const messageEl = document.createElement('div');
        
        // Check if it's an acceptance message for special styling
        const isAcceptanceMessage = message.includes('accepted successfully');
        const isDeclineMessage = message.includes('declined successfully');
        
        if (isAcceptanceMessage) {
            messageEl.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 18px;">✅</span>
                    <span>${message}</span>
                </div>
            `;        } else if (isDeclineMessage) {
            messageEl.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 18px; color: white; font-weight: bold;">✕</span>
                    <span>${message}</span>
                </div>
            `;
        } else {
            messageEl.textContent = message;
        }
          messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: ${isAcceptanceMessage || isDeclineMessage ? '16px 24px' : '12px 20px'};
            border-radius: 8px;
            color: white;
            font-family: 'Red Hat Display', -apple-system, BlinkMacSystemFont, sans-serif;
            font-weight: ${isAcceptanceMessage || isDeclineMessage ? '600' : '500'};
            font-size: ${isAcceptanceMessage || isDeclineMessage ? '16px' : '14px'};
            letter-spacing: 0.3px;
            z-index: 1000;
            background: ${isDeclineMessage ? 
                'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)' :
                (type === 'success' ? 
                    (isAcceptanceMessage ? 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)' : '#4caf50') 
                    : '#f44336')};
            box-shadow: ${isAcceptanceMessage || isDeclineMessage ? 
                (isDeclineMessage ? 
                    '0 8px 25px rgba(244, 67, 54, 0.4), 0 4px 12px rgba(0, 0, 0, 0.15)' :
                    '0 8px 25px rgba(76, 175, 80, 0.4), 0 4px 12px rgba(0, 0, 0, 0.15)') 
                : '0 4px 12px rgba(0, 0, 0, 0.15)'};
            transform: translateX(100%);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            border-left: ${isAcceptanceMessage ? '4px solid #2e7d32' : 
                         isDeclineMessage ? '4px solid #c62828' : 'none'};
            min-width: ${isAcceptanceMessage || isDeclineMessage ? '280px' : '200px'};
        `;
        
        document.body.appendChild(messageEl);
        
        setTimeout(() => messageEl.style.transform = 'translateX(0)', 100);        setTimeout(() => {
            messageEl.style.transform = 'translateX(100%)';
            setTimeout(() => messageEl.remove(), 400);
        }, isAcceptanceMessage ? 4000 : 3000);
    }

    // Mark as read on click
    notificationsList.addEventListener('click', (e) => {
        const notification = e.target.closest('.notification-item');
        if (notification) {
            notification.classList.remove('unread');
        }
    });

    // Mark all as read
    markAllReadBtn.addEventListener('click', () => {
        document.querySelectorAll('.notification-item').forEach(item => {
            item.classList.remove('unread');
        });
    });

    // Initialize
    renderNotifications();
});