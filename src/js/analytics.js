// Chart.js configurations
const ctx = {
    bar: document.getElementById('groupedBarChart').getContext('2d'),
    radar: document.getElementById('radarChart').getContext('2d'),
    area: document.getElementById('stackedAreaChart').getContext('2d')
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

// Grouped Bar Chart
new Chart(ctx.bar, {
    type: 'bar',
    data: {
        labels: ['Engagement', 'Audience', 'Distribution'],
        datasets: [
            {
                label: 'Current Period',
                data: [65, 59, 80],
                backgroundColor: '#1E3D59'
            },
            {
                label: 'Previous Period',
                data: [45, 70, 65],
                backgroundColor: '#FF6B6B'
            }
        ]
    },
    options: chartOptions
});

// Radar Chart
new Chart(ctx.radar, {
    type: 'radar',
    data: {
        labels: ['Likes', 'Comments', 'Replies', 'Followers', 'Views', 'Reach', 'Shares'],
        datasets: [{
            label: 'Metrics Distribution',
            data: [65, 59, 90, 81, 56, 55, 40],
            fill: true,
            backgroundColor: 'rgba(30, 61, 89, 0.2)',
            borderColor: '#1E3D59',
            pointBackgroundColor: '#1E3D59'
        }]
    },
    options: chartOptions
});

// Stacked Area Chart
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