import rightArrowIcon from '../assets/arrow-right.png';

document.addEventListener('DOMContentLoaded', () => {
    const rightArrow = document.querySelector('.sign-in-btn img');
    if (rightArrow) {
        rightArrowIcon.src = rightArrowIcon;
    } else {
        console.error('Logo image not found');
    }
});