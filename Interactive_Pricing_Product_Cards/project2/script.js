document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;

  /* ---------- Ambient gold particles ---------- */
  const ambient = document.getElementById('ambient');
  if (ambient && !reduceMotion) {
    for (let i = 0; i < 12; i++) {
      const orb = document.createElement('span');
      orb.className = 'orb';
      const size = 30 + Math.random() * 90;
      orb.style.width = orb.style.height = size + 'px';
      orb.style.left = Math.random() * 100 + '%';
      orb.style.animationDuration = 20 + Math.random() * 22 + 's';
      orb.style.animationDelay = -Math.random() * 32 + 's';
      orb.style.setProperty('--drift', Math.random() * 110 - 55 + 'px');
      ambient.appendChild(orb);
    }
  }

  /* ---------- Scroll reveal for the editorial section ---------- */
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
      { threshold: 0.15 },
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Product images: fall back to a plain dark panel if a file is missing ---------- */
  document.querySelectorAll('.card__media img').forEach((img) => {
    const fail = () => img.parentElement.classList.add('no-img');
    img.addEventListener('error', fail);
    if (img.complete && img.naturalWidth === 0) fail();
  });

  /* ---------- Micro-interaction: wishlist heart toggle ---------- */
  document.querySelectorAll('.card__wishlist').forEach((btn) => {
    btn.addEventListener('click', () => {
      const liked = btn.getAttribute('aria-pressed') === 'true';
      btn.setAttribute('aria-pressed', String(!liked));
      btn.classList.toggle('is-liked', !liked);
    });
  });

  /* ---------- Pay in Full / Pay Monthly toggle ---------- */
  const cycleSwitch = document.getElementById('cycleSwitch');
  const monthlyLabel = document.querySelector('.cycle-label--monthly');
  const yearlyLabel = document.querySelector('.cycle-label--yearly');
  const amounts = document.querySelectorAll('.card__amount');
  const periods = document.querySelectorAll('.card__period');

  let isInstallment = false;

  cycleSwitch.addEventListener('click', () => {
    isInstallment = !isInstallment;
    cycleSwitch.setAttribute('aria-checked', String(isInstallment));
    monthlyLabel.classList.toggle('is-active', !isInstallment);
    yearlyLabel.classList.toggle('is-active', isInstallment);

    amounts.forEach((el) => {
      const price = isInstallment ? el.dataset.monthly : el.dataset.yearly;
      el.classList.add('is-swapping');
      window.setTimeout(() => {
        el.textContent = '$' + price;
        el.classList.remove('is-swapping');
      }, 160);
    });

    periods.forEach((el) => {
      el.textContent = isInstallment ? '/ mo for 12 months' : 'one-time';
    });
  });

  /* ---------- Category filter ---------- */
  const filterButtons = document.querySelectorAll('.filter-btn');
  const filterGroup = document.querySelector('.filter-group');
  const filterIndicator = document.getElementById('filterIndicator');
  const cards = document.querySelectorAll('.card');
  const emptyState = document.getElementById('emptyState');

  const moveIndicator = (btn) => {
    if (!filterIndicator || !btn) return;
    const groupRect = filterGroup.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    filterIndicator.style.width = btnRect.width + 'px';
    filterIndicator.style.transform = `translateX(${btnRect.left - groupRect.left - 4}px)`;
  };

  moveIndicator(document.querySelector('.filter-btn.is-active'));
  window.requestAnimationFrame(() =>
    moveIndicator(document.querySelector('.filter-btn.is-active')),
  );
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() =>
      moveIndicator(document.querySelector('.filter-btn.is-active')),
    );
  }
  window.addEventListener('resize', () =>
    moveIndicator(document.querySelector('.filter-btn.is-active')),
  );

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterButtons.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      moveIndicator(btn);

      const filter = btn.dataset.filter;
      let visibleCount = 0;

      cards.forEach((card) => {
        const matches = filter === 'all' || card.dataset.category === filter;

        if (matches) {
          visibleCount += 1;
          if (card.classList.contains('is-hidden')) {
            card.classList.remove('is-hidden');
            card.classList.add('is-entering');
            window.setTimeout(() => card.classList.remove('is-entering'), 400);
          }
        } else if (!card.classList.contains('is-hidden')) {
          card.classList.add('is-leaving');
          window.setTimeout(() => {
            card.classList.add('is-hidden');
            card.classList.remove('is-leaving');
          }, 220);
        }
      });

      emptyState.hidden = visibleCount !== 0;
    });
  });

  /* ---------- Micro-interaction: CTA click feedback (label swap + pop animation) ---------- */
  document.querySelectorAll('.card__cta').forEach((btn) => {
    btn.addEventListener('click', () => {
      const original = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Added \u2713';
      btn.classList.add('is-added');

      window.setTimeout(() => {
        btn.classList.remove('is-added');
      }, 350);

      window.setTimeout(() => {
        btn.textContent = original;
        btn.disabled = false;
      }, 1800);
    });
  });
});
