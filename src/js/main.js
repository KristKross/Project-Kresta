import '../scss/main.scss';

window.addEventListener('load', () => {
    if (window.location.hash === '#_=_') {
        window.history.replaceState(null, document.title, window.location.pathname + window.location.search);
    }
});

// Sidebar toggle functionality
function initializeSidebar() {
    const sidenav = document.getElementById("mySidenav");
    const sidebarBtn = document.querySelector(".sidebar-btn");
    let isMenuOpen = false;

    function toggleSidebar() {
        isMenuOpen = !isMenuOpen;
        sidenav?.classList.toggle("active", isMenuOpen);
        sidebarBtn?.classList.toggle("active", isMenuOpen);
        document.body.style.overflow = isMenuOpen ? "hidden" : "";
    }

    sidebarBtn?.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSidebar();
    });

    document.addEventListener("click", (e) => {
        if (isMenuOpen && !sidenav?.contains(e.target) && !sidebarBtn?.contains(e.target)) {
            toggleSidebar();
        }
    });

    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach((link) => {
        link.addEventListener("click", () => {
            if (window.innerWidth <= 600 && isMenuOpen) {
                toggleSidebar();
            }
        });
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && isMenuOpen) {
            toggleSidebar();
        }
    });
}

// Run the initialization function once the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    initializeSidebar();
    
    const navBtn = document.querySelector('.nav-btn');
    const navLinks = document.querySelector('.nav-links');
    let isMenuOpen = false;

    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
        navBtn.classList.toggle('active', isMenuOpen);
        navLinks.classList.toggle('active', isMenuOpen);
        document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    }

    // Toggle menu on button click
    navBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleMenu();
    });

    // Close menu when clicking a link or outside
    document.addEventListener('click', (e) => {
        if (isMenuOpen && !navLinks.contains(e.target) && !navBtn.contains(e.target)) {
            toggleMenu();
        }
    });

    // Close menu when clicking a nav link
    navLinks?.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (isMenuOpen) toggleMenu();
        });
    });
});

