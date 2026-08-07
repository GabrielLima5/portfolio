/**
 * Theme switcher: 8 accent presets stored as [data-theme] on <html>,
 * persisted to localStorage. The hero/about photos are now fixed (a single
 * transparent portrait and pointing shot), so switching themes only ever
 * re-skins colors — no more per-theme photo swapping.
 */
export function initThemeSwitcher() {
    const html = document.documentElement;
    const toggle = document.getElementById('themeToggle');
    const panel = document.getElementById('themePanel');
    if (!toggle || !panel) return;

    const swatches = panel.querySelectorAll('.swatch');
    const saved = localStorage.getItem('gl-theme');
    if (saved) applyTheme(saved);
    markActive();

    function applyTheme(key) {
        html.setAttribute('data-theme', key);
        localStorage.setItem('gl-theme', key);
        markActive();
    }

    function markActive() {
        const current = html.getAttribute('data-theme') || 'purple';
        swatches.forEach((s) => s.classList.toggle('is-active', s.dataset.themeKey === current));
    }

    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const open = panel.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(open));
    });

    swatches.forEach((s) => {
        s.addEventListener('click', () => applyTheme(s.dataset.themeKey));
    });

    document.addEventListener('click', (e) => {
        if (!panel.contains(e.target) && !toggle.contains(e.target)) {
            panel.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
        }
    });
}
