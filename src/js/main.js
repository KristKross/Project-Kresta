import '../scss/main.scss';
document.addEventListener('DOMContentLoaded', () => {
    const header = document.createElement('header');
    fetch('../templates/navbar.html')   
        .then(response => response.text())
        .then(data => {
            header.innerHTML = data;
            document.body.insertBefore(header, document.body.firstChild);
        })
    .catch(error => console.error('Error fetching navbar:', error));
});