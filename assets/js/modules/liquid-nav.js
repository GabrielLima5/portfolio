import { isFinePointer } from '../utils/env.js';

/** Glides the .nav-liquid pill beneath whichever desktop nav link is hovered. */
export function initLiquidNav() {
    const nav = document.querySelector('.nav-desktop ul');
    const liquid = document.getElementById('navLiquid');
    if (!nav || !liquid || !isFinePointer) return;

    nav.querySelectorAll('a').forEach((a) => {
        a.addEventListener('mouseenter', () => {
            const rect = a.getBoundingClientRect();
            const navRect = nav.getBoundingClientRect();
            liquid.style.width = rect.width + 'px';
            liquid.style.transform = `translate(${rect.left - navRect.left}px, -50%)`;
            liquid.style.opacity = '1';
        });
    });
    nav.addEventListener('mouseleave', () => { liquid.style.opacity = '0'; });
}
