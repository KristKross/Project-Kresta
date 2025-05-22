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
        document.querySelector('.task-creator-panel').classList.remove('active');
    });

    // Enhanced bullet editor
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
});

document.querySelector('.create-task-btn').addEventListener('click', () => {
    document.querySelector('.task-creator-panel').classList.add('active');
});

document.querySelector('.close-panel').addEventListener('click', () => {
    document.querySelector('.task-creator-panel').classList.remove('active');
});