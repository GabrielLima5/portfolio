import { prefersReducedMotion } from '../utils/env.js';

/**
 * The "Como eu trabalho" timeline as a pinned scroll-story on wide viewports:
 * the section holds in place while its four steps (and the connecting line)
 * reveal in sequence as the user keeps scrolling. On narrow viewports —
 * where the timeline already stacks to one column — pinning a tall section
 * costs more than it gives, so it falls back to a plain staggered reveal.
 */
export function initProcessStory() {
    const section = document.getElementById('process');
    const steps = section ? Array.from(section.querySelectorAll('.timeline__step')) : [];
    const line = section ? section.querySelector('.timeline__line') : null;
    if (!section || !steps.length) return;

    if (prefersReducedMotion || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        gsap && gsap.set ? gsap.set(steps, { opacity: 1 }) : steps.forEach((s) => { s.style.opacity = '1'; });
        return;
    }

    const mm = gsap.matchMedia();

    mm.add('(min-width: 901px)', () => {
        gsap.set(steps, { opacity: 0, y: 70, scale: 0.94 });
        if (line) gsap.set(line, { scaleX: 0, transformOrigin: 'left center' });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: 'top top+=76',
                end: '+=100%',
                scrub: 0.6,
                pin: true,
                anticipatePin: 1
            }
        });

        if (line) tl.to(line, { scaleX: 1, duration: steps.length, ease: 'none' }, 0);
        steps.forEach((step, i) => {
            tl.to(step, { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power2.out' }, i * 0.95);
        });
    });

    mm.add('(max-width: 900px)', () => {
        gsap.set(steps, { opacity: 0, y: 36 });
        ScrollTrigger.batch(steps, {
            start: 'top 88%',
            once: true,
            onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08 })
        });
    });
}
