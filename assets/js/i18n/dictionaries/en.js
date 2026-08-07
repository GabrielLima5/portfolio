/**
 * English dictionary — same key tree as ./pt.js. Keep both files structurally
 * identical (same nesting, same leaf keys) so a missing translation is easy
 * to spot by diffing the two trees.
 */
export default {
    meta: {
        title: 'Gabriel Lima — Fullstack Developer',
        description: 'Gabriel Lima — Fullstack Developer. Interfaces that delight, back-ends that hold up. Check out projects, stack and ways to get in touch.',
        ogTitle: 'Gabriel Lima — Fullstack Developer',
        ogDescription: 'I turn ideas into complete digital products — from the first wireframe to production deploy.'
    },

    skip: { link: 'Skip to content' },

    nav: {
        aria: 'Main navigation',
        ariaMobile: 'Mobile navigation',
        ariaDots: 'Section navigation',
        about: 'About',
        aboutMobile: 'About me',
        projects: 'Projects',
        flightsim: 'Fly',
        flightsimBadge: 'new',
        process: 'Process',
        contact: 'Contact',
        downloadCv: 'Download CV'
    },

    dotnav: {
        home: 'Home',
        about: 'About',
        projects: 'Projects',
        flightsim: 'Fly',
        process: 'Process',
        contact: 'Contact'
    },

    header: {
        themeAria: 'Choose color theme',
        themeLabel: 'Theme',
        langAria: 'Change portfolio language',
        hamburgerAria: 'Open menu'
    },

    hero: {
        status: 'Available for new projects',
        kicker: "// Hey, I'm",
        desc: 'I turn ideas into complete digital products — from the first wireframe to production deploy. Clean code at the core, out-of-this-world experience in the delivery.',
        ctaProjects: 'View projects',
        ctaCv: 'Download CV',
        statProjects: 'Projects',
        statTech: 'Technologies',
        statYears: 'Years coding',
        statCoffee: 'Cups of coffee',
        scrollCue: 'SCROLL TO EXPLORE',
        roles: ['Fullstack Developer.', 'Software Engineer.', 'Interface Creator.', 'Idea Builder.']
    },

    about: {
        label: '// 01 — About me',
        title: 'Where curiosity meets <span class="text-gradient">code.</span>',
        p1: "I'm Gabriel, a 20-year-old fullstack developer fueled by coffee, curiosity, and a healthy obsession with leaving every interface a little better than I found it.",
        p2: 'My journey started in <strong>October 2022</strong>, with a Programming Logic course. From there I never stopped: I dove headfirst into the fullstack ecosystem, testing languages, frameworks and ideas until I found my own way of building things.',
        p3: 'Today my focus is simple: pairing front-ends that delight with back-ends that hold up. A beautiful interface without a solid foundation doesn\'t scale — and that balance is where I like to work.',
        quote: '"I don\'t just write code. I write experiences people want to come back to."',
        card1Title: 'Clean code',
        card1Desc: "Architecture built to last, not just to work for today.",
        card2Title: 'Detail is everything',
        card2Desc: 'The difference between good and unforgettable lives in the pixels nobody asked for.',
        card3Title: 'Continuous learning',
        card3Desc: 'Technology changes every day — I evolve right along with it.',
        photoAlt: 'Gabriel Lima pointing at the tools he uses',
        photoTag: '// gabriel.exe — compiling ideas',
        toolsLabel: 'Everyday tools'
    },

    marquee: { label: 'Stack &amp; tools' },

    projects: {
        label: '// 02 — Projects',
        title: 'Ideas that left the paper <span class="text-gradient">(and Figma).</span>',
        sub: 'A selection of the projects I\'m most proud of — front to back, first commit to deploy.',
        featuredTag: 'Featured project',
        gabrielAirlinesDesc: 'A full (and turbocharged) fictional airline website: flight booking, aircraft fleet, and a navigation experience designed to feel like a real airline.',
        gabjetsDesc: 'A virtual dealership for executive jets, where buying a state-of-the-art aircraft feels as smooth as the flight itself.',
        linkCode: 'Code',
        linkLive: 'Live',
        otherLabel: 'More experiments &amp; academic projects',
        searchPlaceholder: 'Search by name or technology...',
        // nested (not flat typeAcademic/typePersonal) to match the
        // data-i18n="projects.type.academic"/"projects.type.personal"
        // dot-paths used on every proj-card__type badge in index.html.
        type: {
            academic: 'Academic project',
            personal: 'Personal project'
        },
        noResults: '// No project found for this search.',
        showMore: 'Show more projects',
        showLess: 'Show less',

        // HALPTEC and Secret Word promoted to featured (see their *Desc keys
        // below); Movies Library and Help Desk were dropped from the site
        // entirely per Gabriel's updated project list.
        halptecDesc: 'A responsive landing page for the HALPTEC Elétrica company, built with HTML, CSS and JavaScript.',
        komapeDesc: 'Institutional website for the KOMAPE supermarket chain, showcasing the store, customer testimonials, and WhatsApp ordering.',
        cleomoveisDesc: 'Institutional website for the Cléo Móveis furniture store, presenting its catalog and contact channels.',
        secretWordDesc: 'A small word-guessing game, a project I built with React while learning the technology.',

        other: {
            'clima-atual': { title: 'Current Weather', desc: 'An app where the user enters their city name and gets local weather information back.' },
            'crud-js': { title: 'CRUD JavaScript', desc: 'A user-management project built during the Complete JavaScript course at Hcode Treinamentos.' },
            'relogio-classico': { title: 'Classic Clock', desc: 'A simple Classic Clock project built with the Bootstrap framework and the jQuery library.' },
            'calc-js': { title: 'JavaScript Calculator', desc: 'A calculator project built during the Complete JavaScript course at Hcode Treinamentos.' },
            'flappy-bird': { title: 'Flappy Bird', desc: "A game where the goal is to keep the bird from hitting the barriers." },
            'tabuada': { title: 'Multiplication Table — Hcode', desc: 'A multiplication-table project showing a number multiplied from 1 to 10, built during the HTML5 course at Hcode Treinamentos.' }
        }
    },

    flight: {
        label: '// 03 — Pilot mode',
        title: 'Ever <span class="text-gradient">piloted</span> an airline today?',
        sub: "Before you keep scrolling: take the controls of Gabriel Airlines for a few minutes. Collect tech in mid-air, dodge turbulence, and try to beat your record.",
        start: 'Start takeoff',
        hint: 'Hold ↑ / Space, click or tap the screen to climb. Release to fall.',
        hudPoints: 'POINTS',
        hudBest: 'BEST',
        overlayTitle: 'Forced landing!',
        overlayScoreBefore: 'You scored',
        overlayScoreAfter: 'points collecting tech mid-flight.',
        overlayBest: 'Best:',
        retry: 'Try again',
        seeLive: 'See the real Gabriel Airlines',
        footnote: '// easter egg built in pure canvas — no game libraries.'
    },

    process: {
        label: '// 04 — How I work',
        title: 'From brief to deploy, <span class="text-gradient">no noise.</span>',
        step1Title: 'Discovery',
        step1Desc: "I understand the problem before opening the code editor. Without that, every line written is a gamble.",
        step2Title: 'Design &amp; Architecture',
        step2Desc: 'I structure screens, flows and the architecture behind them — thinking about scale from the very first component.',
        step3Title: 'Development',
        step3Desc: 'Clean, componentized, tested code, bringing front-end and back-end together into one cohesive experience.',
        step4Title: 'Deploy &amp; Evolution',
        step4Desc: 'I ship, monitor and iterate. A good project is never 100% "done" — it\'s always evolving.'
    },

    contact: {
        label: '// 05 — Contact',
        title: 'Shall we build the <span class="text-gradient">next project</span> together?',
        sub: "I'm available for new opportunities, freelance work, or just to talk tech.",
        emailLabel: 'Email',
        copy: 'Copy',
        copied: 'Copied!',
        linkedinLabel: 'LinkedIn',
        githubLabel: 'GitHub',
        access: 'Visit'
    },

    footer: {
        tagline: 'Made with coffee ☕, code, and a pinch of CSS.',
        rights: 'All rights reserved.'
    },

    backToTop: { aria: 'Back to top' }
};
