document.addEventListener('DOMContentLoaded', () => {
    const toggleIcon = document.querySelector('.svg-icon');
    const aside = document.querySelector('.aside-container');
    const asidenav = document.querySelector('.asidenav-container');
    const gamblebox = document.querySelector('#casinohome');
    const gamblebox2 = document.querySelector('#basketball');
    const netslogo = document.getElementById("netslogo");
    const intro = document.querySelector('.introduction');

    toggleIcon.addEventListener('click', () => {
        aside.classList.toggle('expanded');
        gamblebox.classList.toggle('expanded');
        gamblebox2.classList.toggle('expanded');
        intro.classList.toggle('shifted');

        if (aside.classList.contains('expanded')) {
            netslogo.style.marginLeft = "300px";
            asidenav.style.flexDirection = "row";
        } else {
            netslogo.style.marginLeft = "0";
            asidenav.style.flexDirection = "column";
        }
    });
});