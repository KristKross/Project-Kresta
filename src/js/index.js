import rightArrowIcon from '../assets/icons/arrow-right.png';

document.addEventListener('DOMContentLoaded', () => {
    const rightArrow = document.querySelector('.right-arrow-icon');
    if (rightArrow) {
        rightArrow.src = rightArrowIcon;
    } else {
        console.error('Logo image not found');
    }
});