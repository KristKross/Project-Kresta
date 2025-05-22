import '../scss/main.scss';

const ignorePages = ['/login.html', '/register.html', '/dashboard.html', '/sidebar.html', '/planner.html', '/tasks.html', '/analytics.html', '/settings.html', '/profile.html', '/404.html', '/500.html'];

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    if (ignorePages.includes(path)) return;
    const header = document.createElement('header');
    fetch('../templates/navbar.html')   
        .then(response => response.text())
        .then(data => {
            header.innerHTML = data;
            document.body.insertBefore(header, document.body.firstChild);
        })
    .catch(error => console.error('Error fetching navbar:', error));

    // Add footer
    const footer = document.createElement('footer');
    fetch('../templates/footer.html')   
        .then(response => response.text())
        .then(data => {
            footer.innerHTML = data;
            document.body.appendChild(footer); // Append footer at the end of body
        })
        .catch(error => console.error('Error fetching footer:', error));

    // Add sidebar
    const sidebar = document.createElement('aside');
    fetch('../templates/sidebar.html')   
        .then(response => response.text())
        .then(data => {
            sidebar.innerHTML = data;
            document.body.insertBefore(sidebar, document.body.firstChild);
        })
    .catch(error => console.error('Error fetching sidebar:', error));
});
