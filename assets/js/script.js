const body = document.querySelector('body')
const header = document.querySelector('header')
const myImage = document.querySelector('.image img')
const squareProjects = document.querySelectorAll('.square-project')
const showMoreDivs = document.querySelectorAll('.show-more')

// SHOW MORE DIVS
const showMoreBtn = document.querySelector('.show-more-button')
showMoreBtn.addEventListener('click', showProjects)

const showLessBtn = document.querySelector('.show-less-button')
showLessBtn.addEventListener('click', hideProjects)

function showProjects(){
    showMoreDivs.forEach(div => {
        div.classList.remove('hide')
        div.style.display = 'flex'
        div.style.flexDirection = 'column'
        div.style.justifyContent = 'center'
    });

    showMoreBtn.classList.add('hide')
    showLessBtn.classList.remove('hide')
}

// RESPONSIVE SETTINGS
function addOpacity(section){
    section.forEach(element => {
        element.style.opacity = 1
    });
}

function removeOpacity(section){
    section.forEach(element => {
        element.style.opacity = 0.3
    });
}

function responsiveEvents(){
    const menu = document.querySelector('.menu');
    const section =  document.querySelectorAll('section');
    const lis = document.querySelectorAll('.menu li')

    document.querySelector('.open-menu').addEventListener('click', e => {
        menu.classList.add('open');
        removeOpacity(section)

        lis.forEach(li => {
            li.addEventListener('click', e => {
                menu.classList.remove('open')
                addOpacity(section)
            })
        })
    });

    document.querySelector('.close-menu').addEventListener('click', e => {
        menu.classList.remove('open');
        addOpacity(section)
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

function hideProjects(){
    showMoreDivs.forEach(div => {
        div.classList.add('hide')
    });

    showMoreBtn.classList.remove('hide')
    showLessBtn.classList.add('hide')
}

function hideButtons(){
    showMoreBtn.classList.add('hide')
    showLessBtn.classList.add('hide')
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
    const allItems = [...document.querySelectorAll('.project'), ...squareProjects, ...document.querySelectorAll('.contact-box'), ...document.querySelectorAll('input')]
    const textarea = document.querySelector('textarea')
    const divPickedColor = document.querySelector('#picked-color')

    const colorItems = document.querySelectorAll('.dropdown-item')
    colorItems.forEach(colorItem => {
        colorItem.addEventListener('click', e => {
            const lightColor = e.target.dataset.light
            const darkColor = e.target.dataset.dark

            allItems.forEach(item => {
                item.style.backgroundColor = lightColor
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

    input.addEventListener('keyup', e => {

        if (e.target.value === ''){
            hideProjects()
            showMoreBtn.classList.remove('hide')
        } else {
            showProjects()
            hideButtons()
        }

        squareProjects.forEach(project => {
            if (!project.innerText.toLowerCase().includes(e.target.value.toLowerCase())){
                project.style.display = 'none'
            } else {
                project.style.display = 'flex'
            }
        })
    })
}

function initEvents(){
    responsiveEvents()
    scrollAnimation()
    imageAnimation()
    unavailableThings()
    initColorEvents()
    projectInput()
}

window.onload = initEvents()