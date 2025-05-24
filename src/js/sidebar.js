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

document.addEventListener('DOMContentLoaded', () => {
    const sidenav = document.getElementById('mySidenav');
    const sidebarBtn = document.querySelector('.sidebar-btn');
    let isMenuOpen = false;

    function toggleSidebar() {
        isMenuOpen = !isMenuOpen;
        sidenav?.classList.toggle('active', isMenuOpen);
        sidebarBtn?.classList.toggle('active', isMenuOpen);
        document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    }

    // Single event listener for the button
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
});

// Export the functions for use in other modules
export { openNav, closeNav, toggleNav };