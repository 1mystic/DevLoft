// DevLoft — Main JS (animations, nav, shared)
document.addEventListener('DOMContentLoaded', function () {

    // --- Intersection Observer for fade-in animations ---
    const animatedEls = document.querySelectorAll('.anim-fade-in');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, { threshold: 0.1 });
    animatedEls.forEach(el => observer.observe(el));

    // --- Back to top ---
    const backBtn = document.querySelector('.back-to-top');
    if (backBtn) {
        backBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});
