import '../scss/main.scss';

document.addEventListener('DOMContentLoaded', () => {
    // Add navbar
    const header = document.createElement('header');
    fetch('../templates/navbar.html')   
        .then(response => response.text())
        .then(data => {
            header.innerHTML = data;
            document.body.insertBefore(header, document.body.firstChild);
        })
        .catch(error => console.error('Error fetching navbar:', error));

    // Add footer
    const footer = document.createElement('footer');
    fetch('../templates/footer.html')   
        .then(response => response.text())
        .then(data => {
            footer.innerHTML = data;
            document.body.appendChild(footer); // Append footer at the end of body
        })
        .catch(error => console.error('Error fetching footer:', error));
});