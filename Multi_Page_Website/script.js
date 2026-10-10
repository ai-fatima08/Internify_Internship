document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;

  /* ---------- Theme toggle ---------- */
  const themeToggle = document.getElementById('themeToggle');

  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('brewtiful-theme', theme);
    } catch (e) {}
  };

  themeToggle.addEventListener('click', () => {
    const current =
      document.documentElement.getAttribute('data-theme') === 'light'
        ? 'light'
        : 'dark';
    applyTheme(current === 'light' ? 'dark' : 'light');
  });

  /* ---------- Mobile hamburger menu (animated drawer) ---------- */
  const hamburger = document.getElementById('hamburger');
  const drawer = document.getElementById('navDrawer');

  const setMenu = (open) => {
    drawer.classList.toggle('is-open', open);
    hamburger.classList.toggle('is-open', open);
    hamburger.setAttribute('aria-expanded', String(open));
  };

  hamburger.addEventListener('click', () =>
    setMenu(!drawer.classList.contains('is-open')),
  );
  drawer
    .querySelectorAll('a')
    .forEach((link) => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMenu(false);
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 820) setMenu(false);
  });

  /* ---------- Header shadow on scroll ---------- */
  const header = document.querySelector('.site-header');
  const onScroll = () =>
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Warm bokeh lights floating up ---------- */
  const ambient = document.getElementById('ambient');
  if (ambient && !reduceMotion) {
    for (let i = 0; i < 14; i++) {
      const orb = document.createElement('span');
      orb.className = 'orb';
      const size = 40 + Math.random() * 110;
      orb.style.width = orb.style.height = size + 'px';
      orb.style.left = Math.random() * 100 + '%';
      orb.style.animationDuration = 18 + Math.random() * 20 + 's';
      orb.style.animationDelay = -Math.random() * 30 + 's';
      orb.style.setProperty('--drift', Math.random() * 120 - 60 + 'px');
      ambient.appendChild(orb);
    }
  }

  /* ---------- Soft light that follows the cursor ---------- */
  const glow = document.getElementById('cursorGlow');
  if (glow && !reduceMotion && window.matchMedia('(hover:hover)').matches) {
    let x = 0,
      y = 0,
      raf = null;
    window.addEventListener('mousemove', (e) => {
      x = e.clientX;
      y = e.clientY;
      glow.classList.add('is-on');
      if (!raf)
        raf = requestAnimationFrame(() => {
          glow.style.transform = `translate(${x}px, ${y}px)`;
          raf = null;
        });
    });
    document.addEventListener('mouseleave', () =>
      glow.classList.remove('is-on'),
    );
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Photos: if a file is missing, show the warm gradient instead of a broken icon ---------- */
  document.querySelectorAll('.media img').forEach((img) => {
    const fail = () => img.parentElement.classList.add('no-img');
    img.addEventListener('error', fail);
    if (img.complete && img.naturalWidth === 0) fail();
  });

  /* ---------- Hero video: respect reduced motion ---------- */
  const heroVideo = document.querySelector('.hero__video');
  if (heroVideo && reduceMotion) {
    heroVideo.removeAttribute('autoplay');
    heroVideo.pause();
  }

  /* ---------- Scroll progress bar ---------- */
  if (!reduceMotion) {
    const bar = document.createElement('div');
    bar.className = 'progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
    const upd = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
    };
    upd();
    window.addEventListener('scroll', upd, { passive: true });
  }

  /* ---------- 3D tilt on menu cards ---------- */
  if (!reduceMotion && window.matchMedia('(hover:hover)').matches) {
    document.querySelectorAll('.card').forEach((c) => {
      c.addEventListener('pointermove', (e) => {
        const r = c.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5,
          y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-6px)`;
      });
      c.addEventListener('pointerleave', () => {
        c.style.transform = '';
      });
    });
  }

  /* ---------- Logo: fall back to a letter if the image is missing ---------- */
  document.querySelectorAll('.nav__logo-mark img').forEach((img) => {
    const fail = () => {
      const p = img.parentElement;
      img.remove();
      p.classList.add('no-img');
    };
    img.addEventListener('error', fail);
    if (img.complete && img.naturalWidth === 0) fail();
  });

  /* ---------- Contact form validation ---------- */
  const form = document.getElementById('contactForm');
  if (!form) return;

  const nameField = document.getElementById('nameField');
  const emailField = document.getElementById('emailField');
  const messageField = document.getElementById('messageField');
  const status = document.getElementById('formStatus');

  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const messageInput = document.getElementById('message');

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const setError = (fieldEl, message) => {
    fieldEl.classList.remove('has-error');
    void fieldEl.offsetWidth; // restart shake animation
    fieldEl.classList.add('has-error');
    fieldEl.querySelector('.field__error').textContent = message;
  };

  const clearError = (fieldEl) => {
    fieldEl.classList.remove('has-error');
    fieldEl.querySelector('.field__error').textContent = '';
  };

  const validateName = () => {
    if (nameInput.value.trim().length < 2) {
      setError(nameField, 'Enter your name (at least 2 characters).');
      return false;
    }
    clearError(nameField);
    return true;
  };

  const validateEmail = () => {
    if (!emailPattern.test(emailInput.value.trim())) {
      setError(
        emailField,
        'Enter a valid email address, like name@example.com.',
      );
      return false;
    }
    clearError(emailField);
    return true;
  };

  const validateMessage = () => {
    if (messageInput.value.trim().length < 10) {
      setError(messageField, 'Say a little more, at least 10 characters.');
      return false;
    }
    clearError(messageField);
    return true;
  };

  nameInput.addEventListener('blur', validateName);
  emailInput.addEventListener('blur', validateEmail);
  messageInput.addEventListener('blur', validateMessage);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    status.classList.remove('is-success');
    status.textContent = '';

    const okName = validateName();
    const okEmail = validateEmail();
    const okMessage = validateMessage();

    if (okName && okEmail && okMessage) {
      form.reset();
      status.textContent =
        'Thanks, your message has been sent. We\u2019ll reply within a couple of days.';
      status.classList.add('is-success');
      status.setAttribute('tabindex', '-1');
      status.focus();
    } else {
      const firstInvalid = form.querySelector(
        '.has-error input, .has-error textarea',
      );
      if (firstInvalid) firstInvalid.focus();
    }
  });
});
