/** "Other projects" grid: show more/less toggle + live search filter. */
export function initProjects() {
    const showMoreBtn = document.querySelector('.show-more-button');
    const showLessBtn = document.querySelector('.show-less-button');
    const showMoreCards = document.querySelectorAll('.proj-card.show-more');
    const allCards = document.querySelectorAll('.proj-card');
    const input = document.getElementById('projectInput');
    const noResults = document.getElementById('noResults');

    function showExtra() {
        showMoreCards.forEach((c) => c.classList.remove('hide'));
        showMoreBtn && showMoreBtn.classList.add('hide');
        showLessBtn && showLessBtn.classList.remove('hide');
    }
    function hideExtra() {
        showMoreCards.forEach((c) => c.classList.add('hide'));
        showMoreBtn && showMoreBtn.classList.remove('hide');
        showLessBtn && showLessBtn.classList.add('hide');
    }

    showMoreBtn && showMoreBtn.addEventListener('click', showExtra);
    showLessBtn && showLessBtn.addEventListener('click', () => {
        hideExtra();
        document.getElementById('initial-project')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    if (input) {
        input.addEventListener('input', () => {
            const query = input.value.trim().toLowerCase();

            if (query === '') {
                allCards.forEach((c) => { c.style.display = ''; });
                hideExtra();
                noResults && noResults.classList.add('hide');
                return;
            }

            showMoreBtn && showMoreBtn.classList.add('hide');
            showLessBtn && showLessBtn.classList.add('hide');

            let visibleCount = 0;
            allCards.forEach((card) => {
                card.classList.remove('hide');
                const match = card.innerText.toLowerCase().includes(query);
                card.style.display = match ? '' : 'none';
                if (match) visibleCount++;
            });

            noResults && noResults.classList.toggle('hide', visibleCount > 0);
        });
    }
}
