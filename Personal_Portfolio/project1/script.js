// ===== Reveal on scroll =====
const revealTargets = document.querySelectorAll(
  '.about-content, .skill-card, .project, .contact-form, .contact-left, .hero-image-wrap',
);

revealTargets.forEach((el, i) => {
  el.classList.add('reveal');
  el.style.transitionDelay = `${(i % 3) * 0.08}s`;
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 },
);

revealTargets.forEach((el) => revealObserver.observe(el));

// ===== Animate skill progress bars =====
const progressBars = document.querySelectorAll('.progress');

const progressObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const width = bar.getAttribute('data-width');
        bar.style.width = width + '%';
        progressObserver.unobserve(bar);
      }
    });
  },
  { threshold: 0.4 },
);

progressBars.forEach((bar) => progressObserver.observe(bar));

// ===== Active nav link highlight on scroll =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.masthead-nav a');

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach((link) => {
          const isActive = link.getAttribute('href') === '#' + id;
          link.style.color = isActive ? 'var(--accent)' : '';
        });
      }
    });
  },
  { rootMargin: '-45% 0px -55% 0px' },
);

sections.forEach((section) => navObserver.observe(section));

// ===== Smooth scroll for older browsers (fallback) =====
navLinks.forEach((link) => {
  link.addEventListener('click', (e) => {
    const targetId = link.getAttribute('href');
    if (targetId && targetId.startsWith('#')) {
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });
});
