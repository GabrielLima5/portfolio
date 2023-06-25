const body = document.querySelector('body')
const header = document.querySelector('header')
const myImage = document.querySelector('.image img')
const squareProjects = document.querySelectorAll('.square-project')

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
    myImage.addEventListener('mouseover', e => {
        const smileColor = currentColor('smile')
        myImage.src = smileColor
    });

    myImage.addEventListener('mouseleave', e => {
        const normalColor = currentColor()
        myImage.src = normalColor
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
        div.style.flexDirection = 'column'
        div.style.justifyContent = 'center'
    });

    showMoreBtn.classList.toggle('hide')
    showLessBtn.classList.toggle('hide')
}

// COLOR CHANGING FUNCTIONS
function currentColor(smile = ''){
    let color = null
    const headerColor = getComputedStyle(header).getPropertyValue('background-color')
    switch(headerColor){
        case "rgb(3, 23, 109)":
            color = `assets/images/me-blue${smile}.png`
            break;

        case "rgb(32, 32, 32)":
            color = `assets/images/me-black${smile}.png`
            break;

        case "rgb(156, 0, 14)":
            color = `assets/images/me-red${smile}.png`
            break;

        case "rgb(210, 0, 205)":
            color = `assets/images/me-pink${smile}.png`
            break;

        case "rgb(17, 99, 0)":
            color = `assets/images/me-green${smile}.png`
            break;

        case "rgb(0, 86, 95)":
            color = `assets/images/me-aqua${smile}.png`
            break;

        case "rgb(166, 94, 0)":
            color = `assets/images/me-orange${smile}.png`
            break;

        case "rgb(66, 6, 66)":
        default:
            color = `assets/images/me-purple${smile}.png`
    }

    return color
}

function initColorEvents(){
    const projects = document.querySelectorAll('.project')
    const contactBoxes = document.querySelectorAll('.contact-box')
    const inputs = document.querySelectorAll('input')
    const textarea = document.querySelector('textarea')
    const divPickedColor = document.querySelector('#picked-color')

    const colorItems = document.querySelectorAll('.dropdown-item')
    colorItems.forEach(colorItem => {
        colorItem.addEventListener('click', e => {
            const lightColor = e.target.dataset.light
            const darkColor = e.target.dataset.dark

            projects.forEach(project => {
                project.style.backgroundColor = lightColor
            });

            squareProjects.forEach(squareProject => {
                squareProject.style.backgroundColor = lightColor
            });

            contactBoxes.forEach(contactBox => {
                contactBox.style.backgroundColor = lightColor
            });

            inputs.forEach(input => {
                input.style.backgroundColor = lightColor
            });

            body.style.backgroundColor = darkColor
            header.style.backgroundColor = lightColor
            textarea.style.backgroundColor = lightColor
            divPickedColor.style.backgroundColor = darkColor
            myImage.src = currentColor()
            imageAnimation()
        })
    })
}

// PROJECT INPUT FUNCTION
function projectInput(){
    const input = document.querySelector('.project-input')

    input.addEventListener('focus', e => {
        toggleShow()
    });

    input.addEventListener('blur', e => {
        toggleShow()
    });

    input.addEventListener('keyup', e => {
        squareProjects.forEach(project => {
            if (!project.innerText.toLowerCase().includes(e.target.value.toLowerCase())){
                project.style.display = 'none'
            } else {
                project.style.display = 'flex'
            }
        })
    })
}

// INVOKING FUNCTIONS
responsiveEvents()
scrollAnimation()
imageAnimation()
unavailableThings()
formSubmit()
initColorEvents()
projectInput()
