function openNav() {
    const sidenav = document.getElementById("mySidenav");
    const mainContent = document.querySelector('main');
    const openNavBtn = document.getElementById("openNav");
    
    if (sidenav && mainContent) {
        // Make sure the sidebar is visible and has initial width
        sidenav.style.display = "block";
        
        // Add transition class first
        sidenav.classList.add("expanded");
        mainContent.classList.add("shifted");
        
        // Force reflow to ensure the transition is applied
        void sidenav.offsetWidth;
        
        // Hide the open button
        if (openNavBtn) {
            openNavBtn.style.display = 'none';
        }
        
        // Set focus to the sidebar for better accessibility
        sidenav.setAttribute('aria-expanded', 'true');
    }
}

function closeNav() {
    const sidenav = document.getElementById("mySidenav");
    const mainContent = document.querySelector('main');
    const openNavBtn = document.getElementById("openNav");
    
    if (sidenav && mainContent) {
        // Remove the expanded class to trigger the closing animation
        sidenav.classList.remove("expanded");
        mainContent.classList.remove("shifted");
        
        // Show the open button after transition
        setTimeout(() => {
            if (openNavBtn) {
                openNavBtn.style.display = 'inline-block';
            }
            // Only hide on mobile
            if (window.innerWidth <= 600) {
                sidenav.style.display = "none";
            }
        }, 300); // Match this with your CSS transition duration
        
        // Update ARIA attributes
        sidenav.setAttribute('aria-expanded', 'false');
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

// Simple sidebar toggle functionality matching navbar pattern
function initializeSidebar() {
    const sidenav = document.getElementById('mySidenav');
    const sidebarBtn = document.querySelector('.sidebar-btn');
    const navItems = document.querySelector('.nav-items');
    let isMenuOpen = false;

    function toggleSidebar() {
        isMenuOpen = !isMenuOpen;
        sidenav?.classList.toggle('active', isMenuOpen);
        sidebarBtn?.classList.toggle('active', isMenuOpen);
        document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    }

    // Toggle sidebar on button click
    sidebarBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSidebar();
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (isMenuOpen && !sidenav?.contains(e.target) && !sidebarBtn?.contains(e.target)) {
            toggleSidebar();
        }
    });

    // Close sidebar when clicking a nav link on mobile
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 600 && isMenuOpen) {
                toggleSidebar();
            }
        });
    });

    // Add escape key support
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isMenuOpen) {
            toggleSidebar();
        }
    });
}

// Export the initialization function
export { initializeSidebar };

// Export functions for compatibility
// export function openNav() {
//     const sidenav = document.getElementById("mySidenav");
//     sidenav?.classList.add('active');
// }

// export function closeNav() {
//     const sidenav = document.getElementById("mySidenav");
//     sidenav?.classList.remove('active');
// }

// export function toggleNav() {
//     const sidenav = document.getElementById("mySidenav");
//     sidenav?.classList.toggle('active');
// }