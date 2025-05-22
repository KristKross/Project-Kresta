document.addEventListener('DOMContentLoaded', () => {
    // Helper function to check if we're in mobile view
    const isMobileView = () => window.matchMedia('(max-width: 600px)').matches;

    // Date helper functions
    function isDateToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() && 
               date.getMonth() === today.getMonth() && 
               date.getFullYear() === today.getFullYear();
    }

    function isDateTomorrow(date) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return date.getDate() === tomorrow.getDate() && 
               date.getMonth() === tomorrow.getMonth() && 
               date.getFullYear() === tomorrow.getFullYear();
    }

    // Handle body scroll locking
    const toggleBodyScroll = (lock) => {
        if (lock) {
            const scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.overflow = 'hidden';
        } else {
            const scrollY = document.body.style.top;
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.style.top = '';
            document.body.style.overflow = '';
            window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }
    };

    // Drag and Drop Functionality
    let draggedPost = null;

    function handleDragStart(e) {
        draggedPost = this;
        this.style.opacity = '0.4';
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', this.dataset.postData);
        document.body.classList.add('dragging-post');
    }

    function handleDragEnd(e) {
        this.style.opacity = '1';
        document.body.classList.remove('dragging-post');
        document.querySelectorAll('.planner-column').forEach(col => {
            col.classList.remove('drag-over');
        });
    }

    function handleDragOver(e) {
        e.preventDefault();
        const column = e.currentTarget.closest('.planner-column');
        if (column && !column.classList.contains('drag-over')) {
            document.querySelectorAll('.planner-column').forEach(col => {
                col.classList.remove('drag-over');
            });
            column.classList.add('drag-over');
        }
        return false;
    }

    function handleDragEnter(e) {
        const column = e.currentTarget.closest('.planner-column');
        if (column) {
            column.classList.add('drag-over');
        }
    }

    function handleDragLeave(e) {
        const column = e.currentTarget.closest('.planner-column');
        if (column) {
            column.classList.remove('drag-over');
        }
    }

    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const targetColumn = e.currentTarget.closest('.planner-column');
        if (!targetColumn || !draggedPost) {
            return false;
        }

        targetColumn.classList.remove('drag-over');
        
        // Get the target date from the column header
        const dateHeader = targetColumn.querySelector('.date-header');
        if (!dateHeader) {
            return false;
        }

        const targetDateHeader = dateHeader.textContent;
        const postData = JSON.parse(draggedPost.dataset.postData);
        
        // Update the post's scheduled time
        const today = new Date();
        let targetDate = today;
        
        if (targetDateHeader === 'Today') {
            targetDate = today;
        } else if (targetDateHeader === 'Tomorrow') {
            targetDate = new Date(today.setDate(today.getDate() + 1));
        } else {
            // Parse the date from format "DD Month"
            const [day, month] = targetDateHeader.split(' ');
            targetDate = new Date(today.getFullYear(), monthNames.indexOf(month), parseInt(day));
        }
        
        // Keep the original time but update the date
        const originalTime = postData.time ? postData.time.split(':') : ['09', '00'];
        targetDate.setHours(parseInt(originalTime[0]), parseInt(originalTime[1]));
        
        // Update post data
        postData.scheduledDate = targetDate.toISOString();
        postData.time = targetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        postData.status = 'scheduled';
        
        // Find or create posts container
        let postsContainer = targetColumn.querySelector('.posts-container');
        if (!postsContainer) {
            postsContainer = document.createElement('div');
            postsContainer.className = 'posts-container';
            targetColumn.appendChild(postsContainer);
        }
        
        // Remove empty state if it exists
        const emptyState = targetColumn.querySelector('.empty-state');
        if (emptyState) {
            emptyState.remove();
        }

        // Remove the original post card
        const originalColumn = draggedPost.closest('.planner-column');
        draggedPost.remove();
        
        // Create new post card in target column
        const newPostCard = createPostCard(postData, postsContainer);
        
        // Check if original column is now empty
        const originalPostsContainer = originalColumn.querySelector('.posts-container');
        if (originalPostsContainer && !originalPostsContainer.children.length) {
            originalColumn.appendChild(createEmptyState());
        }
        
        draggedPost = null;
        return false;
    }

    // Post Creator Panel Functionality
    const postCreatorPanel = document.querySelector('.post-creator-panel');
    const createPostBtn = document.querySelector('.action-btn');
    const closePanel = document.querySelector('.close-panel');
    const platformOptions = document.querySelectorAll('.platform-option');
    const mediaUpload = document.querySelector('.media-upload');
    const mediaInput = document.querySelector('#media-input');
    const scheduleToggle = document.querySelector('#schedule-toggle');
    const scheduleInputs = document.querySelector('.schedule-inputs');
    const schedulePostBtn = document.querySelector('.schedule-post');
    const postForm = document.querySelector('.panel-content');

    // Post Preview Functionality
    const previewModal = {
        overlay: document.querySelector('.post-preview-overlay'),
        container: document.querySelector('.post-preview-overlay .preview-container'),
        show(postDataStr) {
            try {
                const data = JSON.parse(postDataStr);
                const header = this.container.querySelector('.preview-header');
                const content = this.container.querySelector('.preview-content');
                const media = this.container.querySelector('.preview-media');

                // Update header with platform icon and time
                if (data.platforms && data.platforms.length > 0) {
                    header.querySelector('.platform-icon').src = 
                        `./assets/icons/footer/${data.platforms[0]}.png`;
                }
                header.querySelector('.post-time').textContent = data.time || 'Just now';

                // Update media section if available
                if (data.mediaUrl) {
                    media.innerHTML = `<img src="${data.mediaUrl}" alt="${data.title || ''}" class="preview-image">`;
                } else {
                    media.innerHTML = '';
                }

                // Update content details
                content.querySelector('.post-title').textContent = data.title || '';
                content.querySelector('.post-description').textContent = data.description || '';
                
                // Update platform icons in footer
                if (data.platforms && data.platforms.length > 0) {
                    const platformIconsHtml = data.platforms.map(platform => 
                        `<img src="./assets/icons/footer/${platform}.png" alt="${platform}">`
                    ).join('');
                    content.querySelector('.platform-icons').innerHTML = platformIconsHtml;
                }
                
                // Update status with fallback
                const status = data.status || 'posted';
                const statusElement = content.querySelector('.status');
                statusElement.textContent = status;
                statusElement.className = `status ${status}`;

                // Show overlay
                this.overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            } catch (error) {
                console.error('Error showing preview:', error);
                this.showBasicPreview();
            }
        },
        showBasicPreview() {
            const content = this.container.querySelector('.preview-content');
            content.querySelector('.post-title').textContent = 'Unable to load preview';
            content.querySelector('.post-description').textContent = 'Sorry, there was an error loading the post preview.';
            this.container.querySelector('.preview-media').innerHTML = '';
            this.overlay.classList.add('active');
        },
        hide() {
            this.overlay.classList.remove('active');
            document.body.style.overflow = '';
        },
        init() {
            this.overlay.addEventListener('click', (e) => {
                if (e.target === this.overlay) {
                    this.hide();
                }
            });
            this.container.querySelector('.close-preview').addEventListener('click', () => this.hide());
        }
    };

    // Initialize preview functionality
    previewModal.init();

    // Panel event handlers
    createPostBtn.addEventListener('click', () => {
        postCreatorPanel.classList.add('active');
        if (isMobileView()) {
            toggleBodyScroll(true);
        }
    });

    closePanel.addEventListener('click', () => {
        postCreatorPanel.classList.remove('active');
        if (isMobileView()) {
            toggleBodyScroll(false);
        }
        postForm.reset();
        mediaUpload.classList.remove('has-media');
        mediaUpload.querySelector('img').src = './assets/icons/dashboard/create-post.png';
        mediaUpload.querySelector('img').classList.remove('preview');
        mediaUpload.querySelector('p').textContent = 'Click to upload media (optional)';
    });

    platformOptions.forEach(option => {
        option.addEventListener('click', () => option.classList.toggle('selected'));
    });

    mediaUpload.addEventListener('click', () => mediaInput.click());

    mediaInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                mediaUpload.classList.add('has-media');
                const img = mediaUpload.querySelector('img');
                img.src = e.target.result;
                img.classList.add('preview');
                mediaUpload.querySelector('p').textContent = file.name;
            };
            reader.readAsDataURL(file);
        }
    });

    scheduleToggle.addEventListener('change', () => {
        scheduleInputs.style.display = scheduleToggle.checked ? 'flex' : 'none';
        schedulePostBtn.disabled = !scheduleToggle.checked;
    });

    postForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const selectedPlatforms = Array.from(platformOptions)
            .filter(option => option.classList.contains('selected'))
            .map(option => option.dataset.platform);

        if (selectedPlatforms.length === 0) {
            alert('Please select at least one platform');
            return;
        }        let mediaUrl = null;
        if (mediaInput.files[0]) {
            mediaUrl = URL.createObjectURL(mediaInput.files[0]);
        }

        const formData = {
            title: postForm.querySelector('.post-title').value,
            description: postForm.querySelector('.post-description').value,
            platforms: selectedPlatforms,
            mediaUrl: mediaUrl,
            scheduled: scheduleToggle.checked,
            scheduledDate: scheduleToggle.checked ? 
                `${postForm.querySelector('.schedule-date').value} ${postForm.querySelector('.schedule-time').value}` : 
                null
        };

        createPostCard(formData);
        closePanel.click();
    });

    // Planner Grid Functionality
    let currentDate = new Date();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    function updateCurrentMonth() {
        document.getElementById('current-month').textContent = 
            `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }

    function createEmptyState() {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <img src="./assets/icons/dashboard/create-post.png" alt="">
            <p>No posts scheduled</p>
        `;
        return emptyState;
    }

    function createDayColumn(date, posts = []) {
        const today = new Date();
        const isToday = date.toDateString() === today.toDateString();
        const isTomorrow = date.toDateString() === new Date(today.setDate(today.getDate() + 1)).toDateString();
        
        const dateLabel = isToday ? 'Today' : 
                         isTomorrow ? 'Tomorrow' : 
                         `${date.getDate()} ${monthNames[date.getMonth()]}`;

        const column = document.createElement('div');
        column.className = `planner-column${isToday ? ' today' : ''}`;
        
        column.innerHTML = `
            <div class="date-header">${dateLabel}</div>
            <div class="posts-container">
                ${posts.length ? posts.map(post => createPostCardHtml(post)).join('') : ''}
            </div>
            ${!posts.length ? `
                <div class="empty-state">
                    <img src="./assets/icons/dashboard/create-post.png" alt="">
                    <p>No posts scheduled</p>
                </div>
            ` : ''}
        `;

        // Find or create the posts container
        const postsContainer = column.querySelector('.posts-container');
        
        // Add drag and drop event listeners directly to the posts container
        postsContainer.addEventListener('dragover', handleDragOver);
        postsContainer.addEventListener('dragenter', handleDragEnter);
        postsContainer.addEventListener('dragleave', handleDragLeave);
        postsContainer.addEventListener('drop', handleDrop);
        
        return column;
    }

    function createPostCard(data, container = null) {
        if (container === null) {
            const grid = document.getElementById('planner-grid');
            const today = new Date();
            const targetDate = data.scheduled ? new Date(data.scheduledDate) : today;
            
            // Find or create the target column
            let targetColumn = Array.from(grid.children).find(col => {
                const headerDate = col.querySelector('.date-header').textContent;
                if (!data.scheduled) {
                    return headerDate === 'Today';
                }
                
                // Handle special cases first
                if (headerDate === 'Tomorrow' && isDateTomorrow(targetDate)) {
                    return true;
                }
                if (headerDate === 'Today' && isDateToday(targetDate)) {
                    return true;
                }
                
                // For other dates, check day and month match
                return headerDate.includes(targetDate.getDate().toString()) &&
                       headerDate.includes(monthNames[targetDate.getMonth()]);
            });

            if (!targetColumn) {
                targetColumn = createDayColumn(targetDate);
                grid.appendChild(targetColumn);
            }

            // Find or create the posts container
            container = targetColumn.querySelector('.posts-container');
            if (!container) {
                container = document.createElement('div');
                container.className = 'posts-container';
                targetColumn.appendChild(container);
            }

            // Remove empty state if it exists
            const emptyState = targetColumn.querySelector('.empty-state');
            if (emptyState) {
                emptyState.remove();
            }
        }

        // Create and setup the post card
        const postCard = document.createElement('div');
        postCard.className = 'post-card';
        postCard.draggable = true;
        postCard.innerHTML = createPostCardHtml(data);
        postCard.dataset.postData = JSON.stringify(data);

        // Add drag and drop event listeners
        postCard.addEventListener('dragstart', handleDragStart);
        postCard.addEventListener('dragend', handleDragEnd);
        postCard.addEventListener('click', () => previewModal.show(postCard.dataset.postData));

        container.appendChild(postCard);
        return postCard;
    }
      function createPostCardHtml(post) {
        const mediaHtml = post.mediaUrl ? 
            `<div class="post-media">
                <img src="${post.mediaUrl}" alt="${post.title}">
            </div>` : '';

        return `
            <div class="post-card${post.status === 'draft' ? ' draft' : ''}">
                <div class="post-time">${post.time}</div>
                ${mediaHtml}
                <div class="post-info">
                    <p>${post.title}</p>
                    <div class="post-meta">
                        <span class="platform-icon">
                            ${post.platforms.map(platform => 
                                `<img src="./assets/icons/footer/${platform}.png" alt="${platform}">`
                            ).join('')}
                        </span>
                        <span class="status ${post.status}">${post.status}</span>
                    </div>
                </div>
            </div>
        `;
    }

    function updatePlannerGrid() {
        const grid = document.getElementById('planner-grid');
        grid.innerHTML = '';
        
        for (let i = 0; i < 3; i++) {
            const date = new Date(currentDate);
            date.setDate(date.getDate() + i);
            grid.appendChild(createDayColumn(date));
        }
    }

    // Initialize the planner
    updateCurrentMonth();
    updatePlannerGrid();

    // Month navigation
    document.querySelector('.prev-month').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        updateCurrentMonth();
        updatePlannerGrid();
    });

    document.querySelector('.next-month').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        updateCurrentMonth();
        updatePlannerGrid();
    });
});