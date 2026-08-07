import { prefersReducedMotion } from '../utils/env.js';

/**
 * Fixed-background particle network (canvas). Nodes drift, connect when
 * close, and get gently pushed by the cursor. Colored from the active
 * theme's --accent-rgb, so it re-skins with the theme switcher automatically.
 */
export function initParticles() {
    const html = document.documentElement;
    const canvas = document.getElementById('particles');
    if (!canvas || prefersReducedMotion) return;
    const ctx = canvas.getContext('2d');

    let width, height, particles, animationId;
    let mouse = { x: null, y: null };
    let running = true;

    function getAccentRGB() {
        const raw = getComputedStyle(html).getPropertyValue('--accent-rgb').trim();
        return raw || '168,85,247';
    }

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        const count = Math.round((width * height) / 16000);
        particles = Array.from({ length: Math.min(count, 110) }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.25,
            vy: (Math.random() - 0.5) * 0.25,
            r: Math.random() * 1.6 + 0.6
        }));
    }

    function step() {
        if (!running) return;
        ctx.clearRect(0, 0, width, height);
        const rgb = getAccentRGB();

        particles.forEach((p) => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;

            if (mouse.x !== null) {
                const dx = p.x - mouse.x, dy = p.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 140) {
                    p.x += dx / dist * 0.4;
                    p.y += dy / dist * 0.4;
                }
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${rgb}, .55)`;
            ctx.fill();
        });

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const a = particles[i], b = particles[j];
                const dx = a.x - b.x, dy = a.y - b.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 130) {
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.strokeStyle = `rgba(${rgb}, ${0.12 * (1 - dist / 130)})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }

        animationId = requestAnimationFrame(step);
    }

    window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', () => {
        running = !document.hidden;
        if (running) step();
        else cancelAnimationFrame(animationId);
    });

    resize();
    step();
}
