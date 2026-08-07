/**
 * Portuguese (default) dictionary. This is the source-of-truth language —
 * even though it mirrors what's already baked into index.html, i18n.js
 * applies it on every load (not just when English is active) so the
 * dictionary, not the HTML, is the single source of truth going forward.
 *
 * Nested by section for readability; assets/js/modules/i18n.js flattens
 * dot-paths like "hero.desc" into this tree via a simple reduce.
 */
export default {
    meta: {
        title: 'Gabriel Lima — Desenvolvedor Fullstack',
        description: 'Gabriel Lima — Desenvolvedor Fullstack. Interfaces que encantam, back-ends que sustentam. Confira projetos, stack e formas de contato.',
        ogTitle: 'Gabriel Lima — Desenvolvedor Fullstack',
        ogDescription: 'Transformo ideias em produtos digitais completos — do primeiro wireframe ao deploy em produção.'
    },

    skip: { link: 'Ir para o conteúdo' },

    nav: {
        aria: 'Navegação principal',
        ariaMobile: 'Navegação mobile',
        ariaDots: 'Navegação por seções',
        about: 'Sobre',
        aboutMobile: 'Sobre mim',
        projects: 'Projetos',
        flightsim: 'Pilotar',
        flightsimBadge: 'novo',
        tour3d: 'Tour 3D',
        process: 'Processo',
        contact: 'Contato',
        downloadCv: 'Baixar CV'
    },

    dotnav: {
        home: 'Início',
        about: 'Sobre',
        projects: 'Projetos',
        flightsim: 'Pilotar',
        tour3d: 'Tour 3D',
        process: 'Processo',
        contact: 'Contato'
    },

    header: {
        themeAria: 'Escolher tema de cor',
        themeLabel: 'Tema',
        langAria: 'Mudar idioma do portfólio',
        hamburgerAria: 'Abrir menu'
    },

    hero: {
        status: 'Disponível para novos projetos',
        kicker: '// Olá, eu sou o',
        desc: 'Transformo ideias em produtos digitais completos — do primeiro wireframe ao deploy em produção. Código limpo na essência, experiência de outro mundo na entrega.',
        ctaProjects: 'Ver projetos',
        ctaCv: 'Baixar CV',
        statProjects: 'Projetos',
        statTech: 'Tecnologias',
        statYears: 'Anos de código',
        statCoffee: 'Xícaras de café',
        scrollCue: 'ROLE PARA EXPLORAR',
        roles: ['Desenvolvedor Fullstack.', 'Engenheiro de Software.', 'Criador de Interfaces.', 'Construtor de Ideias.']
    },

    about: {
        label: '// 01 — Sobre mim',
        title: 'Onde curiosidade encontra <span class="text-gradient">código.</span>',
        p1: 'Sou Gabriel, desenvolvedor fullstack de 20 anos movido por café, curiosidade e a obsessão saudável de deixar cada interface um pouco melhor do que encontrei.',
        p2: 'Minha jornada começou em <strong>outubro de 2022</strong>, com um curso de Lógica de Programação. Dali em diante, não parei mais: mergulhei de cabeça no ecossistema fullstack, testando linguagens, frameworks e ideias até encontrar meu próprio jeito de construir.',
        p3: 'Hoje, meu foco é simples: unir front-ends que encantam com back-ends que sustentam. Interface bonita sem uma base sólida não escala — e é nesse equilíbrio que gosto de trabalhar.',
        quote: '"Não escrevo só código. Escrevo experiências que as pessoas sentem vontade de usar de novo."',
        card1Title: 'Código limpo',
        card1Desc: 'Arquitetura pensada para durar, não só para funcionar hoje.',
        card2Title: 'Detalhe é tudo',
        card2Desc: 'A diferença entre bom e inesquecível está nos pixels que ninguém pede.',
        card3Title: 'Aprendizado contínuo',
        card3Desc: 'A tecnologia muda todos os dias — eu evoluo junto com ela.',
        photoAlt: 'Gabriel Lima apontando para as ferramentas que utiliza',
        photoTag: '// gabriel.exe — compilando ideias',
        toolsLabel: 'Ferramentas do dia a dia'
    },

    marquee: { label: 'Stack &amp; ferramentas' },

    projects: {
        label: '// 02 — Projetos',
        title: 'Ideias que saíram do papel <span class="text-gradient">(e do Figma).</span>',
        sub: 'Uma seleção dos projetos que mais me orgulham — do front ao back, do primeiro commit ao deploy.',
        featuredTag: 'Projeto em destaque',
        gabrielAirlinesDesc: 'Um site completo (e turbinado) de companhia aérea fictícia: reserva de passagens, frota de aeronaves e uma experiência de navegação pensada para lembrar uma companhia aérea de verdade.',
        gabjetsDesc: 'Uma concessionária virtual de jatos executivos, onde a experiência de comprar uma aeronave de última geração é tão suave quanto o próprio voo dela.',
        linkCode: 'Código',
        linkLive: 'Ao vivo',
        otherLabel: 'Mais experimentos &amp; projetos acadêmicos',
        searchPlaceholder: 'Buscar por nome ou tecnologia...',
        // nested (not flat typeAcademic/typePersonal) to match the
        // data-i18n="projects.type.academic"/"projects.type.personal"
        // dot-paths used on every proj-card__type badge in index.html.
        type: {
            academic: 'Projeto acadêmico',
            personal: 'Projeto pessoal'
        },
        noResults: '// Nenhum projeto encontrado para essa busca.',
        showMore: 'Mostrar mais projetos',
        showLess: 'Mostrar menos',

        // HALPTEC promoted to featured (see halptecDesc below), and the
        // academic/personal exercise projects not on Gabriel's "keep" list
        // were removed entirely rather than kept around unused.
        // HALPTEC and Secret Word promoted to featured (see their *Desc keys
        // below); Movies Library and Help Desk were dropped from the site
        // entirely per Gabriel's updated project list.
        halptecDesc: 'Uma landing page responsiva para a empresa HALPTEC Elétrica, desenvolvida utilizando HTML, CSS e JavaScript.',
        cleomoveisDesc: 'Site institucional para a loja de móveis Cléo Móveis, apresentando o catálogo e os canais de contato da loja.',
        secretWordDesc: 'Pequeno jogo de acertar palavras, um projeto que criei com React durante meu aprendizado da tecnologia.',
        voceEoBugTitle: 'Você é o bug',
        voceEoBugDesc: 'Um platformer 2D experimental onde os "bugs" não são falhas — são a sua principal ferramenta de progressão. O próprio jogo percebe isso, e não gosta.',
        voceEoBugAlt: 'Gameplay Você é o bug',
        numeroProibidoTitle: 'Número Proibido',
        numeroProibidoDesc: 'Jogo de puzzle web onde a regra do tabuleiro nunca é revelada. O jogador começa em uma célula e precisa chegar até a saída, mas alguns números são "perigosos" segundo uma regra secreta — descoberta apenas observando o que acontece a cada passo.',
        numeroProibidoAlt: 'Gameplay Número Proibido',

        other: {
            'clima-atual': { title: 'Clima Atual', desc: 'Uma aplicação onde o usuário insere o nome de sua cidade e recebe informações sobre o clima local.' },
            'crud-js': { title: 'CRUD JavaScript', desc: 'Projeto de gerenciamento de usuários desenvolvido durante o Curso Completo de JavaScript da Hcode Treinamentos.' },
            'relogio-classico': { title: 'Relógio Clássico', desc: 'Um projeto simples de Relógio Clássico desenvolvido com o framework Bootstrap e com a biblioteca jQuery.' },
            'calc-js': { title: 'Calculadora JavaScript', desc: 'Projeto de uma calculadora, desenvolvido durante o Curso Completo de JavaScript da Hcode Treinamentos.' },
            'flappy-bird': { title: 'Flappy Bird', desc: 'Um jogo cujo objetivo é não deixar o pássaro colidir com as barreiras.' },
            'tabuada': { title: 'Tabuada Hcode', desc: 'Projeto de Tabuada, que mostra o número multiplicado de 1 até 10, feito durante o Curso de HTML5 da Hcode Treinamentos.' }
        }
    },

    flight: {
        label: '// 03 — Modo piloto',
        title: 'Já <span class="text-gradient">pilotou</span> uma companhia aérea hoje?',
        sub: 'Antes de continuar rolando a página: assuma os controles da Gabriel Airlines por uns minutos. Colete tecnologias no ar, evite turbulência e tente bater seu recorde.',
        start: 'Iniciar decolagem',
        hint: 'Segure ↑ / Espaço, clique ou toque na tela para subir. Solte para descer.',
        hudPoints: 'PONTOS',
        hudBest: 'RECORDE',
        overlayTitle: 'Pouso forçado!',
        overlayScoreBefore: 'Você somou',
        overlayScoreAfter: 'pontos coletando tecnologia em pleno voo.',
        overlayBest: 'Recorde:',
        retry: 'Tentar de novo',
        seeLive: 'Ver Gabriel Airlines de verdade',
        footnote: '// easter egg construído em canvas puro — sem bibliotecas de jogo.'
    },

    tour3d: {
        label: '// 04 — Tour 3D',
        title: 'Prefere rodar pela <span class="text-gradient">cidade?</span>',
        sub: 'Um simulador de ônibus em 3D que dobra como tour guiado pelo portfólio: dirija pela cidade e encontre, em cada cruzamento, um projeto real deste site — screenshot, descrição, tecnologias e links pro código e pro site ao vivo.',
        tag: 'Easter egg',
        feat1: '7 projetos, um por cruzamento',
        feat2: 'Three.js — física escrita à mão, sem game engine',
        feat3: 'Funciona no teclado, mouse ou toque',
        start: 'Embarcar no tour',
        hint: 'Abre em uma nova aba — W/↑ acelera, A/D vira, mouse orbita a câmera.',
        footnote: '// construído com Three.js — sem physics engine, tudo escrito à mão.'
    },

    process: {
        label: '// 05 — Como eu trabalho',
        title: 'Do brief ao deploy, <span class="text-gradient">sem ruído.</span>',
        step1Title: 'Descoberta',
        step1Desc: 'Entendo o problema antes de abrir o editor de código. Sem isso, qualquer linha escrita é aposta.',
        step2Title: 'Design &amp; Arquitetura',
        step2Desc: 'Estruturo telas, fluxos e a arquitetura por trás — pensando em escala desde o primeiro componente.',
        step3Title: 'Desenvolvimento',
        step3Desc: 'Código limpo, componentizado e testado, unindo front-end e back-end em uma experiência coesa.',
        step4Title: 'Deploy &amp; Evolução',
        step4Desc: 'Publico, monitoro e itero. Um projeto bom nunca está 100% "pronto" — está sempre evoluindo.'
    },

    contact: {
        label: '// 06 — Contato',
        title: 'Vamos construir o <span class="text-gradient">próximo projeto</span> incrível?',
        sub: 'Estou disponível para novas oportunidades, freelas ou só para trocar uma ideia sobre tecnologia.',
        emailLabel: 'Email',
        copy: 'Copiar',
        copied: 'Copiado!',
        linkedinLabel: 'LinkedIn',
        githubLabel: 'GitHub',
        access: 'Acessar'
    },

    footer: {
        tagline: 'Feito com café ☕, código e uma pitada de CSS.',
        rights: 'Todos os direitos reservados.'
    },

    backToTop: { aria: 'Voltar ao topo' }
};
