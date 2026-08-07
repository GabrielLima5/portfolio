/**
 * Skeleton loading: every <img class="skeleton-img"> shimmers until it has
 * actually finished loading, then cross-fades to the real picture. Handles
 * the already-cached case (img.complete on attach) as well as slow network
 * loads for the external project screenshots.
 */
export function initImageLoading() {
    document.querySelectorAll('img.skeleton-img').forEach((img) => {
        const reveal = () => img.classList.add('is-loaded');
        if (img.complete && img.naturalWidth > 0) {
            reveal();
        } else {
            img.addEventListener('load', reveal, { once: true });
            img.addEventListener('error', reveal, { once: true }); // don't leave a stuck skeleton on a broken image
        }
    });
}
