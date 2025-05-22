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
});

document.querySelector('.create-task-btn').addEventListener('click', () => {
    document.querySelector('.task-creator-panel').classList.add('active');
});

document.querySelector('.close-panel').addEventListener('click', () => {
    document.querySelector('.task-creator-panel').classList.remove('active');
});

// Handle bullet points in editor
document.querySelector('.bullet-editor').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        document.execCommand('insertHTML', false, '<br>• ');
    }
});