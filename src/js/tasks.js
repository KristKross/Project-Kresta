import trashIconPath from '../assets/icons/tasks/trash.png';

document.addEventListener('DOMContentLoaded', () => {
    const customSelect = document.querySelector('.custom-select');
    const selectHeader = customSelect.querySelector('.select-header');
    const selectOptions = customSelect.querySelector('.select-options');

    async function loadWorkspaceMembers() {
        try {
            const response = await fetch('/api/workspace/my');
            if (!response.ok) throw new Error('Failed to load user workspace info');
            
            const data = await response.json();

            if (!data.success || !data.workspace) {
                throw new Error('Workspace access denied or not found');
            }

            const workspace = data.workspace;

            const membersList = [];

            if (workspace.members && workspace.members.length > 0) {
                workspace.members.forEach(member => {
                    membersList.push({
                        _id: member._id,
                        email: member.email,
                        name: member.username,
                        profilePic: null,
                    });
                });
            }

            selectOptions.innerHTML = '';

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

            // Add click handlers to newly created options
            const options = selectOptions.querySelectorAll('.option');
            options.forEach(option => {
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

    loadWorkspaceMembers();

    selectHeader.addEventListener('click', () => {
        customSelect.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (!customSelect.contains(e.target)) {
            customSelect.classList.remove('active');
        }
    });

    const taskForm = document.querySelector('.panel-content');
    const tasksList = document.querySelector('.tasks-list');
    const bulletEditor = document.querySelector('.bullet-editor');

    function formatTaskText(text) {
        const lines = text.split('\n')
            .map(line => line.trim())
            .filter(line => line !== '');

        if (lines.length === 0) return '';

        return `<div class="task-lines">
            ${lines.map(line => `• ${line}`).join('<br>')}
        </div>`;
    }

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
                <span class="date">${new Date(data.dueDate).toLocaleDateString()}</span>
            </div>
            <div class="task-preview">
                ${formatTaskText(data.details)}
            </div>
            <div class="assignees">
                <div class="assignee-wrapper">
                    <img src="${data.assigneeImage}" alt="${data.assigneeName}">
                    <div class="assignee-tooltip">Assigned to: ${data.assigneeName}</div>
                </div>
            </div>
            <button class="delete-task">
                <img src="${trashIconPath}" alt="">
                <span>Delete Task</span>
            </button>
        `;

        const deleteDialog = document.querySelector('.delete-confirmation-dialog');

        taskCard.querySelector('.delete-task').addEventListener('click', () => {
            deleteDialog.classList.add('active');
            deleteDialog.dataset.targetTaskId = data._id;

            deleteDialog.querySelector('.cancel-delete').onclick = () => {
                deleteDialog.classList.remove('active');
            };
        });

        return taskCard;
    }

    const deleteDialog = document.querySelector('.delete-confirmation-dialog');
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

    async function loadTasks() {
        try {
            const response = await fetch('api/task/get');
            if (!response.ok) throw new Error('Failed to load tasks');
            const tasks = await response.json();
            tasks.forEach(data => {
                const taskCard = createTaskCard(data);
                tasksList.appendChild(taskCard);
            });
        } catch (error) {
            console.error('Error loading tasks:', error);
        }
    }

    loadTasks();

    taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const assigneeName = taskForm.querySelector('.select-header span').textContent;
        if (assigneeName === 'Select Assignee') {
            alert('Please select an assignee');
            return;
        }

        const taskDetails = bulletEditor.value.trim();
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
            assigneeName: assigneeName,
        };

        try {
            const res = await fetch('/api/task', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData)
            });

            const createdTask = await res.json();
            console.log('Task created:', createdTask);
            const newTask = createTaskCard(createdTask);
            tasksList.insertBefore(newTask, tasksList.querySelector('.task-card'));

            taskForm.reset();
            const panel = document.querySelector('.task-creator-panel');
            if (isMobileView()) {
                panel.style.transform = 'translateY(100%)';
                panel.addEventListener('transitionend', () => {
                    panel.classList.remove('active');
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
        } catch (error) {
            console.error(error);
            alert('Something went wrong while creating the task.');
        }
    });

    bulletEditor.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const cursorPosition = bulletEditor.selectionStart;
            const currentValue = bulletEditor.value;
            const newValue = currentValue.slice(0, cursorPosition) + '\n' + currentValue.slice(cursorPosition);
            bulletEditor.value = newValue;
            bulletEditor.selectionStart = bulletEditor.selectionEnd = cursorPosition + 1;
        }
    });

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

    const panel = document.querySelector('.task-creator-panel');

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
    });

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