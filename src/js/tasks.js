import trashIconPath from '../assets/icons/tasks/trash.png';
import defaultProfilePath from '../assets/images/dashboard/user-pfp.png';

async function fetchProfileImage(publicId) {
    if (!publicId) {
        return defaultProfilePath;
    }
    try {
        const res = await fetch(`/auth/profile-picture/${publicId}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
            console.warn('Failed to retrieve profile picture, using default.');
            return defaultProfilePath ; // Return default on failure
        }

        return data.imageUrl;
    } catch (error) {
        console.error('Error fetching profile picture:', error);
        return defaultProfilePath ; // Return default on error
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Function declarations first to prevent reference errors
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
        
        // Apply the required styles based on view
        if (isMobileView()) {
            panel.style.position = 'fixed';
            panel.style.bottom = '0';
            panel.style.right = '0';
            panel.style.left = '0';
            panel.style.top = 'auto'; // Override the top property
            panel.style.width = '100%';
            panel.style.height = '90vh';
            panel.style.transform = panel.classList.contains('active') ? 'translateY(0)' : 'translateY(100%)';
            // Only apply transition styles if transitions are enabled
            if (panel.classList.contains('transitions-enabled')) {
                panel.style.transition = 'transform 0.3s ease-in-out, opacity 0.3s ease';
            }
        } else {
            panel.style.position = 'fixed';
            panel.style.top = '0';
            panel.style.right = '0';
            panel.style.width = '40vw';
            panel.style.height = '100vh';
            panel.style.transform = panel.classList.contains('active') ? 'translateX(0)' : 'translateX(100%)';
            // Only apply transition styles if transitions are enabled
            if (panel.classList.contains('transitions-enabled')) {
                panel.style.transition = 'transform 0.3s ease-in-out, opacity 0.3s ease';
            }
        }
    }

    // Initialize panel once - moved to the top
    const panel = document.querySelector('.task-creator-panel');
    
    // Apply initial styles immediately to ensure no flash
    if (isMobileView()) {
        panel.style.transform = 'translateY(100%)';
    } else {
        panel.style.transform = 'translateX(100%)';
    }
    panel.style.opacity = '0';
    panel.style.visibility = 'hidden';
    
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
                        profilePicture: member.profilePicture,
                    });
                });
            }

            selectOptions.innerHTML = '';

            // Add the owner to the list of options
            const ownerOption = document.createElement('div');
            ownerOption.className = 'option';
            ownerOption.dataset.value = workspace.owner._id;
            ownerOption.innerHTML = `
                <img src="${workspace.owner.profilePic || defaultProfilePath}" alt="${workspace.owner.username}">
                <span>${workspace.owner.username}</span>
            `;
            selectOptions.appendChild(ownerOption);

            const loadProfilePictures = async () => {
                const promises = membersList.map(async (member) => {
                    const profilePictureUrl = await fetchProfileImage(member.profilePicture);
                    
                    const option = document.createElement("div");
                    option.className = "option";
                    option.dataset.value = member._id;
                    option.innerHTML = `
                        <img src="${profilePictureUrl || defaultProfilePath}" alt="${member.name}">
                        <span>${member.name}</span>
                    `;
                    selectOptions.appendChild(option);
                });

                await Promise.all(promises);
            };

            await loadProfilePictures();

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
        const lines = text.split('\n').map(line => line.trim()).filter(line => line !== '');

        if (lines.length === 0) return '';

        return `<div class="task-lines">
            ${lines.map(line => `• ${line}`).join('<br>')}
        </div>`;
    }

    async function createTaskCard(data) {
    const taskCard = document.createElement("div");
    taskCard.className = "task-card";
    taskCard.id = `task-${data._id}`;

    // Fetch profile picture asynchronously
    const profilePictureUrl = await fetchProfileImage(data.assignedTo?.profilePicture);

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
                <img src="${profilePictureUrl || defaultProfilePath}" alt="${data.assignedTo?.username}">
                <div class="assignee-tooltip">Assigned to: ${data.assignedTo?.username}</div>
            </div>
        </div>
        <button class="delete-task">
            <img src="${trashIconPath}" alt="">
            <span>Delete Task</span>
        </button>
    `;

    const deleteDialog = document.querySelector(".delete-confirmation-dialog");

    taskCard.querySelector(".delete-task").addEventListener("click", () => {
        deleteDialog.classList.add("active");
        deleteDialog.dataset.targetTaskId = data._id;

        deleteDialog.querySelector(".cancel-delete").onclick = () => {
            deleteDialog.classList.remove("active");
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
            const response = await fetch("api/task/get");
            if (!response.ok) throw new Error("Failed to load tasks");

            const tasks = await response.json();

            for (const data of tasks) {
                const taskCard = await createTaskCard(data);
                tasksList.appendChild(taskCard);
            }
        } catch (error) {
            console.error("Error loading tasks:", error);
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

            const newTask = await createTaskCard(createdTask);
            tasksList.insertBefore(newTask, tasksList.querySelector('.task-card'));

            taskForm.reset();
            
            if (isMobileView()) {
                panel.style.transform = 'translateY(100%)';
                panel.style.opacity = '0';
                
                panel.addEventListener('transitionend', function handler() {
                    panel.classList.remove('active');
                    panel.style.visibility = 'hidden';
                    toggleBodyScroll(false);
                    panel.removeEventListener('transitionend', handler);
                });
            } else {
                panel.style.transform = 'translateX(100%)';
                panel.style.opacity = '0';
                
                panel.addEventListener('transitionend', function handler() {
                    panel.classList.remove('active');
                    panel.style.visibility = 'hidden';
                    panel.removeEventListener('transitionend', handler);
                });
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

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            cleanupPanelStyles(panel);
        }, 250);
    });

    document.querySelector('.create-task-btn').addEventListener('click', () => {
        cleanupPanelStyles(panel);
        
        // Add class first to ensure transitions work properly
        panel.classList.add('active');
        
        // Apply appropriate transform immediately after class is added
        if (isMobileView()) {
            toggleBodyScroll(true);
            requestAnimationFrame(() => {
                panel.style.transform = 'translateY(0)';
                panel.style.opacity = '1';
                panel.style.visibility = 'visible';
            });
        } else {
            requestAnimationFrame(() => {
                panel.style.transform = 'translateX(0)';
                panel.style.opacity = '1';
                panel.style.visibility = 'visible';
            });
        }
    });

    document.querySelector('.close-panel').addEventListener('click', () => {
        if (isMobileView()) {
            panel.style.transform = 'translateY(100%)';
            panel.style.opacity = '0';
            
            // Wait for transition to complete before removing active class
            panel.addEventListener('transitionend', function handler() {
                panel.classList.remove('active');
                panel.style.visibility = 'hidden';
                toggleBodyScroll(false);
                panel.removeEventListener('transitionend', handler);
            });
        } else {
            panel.style.transform = 'translateX(100%)';
            panel.style.opacity = '0';
            
            // Wait for transition to complete before removing active class
            panel.addEventListener('transitionend', function handler() {
                panel.classList.remove('active');
                panel.style.visibility = 'hidden';
                panel.removeEventListener('transitionend', handler);
            });
        }
    });

    // Initialize panel styles and enable transitions after a delay
    window.addEventListener('load', () => {
        // Enable transitions only after page load is complete
        setTimeout(() => {
            panel.classList.add('transitions-enabled');
        }, 300); // Small delay to ensure everything is rendered
    });
});