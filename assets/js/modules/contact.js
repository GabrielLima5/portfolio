/** Copy-to-clipboard buttons, the back-to-top button, and the footer year. */
import { t } from './i18n.js';

export function initCopyButtons() {
    document.querySelectorAll('[data-copy]').forEach((btn) => {
        // read fresh from the DOM at click time (not once at init) so it
        // captures whatever language's "Copiar"/"Copy" label is showing.
        btn.addEventListener('click', async () => {
            const original = btn.innerHTML;
            try {
                await navigator.clipboard.writeText(btn.dataset.copy);
                btn.innerHTML = `${t('contact.copied')} <i class="fa-solid fa-check"></i>`;
                setTimeout(() => { btn.innerHTML = original; }, 1800);
            } catch (err) {
                /* clipboard unavailable — fail silently */
            }
        });
    });
}

export function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;
    window.addEventListener('scroll', () => {
        btn.classList.toggle('is-visible', window.scrollY > 500);
    }, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

export function initFooterYear() {
    const el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
}
