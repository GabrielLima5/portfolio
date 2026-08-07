import { prefersReducedMotion } from '../utils/env.js';
import { splitWords } from '../utils/split-text.js';

/**
 * Fades/slides every [data-animate] element in the first time it enters the
 * viewport, via GSAP ScrollTrigger.batch — elements that enter together
 * (a grid of cards, a row of stats) stagger automatically as one batch.
 * Falls back to plain visibility if GSAP failed to load (CDN blocked/offline).
 */
export function initScrollReveal() {
    const items = Array.from(document.querySelectorAll('[data-animate]'));
    if (!items.length) return;

    if (prefersReducedMotion || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        items.forEach((el) => { el.style.opacity = '1'; el.style.transform = 'none'; });
        return;
    }

    ScrollTrigger.batch(items, {
        start: 'top 88%',
        once: true,
        onEnter: (batch) => {
            // the CSS baseline ([data-animate="..."] in scroll-reveal.css) already set
            // each element's starting opacity/transform offset — GSAP reads that as the
            // implicit "from" state, so animating straight to the resting values is enough.
            gsap.to(batch, {
                opacity: 1, x: 0, y: 0, scale: 1,
                duration: 0.9, ease: 'power3.out', stagger: 0.06
            });
        }
    });
}

/**
 * Word-by-word headline reveal for [data-reveal="words"] elements (the hero
 * name + every section title). Splits into words, then staggers a
 * fade + rise + blur-focus in on scroll.
 */
export function initWordReveal() {
    const items = Array.from(document.querySelectorAll('[data-reveal="words"]'));
    if (!items.length) return;

    if (prefersReducedMotion || typeof gsap === 'undefined') {
        items.forEach((el) => { el.style.opacity = '1'; });
        return;
    }

    items.forEach((el) => {
        const words = splitWords(el);
        el.style.opacity = '1';
        gsap.set(words, { opacity: 0, y: 22, filter: 'blur(4px)' });

        // lighter blur + shorter duration than a generic fade — filter is one of the
        // pricier properties to animate, and this runs on every heading on the page,
        // often several at once while scrolling fast; keeping it brief keeps it snappy
        // even under load instead of leaving text visibly mid-fade for seconds.
        const play = () => gsap.to(words, {
            opacity: 1, y: 0, filter: 'blur(0px)',
            duration: 0.55, ease: 'power2.out', stagger: 0.035
        });

        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: play });
        } else {
            play();
        }
    });
}
