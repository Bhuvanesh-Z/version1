/* =========================================================================
   PREMIUM ENGAGEMENT INVITATION — SCRIPT
   Saranya & Arivazhagan | Vanilla ES6 | No Dependencies
   ========================================================================= */

(() => {
  'use strict';

  /* -----------------------------------------------------------------------
     CONFIG
     --------------------------------------------------------------------- */
  const CONFIG = {
    eventDate: new Date('2026-07-12T18:00:00'), // 12 July 2026, 6:00 PM
    particleCount: window.innerWidth < 600 ? 36 : 70,
    petalIntervalMs: 900,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
  };

  /* -----------------------------------------------------------------------
     UTILITIES
     --------------------------------------------------------------------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const pad2 = (n) => String(Math.max(0, n)).padStart(2, '0');
  const rand = (min, max) => Math.random() * (max - min) + min;

  /* -----------------------------------------------------------------------
     MODULE: TAP TO OPEN GATE
     --------------------------------------------------------------------- */
  const Gate = (() => {
    const gateEl = $('#gate');
    const tapBtn = $('#tapToOpen');
    const main = $('#main');
    const musicToggle = $('#musicToggle');

    function open() {
      AudioPlayer.play();

      gateEl.classList.add('is-closing');
      main.hidden = false;

      window.requestAnimationFrame(() => {
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
      });

      setTimeout(() => {
        gateEl.setAttribute('hidden', '');
        musicToggle.classList.add('is-visible');
        Reveal.refresh();
      }, 1050);
    }

    function init() {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';

      tapBtn.addEventListener('click', open, { once: true });
      tapBtn.addEventListener(
        'touchend',
        (e) => {
          e.preventDefault();
          open();
        },
        { once: true, passive: false }
      );
    }

    return { init };
  })();

  /* -----------------------------------------------------------------------
     MODULE: AUDIO PLAYER
     --------------------------------------------------------------------- */
  const AudioPlayer = (() => {
    const audio = $('#bgMusic');
    const toggleBtn = $('#musicToggle');
    let isPlaying = false;

    function play() {
      audio
        .play()
        .then(() => {
          isPlaying = true;
          toggleBtn.classList.remove('is-paused');
          toggleBtn.setAttribute('aria-pressed', 'true');
        })
        .catch(() => {
          isPlaying = false;
          toggleBtn.classList.add('is-paused');
          toggleBtn.setAttribute('aria-pressed', 'false');
        });
    }

    function pause() {
      audio.pause();
      isPlaying = false;
      toggleBtn.classList.add('is-paused');
      toggleBtn.setAttribute('aria-pressed', 'false');
    }

    function toggle() {
      isPlaying ? pause() : play();
    }

    function init() {
      toggleBtn.addEventListener('click', toggle);
    }

    return { init, play, pause, toggle };
  })();

  /* -----------------------------------------------------------------------
     MODULE: AMBIENT PARTICLES (CANVAS — GOLDEN DUST)
     --------------------------------------------------------------------- */
  const Particles = (() => {
    const canvas = $('#particleCanvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let width, height, rafId;

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    function createParticle() {
      return {
        x: rand(0, width),
        y: rand(0, height),
        r: rand(0.6, 2.2),
        baseAlpha: rand(0.15, 0.6),
        speedY: rand(-0.12, -0.4),
        speedX: rand(-0.08, 0.08),
        twinkleSpeed: rand(0.01, 0.03),
        twinklePhase: rand(0, Math.PI * 2)
      };
    }

    function init() {
      resize();
      particles = Array.from({ length: CONFIG.particleCount }, createParticle);
      window.addEventListener('resize', resize, { passive: true });
      if (!CONFIG.reducedMotion) loop();
    }

    function loop() {
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.y += p.speedY;
        p.x += p.speedX;
        p.twinklePhase += p.twinkleSpeed;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = rand(0, width);
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const alpha = p.baseAlpha * (0.5 + 0.5 * Math.sin(p.twinklePhase));

        ctx.beginPath();
        ctx.fillStyle = `rgba(243, 210, 139, ${alpha.toFixed(3)})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      rafId = requestAnimationFrame(loop);
    }

    return { init };
  })();

  /* -----------------------------------------------------------------------
     MODULE: FLOATING PETALS (DOM-BASED, LIGHTWEIGHT)
     --------------------------------------------------------------------- */
  const Petals = (() => {
    const layer = $('#petalLayer');
    let timerId;

    function spawn() {
      if (document.hidden) return;

      const petal = document.createElement('span');
      petal.className = 'petal';

      const left = rand(0, 100);
      const duration = rand(9, 16);
      const drift = rand(-80, 80);
      const size = rand(8, 16);
      const delay = rand(0, 0.6);

      petal.style.left = `${left}vw`;
      petal.style.width = `${size}px`;
      petal.style.height = `${size}px`;
      petal.style.setProperty('--drift', `${drift}px`);
      petal.style.animationDuration = `${duration}s`;
      petal.style.animationDelay = `${delay}s`;

      layer.appendChild(petal);

      setTimeout(() => petal.remove(), (duration + delay) * 1000 + 200);
    }

    function init() {
      if (CONFIG.reducedMotion) return;
      spawn();
      timerId = setInterval(spawn, CONFIG.petalIntervalMs);
    }

    return { init };
  })();

  /* -----------------------------------------------------------------------
     MODULE: GATE PARTICLES (SMALL BURST INSIDE TAP-TO-OPEN SCREEN)
     --------------------------------------------------------------------- */
  const GateParticles = (() => {
    const container = $('#gateParticles');

    function init() {
      if (CONFIG.reducedMotion) return;
      const count = window.innerWidth < 600 ? 24 : 42;

      for (let i = 0; i < count; i++) {
        const dot = document.createElement('span');
        const size = rand(2, 5);
        const left = rand(0, 100);
        const top = rand(0, 100);
        const duration = rand(4, 9);
        const delay = rand(0, 5);

        dot.style.position = 'absolute';
        dot.style.left = `${left}%`;
        dot.style.top = `${top}%`;
        dot.style.width = `${size}px`;
        dot.style.height = `${size}px`;
        dot.style.borderRadius = '50%';
        dot.style.background = 'rgba(243, 210, 139, 0.6)';
        dot.style.boxShadow = '0 0 6px rgba(243,210,139,0.8)';
        dot.style.opacity = '0';
        dot.style.animation = `gateDotFloat ${duration}s ease-in-out ${delay}s infinite`;

        container.appendChild(dot);
      }

      if (!document.getElementById('gateDotKeyframes')) {
        const style = document.createElement('style');
        style.id = 'gateDotKeyframes';
        style.textContent = `
          @keyframes gateDotFloat {
            0%   { opacity: 0; transform: translateY(0) scale(0.6); }
            20%  { opacity: 1; }
            80%  { opacity: 0.8; }
            100% { opacity: 0; transform: translateY(-60px) scale(1); }
          }
        `;
        document.head.appendChild(style);
      }
    }

    return { init };
  })();

  /* -----------------------------------------------------------------------
     MODULE: COUNTDOWN TIMER (NO FLICKER, RAF-SYNCED)
     --------------------------------------------------------------------- */
  const Countdown = (() => {
    const elDays = $('#cdDays');
    const elHours = $('#cdHours');
    const elMinutes = $('#cdMinutes');
    const elSeconds = $('#cdSeconds');
    let lastSecond = -1;
    let rafId;

    function tick() {
      const now = Date.now();
      const diff = Math.max(0, CONFIG.eventDate.getTime() - now);
      const totalSeconds = Math.floor(diff / 1000);

      if (totalSeconds !== lastSecond) {
        lastSecond = totalSeconds;

        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        elDays.textContent = pad2(days);
        elHours.textContent = pad2(hours);
        elMinutes.textContent = pad2(minutes);
        elSeconds.textContent = pad2(seconds);
      }

      rafId = requestAnimationFrame(tick);
    }

    function init() {
      tick();
    }

    return { init };
  })();

  /* -----------------------------------------------------------------------
     MODULE: SCROLL REVEAL (INTERSECTION OBSERVER)
     --------------------------------------------------------------------- */
  const Reveal = (() => {
    let observer;

    function applyDelays() {
      $$('[data-reveal]').forEach((el) => {
        const delay = el.getAttribute('data-delay') || 0;
        el.style.setProperty('--reveal-delay', delay);
      });
    }

    function onIntersect(entries) {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }

    function init() {
      applyDelays();

      if (!('IntersectionObserver' in window)) {
        $$('[data-reveal]').forEach((el) => el.classList.add('is-visible'));
        return;
      }

      observer = new IntersectionObserver(onIntersect, {
        threshold: 0.18,
        rootMargin: '0px 0px -60px 0px'
      });

      $$('[data-reveal]').forEach((el) => observer.observe(el));
    }

    function refresh() {
      // Re-trigger observation for elements already in viewport on open
      $$('[data-reveal]').forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add('is-visible');
          if (observer) observer.unobserve(el);
        }
      });
    }

    return { init, refresh };
  })();

  /* -----------------------------------------------------------------------
     MODULE: SMOOTH ANCHOR SCROLL
     --------------------------------------------------------------------- */
  const SmoothAnchors = (() => {
    function init() {
      $$('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (e) => {
          const targetId = link.getAttribute('href');
          if (targetId.length <= 1) return;
          const target = $(targetId);
          if (!target) return;

          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      });
    }
    return { init };
  })();

  /* -----------------------------------------------------------------------
     INIT — APP BOOTSTRAP
     --------------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    Gate.init();
    AudioPlayer.init();
    Particles.init();
    Petals.init();
    GateParticles.init();
    Countdown.init();
    Reveal.init();
    SmoothAnchors.init();
  });

})();