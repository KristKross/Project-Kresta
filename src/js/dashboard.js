document.addEventListener('DOMContentLoaded', function() {
    // Simulated user data - replace with actual data from your backend
    const userData = {
        name: 'John Doe',
        plan: 'free', // Options: 'free', 'pro', 'business'
        joinDate: '13 June 2024'
    };

    // Update plan badge
    function updatePlanBadge() {
        const planBadge = document.querySelector('.plan-badge');
        if (planBadge) {
            // Remove any existing plan classes
            planBadge.classList.remove('free', 'pro', 'business');
            // Add current plan class
            planBadge.classList.add(userData.plan);
            
            // Update badge text
            const planText = userData.plan.charAt(0).toUpperCase() + userData.plan.slice(1);
            planBadge.textContent = `${planText} Plan`;

            // Add animation
            planBadge.classList.add('badge-animate');
            setTimeout(() => {
                planBadge.classList.remove('badge-animate');
            }, 1000);
        }
    }

    // Format and update date
    function updateDate() {
        const dateElement = document.querySelector('.current-date');
        if (dateElement) {
            const today = new Date();
            const options = { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            };
            const formattedDate = today.toLocaleDateString('en-US', options);
            dateElement.textContent = formattedDate;

            // Auto-update date at midnight
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            const timeUntilMidnight = tomorrow - today;

            setTimeout(() => {
                updateDate();
            }, timeUntilMidnight);
        }
    }

    // Initialize dashboard elements
    function initDashboard() {
        updatePlanBadge();
        updateDate();

        // Update user name
        const userNameElement = document.querySelector('.user-name');
        if (userNameElement) {
            userNameElement.textContent = userData.name;
        }
    }

    // Toggle visibility based on plan and data availability
    function updateDashboardState() {
        // Analytics section
        const analyticsEmpty = document.querySelector('.analytics-empty');
        const analyticsContent = document.querySelector('.analytics-content');
        if (userData.plan === 'free' || !userData.hasAnalytics) {
            analyticsEmpty.style.display = 'flex';
            analyticsContent.style.display = 'none';
        }

        // Planner section
        const plannerEmpty = document.querySelector('.planner-empty');
        const plannerContent = document.querySelector('.planner-content');
        if (!userData.hasPlannedContent) {
            plannerEmpty.style.display = 'flex';
            plannerContent.style.display = 'none';
        }

        // Workspace section
        const workspaceEmpty = document.querySelector('.workspace-empty');
        if (userData.plan === 'free' || !userData.hasTeam) {
            workspaceEmpty.style.display = 'flex';
        }

        // Tasks section
        const tasksEmpty = document.querySelector('.tasks-empty');
        const tasksContent = document.querySelector('.tasks-content');
        if (!userData.hasTasks) {
            tasksEmpty.style.display = 'flex';
            tasksContent.style.display = 'none';
        }
    }

    // Initialize dashboard state
    updateDashboardState();

    // Event listeners for empty state buttons
    document.querySelector('.create-post-btn')?.addEventListener('click', () => {
        window.location.href = 'planner.html';
    });

    document.querySelector('.create-task-btn')?.addEventListener('click', () => {
        window.location.href = 'tasks.html';
    });

    // Run initialization
    initDashboard();
});