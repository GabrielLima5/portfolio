import { prefersReducedMotion } from '../utils/env.js';

/** Animates each [data-count] stat up to its target the first time it's visible. */
export function initCounters() {
    const nums = document.querySelectorAll('[data-count]');
    if (!nums.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const target = parseInt(el.dataset.count, 10);
            if (prefersReducedMotion) { el.textContent = target; observer.unobserve(el); return; }

            let current = 0;
            const duration = 1200;
            const startTime = performance.now();

            function step(now) {
                const progress = Math.min((now - startTime) / duration, 1);
                current = Math.floor(progress * target);
                el.textContent = current;
                if (progress < 1) requestAnimationFrame(step);
                else el.textContent = target;
            }
            requestAnimationFrame(step);
            observer.unobserve(el);
        });
    }, { threshold: 0.5 });

    nums.forEach((el) => observer.observe(el));
}
