import { prefersReducedMotion } from '../utils/env.js';

/**
 * Multi-layer parallax: each aurora blob drifts at a different rate as the
 * page scrolls, on top of its own idle drift/morph animation — the two
 * motions compose since one animates transform via CSS keyframes and the
 * other nudges the element's own translateY through a wrapping layer.
 */
export function initScrollParallax() {
    if (prefersReducedMotion) return;
    const layers = [
        { el: document.querySelector('.bg-aurora--a'), speed: 0.05 },
        { el: document.querySelector('.bg-aurora--b'), speed: -0.04 },
        { el: document.querySelector('.bg-aurora--c'), speed: 0.08 }
    ].filter((l) => l.el);
    if (!layers.length) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            const y = window.scrollY;
            layers.forEach((l) => { l.el.style.setProperty('--parallax-y', (y * l.speed) + 'px'); });
            ticking = false;
        });
    }, { passive: true });
}
