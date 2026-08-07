/**
 * Elements using the background-clip:text gradient trick (see .text-gradient
 * / .hero__title-fill in CSS). These get treated as one atomic reveal unit
 * instead of being split further — giving each of their inner words its own
 * GSAP-driven `transform` breaks the gradient clip in Chromium/WebKit the
 * moment there's more than one independently-transformed child underneath a
 * background-clip:text parent (confirmed: with a single word it can render
 * fine, but two+ words reliably vanish — so don't split any of them).
 */
const ATOMIC_SELECTOR = '.text-gradient, .hero__title-fill';

/**
 * splitWords(el) — wraps each whitespace-separated run of text inside `el`
 * with <span class="reveal-word">, recursing into plain wrapper elements
 * (so structure survives) but treating anything matching ATOMIC_SELECTOR as
 * a single indivisible word.
 *
 * Returns the created word spans in document order, ready for a GSAP
 * stagger. Idempotent-ish: safe to call once per element per page load.
 */
export function splitWords(el) {
    const words = [];

    function walk(node) {
        Array.from(node.childNodes).forEach((child) => {
            if (child.nodeType === Node.TEXT_NODE) {
                const text = child.textContent;
                if (!text || !text.trim()) return;
                const frag = document.createDocumentFragment();
                const parts = text.split(/(\s+)/); // keep whitespace tokens so spacing survives
                parts.forEach((part) => {
                    if (part === '') return;
                    if (/^\s+$/.test(part)) {
                        frag.appendChild(document.createTextNode(part));
                    } else {
                        const span = document.createElement('span');
                        span.className = 'reveal-word';
                        span.textContent = part;
                        frag.appendChild(span);
                        words.push(span);
                    }
                });
                node.replaceChild(frag, child);
            } else if (child.nodeType === Node.ELEMENT_NODE) {
                if (child.matches(ATOMIC_SELECTOR)) {
                    child.classList.add('reveal-word');
                    words.push(child);
                } else {
                    walk(child);
                }
            }
        });
    }

    walk(el);
    return words;
}
