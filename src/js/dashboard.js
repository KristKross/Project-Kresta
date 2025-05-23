import analyticsImagePath from '../assets/icons/dashboard/analytics-grey.png';
import dashboardImagePath from '../assets/icons/dashboard/dashboard.png';
import interactionsIcon from '../assets/icons/dashboard/interactions.png';
import commentsIcon from '../assets/icons/dashboard/comments.png';
import likesIcon from '../assets/icons/dashboard/like.png';
import repliesIcon from '../assets/icons/dashboard/reply.png';
import arrowUpIcon from '../assets/icons/dashboard/arrow-up.png';


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
        console.log('Instagram analysis raw data:', data);

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


function initDashboard() {
    const usernameEl = document.getElementById("username");
    if (usernameEl && userData.user?.username) {
        usernameEl.textContent = userData.user.username;
    }

    updatePlanBadge();
    updateDate();
    updateAnalyticsSection();
    updateWorkspaceSection();
}

function updatePlanBadge() {
    const planBadge = document.getElementById('plan-badge');
    const tier = userData?.premium?.tier;

    if (planBadge && tier) {
        planBadge.classList.remove('free', 'pro', 'business');
        planBadge.classList.add(tier);
        planBadge.textContent = tier.charAt(0).toUpperCase() + tier.slice(1);
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

function renderStat(icon, label, value) {
    return `
        <div class="stat-container">
            <div class="stat-1"><img src="${icon}" alt="${label}"> ${label}</div>
            <div class="numbers"><img src="${arrowUpIcon}" alt="Change"> +${value}</div>
        </div>
    `;
}

async function updateAnalyticsSection() {
    const analyticsContainer = document.querySelector('.engagement-metrics');
    if (!analyticsContainer) return;

    analyticsContainer.innerHTML = `
        <div class="empty-state analytics-empty">
            <img src="${analyticsImagePath}" alt="Loading">
            <h3>Loading analytics...</h3>
        </div>
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

function updateWorkspaceSection() {
    const workspaceContainer = document.querySelector('.workspace-section');
    const workspaceEmpty = workspaceContainer.querySelector('.workspace-empty');
    const tier = userData?.premium?.tier;
    const workspace = userData?.workspace;

    if (!workspaceContainer || !workspaceEmpty) return;

    if (tier === 'free') {
        workspaceEmpty.innerHTML = `
            <img src="${dashboardImagePath}" alt="No team">
            <h3>No Team Members</h3>
            <p>Upgrade to add team members and collaborate</p>
            <a href="pricing.html" class="upgrade-btn">Upgrade Now</a>
        `;
    } else if (!workspace) {
        workspaceEmpty.innerHTML = `
            <img src="${dashboardImagePath}" alt="No workspace">
            <h3>No Workspace Created</h3>
            <p>Create a workspace to start collaborating with your team</p>
            <a href="/workspace/create" class="upgrade-btn">Create Workspace</a>
        `;
    } else {
        workspaceEmpty.innerHTML = `
            <img src="${dashboardImagePath}" alt="Workspace">
            <h3>${workspace.name || 'Team Workspace'}</h3>
            <p>You're part of a workspace</p>
            <a href="/workspace/view" class="upgrade-btn">View Workspace</a>
        `;
    }
}
