/** Toggles the header's "scrolled" (compact, glassy) state past a small threshold. */
export function initHeaderScroll() {
    const header = document.getElementById('siteHeader');
    if (!header) return;
    function update() {
        header.classList.toggle('is-scrolled', window.scrollY > 30);
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
}
