/* =============================================
   RoadTrip Réunion — JS vanilla
   Menu mobile · Scroll reveal · FAQ · Form
   ============================================= */

(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice  = window.matchMedia('(pointer: coarse)').matches;


  /* ===== HERO : SCROLL PINCÉ + CROSSFADE ===== */
  const heroSection    = document.querySelector('.hero');
  const heroImg1       = document.querySelector('.hero__img--1');
  const heroImg2       = document.querySelector('.hero__img--2');
  const heroImg3       = document.querySelector('.hero__img--3');
  const heroScrollHint = document.querySelector('.hero__scroll-hint');
  const heroEls        = document.querySelectorAll('.js-hero-el');

  if (heroSection) {
    if (!prefersReduced && !isTouchDevice) {
      let ticking = false;

      const updateHero = () => {
        const scrollY   = window.scrollY;
        const heroH     = heroSection.offsetHeight;
        const viewportH = window.innerHeight;
        const ratio     = Math.max(0, Math.min(1, scrollY / (heroH - viewportH)));

        /* 4 images, 3 transitions d'1/3 chacune */
        if (heroImg2) heroImg2.style.opacity = Math.max(0, 1 - ratio * 3).toFixed(3);
        if (heroImg1) heroImg1.style.opacity = Math.max(0, 1 - (ratio - 1/3) * 3).toFixed(3);
        if (heroImg3) heroImg3.style.opacity = Math.max(0, 1 - (ratio - 2/3) * 3).toFixed(3);

        /* Révèle chaque élément selon son seuil */
        heroEls.forEach(el => {
          const threshold = parseFloat(el.dataset.threshold || 0);
          if (ratio >= threshold) el.classList.add('revealed');
        });

        /* Cache le scroll-hint dès le début du scroll */
        if (heroScrollHint) {
          heroScrollHint.style.opacity = ratio > 0.02 ? '0' : '1';
        }

        ticking = false;
      };

      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(updateHero);
          ticking = true;
        }
      }, { passive: true });

      updateHero();

    } else {
      /* Touch ou reduced-motion : tout révélé d'emblée, pas de parallax */
      heroEls.forEach(el => el.classList.add('revealed'));
      if (heroScrollHint) heroScrollHint.style.opacity = '0';
    }
  }


  /* ===== SCROLL REVEAL (IntersectionObserver) ===== */
  const reveals = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    reveals.forEach(el => observer.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('visible'));
  }


  /* ===== NAV : scroll state ===== */
  const nav = document.getElementById('nav');

  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();


  /* ===== MENU MOBILE + FOCUS TRAP ===== */
  const burger   = document.getElementById('navBurger');
  const menu     = document.getElementById('navMenu');
  const mainEl   = document.getElementById('main-content');
  const footerEl = document.querySelector('.footer');
  const body     = document.body;
  let menuOpen   = false;

  function getFocusables() {
    return Array.from(menu.querySelectorAll('a[href], button, [tabindex]:not([tabindex="-1"])'));
  }

  function trapFocus(e) {
    if (e.key !== 'Tab') return;
    const focusables = getFocusables();
    if (!focusables.length) return;
    const first = focusables[0];
    const last  = focusables[focusables.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
    }
  }

  function openMenu() {
    menuOpen = true;
    menu.classList.add('open');
    menu.removeAttribute('aria-hidden');
    burger.classList.add('active');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Fermer le menu');
    body.style.overflow = 'hidden';
    if (mainEl)   mainEl.setAttribute('inert', '');
    if (footerEl) footerEl.setAttribute('inert', '');
    document.addEventListener('keydown', trapFocus);
    setTimeout(() => { const first = getFocusables()[0]; if (first) first.focus(); }, 50);
  }

  function closeMenu() {
    menuOpen = false;
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');
    burger.classList.remove('active');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Ouvrir le menu');
    body.style.overflow = '';
    if (mainEl)   mainEl.removeAttribute('inert');
    if (footerEl) footerEl.removeAttribute('inert');
    document.removeEventListener('keydown', trapFocus);
  }

  burger.addEventListener('click', () => { if (menuOpen) { closeMenu(); } else { openMenu(); } });

  menu.querySelectorAll('.nav-menu__link').forEach(link => {
    link.addEventListener('click', () => { closeMenu(); burger.focus(); });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOpen) { closeMenu(); burger.focus(); }
  });


  /* ===== NAVIGATION : smooth scroll avec offset nav ===== */
  const anchors    = document.querySelectorAll('a[href^="#"]');
  const NAV_OFFSET = 100;

  anchors.forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    });
  });


  /* ===== FAQ ACCORDION ===== */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-item__trigger');
    const answer  = item.querySelector('.faq-item__answer');
    if (!trigger || !answer) return;

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');

      faqItems.forEach(other => {
        if (other !== item) {
          other.classList.remove('active');
          const t = other.querySelector('.faq-item__trigger');
          if (t) t.setAttribute('aria-expanded', 'false');
        }
      });

      item.classList.toggle('active', !isOpen);
      trigger.setAttribute('aria-expanded', String(!isOpen));
    });
  });


  /* ===== FORMULAIRE DE CONTACT ===== */
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');

  if (form && success) {

    /* ---- Helpers validation inline ---- */
    function showError(input, message) {
      const el = document.getElementById(input.id + '-error');
      if (el) { el.textContent = message; el.hidden = false; }
      input.setAttribute('aria-invalid', 'true');
    }

    function clearError(input) {
      const el = document.getElementById(input.id + '-error');
      if (el) { el.textContent = ''; el.hidden = true; }
      input.removeAttribute('aria-invalid');
    }

    function getFieldError(input) {
      if (input.validity.valueMissing) return 'Ce champ est obligatoire.';
      if (input.type === 'email' && input.value &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
        return 'Adresse email invalide (ex: nom@exemple.com).';
      }
      if (input.validity.typeMismatch)   return 'Format invalide.';
      if (input.validity.rangeUnderflow) return 'La date doit être dans le futur.';
      if (input.validity.customError)    return input.validationMessage;
      return 'Valeur incorrecte.';
    }

    function validateField(input) {
      /* Email : custom check avant validity */
      if (input.type === 'email' && input.value &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
        showError(input, getFieldError(input));
        return false;
      }
      if (!input.validity.valid) {
        showError(input, getFieldError(input));
        return false;
      }
      clearError(input);
      return true;
    }

    /* Validation au blur sur chaque champ requis */
    form.querySelectorAll('[required]').forEach(field => {
      field.addEventListener('blur', () => validateField(field));
      /* Nettoyer l'erreur dès que le champ redevient valide */
      field.addEventListener('input', () => {
        if (field.validity.valid) clearError(field);
      });
    });

    /* Min date = aujourd'hui */
    const today     = new Date().toISOString().split('T')[0];
    const dateDebut = form.querySelector('#date-debut');
    const dateFin   = form.querySelector('#date-fin');

    if (dateDebut) {
      dateDebut.min = today;
      dateDebut.addEventListener('change', () => {
        if (dateFin) {
          dateFin.min = dateDebut.value || today;
          if (dateFin.value && dateFin.value < dateDebut.value) dateFin.value = '';
        }
      });
    }
    if (dateFin) dateFin.min = today;

    /* Submit avec validation complète */
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const requiredFields = Array.from(form.querySelectorAll('[required]'));
      let isValid = true;
      let firstInvalid = null;

      requiredFields.forEach(field => {
        if (!validateField(field)) {
          isValid = false;
          if (!firstInvalid) firstInvalid = field;
        }
      });

      if (!isValid) {
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const submit = form.querySelector('.form-submit');
      submit.disabled = true;
      submit.textContent = 'Envoi en cours…';

      /* Simulation d'envoi (à remplacer par fetch vers votre API) */
      setTimeout(() => {
        form.hidden = true;
        success.hidden = false;
        success.setAttribute('tabindex', '-1');
        success.focus();
        success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 1200);
    });
  }


  /* ===== ACTIVE NAV LINK au scroll ===== */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link');

  if (navLinks.length && sections.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    }, { threshold: 0.4 });

    sections.forEach(section => sectionObserver.observe(section));
  }

})();
