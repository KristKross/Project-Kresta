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

    function createNotificationItem(notification) {
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
    }

    function renderNotifications() {
        notificationsList.innerHTML = notifications
            .map(notification => createNotificationItem(notification))
            .join('');
    }

    // Mark individual notification as read
    notificationsList.addEventListener('click', (e) => {
        const notificationItem = e.target.closest('.notification-item');
        if (notificationItem) {
            notificationItem.classList.remove('unread');
        }
    });

    // Mark all notifications as read
    markAllReadBtn.addEventListener('click', () => {
        document.querySelectorAll('.notification-item').forEach(item => {
            item.classList.remove('unread');
        });
    });

    // Initial render
    renderNotifications();
});