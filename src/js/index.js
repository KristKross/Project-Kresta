import menuIcon from '../assets/icons/menu.png';
import closeIcon from '../assets/icons/close.png';
import logoImg from '../assets/images/logo.png';
import rightArrowIcon from '../assets/icons/arrow-right.png';

document.addEventListener('DOMContentLoaded', () => {
    // Set right arrow icon
    const rightArrow = document.querySelector('.right-arrow-icon');
    if (rightArrow) {
        rightArrow.src = rightArrowIcon;
    } else {
        console.error('Right arrow image not found');
    }

    // Set menu icon
    const menuImg = document.querySelector('.menu-img');
    if (menuImg) {
        menuImg.src = menuIcon;
    } else {
        console.error('Menu image not found');
    }

    // Set close icon
    const closeImg = document.querySelector('.close-img');
    if (closeImg) {
        closeImg.src = closeIcon;
    } else {
        console.error('Close image not found');
    }

    // Set logo image
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.src = logoImg;
    } else {
        console.error('Logo image not found');
    }
});