import analyticsImagePath from '../assets/icons/dashboard/analytics-grey.png';
import taskImagePath from '../assets/icons/dashboard/tasks-grey.png';
import interactionsIcon from '../assets/icons/dashboard/interactions.png';
import commentsIcon from '../assets/icons/dashboard/comments.png';
import likesIcon from '../assets/icons/dashboard/like.png';
import repliesIcon from '../assets/icons/dashboard/reply.png';

let userData = null;

document.addEventListener('DOMContentLoaded', function () {
    fetchUserData();
});

async function fetchUserData() {
    try {
        const response = await fetch("auth/user", {
            method: "GET",
            credentials: "include"
        });

        if (response.ok) {
            const res = await response.json();
            userData = res;
            initDashboard();
        } else {
            window.location.href = "/login";
        }
    } catch (err) {
        console.error("Error fetching user", err);
        window.location.href = "/login";
    }
}

async function fetchInstagramAnalysis() {
    try {
        const response = await fetch('/api/instagram/analytics', {
            method: 'GET',
            credentials: 'include',
        });

        if (response.status === 403) {
            return null;
        }

        if (!response.ok) {
            throw new Error('Failed to fetch Instagram analysis');
        }

        const data = await response.json();

        const metrics = data.data || [];

        function getMetricValue(name) {
            const metric = metrics.find(m => m.name === name);
            return metric?.total_value?.value ?? 0;
        }

        return {
            engagement: getMetricValue('total_interactions'),
            comments: getMetricValue('comments'),
            likes: getMetricValue('likes'),
            replies: getMetricValue('replies'),
        };

    } catch (error) {
        if (error.message !== 'Failed to fetch Instagram analysis') {
            console.error('Error fetching Instagram analysis:', error);
        }
        return null;
    }
}

function renderStat(icon, label, value) {
    return `
        <div class="stat-container">
            <div class="stat-1"><img src="${icon}" alt="${label}"> ${label}</div>
            <div class="numbers">${value}</div>
        </div>
    `;
}

async function fetchWorkspace() {
    try {
        const response = await fetch('/api/workspace/my', {
            method: 'GET',
            credentials: 'include'
        });

        if (response.status === 403) {
            return { error: 'Forbidden', hasWorkspace: false };
        }

        if (!response.ok) {
            return { error: `Error fetching workspace: ${response.statusText}`, hasWorkspace: false };
        }

        const data = await response.json();

        if (data.success) {
            if (!data.workspace) {
                return { hasWorkspace: false, workspace: null };
            }
            return { hasWorkspace: true, workspace: data.workspace };
        } else {
            return { error: 'Failed to fetch workspace', hasWorkspace: false };
        }

    } catch (error) {
        console.error('Fetch workspace failed:', error);
        return { error: error.message, hasWorkspace: false };
    }
}

async function loadTasks(workspaceId) {
    try {
        const response = await fetch(`/api/tasks/workspace/${workspaceId}`, {
            method: 'GET',
            credentials: 'include'
        });

        if (response.status === 403) {
            throw new Error('Forbidden');
        }

        if (!response.ok) {
            throw new Error('Failed to fetch tasks');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return null;
    }
}

async function fetchTasks() {
    const workspaceResult = await fetchWorkspace();

    if (!workspaceResult.hasWorkspace) {
        return { tasks: [], hasTasks: false, error: workspaceResult.error || null };
    }

    const tasks = await loadTasks(workspaceResult.workspace._id);

    if (!tasks) {
        return { tasks: [], hasTasks: false, error: 'Failed to load tasks' };
    }

    return { tasks, hasTasks: tasks.length > 0, error: null };
}

function initDashboard() {
    const usernameEl = document.getElementById("username");
    if (usernameEl && userData.user?.username) {
        usernameEl.textContent = userData.user.username;
    }

    updatePlanBadge();
    updateDate();
    updateAnalyticsSection();
    updateWorkspaceSection();
    updateTaskSection();
}

function updatePlanBadge() {
    const planBadges = document.querySelectorAll('.plan-badge');
    const tier = userData?.premium?.tier;

    if (tier) {
        planBadges.forEach(badge => {
            badge.classList.remove('free', 'pro', 'business');
            badge.classList.add(tier);
            badge.textContent = tier.charAt(0).toUpperCase() + tier.slice(1);
        });
    }
}

function updateDate() {
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        const today = new Date();
        const options = {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        };
        dateElement.textContent = today.toLocaleDateString('en-US', options);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        setTimeout(updateDate, tomorrow - today);
    }
}

