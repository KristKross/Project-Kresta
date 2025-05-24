import '../scss/main.scss';
import { openNav, closeNav } from './sidebar';

// Pages where we don't want any header/footer/sidebar
const ignorePages = ['/login.html', '/register.html', '/404.html', '/500.html'];

// Pages where we want to show the sidebar
const sidebarPages = ['/dashboard.html', '/planner.html', '/tasks.html', '/analytics.html', '/profile.html', '/settings.html', '/notification.html'];

document.addEventListener('DOMContentLoaded', () => {
    // Get the full path and just the filename
    const fullPath = window.location.pathname;
    const filename = fullPath.split('/').pop();
    
    // If it's a page that should be ignored, don't add anything
    if (ignorePages.includes(filename) || ignorePages.includes(fullPath)) return;
    
    // Check if current page is the index page
    const isIndexPage = filename === 'index.html' || filename === '' || fullPath.endsWith('/');
    
    // Check if current page is a sidebar page
    const isSidebarPage = !isIndexPage && sidebarPages.some(page => 
        fullPath.endsWith(page) || filename === page
    );
    
    if (isSidebarPage) {
        addSidebar();
    } else {
        // For index and other pages, add navbar and footer
        addNavbar();
        addFooter();
    }

});

// Function to add navbar
function addNavbar() {
    const header = document.createElement('header');
    fetch('../templates/navbar.html')   
        .then(response => response.text())
        .then(data => {
            header.innerHTML = data;
            document.body.insertBefore(header, document.body.firstChild);
        })
        .catch(error => console.error('Error fetching navbar:', error));
}

// Function to add footer
function addFooter() {
    const footer = document.createElement('footer');
    fetch('../templates/footer.html')   
        .then(response => response.text())
        .then(data => {
            footer.innerHTML = data;
            document.body.appendChild(footer);
        })
        .catch(error => console.error('Error fetching footer:', error));
}

// Function to add sidebar
function addSidebar() {
    fetch('../templates/sidebar.html')   
        .then(response => response.text())
        .then(data => {
            // Insert the sidebar as the first element in the body
            document.body.insertAdjacentHTML('afterbegin', data);
            
            // Add toggle button for mobile
            const toggleBtn = document.createElement('button');
            toggleBtn.id = 'openNav';
            toggleBtn.className = 'toggle-btn';
            toggleBtn.setAttribute('aria-label', 'Open navigation');
            toggleBtn.innerHTML = '☰';
            document.body.insertBefore(toggleBtn, document.body.firstChild);
            
            // Initialize the sidebar toggle functionality
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const sidenav = document.getElementById('mySidenav');
                if (sidenav && !sidenav.classList.contains('expanded')) {
                    openNav();
                }
            });
            
            // Close sidebar when clicking on a nav link on mobile
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    if (window.innerWidth <= 600) { // Mobile breakpoint
                        closeNav();
                    }
                });
            });
            
            // Close when clicking outside the sidebar
            document.addEventListener('click', (e) => {
                const sidenav = document.getElementById('mySidenav');
                const toggleBtn = document.getElementById('openNav');
                if (sidenav && !sidenav.contains(e.target) && e.target !== toggleBtn) {
                    closeNav();
                }
            });
            
            // Add keyboard navigation
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    closeNav();
                }
            });
        })
        .catch(error => console.error('Error fetching sidebar:', error));
}
