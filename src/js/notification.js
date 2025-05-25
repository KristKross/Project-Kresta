import inviteIconPath from "../assets/icons/notifications/invite-accepted.png";
import taskIconPath from '../assets/icons/notifications/task-complete.png';

document.addEventListener('DOMContentLoaded', async () => {
    const notificationsList = document.querySelector('.notifications-list');
    const markAllReadBtn = document.querySelector('.mark-all-read');

    // Fetch notifications from API
    async function fetchNotifications() {
        try {
            const response = await fetch("/api/notifications/get");
            const data = await response.json();

            console.log(data);

            if (data.success) {
                return data.notifications.map(notification => ({
                    id: notification._id,
                    type: notification.type,
                    title: notification.type === 'invite' ? 'Workspace Invitation' : notification.type === 'task' ? 'Task Completed' : '',
                    text: notification.message,
                    time: new Date(notification.createdAt).toLocaleString(),
                    unread: !notification.read,
                    icon: getNotificationIcon(notification.type),
                    workspaceId: notification.workspaceId?._id || null // Ensure workspaceId is extracted correctly
                }));
            } else {
                console.error("Error fetching notifications:", data.message);
                return [];
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
            return [];
        }
    }

    // Function to get correct icon for notification type
    function getNotificationIcon(type) {
        const icons = {
            invite: inviteIconPath,
            task: taskIconPath,
        };
        return icons[type] || "./assets/icons/notifications/default.png";
    }

    // Create notification HTML template
    function createNotification(notification) {
        const isInviteNotification = notification.type === 'invite';
        const isTaskNotification = notification.type === 'task';

        return `
            <div class="notification-item ${notification.unread ? 'unread' : ''}" 
                 data-id="${notification.id}" 
                 data-workspace-id="${notification.workspaceId}">
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
                        <button class="action-btn accept-btn" onclick="handleInviteAction('${notification.workspaceId}', 'accept')">Accept</button>
                        <button class="action-btn decline-btn" onclick="handleInviteAction('${notification.workspaceId}', 'decline')">Decline</button>
                    </div>
                ` : ''}
                ${isTaskNotification ? `
                    <div class="notification-actions">
                        <button class="action-btn view-task-btn" onclick="handleTaskNotification('${notification.workspaceId}')">View Task</button>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // Render notifications from API response
    async function renderNotifications() {
        const notifications = await fetchNotifications();
        notificationsList.innerHTML = notifications.map(createNotification).join('');
    }

    // Handle invitation actions (for invite type notifications)
    window.handleInviteAction = async (workspaceId, action) => {
        if (!workspaceId) {
            console.error("Error: Workspace ID not found in notification.");
            showMessage("Error: Workspace ID missing", "error");
            return;
        }

        const notification = document.querySelector(`[data-workspace-id="${workspaceId}"]`);
        const actionBtns = notification.querySelectorAll('.action-btn');

        // Disable buttons
        actionBtns.forEach(btn => btn.disabled = true);

        try {
            const response = await fetch(`/api/workspace/${action}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ workspaceId }) // Send correct workspaceId
            });

            const data = await response.json();

            if (data.success) {
                // Remove notification
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(-20px)';
                setTimeout(() => notification.remove(), 300);

                // Show success message
                const actionMessage = action === 'accept' ? 'accepted' : 'declined';
                showMessage(`Invitation ${actionMessage} successfully!`);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            const actionMessage = action === 'accept' ? 'accepting' : 'declining';
            showMessage(`Error ${actionMessage} invitation`, 'error');
            actionBtns.forEach(btn => btn.disabled = false);
        }
    };

    // Handle task notifications (for task type notifications)
    function handleTaskNotification(workspaceId) {
        const notification = document.querySelector(`[data-workspace-id="${workspaceId}"]`);
        if (notification) {
            notification.classList.remove('unread');
            showMessage('Task notification marked as read');
        }
    }

    // Show message with enhanced styling
    function showMessage(message, type = 'success') {
        const messageEl = document.createElement('div');

        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-family: 'Red Hat Display', sans-serif;
            font-weight: 500;
            font-size: 14px;
            letter-spacing: 0.3px;
            z-index: 1000;
            background: ${type === 'success' ? '#4caf50' : '#f44336'};
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transform: translateX(100%);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        `;

        document.body.appendChild(messageEl);

        setTimeout(() => messageEl.style.transform = 'translateX(0)', 100);
        setTimeout(() => {
            messageEl.style.transform = 'translateX(100%)';
            setTimeout(() => messageEl.remove(), 400);
        }, 3000);
    }

    // Mark all notifications as read
    markAllReadBtn.addEventListener('click', async () => {
        document.querySelectorAll('.notification-item').forEach(item => {
            item.classList.remove('unread');
        });

        try {
            await fetch("/api/notifications/mark-read", { method: "PUT" });
        } catch (error) {
            console.error("Error marking notifications as read:", error);
        }
    });

    // Initialize by fetching and rendering notifications
    renderNotifications();
});