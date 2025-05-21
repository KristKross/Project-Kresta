document.addEventListener('DOMContentLoaded', async function () {
    try {
        const response = await fetch('/api/instagram/analytics/account');
        const data = await response.json();

        const ctx = {
            bar: document.getElementById('groupedBarChart')?.getContext('2d'),
            radar: document.getElementById('radarChart')?.getContext('2d'),
            area: document.getElementById('stackedAreaChart')?.getContext('2d')
        };

        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        };

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Extracting analytics values
        const analytics = {
            engagement: data.data.find(item => item.name === "accounts_engaged")?.total_value?.value || 0,
            audience: data.data.find(item => item.name === "follows_and_unfollows")?.total_value?.value || 0,
            distribution: data.data.find(item => item.name === "reach")?.total_value?.value || 0,
            likes: data.data.find(item => item.name === "likes")?.total_value?.value || 0,
            comments: data.data.find(item => item.name === "comments")?.total_value?.value || 0,
            shares: data.data.find(item => item.name === "shares")?.total_value?.value || 0,
            views: data.data.find(item => item.name === "views")?.total_value?.value || 0,
            replies: data.data.find(item => item.name === "replies")?.total_value?.value || 0,
            totalInteractions: data.data.find(item => item.name === "total_interactions")?.total_value?.value || 0,
            reach: data.data.find(item => item.name === "reach")?.total_value?.value || 0
        };

        document.getElementById('engagement-metric-value').innerText = analytics.engagement;
        document.getElementById('audience-metric-value').innerText = analytics.audience;

        // Bar Chart - Engagement, Audience, Distribution
        new Chart(ctx.bar, {
            type: 'bar',
            data: {
                labels: ['Engagement', 'Audience', 'Distribution'],
                datasets: [
                    {
                        label: 'Current Period',
                        data: [analytics.engagement, analytics.audience, analytics.distribution],
                        backgroundColor: '#1E3D59'
                    },
                    {
                        label: 'Previous Period',
                        data: [0, 0, 0], // Static data
                        backgroundColor: '#FF6B6B'
                    }
                ]
            },
            options: chartOptions
        });

        // Radar Chart - Metric Distribution
        new Chart(ctx.radar, {
            type: 'radar',
            data: {
                labels: ['Likes', 'Comments', 'Replies', 'Followers', 'Views', 'Reach', 'Shares'],
                datasets: [{
                    label: 'Metrics Distribution',
                    data: [
                        analytics.likes,
                        analytics.comments,
                        analytics.replies,
                        analytics.audience,
                        analytics.views,
                        analytics.reach,
                        analytics.shares
                    ],
                    fill: true,
                    backgroundColor: 'rgba(30, 61, 89, 0.2)',
                    borderColor: '#1E3D59',
                    pointBackgroundColor: '#1E3D59'
                }]
            },
            options: chartOptions
        });

        // Area Chart - Trends Over Time
        new Chart(ctx.area, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [
                    {
                        label: 'Engagement',
                        data: [12, 19, 3, 5, 2, 3],
                        fill: true,
                        backgroundColor: 'rgba(30, 61, 89, 0.2)'
                    },
                    {
                        label: 'Audience',
                        data: [15, 12, 8, 9, 12, 15],
                        fill: true,
                        backgroundColor: 'rgba(107, 142, 107, 0.2)'
                    },
                    {
                        label: 'Distribution',
                        data: [8, 15, 12, 10, 7, 9],
                        fill: true,
                        backgroundColor: 'rgba(212, 164, 24, 0.2)'
                    }
                ]
            },
            options: chartOptions
        });

    } catch (error) {
        console.error('Error fetching Instagram analytics:', error);
    }
});