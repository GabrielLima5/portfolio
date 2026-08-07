import { isFinePointer } from '../utils/env.js';

/**
 * Custom cursor: a dot that tracks the mouse 1:1, a ring that eases toward
 * it, and the CSS custom properties (--mx/--my) that drive the ambient
 * spotlight glow (components/cursor.css .cursor-spotlight).
 */
export function initCursor() {
    const html = document.documentElement;
    const body = document.body;

    if (!isFinePointer) { body.classList.add('using-touch'); return; }

    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    if (!dot || !ring) return;

    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
    let ringX = mouseX, ringY = mouseY;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
        html.style.setProperty('--mx', mouseX + 'px');
        html.style.setProperty('--my', mouseY + 'px');
        if (!body.classList.contains('spotlight-on')) body.classList.add('spotlight-on');
    }, { passive: true });

    function loop() {
        ringX += (mouseX - ringX) * 0.18;
        ringY += (mouseY - ringY) * 0.18;
        ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    document.querySelectorAll('[data-cursor="link"], a, button').forEach((el) => {
        el.addEventListener('mouseenter', () => ring.classList.add('is-link'));
        el.addEventListener('mouseleave', () => ring.classList.remove('is-link'));
    });

    document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });
}
