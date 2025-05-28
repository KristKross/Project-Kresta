// Ideators page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Load sidebar template
    loadTemplate('./templates/sidebar.html', '.sidebar-container');
    
    // Load footer template
    loadTemplate('./templates/footer.html', '.footer-container');
      // Initialize page functionality
    initializeIdeatorFilters();
    initializeInstagramEmbeds();
    
    // Highlight current page in sidebar
    highlightCurrentPage();
});

function loadTemplate(templatePath, containerSelector) {
    fetch(templatePath)
        .then(response => response.text())
        .then(html => {
            document.querySelector(containerSelector).innerHTML = html;
        })
        .catch(error => {
            console.error(`Error loading template ${templatePath}:`, error);
        });
}

function initializeIdeatorFilters() {
    const filterButtons = document.querySelectorAll('.category-btn');
    const creatorCards = document.querySelectorAll('.creator-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Get filter category
            const category = button.getAttribute('data-category');
            
            // Filter creator cards
            filterIdeators(category, creatorCards);
        });
    });
}

function filterIdeators(category, cards) {
    cards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        
        if (category === 'all' || cardCategory === category) {
            card.style.display = 'block';
            card.style.opacity = '0';
            
            // Fade in animation
            setTimeout(() => {
                card.style.transition = 'opacity 0.3s ease';
                card.style.opacity = '1';
            }, 50);
        } else {
            card.style.transition = 'opacity 0.3s ease';
            card.style.opacity = '0';
            
            setTimeout(() => {
                card.style.display = 'none';
            }, 300);
        }
    });
    
    console.log(`Filtered ideators by category: ${category}`);
}

function initializeInstagramEmbeds() {
    // Instagram embeds are now directly embedded in HTML
    // Just ensure Instagram script is loaded and process existing embeds
    if (window.instgrm) {
        window.instgrm.Embeds.process();
    } else {
        // Wait for Instagram script to load
        const checkScript = setInterval(() => {
            if (window.instgrm) {
                window.instgrm.Embeds.process();
                clearInterval(checkScript);
            }
        }, 100);
    }
    console.log('Instagram embeds initialized');
}

function highlightCurrentPage() {
    // Wait for sidebar to load, then highlight current page
    setTimeout(() => {
        const sidebarLinks = document.querySelectorAll('.sidebar a');
        sidebarLinks.forEach(link => {
            if (link.href.includes('creators')) {
                link.classList.add('active');
            }
        });
    }, 100);
}

// Public API for external access to Instagram embed functionality
window.CreatorsPage = {
    // Add a single Instagram embed
    addInstagramEmbed: (cardIndex, embedData) => {
        InstagramEmbedManager.addEmbed(cardIndex, embedData);
    },
    
    // Add multiple Instagram embeds at once
    addMultipleInstagramEmbeds: (embedsArray) => {
        InstagramEmbedManager.addMultipleEmbeds(embedsArray);
    },
    
    // Refresh/reprocess all Instagram embeds
    refreshInstagramEmbeds: () => {
        InstagramEmbedManager.refreshEmbeds();
    },
    
    // Get embed manager for advanced usage
    getEmbedManager: () => InstagramEmbedManager
};