// Function to show plan switch notification
function showPlanSwitchNotification(planName) {
    const notification = document.createElement('div');
    notification.className = 'plan-switch-notification';
      notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">
                <i class="material-icons" data-fallback="✓">check_circle</i>
            </div>
            <div class="notification-text">
                <h3>Plan Updated Successfully!</h3>
                <p>You've successfully switched to the ${planName} plan.</p>
            </div>
            <button class="close-notification" aria-label="Close notification">
                <i class="material-icons" data-fallback="×">close</i>
            </button>
        </div>
    `;

    document.body.appendChild(notification);

    // Add close functionality
    const closeBtn = notification.querySelector('.close-notification');
    closeBtn.addEventListener('click', () => {
        hidePlanSwitchNotification(notification);
    });

    // Show notification with animation
    setTimeout(() => {
        notification.classList.add('active');
    }, 100);

    // Auto-hide after 5 seconds
    setTimeout(() => {
        hidePlanSwitchNotification(notification);
    }, 5000);
}

// Function to hide plan switch notification
function hidePlanSwitchNotification(notification) {
    notification.classList.remove('active');
    setTimeout(() => {
        if (notification && notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

// Function to get plan display name
function getPlanDisplayName(planId) {
    const planNames = {
        'free': 'Free',
        'pro': 'Pro',
        'business': 'Business'
    };
    return planNames[planId] || planId;
}

async function updatePricing(event) {
    event.preventDefault();

    const button = event.target.closest('.select-plan');
    if (!button) {
        console.error("Button not found!");
        return;
    }

    const newTier = button.id;
    const planName = getPlanDisplayName(newTier);

    try {
        const res = await fetch(`/auth/update-pricing`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ newTier }),
        });

        const data = await res.json();
        console.log(res);

        if (res.ok) {
            // Show success notification instead of reloading
            showPlanSwitchNotification(planName);
            
            // Optional: Still reload after showing notification for a moment
            setTimeout(() => {
                location.reload();
            }, 2000);
        } else {
            // Show error notification using the same system but with error styling
            showErrorNotification(data.message || 'Failed to update plan');
        }
    } catch (error) {
        console.error("Error during fetch:", error);
        showErrorNotification('Network error occurred. Please try again.');
    }
}

// Function to show error notification
function showErrorNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'plan-switch-notification error';
      notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">
                <i class="material-icons" data-fallback="!">error</i>
            </div>
            <div class="notification-text">
                <h3>Update Failed</h3>
                <p>${message}</p>
            </div>
            <button class="close-notification" aria-label="Close notification">
                <i class="material-icons" data-fallback="×">close</i>
            </button>
        </div>
    `;

    document.body.appendChild(notification);

    // Add close functionality
    const closeBtn = notification.querySelector('.close-notification');
    closeBtn.addEventListener('click', () => {
        hidePlanSwitchNotification(notification);
    });

    // Show notification with animation
    setTimeout(() => {
        notification.classList.add('active');
    }, 100);

    // Auto-hide after 5 seconds
    setTimeout(() => {
        hidePlanSwitchNotification(notification);
    }, 5000);
}

document.querySelectorAll('.select-plan').forEach(button => {
    button.addEventListener('click', updatePricing);
});