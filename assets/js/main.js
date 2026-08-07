/**
 * GABRIEL LIMA — PORTFOLIO
 * Composition root. Each feature lives in its own module under modules/
 * (one cohesive responsibility, one exported init function); this file
 * just wires them together in the right order.
 *
 * Native ES modules — no bundler/build step. Deploy is still "commit the
 * files": modules are deferred and scoped by the browser for free. GSAP +
 * ScrollTrigger load beforehand via plain <script> tags in index.html (so
 * `gsap`/`ScrollTrigger` are ready as globals by the time this runs) —
 * every module that needs them checks `typeof gsap !== 'undefined'` first
 * and degrades to "just show the content" if the CDN was unreachable.
 * (Note: type="module" is subject to CORS when opened via file://, so this
 * only runs correctly when served over http(s) — GitHub Pages included.)
 */

import { initI18n } from './modules/i18n.js';
import { initPreloader } from './modules/preloader.js';
import { initCursor } from './modules/cursor.js';
import { initParticles } from './modules/particles.js';
import { initScrollProgress } from './modules/scroll-progress.js';
import { initHeaderScroll } from './modules/header-scroll.js';
import { initMobileMenu } from './modules/mobile-menu.js';
import { initThemeSwitcher } from './modules/theme-switcher.js';
import { initDotNav } from './modules/dot-nav.js';
import { initScrollReveal, initWordReveal } from './modules/reveal.js';
import { initTypedRole } from './modules/typed-role.js';
import { initCounters } from './modules/counters.js';
import { initMagnetic, initTilt, initSheen } from './modules/pointer-effects.js';
import { initLiquidNav } from './modules/liquid-nav.js';
import { initRipple } from './modules/ripple.js';
import { initScrollParallax } from './modules/scroll-parallax.js';
import { initHeroParallax } from './modules/hero-parallax.js';
import { initProcessStory } from './modules/process-story.js';
import { initImageLoading } from './modules/image-loading.js';
import { initProjects } from './modules/projects.js';
import { initFlightGame } from './modules/flight-game.js';
import { initCopyButtons, initBackToTop, initFooterYear } from './modules/contact.js';

function init() {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    // must run before initWordReveal/initScrollReveal below — the correct-
    // language text needs to already be in the DOM before headings get
    // split into .reveal-word spans, or the split would have to happen twice.
    initI18n();

    initPreloader();
    initCursor();
    initParticles();
    initImageLoading();
    initScrollProgress();
    initHeaderScroll();
    initMobileMenu();
    initThemeSwitcher();
    initDotNav();
    initWordReveal();
    initScrollReveal();
    initTypedRole();
    initCounters();
    initMagnetic();
    initTilt();
    initSheen();
    initLiquidNav();
    initRipple();
    initScrollParallax();
    initHeroParallax();
    initProcessStory();
    initProjects();
    initFlightGame();
    initCopyButtons();
    initBackToTop();
    initFooterYear();

    // layout can shift slightly as skeleton-loaded images resolve or fonts
    // swap in — keep every ScrollTrigger's start/end lined up with reality.
    if (typeof ScrollTrigger !== 'undefined') {
        window.addEventListener('load', () => ScrollTrigger.refresh());
        document.fonts?.ready?.then(() => ScrollTrigger.refresh());
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
