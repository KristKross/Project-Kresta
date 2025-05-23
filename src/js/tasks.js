document.addEventListener('DOMContentLoaded', () => {
    const customSelect = document.querySelector('.custom-select');
    const selectHeader = customSelect.querySelector('.select-header');
    const options = customSelect.querySelectorAll('.option');

    selectHeader.addEventListener('click', () => {
        customSelect.classList.toggle('active');
    });

    options.forEach(option => {
        option.addEventListener('click', () => {
            const img = option.querySelector('img').src;
            const text = option.querySelector('span').textContent;
            
            selectHeader.querySelector('img').src = img;
            selectHeader.querySelector('span').textContent = text;
            
            customSelect.classList.remove('active');
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!customSelect.contains(e.target)) {
            customSelect.classList.remove('active');
        }
    });

    // Task Creation and Preview Functionality
    const taskForm = document.querySelector('.panel-content');
    const tasksList = document.querySelector('.tasks-list');
    const bulletEditor = document.querySelector('.bullet-editor');

    // Convert text to HTML with line breaks but without bullets
    function formatTaskText(text) {
        const lines = text.split('\n')
            .map(line => line.trim())
            .filter(line => line !== '');
        
        if (lines.length === 0) return '';
        
        // Add a class to help with styling
        return `<div class="task-lines">
            ${lines.map(line => `• ${line}`).join('<br>')}
        </div>`;
    }

    // Create new task card
    function createTaskCard(data) {
        const taskCard = document.createElement('div');
        taskCard.className = 'task-card';
        taskCard.innerHTML = `
            <div class="task-header">
                <h3 class="task-title">${data.title}</h3>
                <span class="priority ${data.priority.toLowerCase()}">${data.priority}</span>
            </div>
            <div class="task-meta">
                <span class="status ${data.status.toLowerCase()}">${data.status}</span>
                <span class="date">${data.dueDate}</span>
            </div>
            <div class="task-preview">
                ${formatTaskText(data.details)}
            </div>            <div class="assignees">
                <div class="assignee-wrapper">
                    <img src="${data.assigneeImage}" alt="${data.assigneeName}">
                    <div class="assignee-tooltip">Assigned to: ${data.assigneeName}</div>
                </div>
            </div>
            <button class="delete-task">
                <img src="../src/assets/icons/tasks/trash.png" alt="">
                <span>Delete Task</span>
            </button>
        `;

        // Update delete functionality with custom dialog
        const deleteDialog = document.querySelector('.delete-confirmation-dialog');
        taskCard.querySelector('.delete-task').addEventListener('click', () => {
            deleteDialog.classList.add('active');
            
            // Store reference to the task card
            deleteDialog.dataset.targetTask = taskCard.id = `task-${Date.now()}`;
            
            // Handle cancel
            deleteDialog.querySelector('.cancel-delete').onclick = () => {
                deleteDialog.classList.remove('active');
            };
            
            // Handle confirm
            deleteDialog.querySelector('.confirm-delete').onclick = () => {
                const targetTask = document.getElementById(deleteDialog.dataset.targetTask);
                targetTask.remove();
                deleteDialog.classList.remove('active');
            };
        });

        return taskCard;
    }    // Handle task creation
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Validate assignee selection
        const assigneeName = taskForm.querySelector('.select-header span').textContent;
        if (assigneeName === 'Select assignee') {
            alert('Please select an assignee');
            return;
        }

        // Validate task details
        const taskDetails = taskForm.querySelector('.bullet-editor').value.trim();
        if (taskDetails === '') {
            alert('Please enter task details');
            return;
        }
        
        const taskData = {
            title: taskForm.querySelector('.task-title-input').value,
            priority: taskForm.querySelector('.priority-select').value,
            status: taskForm.querySelector('.status-select').value,
            dueDate: taskForm.querySelector('.date-input').value,
            details: taskDetails,
            assigneeImage: taskForm.querySelector('.select-header img').src,
            assigneeName: assigneeName
        };

        const newTask = createTaskCard(taskData);
        tasksList.insertBefore(newTask, tasksList.querySelector('.task-card'));
          // Reset form and close panel
        taskForm.reset();
        const panel = document.querySelector('.task-creator-panel');
        if (isMobileView()) {
            panel.style.transform = 'translateY(100%)';
            panel.addEventListener('transitionend', () => {
                panel.classList.remove('active');
                // Keep mobile positioning after close
                panel.style.position = 'fixed';
                panel.style.bottom = '0';
                panel.style.right = '0';
                panel.style.left = '0';
                panel.style.width = '100%';
            }, { once: true });
        } else {
            panel.classList.remove('active');
            cleanupPanelStyles(panel);
        }
    });    // Enhanced bullet editor
    bulletEditor.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const cursorPosition = bulletEditor.selectionStart;
            const currentValue = bulletEditor.value;
            const newValue = currentValue.slice(0, cursorPosition) + '\n' + currentValue.slice(cursorPosition);
            bulletEditor.value = newValue;
            bulletEditor.selectionStart = bulletEditor.selectionEnd = cursorPosition + 1;
        }
    });    // Helper function to check if we're in mobile view
    function isMobileView() {
        return window.matchMedia('(max-width: 600px)').matches;
    }

    // Handle body scroll locking with position preservation
    function toggleBodyScroll(lock) {
        if (lock) {
            // Store current scroll position
            const scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.overflow = 'hidden';
        } else {
            // Restore scroll position
            const scrollY = document.body.style.top;
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.style.top = '';
            document.body.style.overflow = '';
            window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }
    }

    // Function to clean up inline styles
    function cleanupPanelStyles(panel) {
        if (isMobileView()) {
            // In mobile, preserve required styles
            const requiredStyles = {
                position: 'fixed',
                bottom: '0',
                right: '0',
                left: '0',
                width: '100%',
                height: '90vh',
                transform: 'translateY(100%)',
                transition: 'transform 0.3s ease-in-out'
            };
            
            Object.assign(panel.style, requiredStyles);
        } else {
            // In desktop, remove all inline styles
            panel.style.cssText = '';
        }
    }

    // Initialize panel position based on view
    function initializePanelPosition(panel) {
        cleanupPanelStyles(panel);
        
        // Add smooth transition for both views
        panel.style.transition = 'transform 0.3s ease-in-out';
        
        if (isMobileView()) {
            panel.style.transform = 'translateY(100%)';
        }
    }

    const panel = document.querySelector('.task-creator-panel');

    // Handle resize events
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (panel.classList.contains('active')) {
                cleanupPanelStyles(panel);
                initializePanelPosition(panel);
                if (isMobileView()) {
                    panel.style.transform = 'translateY(0)';
                }
            } else {
                cleanupPanelStyles(panel);
                initializePanelPosition(panel);
            }
        }, 250);
    });    // Handle panel opening
    document.querySelector('.create-task-btn').addEventListener('click', () => {
        initializePanelPosition(panel);
        panel.classList.add('active');
        if (isMobileView()) {
            toggleBodyScroll(true);
            requestAnimationFrame(() => {
                panel.style.transform = 'translateY(0)';
            });
        }
    });    // Handle panel closing
    document.querySelector('.close-panel').addEventListener('click', () => {
        if (isMobileView()) {
            panel.style.transform = 'translateY(100%)';
            panel.addEventListener('transitionend', () => {
                panel.classList.remove('active');
                cleanupPanelStyles(panel);
                toggleBodyScroll(false);
            }, { once: true });
        } else {
            panel.classList.remove('active');
            cleanupPanelStyles(panel);
        }
    });
});

async function loadTasks() {
    try {
        const response = await fetch('/api/tasks'); // Your backend endpoint to get all tasks
        if (!response.ok) throw new Error('Failed to fetch tasks');
            const tasks = await response.json();

            tasks.forEach(taskData => {
            const taskCard = createTaskCard(taskData);
            tasksList.appendChild(taskCard);
        });
    } catch (error) {
        console.error(error);
        tasksList.innerHTML = '<p>Error loading tasks.</p>';
    }
}


