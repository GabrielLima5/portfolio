/**
 * Boot sequence: a quiet progress fill (real asset-load progress isn't worth
 * tracking for a page this light, so it's a smooth simulated ramp), then a
 * cross-fade into the page. No terminal log, no glitch — see the "premium,
 * not hacker-HUD" direction the rest of the site follows.
 */
export function initPreloader() {
    const body = document.body;
    const preloader = document.getElementById('preloader');
    const fill = document.getElementById('preloaderFill');
    const count = document.getElementById('preloaderCount');
    if (!preloader) return;

    let progress = 0;

    const interval = setInterval(() => {
        progress += Math.random() * 22 + 8;
        if (progress >= 100) progress = 100;

        fill.style.width = progress + '%';
        count.textContent = Math.floor(progress) + '%';

        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                preloader.classList.add('is-done');
                body.classList.remove('no-scroll');
                document.dispatchEvent(new CustomEvent('preloader:done'));
            }, 300);
        }
    }, 120);

    body.classList.add('no-scroll');

    // safety fallback in case something stalls
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (!preloader.classList.contains('is-done')) {
                clearInterval(interval);
                fill.style.width = '100%';
                count.textContent = '100%';
                preloader.classList.add('is-done');
                body.classList.remove('no-scroll');
            }
        }, 2200);
    });
}
