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