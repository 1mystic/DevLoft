// DevLoft — Docs page navigation
document.addEventListener('DOMContentLoaded', () => {
    const docsLayout = document.getElementById('docsLayout');
    const mobileToggle = document.getElementById('mobileToggle');
    const navLinks = document.querySelectorAll('.docs-sidebar .nav-link');
    const sections = document.querySelectorAll('.docs-content section');
    const docsContent = document.querySelector('.docs-content');

    // Mobile toggle
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            docsLayout.classList.toggle('sidebar-open');
        });
    }

    // Active link on scroll
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('data-section') === entry.target.id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, { root: docsContent, rootMargin: '-20% 0px -75% 0px', threshold: 0 });

    sections.forEach(section => observer.observe(section));

    // Smooth scroll + close mobile
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            const target = document.getElementById(sectionId);
            if (target && docsContent) {
                docsContent.scrollTo({
                    top: target.offsetTop - docsContent.offsetTop,
                    behavior: 'smooth'
                });
            }
            if (docsLayout && docsLayout.classList.contains('sidebar-open')) {
                docsLayout.classList.remove('sidebar-open');
            }
        });
    });
});
