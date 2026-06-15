/* =============================================
   RoadTrip Réunion — JS vanilla
   Menu mobile · Scroll reveal · FAQ · Form
   ============================================= */

(function () {
  'use strict';

  /* ===== HERO : SCROLL PINCÉ + ZOOM PARALLAX ===== */
  const heroSection    = document.querySelector('.hero');
  const heroImg        = document.querySelector('.hero__img');
  const heroOverlay    = document.querySelector('.hero__overlay');
  const heroScrollHint = document.querySelector('.hero__scroll-hint');
  const heroEls        = document.querySelectorAll('.js-hero-el');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (heroSection && !prefersReduced) {
    let ticking = false;

    const updateHero = () => {
      const scrollY   = window.scrollY;
      const heroH     = heroSection.offsetHeight;
      const viewportH = window.innerHeight;
      const ratio     = Math.max(0, Math.min(1, scrollY / (heroH - viewportH)));

      /* Overlay : transparent → plein (image passe de lumineuse à sombre) */
      if (heroOverlay) {
        heroOverlay.style.opacity = Math.min(ratio / 0.78, 1).toFixed(3);
      }

      /* Image : zoom progressif 1.0 → 1.15 */
      if (heroImg) {
        heroImg.style.transform = `scale(${1 + ratio * 0.15})`;
      }

      /* Révèle chaque élément selon son seuil */
      heroEls.forEach(el => {
        const threshold = parseFloat(el.dataset.threshold || 0);
        if (ratio >= threshold) {
          el.classList.add('revealed');
        }
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

    /* Premier appel pour l'état initial */
    updateHero();

  } else if (prefersReduced) {
    /* Sans animation : tout affiché d'emblée */
    heroEls.forEach(el => el.classList.add('revealed'));
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
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();


  /* ===== MENU MOBILE ===== */
  const burger = document.getElementById('navBurger');
  const menu   = document.getElementById('navMenu');
  const body   = document.body;
  let menuOpen = false;

  function openMenu() {
    menuOpen = true;
    menu.classList.add('open');
    menu.removeAttribute('aria-hidden');
    burger.classList.add('active');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Fermer le menu');
    body.style.overflow = 'hidden';
  }

  function closeMenu() {
    menuOpen = false;
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');
    burger.classList.remove('active');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Ouvrir le menu');
    body.style.overflow = '';
  }

  burger.addEventListener('click', () => {
    if (menuOpen) { closeMenu(); } else { openMenu(); }
  });

  /* Fermer le menu au clic sur un lien */
  const menuLinks = menu.querySelectorAll('.nav-menu__link');
  menuLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  /* Fermer avec Echap */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOpen) {
      closeMenu();
      burger.focus();
    }
  });


  /* ===== NAVIGATION : smooth scroll avec offset nav ===== */
  const anchors = document.querySelectorAll('a[href^="#"]');
  const NAV_OFFSET = 100;

  anchors.forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;

      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;

      window.scrollTo({
        top: Math.max(0, top),
        behavior: 'smooth'
      });
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

      /* Fermer tous les autres */
      faqItems.forEach(other => {
        if (other !== item) {
          other.classList.remove('active');
          const otherTrigger = other.querySelector('.faq-item__trigger');
          if (otherTrigger) {
            otherTrigger.setAttribute('aria-expanded', 'false');
          }
        }
      });

      /* Toggle courant */
      item.classList.toggle('active', !isOpen);
      trigger.setAttribute('aria-expanded', String(!isOpen));
    });
  });


  /* ===== FORMULAIRE DE CONTACT ===== */
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');

  if (form && success) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const submit = form.querySelector('.form-submit');
      submit.disabled = true;
      submit.textContent = 'Envoi en cours...';

      /* Simulation d'envoi (à remplacer par fetch vers votre API / service email) */
      setTimeout(() => {
        form.hidden = true;
        success.hidden = false;
        success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 1200);
    });

    /* Validation live email */
    const emailInput = form.querySelector('#email');
    if (emailInput) {
      emailInput.addEventListener('blur', () => {
        const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value);
        emailInput.setCustomValidity(valid || emailInput.value === '' ? '' : 'Adresse email invalide');
      });
    }

    /* Min date = aujourd'hui */
    const today = new Date().toISOString().split('T')[0];
    const dateDebut = form.querySelector('#date-debut');
    const dateFin   = form.querySelector('#date-fin');

    if (dateDebut) {
      dateDebut.min = today;
      dateDebut.addEventListener('change', () => {
        if (dateFin) {
          dateFin.min = dateDebut.value || today;
          if (dateFin.value && dateFin.value < dateDebut.value) {
            dateFin.value = '';
          }
        }
      });
    }
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
            const isActive = link.getAttribute('href') === `#${id}`;
            link.style.color      = isActive ? 'var(--accent)' : '';
            link.style.background = isActive ? 'var(--accent-light)' : '';
          });
        }
      });
    }, { threshold: 0.4 });

    sections.forEach(section => sectionObserver.observe(section));
  }

})();
