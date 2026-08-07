import { prefersReducedMotion } from '../utils/env.js';
import { t } from './i18n.js';

/** Types/deletes each role in a loop under the hero name. Restarts cleanly
 *  from the new language's role list on an `i18n:change` event. */
export function initTypedRole() {
    const el = document.getElementById('typedRole');
    if (!el) return;

    let roles = t('hero.roles');
    let roleIndex = 0, charIndex = 0, deleting = false;
    let generation = 0; // bumped on language change so the in-flight setTimeout chain dies

    if (prefersReducedMotion) {
        el.textContent = roles[0];
        document.addEventListener('i18n:change', () => { el.textContent = t('hero.roles')[0]; });
        return;
    }

    function tick(myGen) {
        if (myGen !== generation) return; // a language change started a fresh chain — let this one die
        const current = roles[roleIndex];
        if (!deleting) {
            charIndex++;
            el.textContent = current.slice(0, charIndex);
            if (charIndex === current.length) {
                deleting = true;
                setTimeout(() => tick(myGen), 1800);
                return;
            }
        } else {
            charIndex--;
            el.textContent = current.slice(0, charIndex);
            if (charIndex === 0) {
                deleting = false;
                roleIndex = (roleIndex + 1) % roles.length;
            }
        }
        setTimeout(() => tick(myGen), deleting ? 35 : 55);
    }

    function restart() {
        generation++;
        roles = t('hero.roles');
        roleIndex = 0; charIndex = 0; deleting = false;
        tick(generation);
    }

    tick(generation);
    document.addEventListener('i18n:change', restart);
}
