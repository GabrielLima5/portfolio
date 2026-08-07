/** Fills the fixed top progress bar as the page scrolls. */
export function initScrollProgress() {
    const fill = document.getElementById('progressFill');
    if (!fill) return;
    function update() {
        const scrollTop = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const pct = max > 0 ? (scrollTop / max) * 100 : 0;
        fill.style.width = pct + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
}