async function updateAnalyticsSection() {
    const analyticsContainer = document.querySelector('.engagement-metrics');
    if (!analyticsContainer) return;

    analyticsContainer.innerHTML = `
        <div class="loading-spinner"></div>
    `;

    const analysis = await fetchInstagramAnalysis();

    if (!analysis) {
        analyticsContainer.innerHTML = `
            <div class="empty-state analytics-empty">
                <img src="${analyticsImagePath}" alt="No analytics">
                <h3>No Analytics Available</h3>
                <p>Upgrade to Creator or Business plan to access detailed analytics</p>
                <a href="pricing.html" class="upgrade-btn">Upgrade Now</a>
            </div>
        `;
        return;
    }

    analyticsContainer.innerHTML = ` 
        ${renderStat(interactionsIcon, 'Engagement', analysis.engagement)}
        ${renderStat(commentsIcon, 'Comments', analysis.comments)}
        ${renderStat(likesIcon, 'Likes', analysis.likes)}
        ${renderStat(repliesIcon, 'Replies', analysis.replies)}
    `;
}

async function updateWorkspaceSection() {
    const workspaceContainer = document.querySelector('.workspace-empty');
    if (!workspaceContainer) return;

    const result = await fetchWorkspace();

    if (result.error === 'Forbidden') {
        workspaceContainer.innerHTML = `
            <h3>No Team Members</h3>
            <p>Upgrade to add team members and collaborate</p>
            <a href="pricing.html" class="upgrade-btn">Upgrade Now</a>
        `;
        return;
    }

    if (!result.hasWorkspace) {
        workspaceContainer.innerHTML = `
            <h3>No Workspace Created</h3>
            <p>Create a workspace to start collaborating with your team</p>
            <a href="/api/workspace" class="upgrade-btn">Create Workspace</a>
        `;
        return;
    }

    const workspace = result.workspace;
    workspaceContainer.innerHTML = `
        <h3>${workspace.name}</h3>
        <p>You're part of a workspace</p>
        <a href="/workspace/view" class="upgrade-btn">View Workspace</a>
    `;
}

async function updateTaskSection() {
    const tasksContainer = document.querySelector('.tasks-empty');
    if (!tasksContainer) return;

    const result = await fetchTasks();
    console.log(result);

    if (result.error === 'Forbidden') {
        tasksContainer.innerHTML = `
            <img src="${taskImagePath}" alt="No tasks">
            <h3>No Tasks Available</h3>
            <p>Upgrade to add tasks and collaborate</p>
            <a href="pricing.html" class="upgrade-btn">Upgrade Now</a>
        `;
        return;
    }

    if (!result.hasTasks) {
        tasksContainer.innerHTML = `
            <img src="${taskImagePath}" alt="No tasks">
            <h3>No Tasks Yet</h3>
            <p>Create your first task to get started</p>
            <button onclick="window.location.href='tasks.html'" class="create-task-btn">Create Task</button>
        `;
        return;
    }

    tasksContainer.innerHTML = `
        <img src="${taskImagePath}" alt="Tasks">
        <h3>${result.tasks.length} Tasks</h3>
        <p>View your tasks to get started</p>
        <button onclick="window.location.href='tasks.html'" class="create-task-btn">View Tasks</button>
    `;
}

