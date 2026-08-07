import { isFinePointer, prefersReducedMotion } from '../utils/env.js';

/** Buttons/links with .magnetic ease toward the cursor while hovered. */
export function initMagnetic() {
    if (!isFinePointer || prefersReducedMotion) return;
    document.querySelectorAll('.magnetic').forEach((el) => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            el.style.transform = `translate(${x * 0.28}px, ${y * 0.35}px)`;
        });
        el.addEventListener('mouseleave', () => { el.style.transform = 'translate(0, 0)'; });
    });
}

/** Elements with .tilt rotate in 3D following the cursor position. */
export function initTilt() {
    if (!isFinePointer || prefersReducedMotion) return;
    document.querySelectorAll('.tilt').forEach((el) => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const px = (e.clientX - rect.left) / rect.width;
            const py = (e.clientY - rect.top) / rect.height;
            const rx = (py - 0.5) * -10;
            const ry = (px - 0.5) * 10;
            el.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`;
        });
        el.addEventListener('mouseleave', () => {
            el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg)';
        });
    });
}

/** Holographic sheen: tracks the cursor position across cards via --mx-local/--my-local. */
export function initSheen() {
    if (!isFinePointer || prefersReducedMotion) return;
    const sel = '.proj-card, .philosophy-card, .timeline__card, .contact-box, .tech-chip, .featured-project__media';
    document.querySelectorAll(sel).forEach((el) => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            el.style.setProperty('--mx-local', ((e.clientX - rect.left) / rect.width) * 100 + '%');
            el.style.setProperty('--my-local', ((e.clientY - rect.top) / rect.height) * 100 + '%');
        });
    });
}
