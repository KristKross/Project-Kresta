document.addEventListener('DOMContentLoaded', () => {
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

    // Close menu when clicking outside
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