document.addEventListener('DOMContentLoaded', () => {
    // Get reference to panel elements - fix duplicate declaration
    const postCreatorPanel = document.querySelector('.post-creator-panel');
    const createPostBtn = document.querySelector('.action-btn');
    const closePanel = document.querySelector('.close-panel');
    const platformOptions = document.querySelectorAll('.platform-option');
    const mediaUpload = document.querySelector('.media-upload');
    const mediaInput = document.querySelector('#media-input');
    const postForm = document.querySelector('.panel-content');

    // Explicitly ensure post creator panel is fully hidden on page load
    if (postCreatorPanel) {
        postCreatorPanel.style.transform = 'translateX(100%)';
        postCreatorPanel.style.opacity = '0';
        postCreatorPanel.style.visibility = 'hidden';
        postCreatorPanel.classList.remove('active');
        
        // Give the browser a moment to apply these styles before any other operations
        setTimeout(() => {
            // Remove the inline styles after a brief delay so the CSS transitions will work normally
            postCreatorPanel.style.transform = '';
            postCreatorPanel.style.opacity = '';
            postCreatorPanel.style.visibility = '';
        }, 300);
    }

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

    // Post Preview Functionality - keep only one instance of this
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

    // Panel event handlers - Fix the click handlers
    createPostBtn?.addEventListener('click', () => {
        console.log('Create post button clicked');
        postCreatorPanel.classList.add('active');
        // Force the panel to be visible with inline styles that override the !important CSS
        postCreatorPanel.style.transform = 'translateX(0) !important';
        postCreatorPanel.style.opacity = '1';
        postCreatorPanel.style.visibility = 'visible';
    });    closePanel?.addEventListener('click', () => {
        // Hide panel with smooth animation
        postCreatorPanel.classList.remove('active');
        // Reset inline styles
        postCreatorPanel.style.transform = '';
        postCreatorPanel.style.opacity = '';
        postCreatorPanel.style.visibility = '';
        
        // Reset form after animation completes
        setTimeout(() => {
            if (postForm) postForm.reset();
            if (mediaUpload) {
                mediaUpload.classList.remove('has-media');
                const img = mediaUpload.querySelector('img');
                if (img) {
                    img.src = './assets/icons/dashboard/create-post.png';
                    img.classList.remove('preview');
                }
                const p = mediaUpload.querySelector('p');
                if (p) p.textContent = 'Click to upload media';
            }
            
            // Reset any button loading states
            const submitBtn = postForm.querySelector('.post-now');
            if (submitBtn && submitBtn.classList.contains('btn-loading')) {
                submitBtn.classList.remove('btn-loading');
                submitBtn.innerHTML = 'Create Post';
                submitBtn.disabled = false;
            }
        }, 300);
    });

    // Platform options click handler
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

    // Enhanced toast notification function with animation and icon
function showToast(message, type = "") {
    const toast = document.getElementById("custom-toast");
    if (!toast) return;
    
    // Remove any existing toast first (in case there's one already showing)
    toast.classList.remove("active");
    
    // Wait a tiny bit before showing the new toast (for animation purposes)
    setTimeout(() => {
        // Create content with icon
        toast.innerHTML = `${message}`;
        toast.className = "custom-toast with-icon" + (type ? ` ${type}` : "");
        toast.classList.add("active");
        
        // Hide toast after delay
        setTimeout(() => {
            toast.classList.remove("active");
        }, 3000);
    }, 10);
}    postForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get submit button
        const submitBtn = postForm.querySelector('.post-now');
        const originalBtnText = submitBtn.textContent;

        // Validate media file
        const mediaInputFile = mediaInput.files[0];
        if (!mediaInputFile) {
            showToast('Please upload a media file', 'error');
            return;
        }

        // Validate caption
        const caption = postForm.querySelector('.post-description').value.trim();
        if (!caption) {
            showToast('Please enter a caption for your post', 'error');
            return;
        }

        // Show loading state
        submitBtn.classList.add('btn-loading');
        submitBtn.innerHTML = `<div class="spinner"></div><span>${originalBtnText}</span>`;
        submitBtn.disabled = true;
        
        // Process file type
        const fileType = mediaInputFile.type.startsWith('video') ? 'video' : 'image';
        const mediaFormData = new FormData();
        mediaFormData.append('imageFile', mediaInputFile);
        mediaFormData.append('resourceType', fileType);

        try {
            // Display "Uploading..." toast
            showToast('Uploading media...', '');
            
            // Upload media
            const uploadResponse = await fetch('/api/upload-media', {
                method: 'POST',
                body: mediaFormData
            });

            const uploadResult = await uploadResponse.json();
            if (!uploadResponse.ok) {
                throw new Error(uploadResult.error || 'Media upload failed');
            }

            // Show "Publishing..." toast
            showToast('Publishing post...', '');
            
            const cloudinaryPublicId = uploadResult.publicId;

            // Prepare post data
            const postFormData = {
                caption: caption,
                mediaPublicId: cloudinaryPublicId,
                resourceType: fileType,
            };

            // Submit post
            const postResponse = await fetch('/api/instagram/publish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postFormData)
            });

            const postResult = await postResponse.json();
            if (!postResponse.ok) {
                throw new Error(postResult.error || 'Failed to publish post');
            }

            // Success: Show toast and reset form
            showToast('Your post has been published successfully!', 'success');
            
            // Clear form content and hide panel with a slight delay
            setTimeout(() => {
                // Hide the panel
                postCreatorPanel.classList.remove('active');
                postCreatorPanel.style.transform = '';
                postCreatorPanel.style.opacity = '';
                postCreatorPanel.style.visibility = '';
                
                // Reset form fields after panel is hidden
                setTimeout(() => {
                    // Reset form
                    postForm.reset();
                    
                    // Reset media upload area
                    if (mediaUpload) {
                        mediaUpload.classList.remove('has-media');
                        const img = mediaUpload.querySelector('img');
                        if (img) {
                            img.src = './assets/icons/dashboard/create-post.png';
                            img.classList.remove('preview');
                        }
                        const p = mediaUpload.querySelector('p');
                        if (p) p.textContent = 'Click to upload media';
                    }
                    
                    // Refresh the planner grid to show the new post
                    updatePlannerGridWithTasks();
                }, 300);
            }, 1000);
            
        } catch (error) {
            console.error('Error:', error);
            showToast('Something went wrong. Please try again.', 'error');
        } finally {
            // Reset button state
            submitBtn.classList.remove('btn-loading');
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    });

    // Planner Grid Functionality
    let currentDate = new Date();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    function updateCurrentMonth() {
        document.getElementById('current-month').textContent = 
            `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }

    function createDayColumn(date, posts = []) {
        const today = new Date();
        const isToday = date.toDateString() === today.toDateString();
        
        // Simplified date label without indicators
        const dateLabel = `${date.getDate()} ${monthNames[date.getMonth()]}`;

        const column = document.createElement('div');
        column.className = `planner-column${isToday ? ' today' : ''}`;
        
        column.innerHTML = `
            <div class="column-content">
                <div class="date-header">${dateLabel}</div>
                <div class="posts-container">
                    ${posts.length ? posts.map(post => createPostCardHtml(post)).join('') : ''}
                </div>
            </div>
        `;

        return column;
    }

    function createPostCard(data, container = null) {
        if (container === null) {
            const grid = document.getElementById('planner-grid');
            const calendarGrid = grid.querySelector('.calendar-grid');
            const today = new Date();
            const targetDate = data.scheduled ? new Date(data.scheduledDate) : today;
            
            let targetColumn = calendarGrid ? Array.from(calendarGrid.children).find(col => {
                const headerDate = col.querySelector('.date-header')?.textContent;
                if (!headerDate) return false;
                
                if (!data.scheduled) {
                    return headerDate === 'Today';
                }
                
                if (headerDate === 'Tomorrow' && isDateTomorrow(targetDate)) {
                    return true;
                }
                if (headerDate === 'Today' && isDateToday(targetDate)) {
                    return true;
                }
                
                return headerDate.includes(targetDate.getDate().toString()) &&
                       headerDate.includes(monthNames[targetDate.getMonth()]);
            }) : null;

            if (!targetColumn) {
                targetColumn = createDayColumn(targetDate);
                calendarGrid?.appendChild(targetColumn);
            }

            container = targetColumn?.querySelector('.posts-container');
            if (!container) {
                container = document.createElement('div');
                container.className = 'posts-container';
                targetColumn?.appendChild(container);
            }
        }

        if (!data.status) {
            data.status = data.scheduled ? 'scheduled' : 'draft';
        }

        const postCard = document.createElement('div');
        postCard.className = `post-card ${data.status}`;
        // Remove draggable attribute
        postCard.innerHTML = createPostCardHtml(data);
        postCard.dataset.postData = JSON.stringify(data);

        // Remove drag event listeners, keep only click handlers
        postCard.addEventListener('click', (e) => {
            if (!e.target.closest('.edit-btn')) {
                previewModal.show(postCard.dataset.postData);
            }
        });

        container?.appendChild(postCard);
        return postCard;
    }

    function createPostCardHtml(post) {
        const mediaHtml = post.mediaUrl ? 
            `<div class="post-media">
                <img src="${post.mediaUrl}" alt="${post.title}">
            </div>` : '';

        return `
            <div class="post-info">
                <div class="post-header">
                    <div class="post-time">${post.time || 'Not scheduled'}</div>
                    <button class="edit-btn" type="button" title="Edit post">
                        <img src="./assets/icons/dashboard/pen.png" alt="Edit">
                    </button>
                </div>
                ${mediaHtml}
                <p>${post.title}</p>
                <div class="post-meta">
                    <span class="platform-icons">
                        ${post.platforms.map(platform => 
                            `<img src="./assets/icons/footer/${platform}.png" alt="${platform}">`
                        ).join('')}
                    </span>
                    <span class="status ${post.status}">${post.status}</span>
                </div>
            </div>
        `;
    }

    // Add this right after the createPostCard function
    function handlePostEdit(e) {
        e.stopPropagation(); // Prevent post preview from opening
        const postCard = e.target.closest('.post-card');
        if (!postCard) return;

        const postData = JSON.parse(postCard.dataset.postData);
        
        // Populate post creator panel with existing data
        const postForm = document.querySelector('.panel-content');
        postForm.querySelector('.post-title').value = postData.title;
        postForm.querySelector('.post-description').value = postData.description || '';
        
        // Select platforms
        const platformOptions = document.querySelectorAll('.platform-option');
        platformOptions.forEach(option => {
            const platform = option.dataset.platform;
            if (postData.platforms.includes(platform)) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
        
        // Show media if exists
        const mediaUpload = document.querySelector('.media-upload');
        if (postData.mediaUrl) {
            mediaUpload.classList.add('has-media');
            const img = mediaUpload.querySelector('img');
            img.src = postData.mediaUrl;
            img.classList.add('preview');
            mediaUpload.querySelector('p').textContent = 'Media uploaded';
        }
        
        // Store reference to edited post
        postForm.dataset.editingPostId = postData.id;
    }

    // Add event delegation for edit buttons
    document.addEventListener('click', (e) => {
        if (e.target.closest('.edit-btn')) {
            handlePostEdit(e);
        }
    });

    let currentView = 'week';

    function getMonthDays(date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const currentDay = date.getDate();
        
        // Calculate the start date (2 weeks before current day)
        const start = new Date(year, month, currentDay - 14);
        start.setDate(start.getDate() - start.getDay()); // Align to Sunday
        
        const days = [];
        let current = new Date(start);
        
        // Generate 35 days (5 weeks)
        for (let i = 0; i < 35; i++) {
            days.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }
        
        return days;
    }

    function getWeekDays(date) {
        const start = new Date(date);
        start.setDate(start.getDate() - start.getDay()); // Start from Sunday
        
        const days = [];
        for (let i = 0; i < 7; i++) {
            const current = new Date(start);
            current.setDate(current.getDate() + i);
            days.push(current);
        }
        
        return days;
    }

    function updatePlannerGrid() {
        const grid = document.getElementById('planner-grid');
        grid.innerHTML = '';

        // Create and add day labels row
        const dayLabelsRow = document.createElement('div');
        dayLabelsRow.className = 'day-labels';
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayNames.forEach(day => {
            const label = document.createElement('div');
            label.className = 'day-label';
            label.textContent = day;
            dayLabelsRow.appendChild(label);
        });
        grid.appendChild(dayLabelsRow);

        // Create and add calendar grid
        const calendarGrid = document.createElement('div');
        calendarGrid.className = `calendar-grid ${currentView}-view`;

        const days = currentView === 'week' ? 
            getWeekDays(currentDate) : 
            getMonthDays(currentDate);

        days.forEach((date, index) => {
            const column = createDayColumn(date);
            if (currentView === 'month') {
                if (isDateToday(date)) {
                    column.classList.add('current-day');
                }
                if (date.getMonth() !== currentDate.getMonth()) {
                    column.classList.add('other-month');
                }
            }
            calendarGrid.appendChild(column);
        });

        grid.appendChild(calendarGrid);
    }    // Function to create task card for planner view
    function createTaskCardForPlanner(task) {
        const taskCard = document.createElement('div');
        taskCard.className = `task-card ${task.priority.toLowerCase()}`;
        taskCard.dataset.taskId = task._id;
        
        // Enhanced task card with more visible structure
        taskCard.innerHTML = `
            <div class="task-info">
                <div class="task-header">
                    <div class="task-title">${task.title}</div>
                    <span class="priority ${task.priority.toLowerCase()}">${task.priority}</span>
                </div>
                <div class="task-meta">
                    <span class="assignee">${task.assignedTo?.username || 'Unassigned'}</span>
                    <span class="status ${task.status.toLowerCase()}">${task.status}</span>
                </div>
            </div>
        `;
        
        // Add click handler to navigate to tasks page
        taskCard.addEventListener('click', () => {
            window.location.href = '/tasks.html';
        });
        
        return taskCard;
    }
    
    // Function to fetch tasks and add them to planner
    async function loadTasksIntoPlanner() {
        try {
            const response = await fetch("/api/task/get");
            if (!response.ok) throw new Error("Failed to load tasks");
            
            const tasks = await response.json();
            
            tasks.forEach(task => {
                if (!task.dueDate) return; // Skip tasks without due dates
                
                const dueDate = new Date(task.dueDate);
                
                // Find the correct column for this task's due date
                const grid = document.getElementById('planner-grid');
                const calendarGrid = grid.querySelector('.calendar-grid');
                
                if (!calendarGrid) return;
                
                // Match the column by date
                const targetColumn = Array.from(calendarGrid.children).find(col => {
                    const headerDate = col.querySelector('.date-header')?.textContent;
                    if (!headerDate) return false;
                    
                    const headerDay = parseInt(headerDate.split(' ')[0], 10);
                    const headerMonth = headerDate.split(' ')[1];
                    
                    return headerDay === dueDate.getDate() && 
                           headerMonth === monthNames[dueDate.getMonth()];
                });
                
                if (targetColumn) {
                    // Check if there's already a tasks container
                    let tasksContainer = targetColumn.querySelector('.tasks-container');
                    if (!tasksContainer) {
                        // Create tasks container if it doesn't exist
                        tasksContainer = document.createElement('div');
                        tasksContainer.className = 'tasks-container';                        // Add a label for the tasks section with enhanced visibility
                        const tasksLabel = document.createElement('div');
                        tasksLabel.className = 'tasks-label';
                        
                        // Adjust label styling based on view and device
                        if (currentView === 'month') {
                            tasksLabel.textContent = 'Tasks';
                        } else {
                            // Add a small icon for tasks in week view
                            const taskIcon = document.createElement('span');
                            taskIcon.innerHTML = '●';
                            taskIcon.style.marginRight = '5px';
                            tasksLabel.appendChild(taskIcon);
                            tasksLabel.appendChild(document.createTextNode('Tasks'));
                        }
                        
                        tasksContainer.appendChild(tasksLabel);
                        
                        // For mobile/tablet, add a small badge with task count
                        if (window.innerWidth <= 1024) {
                            const taskCount = document.createElement('span');
                            taskCount.className = 'task-count';
                            taskCount.textContent = '1';
                            taskCount.style.marginLeft = '5px';
                            taskCount.style.backgroundColor = currentView === 'month' ? '#293241' : '#E5E9F0';
                            taskCount.style.color = currentView === 'month' ? '#fff' : '#293241';
                            taskCount.style.borderRadius = '50%';
                            taskCount.style.padding = currentView === 'month' ? '1px 4px' : '1px 6px';
                            taskCount.style.fontSize = currentView === 'month' ? '8px' : '11px';
                            taskCount.style.fontWeight = 'bold';
                            tasksLabel.appendChild(taskCount);
                            
                            // Add some emphasis to the container in month view
                            if (currentView === 'month') {
                                tasksContainer.style.backgroundColor = 'rgba(41, 50, 65, 0.05)';
                                tasksContainer.style.borderRadius = '3px';
                            }
                        }
                        
                        // Find the posts-container and insert tasks after it
                        const postsContainer = targetColumn.querySelector('.posts-container');
                        if (postsContainer) {
                            postsContainer.after(tasksContainer);
                        } else {
                            targetColumn.querySelector('.column-content').appendChild(tasksContainer);
                        }
                    }
                    
                    // Add the task card to the container
                    const taskCard = createTaskCardForPlanner(task);
                    tasksContainer.appendChild(taskCard);
                }
            });
            
        } catch (error) {
            console.error("Error loading tasks into planner:", error);
        }
    }    // Modify the updatePlannerGrid function to call loadTasksIntoPlanner after grid is created
    function updatePlannerGridWithTasks() {
        updatePlannerGrid();
        // After grid is created, load tasks into it
        loadTasksIntoPlanner();
    };
      // Set up view toggle buttons
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            const view = button.dataset.view;
            if (view && view !== currentView) {
                currentView = view;
                viewButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                updatePlannerGridWithTasks();
            }
        });
    });
    
    // Set up month navigation buttons
    const prevMonthBtn = document.querySelector('.prev-month');
    const nextMonthBtn = document.querySelector('.next-month');
      prevMonthBtn?.addEventListener('click', () => {
        if (currentView === 'week') {
            // Move back one week
            currentDate.setDate(currentDate.getDate() - 7);
        } else {
            // Move back one month
            currentDate.setMonth(currentDate.getMonth() - 1);
        }
        updateCurrentMonth();
        updatePlannerGridWithTasks();
    });
      nextMonthBtn?.addEventListener('click', () => {
        if (currentView === 'week') {
            // Move forward one week
            currentDate.setDate(currentDate.getDate() + 7);
        } else {
            // Move forward one month
            currentDate.setMonth(currentDate.getMonth() + 1);
        }
        updateCurrentMonth();
        updatePlannerGridWithTasks();
    });
      // Initialize the planner
    updateCurrentMonth();
    updatePlannerGridWithTasks();
});