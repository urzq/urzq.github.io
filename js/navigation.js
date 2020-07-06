const toggle = document.querySelector('.toggle');
const menu = document.querySelector('.menu');
const navigation = document.querySelector('nav');
const originalNavigationOffsetTop = navigation.offsetTop;

/* Show / Hide the menu */
function toggleMenu() {
    if (menu.classList.contains('active')) {
        menu.classList.remove('active')
        toggle.querySelector('a').querySelector('img').src = "feather_icon/menu.svg";
    } else {
        menu.classList.add('active')
        toggle.querySelector('a').querySelector('img').src = "feather_icon/x.svg";
    }
}

toggle.addEventListener('click', toggleMenu);

let items = document.querySelectorAll('#navigation .item');

debugger

for (item in items) {
    let ahref = items[item].querySelector('a');
    ahref.addEventListener('click', toggleMenu);
}
