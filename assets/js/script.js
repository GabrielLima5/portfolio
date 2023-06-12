// RESPONSIVE SETTINGS
function responsiveEvents(){
    const menu = document.querySelector('.menu');
    const section =  document.querySelectorAll('section');

    document.querySelector('.open-menu').addEventListener('click', e => {
        menu.classList.add('open');
        section.forEach(element => {
            element.style.opacity = 0.3
        });
    });

    document.querySelector('.close-menu').addEventListener('click', e => {
        menu.classList.remove('open');
        section.forEach(element => {
            element.style.opacity = 1
        });
    });
}

// ANIMATION SETTINGS
function scrollAnimation(){

    const item = document.querySelectorAll('[data-animation]');

    setInterval(animationScroll = (element) => {
        let windowTop = window.pageYOffset + window.innerHeight * 0.85;
    
        item.forEach(item => {
            if (windowTop > item.offsetTop){
                item.classList.add('animate')
            }
        })
    }, 1000)

    window.addEventListener('scroll', animationScroll());
}

function imageAnimation(){
    const myImage = document.querySelector('.image img');

    myImage.addEventListener('mouseover', e => {
        myImage.src = 'assets/images/me-smile.png'
    });

    myImage.addEventListener('mouseleave', e => {
        myImage.src = 'assets/images/me.png'
    });
}

// UNAVAILABLE THINGS IN THE SITE
function comingSoonAlert(e){
    e.preventDefault()
    alert('Coming soon!')
}

function unavailableThings(){
    document.querySelectorAll('.coming-soon').forEach(element => {
        element.addEventListener('click', comingSoonAlert)
    });
}

// FORM SUBMIT
function formSubmit(){
    document.querySelector('form').addEventListener('submit', e => {
        e.preventDefault()
        alert('Formulário temporariamente indisponível. :(')
    });
}

// SHOW MORE DIVS
const showMoreBtn = document.querySelector('.show-more-button')
showMoreBtn.addEventListener('click', toggleShow)

const showLessBtn = document.querySelector('.show-less-button')
showLessBtn.addEventListener('click', toggleShow)

function toggleShow(){
    const divs = document.querySelectorAll('.show-more')
    divs.forEach(div => {
        div.classList.toggle('hide')
        div.style.display = 'flex'
        div.style.flexWrap = 'wrap'
        div.style.justifyContent = 'center'
        showMoreBtn.classList.toggle('hide')
        showLessBtn.classList.toggle('hide')
    })
}

// INVOKING FUNCTIONS
responsiveEvents()
scrollAnimation()
imageAnimation()
unavailableThings()
formSubmit()
