import '../scss/main.scss';
import { initializeSidebar } from './sidebar.js';

// Pages where we don't want any header/footer/sidebar
const ignorePages = [
    '/login.html',
    '/register.html',
    '/404.html',
    '/500.html',
    '/login',
    '/register',
    '/404',
    '/500',
    '/creators',
    '/creators.html'
];

// Pages where we want to show the sidebar
const sidebarPages = [
    '/dashboard',
    '/dashboard.html',
    '/planner',
    '/planner.html',
    '/tasks',
    '/tasks.html',
    '/analytics',
    '/analytics.html',
    '/profile',
    '/profile.html',
    '/settings',
    '/settings.html',
    '/notification',
    '/notification.html',
    '/creators',
    '/creators.html',
];

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
            initializeNavigation();
        })
        .catch(error => console.error('Error fetching navbar:', error));
}

// Navigation initialization function
function initializeNavigation() {
    const nav = document.querySelector('nav');
    const navBtn = document.querySelector('.nav-btn');
    const navLinks = nav?.querySelector('.nav-links');
    let isMenuOpen = false;

    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
        navBtn?.classList.toggle('active', isMenuOpen);
        navLinks?.classList.toggle('active', isMenuOpen);
        document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    }

    navBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleMenu();
    });

    document.addEventListener('click', (e) => {
        if (isMenuOpen && !navLinks?.contains(e.target) && !navBtn?.contains(e.target)) {
            toggleMenu();
        }
    });

    navLinks?.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (isMenuOpen) toggleMenu();
        });
    });
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

// Function to add sidebar - now calls initializeSidebar after loading
function addSidebar() {
    fetch('../templates/sidebar.html')   
        .then(response => response.text())
        .then(data => {
            document.body.insertAdjacentHTML('afterbegin', data);
            initializeSidebar(); // Initialize sidebar functionality after HTML is loaded
        })
        .catch(error => console.error('Error fetching sidebar:', error));
}
