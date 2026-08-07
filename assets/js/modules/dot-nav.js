/** Side dot-nav: highlights whichever section is currently centered in the viewport. */
export function initDotNav() {
    const items = document.querySelectorAll('.dot-nav__item');
    if (!items.length) return;
    const sections = Array.from(items).map((item) => document.getElementById(item.dataset.target)).filter(Boolean);
    if (!sections.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                items.forEach((item) => item.classList.toggle('is-active', item.dataset.target === entry.target.id));
            }
        });
    }, { rootMargin: '-45% 0px -45% 0px' });

    sections.forEach((s) => observer.observe(s));
}
