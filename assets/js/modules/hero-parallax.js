import { prefersReducedMotion } from '../utils/env.js';

/** Subtle multi-layer parallax as the hero scrolls away: the visual and the
 * copy drift at slightly different rates, on top of the visual's own 3D
 * tilt-on-hover — depth from two independent motions, not one. */
export function initHeroParallax() {
    if (prefersReducedMotion || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    const hero = document.getElementById('home');
    if (!hero) return;
    const visual = hero.querySelector('.hero__visual');
    const content = hero.querySelector('.hero__content');
    const trigger = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true };

    if (visual) gsap.to(visual, { y: 80, ease: 'none', scrollTrigger: trigger });
    if (content) gsap.to(content, { y: 32, ease: 'none', scrollTrigger: trigger });
}
