// DevLoft — Docs page navigation
document.addEventListener('DOMContentLoaded', () => {
    const docsLayout = document.getElementById('docsLayout');
    const mobileToggle = document.getElementById('mobileToggle');
    const navLinks = document.querySelectorAll('.docs-sidebar .nav-link');
    const sections = document.querySelectorAll('.docs-content section');

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
                    if (link.getAttribute('href') === '#' + entry.target.id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, { rootMargin: '-20% 0px -75% 0px', threshold: 0 });

    sections.forEach(section => observer.observe(section));

    // Smooth scroll + close mobile
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
            if (docsLayout.classList.contains('sidebar-open')) {
                docsLayout.classList.remove('sidebar-open');
            }
        });
    });
});
