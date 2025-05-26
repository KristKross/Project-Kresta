import '../scss/main.scss';

window.addEventListener('load', () => {
    if (window.location.hash === '#_=_') {
        window.history.replaceState(null, document.title, window.location.pathname + window.location.search);
    }
});

function openNav() {
    const sidenav = document.getElementById("mySidenav");
    const mainContent = document.querySelector("main");
    const openNavBtn = document.getElementById("openNav");

    if (sidenav && mainContent) {
        sidenav.style.display = "block"; // Ensure sidebar is visible
        sidenav.classList.add("expanded");
        mainContent.classList.add("shifted");

        // Force reflow to ensure transition applies
        void sidenav.offsetWidth;

        if (openNavBtn) {
            openNavBtn.style.display = "none";
        }

        sidenav.setAttribute("aria-expanded", "true");
    }
}

function closeNav() {
    const sidenav = document.getElementById("mySidenav");
    const mainContent = document.querySelector("main");
    const openNavBtn = document.getElementById("openNav");

    if (sidenav && mainContent) {
        sidenav.classList.remove("expanded");
        mainContent.classList.remove("shifted");

        setTimeout(() => {
            if (openNavBtn) {
                openNavBtn.style.display = "inline-block";
            }
            if (window.innerWidth <= 600) {
                sidenav.style.display = "none";
            }
        }, 300); // Match CSS transition duration

        sidenav.setAttribute("aria-expanded", "false");
    }
}

function toggleNav() {
    const sidenav = document.getElementById("mySidenav");
    if (sidenav && sidenav.classList.contains("expanded")) {
        closeNav();
    } else {
        openNav();
    }
}

// Sidebar toggle functionality
function initializeSidebar() {
    const sidenav = document.getElementById("mySidenav");
    const sidebarBtn = document.querySelector(".sidebar-btn");
    const navItems = document.querySelector(".nav-items");
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
    
    const nav = document.querySelector('nav');
    const navBtn = document.querySelector('.nav-btn');
    const navLinks = nav.querySelector('.nav-links');
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

