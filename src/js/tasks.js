import trashIconPath from '../assets/icons/tasks/trash.png';

document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const customSelect = document.querySelector('.custom-select');
    const selectHeader = customSelect.querySelector('.select-header');
    const selectOptions = customSelect.querySelector('.select-options');
    const taskForm = document.querySelector('.panel-content');
    const tasksList = document.querySelector('.tasks-list');
    const bulletEditor = document.querySelector('.bullet-editor');
    const deleteDialog = document.querySelector('.delete-confirmation-dialog');
    const panel = document.querySelector('.task-creator-panel');

    // Utility functions
    function isMobileView() {
        return window.matchMedia('(max-width: 600px)').matches;
    }

    function toggleBodyScroll(lock) {
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
    }

    function cleanupPanelStyles(panel) {
        if (isMobileView()) {
            Object.assign(panel.style, {
                position: 'fixed',
                bottom: '0',
                right: '0',
                left: '0',
                width: '100%',
                height: '90vh',
                transform: 'translateY(100%)',
                transition: 'transform 0.3s ease-in-out',
            });
        } else {
            panel.style.cssText = '';
        }
    }

    function initializePanelPosition(panel) {
        cleanupPanelStyles(panel);
        panel.style.transition = 'transform 0.3s ease-in-out';
        if (isMobileView()) {
            panel.style.transform = 'translateY(100%)';
        }
    }

    function formatTaskText(text) {
        const lines = text
            .split('\n')
            .map(line => line.trim())
            .filter(line => line !== '');

        if (lines.length === 0) return '';

        return `<div class="task-lines">${lines.map(line => `• ${line}`).join('<br>')}</div>`;
    }

    // Load workspace members and populate custom select dropdown
    async function loadWorkspaceMembers() {
        try {
            const response = await fetch('/api/workspace/my');
            if (!response.ok) throw new Error('Failed to load user workspace info');

            const data = await response.json();

            if (!data.success || !data.workspace) throw new Error('Workspace access denied or not found');

            const membersList = (data.workspace.members || []).map(member => ({
                _id: member._id,
                email: member.email,
                name: member.username,
                profilePic: null,
            }));

            // Clear existing options
            selectOptions.innerHTML = '';

            // Populate options
            membersList.forEach(member => {
                const option = document.createElement('div');
                option.className = 'option';
                option.dataset.value = member._id;
                option.innerHTML = `
                <img src="${member.profilePic || '../src/assets/images/dashboard/user-pfp.png'}" alt="${member.name}">
                <span>${member.name}</span>
                `;
                selectOptions.appendChild(option);
            });

            // Add click handlers to options
            selectOptions.querySelectorAll('.option').forEach(option => {
                option.addEventListener('click', () => {
                    const img = option.querySelector('img').src;
                    const text = option.querySelector('span').textContent;

                    selectHeader.querySelector('img').src = img;
                    selectHeader.querySelector('span').textContent = text;
                    customSelect.classList.remove('active');
                });
            });
        } catch (error) {
            console.error('Error loading workspace members:', error);
        }
    }

    // Create task card HTML element
    function createTaskCard(data) {
        const taskCard = document.createElement('div');
        taskCard.className = 'task-card';
        taskCard.id = `task-${data._id}`;

        taskCard.innerHTML = `
            <div class="task-header">
                <h3 class="task-title">${data.title}</h3>
                <span class="priority ${data.priority.toLowerCase()}">${data.priority}</span>
            </div>
            <div class="task-meta">
                <span class="status ${data.status.toLowerCase()}">${data.status}</span>
                <span class="date">${new Date(data.dueDate).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                })}</span>
            </div>
            <div class="task-preview">
                ${formatTaskText(data.details)}
            </div>
            <div class="assignees">
                <div class="assignee-wrapper">
                    <img src="${data.assigneeImage || '../src/assets/images/dashboard/user-pfp.png'}" alt="${data.assignedTo?.username || ''}">
                    <div class="assignee-tooltip">Assigned to: ${data.assignedTo?.username || 'Unassigned'}</div>
                </div>
            </div>
            <button class="delete-task">
                <img src="${trashIconPath}" alt="Delete">
                <span>Delete Task</span>
            </button>
        `;

        // Delete button event
        taskCard.querySelector('.delete-task').addEventListener('click', () => {
            deleteDialog.classList.add('active');
            deleteDialog.dataset.targetTaskId = data._id;

            deleteDialog.querySelector('.cancel-delete').onclick = () => {
                deleteDialog.classList.remove('active');
            };
        });

        return taskCard;
    }

    // Load tasks from API and render them
    async function loadTasks() {
        try {
            const response = await fetch('api/task/get');
            if (!response.ok) throw new Error('Failed to load tasks');

            const tasks = await response.json();
            tasks.forEach(data => {
                tasksList.appendChild(createTaskCard(data));
            });
        } catch (error) {
            console.error('Error loading tasks:', error);
        }
    }

    // Event listeners
    selectHeader.addEventListener('click', () => {
        customSelect.classList.toggle('active');
    });

    document.addEventListener('click', e => {
        if (!customSelect.contains(e.target)) {
            customSelect.classList.remove('active');
        }
    });

    bulletEditor.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const cursorPosition = bulletEditor.selectionStart;
            const currentValue = bulletEditor.value;
            const newValue =
                currentValue.slice(0, cursorPosition) + '\n' + currentValue.slice(cursorPosition);
            bulletEditor.value = newValue;
            bulletEditor.selectionStart = bulletEditor.selectionEnd = cursorPosition + 1;
        }
    });

    taskForm.addEventListener('submit', async e => {
        e.preventDefault();

        const assigneeName = selectHeader.querySelector('span').textContent;
        if (assigneeName === 'Select Assignee') {
            alert('Please select an assignee');
            return;
        }

        const taskDetails = bulletEditor.value.trim();
        if (!taskDetails) {
            alert('Please enter task details');
            return;
        }

        const taskData = {
            title: taskForm.querySelector('.task-title-input').value,
            priority: taskForm.querySelector('.priority-select').value,
            status: taskForm.querySelector('.status-select').value,
            dueDate: taskForm.querySelector('.date-input').value,
            details: taskDetails,
            assigneeName,
        };

        try {
            const res = await fetch('/api/task', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData),
            });

            if (!res.ok) throw new Error('Failed to create task');

            const createdTask = await res.json();
            const newTask = createTaskCard(createdTask);

            // Insert new task at the top
            tasksList.insertBefore(newTask, tasksList.firstChild);

            taskForm.reset();

            if (isMobileView()) {
                panel.style.transform = 'translateY(100%)';
                panel.addEventListener(
                    'transitionend',
                    () => {
                        panel.classList.remove('active');
                        cleanupPanelStyles(panel);
                        toggleBodyScroll(false);
                    },
                    { once: true }
                );
            } else {
                panel.classList.remove('active');
                cleanupPanelStyles(panel);
            }
        } catch (error) {
            console.error(error);
            alert('Something went wrong while creating the task.');
        }
    });

    deleteDialog.querySelector('.confirm-delete').addEventListener('click', async () => {
        const taskId = deleteDialog.dataset.targetTaskId;
        if (!taskId) return;

        try {
            const res = await fetch(`/api/task/${taskId}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to delete task');

            const taskCard = document.getElementById(`task-${taskId}`);
            if (taskCard) taskCard.remove();

            deleteDialog.classList.remove('active');
        } catch (error) {
            console.error(error);
            alert('Failed to delete task. Please try again.');
        }
    });

    // Panel open/close buttons & resize handling
    document.querySelector('.create-task-btn').addEventListener('click', () => {
        initializePanelPosition(panel);
        panel.classList.add('active');
        if (isMobileView()) {
            toggleBodyScroll(true);
            requestAnimationFrame(() => {
                panel.style.transform = 'translateY(0)';
            });
        }
    });

    document.querySelector('.close-panel').addEventListener('click', () => {
        if (isMobileView()) {
            panel.style.transform = 'translateY(100%)';
            panel.addEventListener(
                'transitionend',
                () => {
                    panel.classList.remove('active');
                    cleanupPanelStyles(panel);
                    toggleBodyScroll(false);
                },
                { once: true }
            );
        } else {
            panel.classList.remove('active');
            cleanupPanelStyles(panel);
        }
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (panel.classList.contains('active')) {
                cleanupPanelStyles(panel);
                initializePanelPosition(panel);
                if (isMobileView()) panel.style.transform = 'translateY(0)';
            } else {
                cleanupPanelStyles(panel);
                initializePanelPosition(panel);
            }
        }, 250);
    });

    // Initial loads
    loadWorkspaceMembers();
    loadTasks();
});