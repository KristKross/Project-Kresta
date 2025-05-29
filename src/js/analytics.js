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
        };

        // Store chart instances for resizing
        const charts = {};
        
        // Handle window resize for better chart rendering
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                // Resize all charts if they exist
                Object.values(charts).forEach(chart => {
                    if (chart) chart.resize();
                });
            }, 250);
        });
        
        // Handle container resize through ResizeObserver if available
        if (typeof ResizeObserver !== 'undefined') {
            const chartContainers = document.querySelectorAll('.chart-container');
            const resizeObserver = new ResizeObserver(entries => {
                entries.forEach(entry => {
                    const chartId = entry.target.querySelector('canvas')?.id;
                    if (chartId && charts[chartId]) {
                        charts[chartId].resize();
                    }
                });
            });
            
            chartContainers.forEach(container => resizeObserver.observe(container));
        }

        // Define responsive options based on screen width
        const getResponsiveOptions = () => {
            const isDesktop = window.innerWidth >= 1200;
            const isTablet = window.innerWidth >= 768 && window.innerWidth < 1200;
            const isMobile = window.innerWidth < 768;
            
            return {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: isMobile ? 1.3 : isTablet ? 1.7 : 2,
                responsiveAnimationDuration: 100,
                plugins: {
                    legend: {
                        position: isMobile ? 'bottom' : 'bottom',
                        align: 'center',
                        labels: {
                            padding: isMobile ? 10 : 20,
                            usePointStyle: true,
                            boxWidth: isMobile ? 8 : 12,
                            font: {
                                size: isMobile ? 10 : 12
                            }
                        }
                    },
                    tooltip: {
                        bodyFont: {
                            size: isMobile ? 12 : 14
                        }
                    }
                }
            };
        };
        
        // Get responsive options
        const commonOptions = getResponsiveOptions();

        // Initialize charts
        initializeEngagementChart(analytics, chartColors, commonOptions);
        initializeContentChart(analytics, chartColors, commonOptions);
        initializeRadarChart(analytics, chartColors, commonOptions);

        // Ensure charts fit their containers properly
        ensureChartsFit();

        // Add event listener for tab changes or visibility changes
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                ensureChartsFit();
            }
        });

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
    if (!ctx) return;    charts['engagementChart'] = new Chart(ctx, {
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
        },options: {
            ...options,
            plugins: {
                ...options.plugins,
                legend: {
                    ...options.plugins.legend,
                    position: 'right',
                    align: 'center'
                }
            },
            maintainAspectRatio: true,
            responsive: true,
            aspectRatio: 1.5,
            layout: {
                padding: {
                    left: 10,
                    right: 10,
                    top: 0,
                    bottom: 0
                }
            }
        }
    });
}

function initializeContentChart(analytics, colors, options) {
    const ctx = document.getElementById('contentChart')?.getContext('2d');
    if (!ctx) return;    charts['contentChart'] = new Chart(ctx, {
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
        },options: {
            ...options,
            maintainAspectRatio: true,
            responsive: true,
            aspectRatio: 1.5,
            layout: {
                padding: {
                    left: 10,
                    right: 10,
                    top: 10,
                    bottom: 0
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0,0,0,0.05)'
                    },
                    ticks: {
                        font: {
                            size: 11
                        },
                        maxTicksLimit: 8 // Limit the number of ticks for better fit
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

    const normalizeValue = (value) => maxValue > 0 ? (value / maxValue) * 100 : 0;    charts['radarChart'] = new Chart(ctx, {
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
            responsive: true,            aspectRatio: window.innerWidth > 1200 ? 2.5 : 
                      window.innerWidth > 768 ? 2 : 1.5, // Responsive aspect ratio
            layout: {
                padding: window.innerWidth < 768 ? 10 : 20
            },
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

// Ensure charts fit their containers properly
function ensureChartsFit() {
    // Force chart reflow for better fitting
    setTimeout(() => {
        for (const chartId in charts) {
            if (charts[chartId]) {
                charts[chartId].resize();
            }
        }
    }, 200);
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
                        <div class="analytics-icon"></div>
                    </div>
                    <h3 class="error-title">Unable to load analytics data</h3>
                    <p class="error-message">Please check your connection and try again.</p>
                    <button class="retry-button">
                        <div class="refresh-icon"></div>
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