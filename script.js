/* ═══════════════════════════════════════════════════════
   SARANYA & ARIVAZHAGAN — ENGAGEMENT INVITATION
   script.js  |  All interactive & animation logic
   Cleaned up: no duplicate functions/listeners, debounced
   resize handling, cached DOM lookups, animations pause
   when the tab is hidden, panels cleaned up safely.
   ═══════════════════════════════════════════════════════

   ── MUSIC CONFIGURATION ──────────────────────────────
   Replace the path below with your audio file, drop the
   .mp3 into the project root (or /music/) and update:
     const MUSIC_URL = "neethanae.mp3";
   ──────────────────────────────────────────────────── */
const MUSIC_URL = 'neethanae.mp3';

/* ── Small shared utility: debounce ── */
function debounce(fn, wait = 150) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

const prefersReducedMotion =
  window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ══════════════════════════════════════════════════════
   1. ENTRANCE — GOLDEN SPARK PARTICLES
══════════════════════════════════════════════════════ */
(function initEntranceSparks() {
  const canvas = document.getElementById('entranceParticles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, sparks = [];
  let burstIntervalId = null;
  let rafId = null;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', debounce(resize, 150), { passive: true });

  function spawnBurst(x, y, count) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 2.5;
      sparks.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        life: 1,
        decay: 0.008 + Math.random() * 0.012,
        size: 1 + Math.random() * 3,
        hue: 38 + Math.random() * 20 // gold range
      });
    }
  }

  // Initial burst from center, then periodic ambient sparks
  const startTimeout = setTimeout(() => {
    spawnBurst(W / 2, H / 2, 80);
    burstIntervalId = setInterval(() => {
      const cx = W * 0.2 + Math.random() * W * 0.6;
      const cy = H * 0.2 + Math.random() * H * 0.5;
      spawnBurst(cx, cy, 6);
    }, 600);
  }, 100);

  function tick() {
    ctx.clearRect(0, 0, W, H);
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.x += s.vx;
      s.y += s.vy;
      s.vy += 0.04; // gravity
      s.vx *= 0.99;
      s.life -= s.decay;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${s.hue}, 85%, 65%, ${s.life})`;
      ctx.fill();

      // Tail trail
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - s.vx * 3, s.y - s.vy * 3);
      ctx.strokeStyle = `hsla(${s.hue}, 85%, 70%, ${s.life * 0.5})`;
      ctx.lineWidth = s.size * 0.5 * s.life;
      ctx.stroke();
    }
    rafId = requestAnimationFrame(tick);
  }
  rafId = requestAnimationFrame(tick);

  // Stop the loop once the entrance has fully transitioned away —
  // avoids a permanent rAF + canvas clear running for the whole visit.
  const entrance = document.getElementById('entrance');
  if (entrance) {
    entrance.addEventListener('transitionend', (e) => {
      if (e.target !== entrance) return;
      cancelAnimationFrame(rafId);
      clearInterval(burstIntervalId);
      clearTimeout(startTimeout);
    }, { once: true });
  }
})();

/* ══════════════════════════════════════════════════════
   2. BACKGROUND CANVAS — bokeh, light rays, hearts
══════════════════════════════════════════════════════ */
(function initBgCanvas() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;
  let bokeh = [], rays = [], hearts = [];
  let active = false;
  let isPageVisible = !document.hidden;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    if (active) buildBokeh();
  }
  resize();
  window.addEventListener('resize', debounce(resize, 150), { passive: true });

  // Pause the animation loop while the tab is hidden to save battery/CPU.
  document.addEventListener('visibilitychange', () => {
    isPageVisible = !document.hidden;
  });

  function buildBokeh() {
    bokeh = [];
    const count = Math.min(30, Math.floor((W * H) / 25000));
    for (let i = 0; i < count; i++) {
      bokeh.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 20 + Math.random() * 80,
        a: Math.random() * Math.PI * 2,
        speed: 0.0003 + Math.random() * 0.0005,
        alpha: 0.03 + Math.random() * 0.07,
        hue: Math.random() < 0.5 ? 38 : 340 // gold or rose
      });
    }
    rays = [];
    for (let i = 0; i < 5; i++) {
      rays.push({
        x: W * (0.2 + i * 0.15),
        angle: -Math.PI / 2 + (Math.random() - 0.5) * 0.5,
        alpha: 0.03 + Math.random() * 0.05,
        width: 80 + Math.random() * 160,
        phase: Math.random() * Math.PI * 2
      });
    }
    hearts = [];
    for (let i = 0; i < 8; i++) {
      hearts.push({
        x: Math.random() * W,
        y: H + 40,
        size: 8 + Math.random() * 16,
        speed: 0.3 + Math.random() * 0.5,
        drift: (Math.random() - 0.5) * 0.5,
        alpha: 0.5 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  function drawHeart(c, x, y, size) {
    c.save();
    c.translate(x, y);
    c.beginPath();
    c.moveTo(0, -size * 0.3);
    c.bezierCurveTo(size * 0.5, -size * 0.9, size * 1.0, size * 0.1, 0, size * 0.7);
    c.bezierCurveTo(-size * 1.0, size * 0.1, -size * 0.5, -size * 0.9, 0, -size * 0.3);
    c.closePath();
    c.restore();
  }

  let t = 0;
  function tick() {
    requestAnimationFrame(tick);
    if (!active || !isPageVisible) return;

    ctx.clearRect(0, 0, W, H);
    t += 0.016;

    // Bokeh circles
    for (const b of bokeh) {
      b.a += b.speed;
      const px = b.x + Math.cos(b.a) * 30;
      const py = b.y + Math.sin(b.a * 0.7) * 20;
      const grad = ctx.createRadialGradient(px, py, 0, px, py, b.r);
      grad.addColorStop(0, `hsla(${b.hue}, 70%, 70%, ${b.alpha})`);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(px - b.r, py - b.r, b.r * 2, b.r * 2);
    }

    // Light rays from top
    for (const ray of rays) {
      const pulse = Math.sin(t * 0.4 + ray.phase) * 0.015;
      ctx.save();
      ctx.translate(ray.x, 0);
      ctx.rotate(ray.angle);
      const rayGrad = ctx.createLinearGradient(0, 0, 0, H * 0.7);
      rayGrad.addColorStop(0, `rgba(200,169,110,${ray.alpha + pulse})`);
      rayGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = rayGrad;
      ctx.fillRect(-ray.width / 2, 0, ray.width, H * 0.7);
      ctx.restore();
    }

    // Floating hearts
    for (const h of hearts) {
      h.y -= h.speed;
      h.x += Math.sin(t * 0.8 + h.phase) * h.drift;
      if (h.y < -60) {
        h.y = H + 40;
        h.x = Math.random() * W;
      }
      ctx.save();
      ctx.globalAlpha = h.alpha * Math.abs(Math.sin(t * 0.5 + h.phase));
      drawHeart(ctx, h.x, h.y, h.size);
      const hGrad = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, h.size);
      hGrad.addColorStop(0, '#F0B8C8');
      hGrad.addColorStop(1, '#D4738A');
      ctx.fillStyle = hGrad;
      ctx.fill();
      ctx.restore();
    }
  }
  requestAnimationFrame(tick);

  // Exposed activation hook, called once the invitation opens.
  window.activateBgCanvas = function activateBgCanvas() {
    active = true;
    buildBokeh();
    canvas.classList.add('active');
  };
})();

/* ══════════════════════════════════════════════════════
   3. ENTRANCE — open invitation
══════════════════════════════════════════════════════ */
function openInvitation() {
  if (openInvitation._called) return; // prevent double-fire
  openInvitation._called = true;

  const entrance = document.getElementById('entrance');
  const main = document.getElementById('main');

  entrance.classList.add('hide');
  main.classList.add('show');

  // Stagger background activations so the entrance fade feels smooth
  // before heavier canvas/observer work begins.
  setTimeout(() => {
    if (window.activateBgCanvas) window.activateBgCanvas();
    spawnPetals();
    startCountdown();
    initScratch();
    observeFadeIns();
  }, 400);

  // Music
  const music = document.getElementById('bgMusic');
  music.src = MUSIC_URL;
  setTimeout(() => { music.play().catch(() => {}); }, 900);
}

(function setupEntranceTriggers() {
  const entrance = document.getElementById('entrance');
  const tapBtn = document.getElementById('tapBtn');
  if (!entrance) return;

  tapBtn?.addEventListener('click', openInvitation);
  entrance.addEventListener('click', (e) => {
    // Avoid double-triggering when the button itself was clicked
    if (e.target === tapBtn) return;
    openInvitation();
  });
  entrance.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openInvitation();
    }
  });
})();

/* ══════════════════════════════════════════════════════
   4. FLOATING PETALS
══════════════════════════════════════════════════════ */
function spawnPetals() {
  const container = document.getElementById('petalsContainer');
  if (!container) return;
  const emojis = ['🌸', '🌺', '✿', '❀', '🌼', '🌹', '🪷'];
  const MAX_PETALS = 20;

  function addPetal() {
    const p = document.createElement('div');
    p.className = 'petal';
    p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    p.style.left = Math.random() * 100 + 'vw';
    p.style.animationDuration = (9 + Math.random() * 12) + 's';
    p.style.animationDelay = (Math.random() * 4) + 's';
    p.style.fontSize = (0.8 + Math.random() * 1.0) + 'rem';
    p.style.setProperty('--drift', (Math.random() > 0.5 ? 1 : -1) * (20 + Math.random() * 60) + 'px');
    container.appendChild(p);
    // Recycle the petal after its animation completes to avoid DOM bloat.
    setTimeout(() => { p.remove(); addPetal(); }, (22 + Math.random() * 8) * 1000);
  }

  for (let i = 0; i < MAX_PETALS; i++) {
    setTimeout(addPetal, i * 280);
  }
}

/* ══════════════════════════════════════════════════════
   5. COUNTDOWN — rolling odometer-style digit scroller
   Architecture:
   • One setInterval at exactly 1000ms drives the time math.
   • Each unit (days/hours/mins/secs) is a row of digit reels,
     each reel a vertical strip of 0–9 inside a fixed-height
     window. Updating a digit just changes the strip's
     translateY — the CSS transition animates the roll.
   • Reels are built once; only their transform updates per tick.
══════════════════════════════════════════════════════ */
const TARGET_DATE = new Date('2026-07-12T18:00:00');

// How many digit reels each unit shows (days gets 3 for safety
// on long countdowns, the rest are always 2 digits).
const ODOMETER_DIGITS = { days: 3, hours: 2, mins: 2, secs: 2 };

// Track currently displayed values to avoid redundant DOM writes.
const cdCurrent = { days: -1, hours: -1, mins: -1, secs: -1 };

/**
 * Builds the digit-reel DOM for one odometer unit, once.
 * Each reel contains a .digit-strip with digits 0–9 stacked;
 * the strip's transform is what drives the rolling animation.
 */
function buildOdometer(unit) {
  const container = document.getElementById('od-' + unit);
  if (!container) return;
  const digitCount = ODOMETER_DIGITS[unit];

  container.innerHTML = '';
  for (let i = 0; i < digitCount; i++) {
    const reel = document.createElement('div');
    reel.className = 'digit-reel';

    const strip = document.createElement('div');
    strip.className = 'digit-strip';
    for (let d = 0; d <= 9; d++) {
      const digitEl = document.createElement('div');
      digitEl.className = 'digit';
      digitEl.textContent = String(d);
      strip.appendChild(digitEl);
    }

    reel.appendChild(strip);
    container.appendChild(reel);
  }
}

/**
 * Updates one odometer unit to a new numeric value by moving
 * each digit reel's strip to the matching position. Each strip
 * is 10 stacked digits tall, so shifting by `digit * 10%` of the
 * strip's own height moves it up by exactly one digit's worth.
 */
function setOdometerValue(unit, value) {
  const container = document.getElementById('od-' + unit);
  if (!container) return;
  const digitCount = ODOMETER_DIGITS[unit];
  const str = String(value).padStart(digitCount, '0');

  const strips = container.querySelectorAll('.digit-strip');
  strips.forEach((strip, i) => {
    const digit = Number(str[i]);
    strip.style.transform = `translateY(-${digit * 10}%)`;
  });
}

function startCountdown() {
  if (startCountdown._running) return; // prevent double-start
  startCountdown._running = true;

  const grid = document.getElementById('countdownGrid');
  if (!grid) return;

  // Build all four odometers once.
  Object.keys(ODOMETER_DIGITS).forEach(buildOdometer);

  const arrivedEl = document.createElement('p');
  arrivedEl.className = 'countdown-arrived';
  arrivedEl.textContent = 'Our Special Day Has Arrived ❤️';

  let intervalId;

  function update() {
    const diff = TARGET_DATE.getTime() - Date.now();

    if (diff <= 0) {
      grid.style.display = 'none';
      if (!arrivedEl.parentNode) grid.parentNode.appendChild(arrivedEl);
      clearInterval(intervalId);
      return;
    }

    const units = [
      { key: 'days', val: Math.floor(diff / 86400000) },
      { key: 'hours', val: Math.floor((diff % 86400000) / 3600000) },
      { key: 'mins', val: Math.floor((diff % 3600000) / 60000) },
      { key: 'secs', val: Math.floor((diff % 60000) / 1000) }
    ];

    units.forEach(({ key, val }) => {
      if (val === cdCurrent[key]) return;
      cdCurrent[key] = val;
      setOdometerValue(key, val);
    });
  }

  update(); // immediate first tick, sets initial reel positions
  intervalId = setInterval(update, 1000);
}

/* ══════════════════════════════════════════════════════
   6. SCRATCH CARD
══════════════════════════════════════════════════════ */
function initScratch() {
  const canvas = document.getElementById('scratchCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  // Gold foil overlay
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, '#7a5200');
  grad.addColorStop(0.3, '#C8A96E');
  grad.addColorStop(0.5, '#9A7240');
  grad.addColorStop(0.7, '#C8A96E');
  grad.addColorStop(1, '#7a5200');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Texture dots
  ctx.fillStyle = 'rgba(200,169,110,0.25)';
  for (let i = 0; i < 10; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * W, Math.random() * H, 8 + Math.random() * 18, 0, Math.PI * 2);
    ctx.fill();
  }

  // Instruction text
  ctx.fillStyle = '#3B2010';
  ctx.font = 'bold 13px serif';
  ctx.textAlign = 'center';
  ctx.fillText('✦ SCRATCH HERE ✦', W / 2, 42);
  ctx.font = '11px serif';
  ctx.fillText('Reveal the auspicious date', W / 2, 64);
  ctx.font = '10px serif';
  ctx.fillStyle = 'rgba(59,32,16,0.7)';
  ctx.fillText('(Touch & drag to scratch)', W / 2, 88);

  ctx.globalCompositeOperation = 'destination-out';

  let isDrawing = false;
  let scratched = 0;
  let revealed = false;
  const total = W * H;
  const REVEAL_THRESHOLD = 0.55;
  const scratchedMsg = document.getElementById('scratchedMsg');

  function getPos(e) {
    const r = canvas.getBoundingClientRect();
    const scaleX = W / r.width;
    const scaleY = H / r.height;
    const point = e.touches ? e.touches[0] : e;
    return {
      x: (point.clientX - r.left) * scaleX,
      y: (point.clientY - r.top) * scaleY
    };
  }

  function scratch(e) {
    if (!isDrawing || revealed) return;
    e.preventDefault();
    const p = getPos(e);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 26, 0, Math.PI * 2);
    ctx.fill();
    scratched += 1800;

    if (scratched > total * REVEAL_THRESHOLD) {
      revealed = true;
      setTimeout(() => {
        canvas.style.transition = 'opacity 0.6s ease';
        canvas.style.opacity = '0';
        setTimeout(() => { canvas.style.display = 'none'; }, 650);
      }, 100);
      if (scratchedMsg) scratchedMsg.style.display = 'block';
    }
  }

  function startScratch(e) { isDrawing = true; scratch(e); }
  function stopScratch() { isDrawing = false; }

  canvas.addEventListener('mousedown', startScratch);
  canvas.addEventListener('mousemove', scratch);
  canvas.addEventListener('mouseup', stopScratch);
  canvas.addEventListener('mouseleave', stopScratch);
  canvas.addEventListener('touchstart', startScratch, { passive: false });
  canvas.addEventListener('touchmove', scratch, { passive: false });
  canvas.addEventListener('touchend', stopScratch);
}

/* ══════════════════════════════════════════════════════
   7. SCROLL FADE-IN
══════════════════════════════════════════════════════ */
function observeFadeIns() {
  const targets = document.querySelectorAll('.fade-in');
  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // no need to keep watching once shown
      }
    });
  }, { threshold: 0.12 });
  targets.forEach((el) => observer.observe(el));
}

/* ══════════════════════════════════════════════════════
   8. MUSIC TOGGLE
══════════════════════════════════════════════════════ */
(function setupMusicPlayer() {
  const music = document.getElementById('bgMusic');
  const btn = document.getElementById('musicBtn');
  if (!music || !btn) return;

  let playing = false;

  function setPlayingUI(isPlaying) {
    playing = isPlaying;
    btn.textContent = isPlaying ? '⏸' : '🎵';
    btn.setAttribute('aria-label', isPlaying ? 'Pause background music' : 'Play background music');
    btn.setAttribute('aria-pressed', String(isPlaying));
  }

  function toggleMusic() {
    if (playing) {
      music.pause();
      return;
    }
    if (!music.src) music.src = MUSIC_URL;
    music.play().catch(() => {});
  }

  btn.addEventListener('click', toggleMusic);
  music.addEventListener('play', () => setPlayingUI(true));
  music.addEventListener('pause', () => setPlayingUI(false));
})();
