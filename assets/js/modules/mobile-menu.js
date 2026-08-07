/** Fullscreen mobile nav: hamburger toggle, link/Escape-to-close, scroll lock. */
export function initMobileMenu() {
    const body = document.body;
    const hamburger = document.getElementById('hamburger');
    const menu = document.getElementById('mobileMenu');
    if (!hamburger || !menu) return;

    function close() {
        hamburger.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
        menu.classList.remove('is-open');
        body.classList.remove('no-scroll');
    }

    hamburger.addEventListener('click', () => {
        const open = hamburger.classList.toggle('is-open');
        hamburger.setAttribute('aria-expanded', String(open));
        menu.classList.toggle('is-open', open);
        body.classList.toggle('no-scroll', open);
    });

    menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}
