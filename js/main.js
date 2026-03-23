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
     EMAILJS CONFIGURATION
     ============================================================
     Setup steps (takes ~10 minutes):
     1. Create free account at https://www.emailjs.com
     2. Add an Email Service (Gmail, Outlook, SMTP…) → copy the Service ID
     3. Create Template "notification" (company receives the client inquiry):
          To Email:  randdyfeliz@hotmail.com
          CC:        ranyelfeliz@hotmail.com, felizarnold@gmail.com
          Subject:   Nuevo contacto — {{from_name}} · 3S Website
          Variables used: {{from_name}}, {{from_email}}, {{company}},
                          {{phone}}, {{service}}, {{message}}
     4. Create Template "autoreply" (confirmation sent to the client):
          To Email: {{to_email}}
          Subject:  Recibimos su mensaje – System Shop Solutions 3S
          Variables used: {{to_name}}
     5. Copy your Public Key: Account → API Keys → Public Key
     6. Replace the four placeholder strings below with your real values
     ============================================================ */
  const EMAILJS_CONFIG = {
    publicKey:       'YOUR_PUBLIC_KEY',          // Account > API Keys
    serviceId:       'YOUR_SERVICE_ID',          // Email Services tab
    templateId:      'YOUR_TEMPLATE_ID',         // Notification template
    templateIdReply: 'YOUR_AUTOREPLY_TEMPLATE'   // Auto-reply template
  };

  /* ============================================================
     CONTACT FORM — VALIDATION + EMAIL DELIVERY (EmailJS)
     ============================================================ */
  const contactForm = document.querySelector('#contact-form');
  if (contactForm) {

    // Initialize EmailJS with the public key (safe to call even on other pages)
    if (typeof emailjs !== 'undefined') {
      emailjs.init({ publicKey: EMAILJS_CONFIG.publicKey });
    }

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // ── Client-side validation ──────────────────────────────
      const nameField  = this.querySelector('#f-name');
      const emailField = this.querySelector('#f-email');
      const msgField   = this.querySelector('#f-msg');
      const required   = [nameField, emailField, msgField];
      let valid = true;

      required.forEach(field => {
        if (!field.value.trim()) {
          field.style.borderColor = '#EF5350';
          valid = false;
        } else {
          field.style.borderColor = '';
        }
      });
      if (!valid) return;

      // ── Spinner state ────────────────────────────────────────
      const submitBtn = this.querySelector('[type="submit"]');
      const originalBtnHTML = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>&nbsp; Enviando...';
      submitBtn.disabled = true;

      // ── Build template params ────────────────────────────────
      const serviceSelect = this.querySelector('#f-service');
      const serviceLabel  = serviceSelect.options[serviceSelect.selectedIndex]?.text || 'No especificado';

      const notificationParams = {
        from_name: nameField.value.trim(),
        from_email: emailField.value.trim(),
        company:  (this.querySelector('#f-company')?.value.trim()) || 'No especificada',
        phone:    (this.querySelector('#f-phone')?.value.trim())   || 'No especificado',
        service:  serviceLabel,
        message:  msgField.value.trim()
      };

      const replyParams = {
        to_name:  nameField.value.trim(),
        to_email: emailField.value.trim()
      };

      // ── Send emails ──────────────────────────────────────────
      if (typeof emailjs === 'undefined') {
        // EmailJS SDK not loaded — show configuration warning in console
        console.warn('[3S Contact] EmailJS SDK not available. Make sure the CDN script is loaded and EMAILJS_CONFIG values are set.');
        showFormError();
        resetBtn();
        return;
      }

      emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, notificationParams)
        .then(() => {
          // Notification sent — now send auto-reply to client
          return emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateIdReply, replyParams);
        })
        .then(() => {
          showFormSuccess();
        })
        .catch(err => {
          console.error('[3S Contact] EmailJS error:', err);
          showFormError();
          resetBtn();
        });

      function showFormSuccess() {
        const successEl = document.querySelector('.form-success');
        if (successEl) {
          contactForm.style.display = 'none';
          successEl.style.display = 'block';
        }
      }

      function showFormError() {
        const errorEl = document.querySelector('.form-error');
        if (errorEl) {
          contactForm.style.display = 'none';
          errorEl.style.display = 'block';
        }
      }

      function resetBtn() {
        submitBtn.innerHTML = originalBtnHTML;
        submitBtn.disabled  = false;
      }
    });

    // Clear validation highlight on input
    contactForm.querySelectorAll('input, textarea').forEach(field => {
      field.addEventListener('input', () => { field.style.borderColor = ''; });
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
