/**
 * Environment flags shared across modules.
 *
 * Computed once at import time — every module that imports these gets the
 * same values (ES modules are singletons), so we avoid re-querying
 * matchMedia() in a dozen different files.
 */

export const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
