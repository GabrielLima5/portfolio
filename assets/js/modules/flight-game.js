import { prefersReducedMotion } from '../utils/env.js';

/**
 * Flight Simulator easter egg — canvas mini-game, no dependencies.
 * Hold ↑ / Space / click / touch to climb, release to fall.
 * Fly through tech badges (+10 pts), avoid turbulence, don't hit the ground.
 */
export function initFlightGame() {
    const html = document.documentElement;
    const stage = document.getElementById('runwayStage');
    const startBtn = document.getElementById('startFlightBtn');
    const gameWrap = document.getElementById('flightGame');
    const canvas = document.getElementById('flightCanvas');
    if (!stage || !startBtn || !gameWrap || !canvas) return;

    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('flightScore');
    const bestEl = document.getElementById('flightBest');
    const overlay = document.getElementById('flightOverlay');
    const finalScoreEl = document.getElementById('flightFinalScore');
    const overlayBestEl = document.getElementById('flightOverlayBest');
    const retryBtn = document.getElementById('retryFlightBtn');

    const BEST_KEY = 'gl-flight-best';
    const TECHS = [
        { label: 'HTML', color: '#e34f26' },
        { label: 'CSS', color: '#2965f1' },
        { label: 'JS', color: '#f7df1e' },
        { label: 'TS', color: '#3178c6' },
        { label: 'React', color: '#61dafb' },
        { label: 'Next', color: '#e5e7eb' },
        { label: 'Node', color: '#8cbf3d' },
        { label: 'Nest', color: '#e0234e' },
        { label: 'Ang', color: '#dd0031' },
        { label: 'BS', color: '#7952b3' }
    ];

    let best = parseInt(localStorage.getItem(BEST_KEY) || '0', 10) || 0;
    bestEl.textContent = best;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0, height = 0;
    let state = 'idle'; // idle | playing | gameover
    let plane, entities, score, distFrames, spawnTimer, speed, rafId, lastTime;
    let thrustActive = false;

    function accentColor() {
        return (getComputedStyle(html).getPropertyValue('--accent').trim()) || '#a855f7';
    }
    function accent2Color() {
        return (getComputedStyle(html).getPropertyValue('--accent-2').trim()) || '#ec4899';
    }
    function accentRgb() {
        return (getComputedStyle(html).getPropertyValue('--accent-rgb').trim()) || '168,85,247';
    }

    function resize() {
        const rect = canvas.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function reset() {
        resize();
        plane = { x: width * 0.16, y: height / 2, vy: 0, r: Math.max(9, height * 0.05) };
        entities = [];
        score = 0;
        distFrames = 0;
        spawnTimer = 65;
        scoreEl.textContent = '0';
    }

    function currentSpeed() {
        const base = width / 220;
        return Math.min(width / 70, base + score * (width / 6000));
    }

    function spawnEntity() {
        const margin = height * 0.16;
        const y = margin + Math.random() * (height - margin * 2);
        if (Math.random() < 0.32) {
            entities.push({ type: 'obstacle', x: width + 30, y, r: height * 0.075 });
        } else {
            const tech = TECHS[Math.floor(Math.random() * TECHS.length)];
            entities.push({ type: 'badge', x: width + 30, y, r: Math.max(14, height * 0.07), tech });
        }
    }

    function drawBackground(t) {
        const rgb = accentRgb();
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, '#05060a');
        grad.addColorStop(1, `rgba(${rgb}, .2)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = 'rgba(255,255,255,.05)';
        for (let i = 0; i < 5; i++) {
            const cx = ((t * 0.02 + i * 160) % (width + 160)) - 80;
            const cy = height * (0.15 + (i % 3) * 0.22);
            ctx.beginPath();
            ctx.ellipse(cx, cy, 42, 14, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.fillStyle = 'rgba(255,255,255,.06)';
        ctx.fillRect(0, height - 5, width, 5);
    }

    function drawPlane(now) {
        const u = plane.r * 1.15;
        const angle = Math.max(-0.45, Math.min(0.55, plane.vy * 0.07));
        const accent = accentColor();
        const accent2 = accent2Color();

        ctx.save();
        ctx.translate(plane.x, plane.y);
        ctx.rotate(angle);

        // engine glow / exhaust — flickers, flares brighter while climbing
        const flicker = 0.45 + Math.sin(now * 0.02) * 0.12 + (thrustActive ? 0.3 : 0);
        const exhaustLen = u * (thrustActive ? 1.5 : 0.85);
        const exhaustGrad = ctx.createRadialGradient(-u * 0.65, 0, 0, -u * 0.65 - exhaustLen, 0, exhaustLen);
        exhaustGrad.addColorStop(0, `rgba(255,255,255,${Math.min(0.75, flicker)})`);
        exhaustGrad.addColorStop(0.5, `rgba(${accentRgb()}, ${flicker * 0.5})`);
        exhaustGrad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = exhaustGrad;
        ctx.beginPath();
        ctx.ellipse(-u * 0.65 - exhaustLen * 0.35, 0, exhaustLen * 0.55, u * 0.26, 0, 0, Math.PI * 2);
        ctx.fill();

        // classic minimal "flight icon" dart — pointed nose, symmetric swept wings, back notch
        ctx.shadowColor = accent;
        ctx.shadowBlur = u * 0.85;
        const grad = ctx.createLinearGradient(-u, 0, u * 1.4, 0);
        grad.addColorStop(0, accent2);
        grad.addColorStop(1, accent);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(u * 1.4, 0);
        ctx.lineTo(-u * 0.95, -u * 0.92);
        ctx.lineTo(-u * 0.32, -u * 0.12);
        ctx.lineTo(-u * 0.6, 0);
        ctx.lineTo(-u * 0.32, u * 0.12);
        ctx.lineTo(-u * 0.95, u * 0.92);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.restore();
    }

    function drawEntities() {
        entities.forEach((e) => {
            if (e.type === 'obstacle') {
                ctx.fillStyle = 'rgba(148,163,184,.55)';
                [-1, 0, 1].forEach((i) => {
                    ctx.beginPath();
                    ctx.arc(e.x + i * e.r * 0.6, e.y + (i === 0 ? -e.r * 0.3 : e.r * 0.1), e.r * 0.62, 0, Math.PI * 2);
                    ctx.fill();
                });
            } else {
                ctx.beginPath();
                ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
                ctx.globalAlpha = 0.92;
                ctx.fillStyle = e.tech.color;
                ctx.fill();
                ctx.globalAlpha = 1;
                ctx.fillStyle = '#05060a';
                ctx.font = `700 ${Math.round(e.r * 0.55)}px 'JetBrains Mono', monospace`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(e.tech.label, e.x, e.y + 1);
            }
        });
    }

    function crash() {
        state = 'gameover';
        cancelAnimationFrame(rafId);
        const finalScore = score + Math.floor(distFrames / 6);
        best = Math.max(best, finalScore);
        localStorage.setItem(BEST_KEY, String(best));
        finalScoreEl.textContent = finalScore;
        overlayBestEl.textContent = best;
        bestEl.textContent = best;
        overlay.classList.remove('hide');
    }

    function loop(now) {
        if (state !== 'playing') return;
        if (!lastTime) lastTime = now;
        const dt = Math.min(2, (now - lastTime) / 16.67);
        lastTime = now;

        const graceEase = distFrames < 45 ? 0.15 : 1; // brief grace window right after takeoff
        const gravity = height * 0.00055 * graceEase * dt;
        const thrust = thrustActive ? -height * 0.0011 * dt : 0;
        const maxUp = -height * 0.012, maxDown = height * 0.014;
        plane.vy = Math.max(maxUp, Math.min(maxDown, plane.vy + gravity + thrust));
        plane.y += plane.vy * dt;

        if (plane.y - plane.r < 0) { plane.y = plane.r; plane.vy = 0; }
        if (plane.y + plane.r > height) { crash(); return; }

        spawnTimer -= dt;
        if (spawnTimer <= 0) {
            spawnEntity();
            spawnTimer = Math.max(32, 80 - score * 0.5);
        }

        speed = currentSpeed();
        for (let i = entities.length - 1; i >= 0; i--) {
            const e = entities[i];
            e.x -= speed * dt;
            const dx = e.x - plane.x, dy = e.y - plane.y;
            if (Math.sqrt(dx * dx + dy * dy) < e.r + plane.r) {
                if (e.type === 'obstacle') { crash(); return; }
                score += 10;
                entities.splice(i, 1);
                continue;
            }
            if (e.x < -60) entities.splice(i, 1);
        }

        distFrames += dt;
        scoreEl.textContent = String(score + Math.floor(distFrames / 6));

        drawBackground(now);
        drawEntities();
        drawPlane(now);

        rafId = requestAnimationFrame(loop);
    }

    function start() {
        state = 'playing';
        overlay.classList.add('hide');
        lastTime = 0;
        reset();
        rafId = requestAnimationFrame(loop);
    }

    function beginGameView() {
        stage.classList.add('hide');
        gameWrap.classList.remove('hide');
        start();
    }

    function launch() {
        stage.classList.add('is-launching');
        setTimeout(beginGameView, prefersReducedMotion ? 0 : 550);
    }

    function setThrust(v) { if (state === 'playing') thrustActive = v; }

    startBtn.addEventListener('click', launch);
    retryBtn.addEventListener('click', () => { overlay.classList.add('hide'); start(); });

    window.addEventListener('keydown', (e) => {
        if (!['Space', 'ArrowUp', 'KeyW'].includes(e.code)) return;
        if (state !== 'playing') return;
        const active = document.activeElement;
        if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return;
        e.preventDefault();
        setThrust(true);
    });
    window.addEventListener('keyup', (e) => {
        if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) setThrust(false);
    });

    canvas.addEventListener('mousedown', () => setThrust(true));
    window.addEventListener('mouseup', () => setThrust(false));
    canvas.addEventListener('mouseleave', () => setThrust(false));
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); setThrust(true); }, { passive: false });
    canvas.addEventListener('touchend', (e) => { e.preventDefault(); setThrust(false); }, { passive: false });
    window.addEventListener('blur', () => setThrust(false));

    window.addEventListener('resize', () => { if (!gameWrap.classList.contains('hide')) resize(); });
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) setThrust(false);
    });
}
