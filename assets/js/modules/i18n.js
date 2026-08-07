import pt from '../i18n/dictionaries/pt.js';
import en from '../i18n/dictionaries/en.js';

const DICTS = { pt, en };
const STORAGE_KEY = 'gl-lang';
const HTML_LANG = { pt: 'pt-br', en: 'en' };

let currentLang = 'pt';

/** dot-path lookup, e.g. t('about.card1Title') -> DICTS.pt.about.card1Title */
function lookup(dict, path) {
    return path.split('.').reduce((node, key) => (node == null ? undefined : node[key]), dict);
}

/** Translate a key in the current language. Falls back to the key itself
 *  (visibly wrong but never silently blank) if it's missing from the dict. */
export function t(key) {
    const value = lookup(DICTS[currentLang], key);
    return value === undefined ? key : value;
}

export function getLang() {
    return currentLang;
}

/** Applies every [data-i18n] / [data-i18n-attr] node in the document to the
 *  current language. Re-running this after the initial load (i.e. on a
 *  runtime language switch) intentionally does NOT re-run the word-splitting
 *  reveal animation for [data-reveal="words"] headings — it just swaps their
 *  text in place. Re-splitting already-revealed (or not-yet-revealed) words
 *  would mean re-registering ScrollTriggers that already fired `once`, and
 *  risks reintroducing the background-clip:text + multi-child invisible-text
 *  bug (see utils/split-text.js) the moment a heading gets split twice. An
 *  instant text swap is the correct, boring choice for a language toggle.
 */
function applyTranslations() {
    document.documentElement.setAttribute('lang', HTML_LANG[currentLang] || currentLang);

    document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.getAttribute('data-i18n');
        const value = t(key);
        if (el.hasAttribute('data-i18n-html')) {
            el.innerHTML = value;
        } else {
            el.textContent = value;
        }
    });

    document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
        el.getAttribute('data-i18n-attr').split(',').forEach((pair) => {
            const [attr, key] = pair.split(':').map((s) => s.trim());
            if (!attr || !key) return;
            el.setAttribute(attr, t(key));
        });
    });

    // <meta>/<title> aren't matched by querying for visible content, but they
    // use the exact same [data-i18n]/[data-i18n-attr] mechanism above already
    // (title via textContent, meta content via data-i18n-attr="content:...") —
    // nothing special needed here.

    document.querySelectorAll('[data-lang-active]').forEach((el) => {
        el.classList.toggle('is-active', el.getAttribute('data-lang-active') === currentLang);
    });

    // keep every switch instance (header + mobile menu) in sync — checked = EN.
    document.querySelectorAll('[data-lang-checkbox]').forEach((input) => {
        input.checked = currentLang === 'en';
    });
}

function dispatchChange() {
    document.dispatchEvent(new CustomEvent('i18n:change', { detail: { lang: currentLang } }));
}

/** [data-reveal="words"] headings keep their already-split .reveal-word spans
 *  set to opacity:1 the instant a scroll-triggered reveal has played (see
 *  modules/reveal.js). applyTranslations() above just overwrites their
 *  innerHTML with fresh, unsplit text on every call — fine visually (the
 *  parent's own opacity is already 1) for headings that have ALREADY played.
 *  For ones still waiting below the fold, the plain-text swap makes them pop
 *  in immediately instead of waiting for their scroll reveal. That's an
 *  acceptable, minor trade-off for a language toggle — not worth resurrecting
 *  ScrollTrigger re-registration complexity for.
 */
function setLang(lang) {
    if (!DICTS[lang] || lang === currentLang) return;
    currentLang = lang;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (err) { /* storage unavailable */ }
    applyTranslations();
    dispatchChange();
}

function wireToggle(root) {
    if (!root) return;
    root.querySelectorAll('[data-lang-checkbox]').forEach((input) => {
        input.addEventListener('change', () => setLang(input.checked ? 'en' : 'pt'));
    });
}

export function initI18n() {
    let saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (err) { /* storage unavailable */ }
    currentLang = DICTS[saved] ? saved : 'pt';

    applyTranslations();

    document.querySelectorAll('[data-lang-switcher]').forEach(wireToggle);
}
