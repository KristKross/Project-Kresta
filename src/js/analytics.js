document.addEventListener('DOMContentLoaded', async function () {
    try {
        const response = await fetch('/api/instagram/analytics');
        const data = await response.json();

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Extracting analytics values
        const analytics = {
            engagement: data.data.find(item => item.name === "accounts_engaged")?.total_value?.value || 0,
            audience: data.data.find(item => item.name === "follows_and_unfollows")?.total_value?.value || 0,
            reach: data.data.find(item => item.name === "reach")?.total_value?.value || 0,
            likes: data.data.find(item => item.name === "likes")?.total_value?.value || 0,
            comments: data.data.find(item => item.name === "comments")?.total_value?.value || 0,
            shares: data.data.find(item => item.name === "shares")?.total_value?.value || 0,
            views: data.data.find(item => item.name === "views")?.total_value?.value || 0,
            replies: data.data.find(item => item.name === "replies")?.total_value?.value || 0,
            totalInteractions: data.data.find(item => item.name === "total_interactions")?.total_value?.value || 0
        };

        // Update metric cards
        updateMetricCards(analytics);

        // Calculate engagement rate
        const engagementRate = analytics.views > 0 ? ((analytics.totalInteractions / analytics.views) * 100).toFixed(2) : 0;
        document.getElementById('engagement-rate').textContent = `${engagementRate}%`;

        // Chart configurations
        const chartColors = {
            primary: '#143D60',
            secondary: '#A5BFCC',
            accent: '#F4EDD3',
            success: '#6B8E6B',
            warning: '#D4A418',
            error: '#C44536'
        };        const commonOptions = {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1.5,
            onResize: function(chart, size) {
                // This ensures the chart maintains proper aspect ratio when resized
                setTimeout(() => {
                    chart.resize();
                }, 0);
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: {
                            size: 12
                        }
                    }
                }
            }
        };

        // Initialize charts
        initializeEngagementChart(analytics, chartColors, commonOptions);
        initializeContentChart(analytics, chartColors, commonOptions);
        initializeRadarChart(analytics, chartColors, commonOptions);

    } catch (error) {
        console.error('Error fetching Instagram analytics:', error);
        showErrorState();
    }
});

function updateMetricCards(analytics) {
    document.getElementById('engagement-metric-value').textContent = formatNumber(analytics.engagement);
    document.getElementById('reach-metric-value').textContent = formatNumber(analytics.reach);
    document.getElementById('total-interactions-value').textContent = formatNumber(analytics.totalInteractions);
    document.getElementById('audience-metric-value').textContent = formatNumber(analytics.audience);
    
    // Update detailed metrics
    document.getElementById('likes-value').textContent = formatNumber(analytics.likes);
    document.getElementById('comments-value').textContent = formatNumber(analytics.comments);
    document.getElementById('shares-value').textContent = formatNumber(analytics.shares);
    document.getElementById('replies-value').textContent = formatNumber(analytics.replies);
    document.getElementById('views-value').textContent = formatNumber(analytics.views);
}

function initializeEngagementChart(analytics, colors, options) {
    const ctx = document.getElementById('engagementChart')?.getContext('2d');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Likes', 'Comments', 'Shares', 'Replies'],
            datasets: [{
                data: [analytics.likes, analytics.comments, analytics.shares, analytics.replies],
                backgroundColor: [
                    colors.primary,
                    colors.secondary,
                    colors.success,
                    colors.warning
                ],
                borderWidth: 0,
                cutout: '60%'
            }]
        },
        options: {
            ...options,
            plugins: {
                ...options.plugins,
                legend: {
                    ...options.plugins.legend,
                    position: 'right'
                }
            },
            maintainAspectRatio: true,
            responsive: true,
            aspectRatio: 1.5
        }
    });
}

function initializeContentChart(analytics, colors, options) {
    const ctx = document.getElementById('contentChart')?.getContext('2d');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Views', 'Engagement', 'Reach'],
            datasets: [{
                label: 'Performance Metrics',
                data: [analytics.views, analytics.engagement, analytics.reach],
                backgroundColor: [
                    colors.primary,
                    colors.success,
                    colors.secondary
                ],
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            ...options,
            maintainAspectRatio: true,
            responsive: true,
            aspectRatio: 1.5,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0,0,0,0.05)'
                    },
                    ticks: {
                        font: {
                            size: 11
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    });
}

function initializeRadarChart(analytics, colors, options) {
    const ctx = document.getElementById('radarChart')?.getContext('2d');
    if (!ctx) return;

    // Normalize data for radar chart (scale to 0-100)
    const maxValue = Math.max(
        analytics.likes, analytics.comments, analytics.shares, 
        analytics.replies, analytics.views, analytics.reach
    );

    const normalizeValue = (value) => maxValue > 0 ? (value / maxValue) * 100 : 0;

    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Likes', 'Comments', 'Shares', 'Replies', 'Views', 'Reach'],
            datasets: [{
                label: 'Engagement Distribution',
                data: [
                    normalizeValue(analytics.likes),
                    normalizeValue(analytics.comments),
                    normalizeValue(analytics.shares),
                    normalizeValue(analytics.replies),
                    normalizeValue(analytics.views),
                    normalizeValue(analytics.reach)
                ],
                fill: true,
                backgroundColor: `${colors.primary}20`,
                borderColor: colors.primary,
                borderWidth: 2,
                pointBackgroundColor: colors.primary,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5
            }]
        },
        options: {
            ...options,
            maintainAspectRatio: true,
            responsive: true,
            aspectRatio: 2,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    },
                    angleLines: {
                        color: 'rgba(0,0,0,0.1)'
                    },
                    pointLabels: {
                        font: {
                            size: 11
                        }
                    },
                    ticks: {
                        display: false
                    }
                }
            }
        }
    });
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function showErrorState() {
    const container = document.querySelector('.analytics-container');
    if (container) {
        container.innerHTML = `
            <div class="error-state-container">
                <div class="error-state-content">
                    <div class="error-icon-wrapper">
                        <img src="./assets/icons/analytics/analytics-logo.png" alt="Analytics">
                    </div>
                    <h3 class="error-title">Unable to load analytics data</h3>
                    <p class="error-message">Please check your connection and try again.</p>
                    <button class="retry-button">
                        <img src="./assets/icons/analytics/refresh.png" alt="Retry">
                        Retry
                    </button>
                </div>
            </div>
        `;
        
        // Add retry functionality
        const retryButton = container.querySelector('.retry-button');
        if (retryButton) {
            retryButton.addEventListener('click', () => {
                container.innerHTML = `
                    <div class="loading-state">
                        <div class="loading-spinner"></div>
                        <p>Loading analytics data...</p>
                    </div>
                `;
                
                // Reload the page after a short delay
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            });
        }
    }
}