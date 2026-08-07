import { prefersReducedMotion } from '../utils/env.js';

/** Spawns a short-lived energy ripple at the click point of any .btn. */
export function initRipple() {
    if (prefersReducedMotion) return;
    document.querySelectorAll('.btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            const rect = btn.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height) * 1.8;
            const span = document.createElement('span');
            span.className = 'btn-ripple';
            span.style.width = span.style.height = size + 'px';
            span.style.left = (e.clientX - rect.left) + 'px';
            span.style.top = (e.clientY - rect.top) + 'px';
            btn.appendChild(span);
            span.addEventListener('animationend', () => span.remove());
        });
    });
}
