document.addEventListener('DOMContentLoaded', () => {
    const toggleIcon = document.querySelector('.svg-icon');
    const aside = document.querySelector('.aside-container');
    const gamblebox = document.querySelector('#casinohome');
    const gamblebox2 = document.querySelector('#basketball');
    const netslogo = document.getElementById("netslogo");

    toggleIcon.addEventListener('click', () => {
        aside.classList.toggle('expanded');
        gamblebox.classList.toggle('expanded');
        gamblebox2.classList.toggle('expanded');

        if (aside.classList.contains('expanded')) {
            netslogo.style.marginLeft = "300px";
        } else {
            netslogo.style.marginLeft = "0";
        }
    });
});