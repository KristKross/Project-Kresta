import '../scss/main.scss';
import logo from '../assets/logo.png';

document.addEventListener('DOMContentLoaded', () => {
    const header = document.createElement('header');
    fetch('../templates/navbar.html')   
        .then(response => response.text())
        .then(data => {
            header.innerHTML = data;
            document.body.insertBefore(header, document.body.firstChild);

            const logoImg = document.querySelector('.logo');
            if (logoImg) {
                logoImg.src = logo;
            } else {
                console.error('Logo image not found');
            }
        })
    .catch(error => console.error('Error fetching navbar:', error));
});