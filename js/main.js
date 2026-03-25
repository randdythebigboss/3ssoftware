/* ============================================================
   SYSTEM SHOP SOLUTIONS 3S — Main JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* ============================================================
     NAVBAR BEHAVIOR
     ============================================================ */
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    const isWhiteNav = navbar.classList.contains('white');

    function updateNav() {
      if (window.scrollY > 20) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav();
  }

  /* ============================================================
     ACTIVE NAV LINK
     ============================================================ */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .nav-mobile a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ============================================================
     MOBILE MENU
     ============================================================ */
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileMenu = document.querySelector('.nav-mobile');
  const mobileClose = document.querySelector('.nav-mobile-close');

  function openMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add('open');
    document.body.style.overflow = 'hidden';
    hamburger && hamburger.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
    hamburger && hamburger.setAttribute('aria-expanded', 'false');
  }

  hamburger && hamburger.addEventListener('click', openMenu);
  mobileClose && mobileClose.addEventListener('click', closeMenu);

  mobileMenu && mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on ESC
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });

  /* ============================================================
     SCROLL REVEAL ANIMATION (IntersectionObserver)
     ============================================================ */
  const revealEls = document.querySelectorAll(
    '.reveal, .reveal-left, .reveal-right'
  );

  if ('IntersectionObserver' in window && revealEls.length) {
    const revealObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealEls.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback: show all immediately
    revealEls.forEach(el => el.classList.add('visible'));
  }

  /* ============================================================
     ANIMATED COUNTER
     ============================================================ */
  function animateCounter(el, target, suffix) {
    const duration = 1800;
    const start = performance.now();
    const isNum = !isNaN(parseFloat(target));

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // ease-out-cubic

      if (isNum) {
        const current = Math.round(parseFloat(target) * ease);
        el.textContent = current + suffix;
      }

      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  // Observe metric cards to trigger counter animation
  const metricValues = document.querySelectorAll('.metric-value[data-target]');
  if (metricValues.length && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = el.dataset.target;
          const suffix = el.dataset.suffix || '';
          animateCounter(el, target, suffix);
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    metricValues.forEach(el => counterObserver.observe(el));
  }

  /* ============================================================
     HERO STAT COUNTERS
     ============================================================ */
  const heroStats = document.querySelectorAll('.hero-stat-value[data-target]');
  if (heroStats.length && 'IntersectionObserver' in window) {
    const heroObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          animateCounter(el, el.dataset.target, el.dataset.suffix || '');
          heroObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    heroStats.forEach(el => heroObserver.observe(el));
  }

  /* ============================================================
     LANGUAGE TOGGLE (delegated)
     ============================================================ */
  document.addEventListener('click', e => {
    const btn = e.target.closest('.lang-btn');
    if (btn && btn.dataset.lang) {
      toggleLang(btn.dataset.lang);
    }
  });

  /* ============================================================
     DASHBOARD CHART ANIMATION
     ============================================================ */
  const chartPath = document.querySelector('.dw-line-path');
  if (chartPath) {
    const length = chartPath.getTotalLength ? chartPath.getTotalLength() : 400;
    chartPath.style.strokeDasharray = length;
    chartPath.style.strokeDashoffset = length;

    setTimeout(() => {
      chartPath.style.transition = 'stroke-dashoffset 2s ease';
      chartPath.style.strokeDashoffset = '0';
    }, 800);
  }

  /* ============================================================
     CONTACT FORM — Cloudflare Worker via fetch
     ============================================================ */
  const contactForm = document.querySelector('#contactForm');

  if (contactForm) {
    const successEl   = document.querySelector('.form-success');
    const errorEl     = document.querySelector('.form-error');
    const submitBtn   = contactForm.querySelector('[type="submit"]');
    const submitLabel = submitBtn ? submitBtn.innerHTML : '';

    /* ── Validation ──────────────────────────────────────────── */
    const emailError = document.getElementById('f-email-error');

    function validateForm() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      let valid = true;

      const required = {
        'f-name':  contactForm.querySelector('#f-name'),
        'f-email': contactForm.querySelector('#f-email'),
        'f-msg':   contactForm.querySelector('#f-msg'),
      };

      Object.entries(required).forEach(([id, el]) => {
        if (!el) return;
        const val = el.value.trim();
        let ok = val.length > 0;
        if (id === 'f-email' && ok) ok = emailRegex.test(val);

        if (!ok) {
          el.style.borderColor = '#e53935';
          if (id === 'f-email' && emailError) emailError.style.display = 'block';
          valid = false;
        } else {
          el.style.borderColor = '';
          if (id === 'f-email' && emailError) emailError.style.display = 'none';
        }
      });

      return valid;
    }

    /* ── Submit handler ──────────────────────────────────────── */
    contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      if (!validateForm()) return;

      const sendingText = (typeof translations !== 'undefined' && translations['form.sending'])
        ? translations['form.sending'][currentLang] || 'Enviando...'
        : 'Enviando...';
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i>&nbsp; ${sendingText}`;
      submitBtn.disabled = true;

      const data = {
        name:    contactForm.querySelector('#f-name').value.trim(),
        email:   contactForm.querySelector('#f-email').value.trim(),
        phone:   contactForm.querySelector('#f-phone').value.trim(),
        company: contactForm.querySelector('#f-company').value.trim(),
        service: contactForm.querySelector('#f-service').value,
        message: contactForm.querySelector('#f-msg').value.trim(),
      };

      try {
        const res = await fetch('https://contact-form-handler.ing-randdy.workers.dev', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (res.ok) {
          contactForm.style.display = 'none';
          contactForm.reset();
          successEl.style.display = 'block';
          successEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
          throw new Error('Worker response not ok');
        }

      } catch (err) {
        contactForm.style.display = 'none';
        errorEl.style.display = 'block';
        errorEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });

    /* ── Retry button ────────────────────────────────────────── */
    const retryBtn = document.querySelector('.form-retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', function () {
        errorEl.style.display = 'none';
        contactForm.style.display = '';
        submitBtn.innerHTML = submitLabel;
        submitBtn.disabled = false;
        contactForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }

    /* ── Phone: strip non-phone characters ──────────────────── */
    const phoneField = contactForm.querySelector('#f-phone');
    if (phoneField) {
      phoneField.addEventListener('input', function () {
        const clean = this.value.replace(/[^0-9\s\+\-\(\)]/g, '');
        if (this.value !== clean) this.value = clean;
      });
    }

    /* ── Clear field highlight on input ─────────────────────── */
    contactForm.querySelectorAll('input, textarea').forEach(field => {
      field.addEventListener('input', () => {
        field.style.borderColor = '';
        if (field.id === 'f-email' && emailError) emailError.style.display = 'none';
      });
    });
  }

  /* ============================================================
     SMOOTH SCROLL FOR ANCHOR LINKS
     ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

})();
