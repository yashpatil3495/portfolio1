/* =========================================================
   NEW FEATURES — v5
   ========================================================= */

/* ─── 1. LIGHT / CREAM MODE TOGGLE ─── */
(function() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  const saved = localStorage.getItem('yp-theme');
  if (saved === 'light') { document.body.classList.add('light-mode'); btn.textContent = '🌙'; }
  btn.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-mode');
    btn.textContent = isLight ? '🌙' : '☀️';
    localStorage.setItem('yp-theme', isLight ? 'light' : 'dark');
    
  });
  
  btn.addEventListener('mouseenter', () => document.getElementById('cursor-ring')?.classList.add('grow'));
  btn.addEventListener('mouseleave', () => document.getElementById('cursor-ring')?.classList.remove('grow'));
})();

/* ─── 2. PROJECT FILTER BAR ─── */
(function() {
  const bar = document.getElementById('filter-bar');
  if (!bar) return;
  bar.querySelectorAll('.filter-btn').forEach(btn => {
    if (isPointerFine) {
      btn.addEventListener('mouseenter', () => document.getElementById('cursor-ring')?.classList.add('magnetic'));
      btn.addEventListener('mouseleave', () => document.getElementById('cursor-ring')?.classList.remove('magnetic'));
    }
    btn.addEventListener('click', () => {
      bar.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      const filter = btn.dataset.filter;
      document.querySelectorAll('.project-card').forEach(card => {
        const cat = card.dataset.category || '';
        if (filter === 'all' || cat === filter) {
          card.classList.remove('filtered-out');
        } else {
          card.classList.add('filtered-out');
        }
      });
    });
  });
})();

/* ─── 3. PROJECT MODAL / LIGHTBOX ─── */
function openModal(card) {
  try {
    const data = JSON.parse(card.dataset.modal);
    const modal = document.getElementById('project-modal');
    document.getElementById('modal-hero').style.background = data.gradient;
    document.getElementById('modal-emoji').textContent = data.emoji;
    document.getElementById('modal-cat').textContent = data.category;
    document.getElementById('modal-title').textContent = data.title;
    document.getElementById('modal-problem').textContent = data.problem;
    document.getElementById('modal-solution').textContent = data.solution;
    const tagsEl = document.getElementById('modal-tags');
    tagsEl.innerHTML = data.tags.map(t => `<span class="tech-tag">${t}</span>`).join('');
    document.getElementById('modal-links').innerHTML = `
      <a href="${data.live}" target="_blank" rel="noopener noreferrer" class="card-link primary magnetic" style="cursor:none;" data-label="Open">Live Demo ↗</a>
      <a href="${data.github}" target="_blank" rel="noopener noreferrer" class="card-link secondary magnetic" style="cursor:none;" data-label="Code">GitHub</a>
    `;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  } catch(e) { console.error('Modal error', e); }
}
function closeModal() {
  document.getElementById('project-modal')?.classList.remove('open');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ─── 4. SKILLS RADAR CHART ─── */
(function() {
  const canvas = document.getElementById('radar-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = 480, H = 480, cx = W/2, cy = H/2, R = 170;
  const skills = [
    { label: 'Frontend',    value: 0.92, color: '#e8a832' },
    { label: 'UI/UX',       value: 0.82, color: '#2abfb3' },
    { label: 'AI / ML',     value: 0.78, color: '#c94a2a' },
    { label: 'Backend',     value: 0.58, color: '#fad06e' },
    { label: 'Systems',     value: 0.72, color: '#9b7fe8' },
    { label: 'Creative Dev',value: 0.85, color: '#e8a832' },
  ];
  const N = skills.length;
  const step = (Math.PI * 2) / N;
  const offset = -Math.PI / 2;

  function polarX(i, r) { return cx + Math.cos(offset + i * step) * r; }
  function polarY(i, r) { return cy + Math.sin(offset + i * step) * r; }

  let animated = 0;
  const targetTime = 1600;
  let startTime = null;
  let started = false;

  function draw(progress) {
    ctx.clearRect(0, 0, W, H);

    // Grid rings
    for (let ring = 1; ring <= 5; ring++) {
      const r = (R / 5) * ring;
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        i === 0 ? ctx.moveTo(polarX(i, r), polarY(i, r))
                : ctx.lineTo(polarX(i, r), polarY(i, r));
      }
      ctx.closePath();
      ctx.strokeStyle = ring === 5 ? 'rgba(232,168,50,0.25)' : 'rgba(232,168,50,0.1)';
      ctx.lineWidth = ring === 5 ? 1.5 : 0.8;
      ctx.stroke();
    }

    // Spokes
    for (let i = 0; i < N; i++) {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(polarX(i, R), polarY(i, R));
      ctx.strokeStyle = 'rgba(232,168,50,0.15)';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    // Filled radar shape
    ctx.beginPath();
    skills.forEach((s, i) => {
      const r = s.value * R * progress;
      i === 0 ? ctx.moveTo(polarX(i, r), polarY(i, r))
              : ctx.lineTo(polarX(i, r), polarY(i, r));
    });
    ctx.closePath();
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
    grad.addColorStop(0, 'rgba(232,168,50,0.35)');
    grad.addColorStop(1, 'rgba(232,168,50,0.06)');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(232,168,50,0.7)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Dots & labels
    skills.forEach((s, i) => {
      const r = s.value * R * progress;
      const x = polarX(i, r), y = polarY(i, r);
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.shadowColor = s.color;
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Labels
      const lx = polarX(i, R + 28), ly = polarY(i, R + 28);
      ctx.fillStyle = 'rgba(240,230,204,0.85)';
      ctx.font = 'bold 11px "DM Mono", monospace';
      ctx.textAlign = lx < cx - 10 ? 'right' : lx > cx + 10 ? 'left' : 'center';
      ctx.textBaseline = ly < cy - 10 ? 'bottom' : ly > cy + 10 ? 'top' : 'middle';
      ctx.fillText(s.label, lx, ly);

      // Percent
      ctx.fillStyle = s.color;
      ctx.font = '9px "DM Mono", monospace';
      ctx.fillText(Math.round(s.value * 100 * progress) + '%', lx, ly + (ly < cy ? -13 : 13));
    });
  }

  function animate(ts) {
    if (!startTime) startTime = ts;
    const prog = Math.min((ts - startTime) / targetTime, 1);
    const ease = 1 - Math.pow(1 - prog, 3);
    draw(ease);
    if (prog < 1) requestAnimationFrame(animate);
  }

  // Trigger on scroll into view
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !started) {
        started = true;
        requestAnimationFrame(animate);
        obs.disconnect();
      }
    });
  }, { threshold: 0.3 });
  obs.observe(canvas);
  draw(0); // initial static
})();

/* ─── 5. ANIMATED CV DOWNLOAD BUTTON ─── */
function triggerCVDownload() {
  const btn = document.getElementById('cv-download-btn');
  if (!btn || btn.classList.contains('filling')) return;
  btn.classList.add('filling');
  btn.querySelector('.btn-cv-text').textContent = 'Preparing…';
  setTimeout(() => {
    btn.classList.remove('filling');
    btn.classList.add('done');
    btn.querySelector('.btn-cv-text').textContent = 'Downloaded! ✦';
    btn.querySelector('.btn-cv-icon').textContent = '✓';
    // Try to fetch the PDF first; if it's missing (404) fall back to the
    // live resume.html page so the button never silently fails.
    const pdfPath = 'assets/Yash_Patil_CV.pdf';
    fetch(pdfPath, { method: 'HEAD' })
      .then((res) => {
        if (res.ok) {
          const a = document.createElement('a');
          a.href = pdfPath;
          a.download = 'Yash_Patil_CV.pdf';
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.click();
        } else {
          // PDF not uploaded yet — open the dynamic resume page instead
          window.open('resume.html', '_blank', 'noopener,noreferrer');
        }
      })
      .catch(() => {
        window.open('resume.html', '_blank', 'noopener,noreferrer');
      });
    setTimeout(() => {
      btn.classList.remove('done');
      btn.querySelector('.btn-cv-text').textContent = 'Download CV';
      btn.querySelector('.btn-cv-icon').textContent = '↓';
    }, 3000);
  }, 2100);
}

/* ─── 6. CONTACT FORM — Inline validation (no alert()) ─── */
function clearFormErrors() {
  document.querySelectorAll('.form-input.error, .form-textarea.error').forEach(el => el.classList.remove('error'));
  document.querySelectorAll('.form-error').forEach(el => el.classList.remove('visible'));
}
function showFieldError(fieldId, errorId) {
  const field = document.getElementById(fieldId);
  const err = document.getElementById(errorId);
  if (field) field.classList.add('error');
  if (err) err.classList.add('visible');
  if (field) field.focus();
}

function submitContactForm() {
  const nameEl    = document.getElementById('cf-name');
  const emailEl   = document.getElementById('cf-email');
  const subjectEl = document.getElementById('cf-subject');
  const msgEl     = document.getElementById('cf-message');
  const btn       = document.getElementById('cf-submit');

  const name    = nameEl?.value.trim();
  const email   = emailEl?.value.trim();
  const subject = subjectEl?.value.trim();
  const message = msgEl?.value.trim();

  clearFormErrors();
  let hasError = false;

  if (!name) { showFieldError('cf-name', 'err-name'); hasError = true; }
  if (!email) { showFieldError('cf-email', 'err-email'); hasError = true; }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showFieldError('cf-email', 'err-email-invalid'); hasError = true; }
  if (!message) { showFieldError('cf-message', 'err-message'); hasError = true; }
  if (hasError) return;

  btn.disabled = true;
  btn.textContent = 'Sending…';

  // Formspree endpoint — domain-restrict this in your Formspree dashboard settings
  fetch('https://formspree.io/f/xpwzrlwv', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ name, email, subject, message })
  })
  .then(r => {
    if (!r.ok) throw new Error('Network response not ok');
    document.getElementById('contact-form-inner').style.display = 'none';
    document.getElementById('form-success').classList.add('show');
  })
  .catch(() => {
    // Graceful fallback: open mailto
    window.location.href = `mailto:yashpatil197@gmail.com?subject=${encodeURIComponent(subject || 'Portfolio Contact')}&body=${encodeURIComponent(`From: ${name} <${email}>\n\n${message}`)}`;
    btn.disabled = false;
    btn.textContent = 'Send Message ✦';
  });
}

/* ─── 7. GITHUB CONTRIBUTION HEATMAP (GitHub API) ─── */
(function() {
  const canvas = document.getElementById('gh-heatmap-canvas');
  if (!canvas) return;

  const USERNAME = 'yashpatil3495';
  const CACHE_KEY = 'yp_gh_heatmap_v3';
  const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

  const COLORS = [
    'rgba(232,168,50,0.06)',
    'rgba(232,168,50,0.28)',
    'rgba(232,168,50,0.52)',
    'rgba(232,168,50,0.76)',
    '#e8a832'
  ];

  function getLevel(count) {
    if (count === 0) return 0;
    if (count <= 3) return 1;
    if (count <= 9) return 2;
    if (count <= 19) return 3;
    return 4;
  }

  function drawHeatmap(weeks) {
    const W = canvas.offsetWidth || 728;
    canvas.width = W;
    canvas.height = 112;
    const ctx = canvas.getContext('2d');
    const WEEKS = weeks.length;
    const DAYS = 7;
    const cellW = (W - 12) / Math.max(WEEKS, 1);
    const cellH = (108 - 12) / DAYS;
    const gap = Math.max(2, cellW * 0.12);
    const rr = Math.max(2, cellW * 0.15);
    ctx.clearRect(0, 0, W, 120);

    weeks.forEach((week, w) => {
      const days = week.contributionDays || [];
      for (let d = 0; d < DAYS; d++) {
        const count = (days[d] && days[d].contributionCount) || 0;
        const level = getLevel(count);
        const x = 6 + w * cellW + gap / 2;
        const y = 6 + d * cellH + gap / 2;
        const cw = cellW - gap;
        const ch = cellH - gap;
        if (level >= 3) {
          ctx.shadowColor = level === 4 ? 'rgba(232,168,50,0.7)' : 'rgba(232,168,50,0.4)';
          ctx.shadowBlur = level === 4 ? 8 : 4;
        }
        ctx.fillStyle = COLORS[level];
        ctx.beginPath();
        ctx.roundRect(x, y, cw, ch, rr);
        ctx.fill();
        ctx.shadowBlur = 0;
        if (level === 0) {
          ctx.strokeStyle = 'rgba(232,168,50,0.10)';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    });

    const dayLabels = ['S','M','T','W','T','F','S'];
    ctx.fillStyle = 'rgba(138,125,101,0.7)';
    ctx.font = '8px "DM Mono", monospace';
    ctx.textAlign = 'right';
    for (let d = 1; d < DAYS; d += 2) {
      const y = 6 + d * cellH + cellH / 2 + 3;
      ctx.fillText(dayLabels[d], 5, y);
    }
  }

  function buildFallbackWeeks() {
    function seededRandom(seed) {
      let s = seed;
      return function() { s = (s * 1664525 + 1013904223) & 0xFFFFFFFF; return (s >>> 0) / 0xFFFFFFFF; };
    }
    const rand = seededRandom(197);
    const weeks = [];
    for (let w = 0; w < 52; w++) {
      const days = [];
      for (let d = 0; d < 7; d++) {
        let base = (d === 0 || d === 6) ? 0.15 : 0.45;
        const r = rand();
        if (w >= 8 && w <= 12) base += 0.3;
        if (w >= 22 && w <= 28) base += 0.35;
        const count = r < base ? 0 : r < base + 0.2 ? 2 : r < base + 0.35 ? 6 : r < base + 0.45 ? 14 : 25;
        days.push({ contributionCount: count });
      }
      weeks.push({ contributionDays: days });
    }
    return weeks;
  }

  let cachedWeeks = null;

  function redraw() {
    if (cachedWeeks) drawHeatmap(cachedWeeks);
    else drawHeatmap(buildFallbackWeeks());
  }

  async function fetchContributions() {
    // Try sessionStorage cache first
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (raw) {
        const { weeks, ts } = JSON.parse(raw);
        if (Date.now() - ts < CACHE_TTL) {
          cachedWeeks = weeks;
          drawHeatmap(weeks);
          return;
        }
      }
    } catch(e) {}

    // Use github-contributions-api (CORS-friendly public proxy for GitHub contribution data)
    try {
      const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${USERNAME}?y=last`);
      if (!res.ok) throw new Error('API ' + res.status);
      const data = await res.json();
      const flat = data.contributions || [];
      // Bucket into weeks of 7 days
      const weeks = [];
      for (let i = 0; i < flat.length; i += 7) {
        const slice = flat.slice(i, i + 7);
        weeks.push({ contributionDays: slice.map(d => ({ contributionCount: d.count, date: d.date })) });
      }
      cachedWeeks = weeks;
      drawHeatmap(weeks);
      try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ weeks, ts: Date.now() })); } catch(e) {}
    } catch(e) {
      // Fallback: draw seeded realistic data
      drawHeatmap(buildFallbackWeeks());
    }
  }

  fetchContributions();
  window.addEventListener('resize', redraw);
})();

/* ─── 8. SERVICES SECTION — SECTION-ASK-ROW FIX ─── */
// (already in HTML, nothing needed here)

/* ─── WORKFLOW SECTION-BOX INNER PADDING FIX ─── */
// Handled via CSS

/* ─── VISITOR TYPE SELECTOR ─── */
(function() {
  const messages = {
    recruiter: "👋 Hi! I'm actively looking for internships & full-time roles. Check my projects, grab my resume, and let's connect!",
    collaborator: "🤝 Always down to collaborate on interesting projects. Let's build something cool together — reach out!",
    curious: "🔭 Welcome! Feel free to explore my work, poke around the code on GitHub, and enjoy the site."
  };
  const btns = document.querySelectorAll('.visitor-btn');
  const msgEl = document.getElementById('visitor-msg-text');
  if (!btns.length || !msgEl) return;
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      const msgDiv = document.getElementById('visitor-message');
      if (msgDiv) { msgDiv.style.opacity = '0'; }
      setTimeout(() => {
        msgEl.textContent = messages[btn.dataset.type] || '';
        if (msgDiv) { msgDiv.style.opacity = '1'; }
      }, 200);
    });
    if (isPointerFine) {
      btn.addEventListener('mouseenter', () => document.getElementById('cursor-ring')?.classList.add('grow'));
      btn.addEventListener('mouseleave', () => document.getElementById('cursor-ring')?.classList.remove('grow'));
    }
  });
})();

/* ─── ANIMATED COUNTERS ─── */
(function() {
  const counters = document.querySelectorAll('.counter-item');
  if (!counters.length) return;
  let triggered = false;
  function animateCounters() {
    counters.forEach(item => {
      const valEl = item.querySelector('.counter-val');
      if (!valEl) return;
      const target = parseInt(item.dataset.target, 10);
      const duration = 1800;
      const start = performance.now();
      function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        valEl.textContent = Math.round(ease * target);
        if (progress < 1) requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
    });
  }
  const observer = new IntersectionObserver(entries => {
    if (entries.some(e => e.isIntersecting) && !triggered) {
      triggered = true;
      animateCounters();
      observer.disconnect();
    }
  }, { threshold: 0.3 });
  counters.forEach(c => observer.observe(c));
})();


/* ─── PAGE SHARE BUTTON ─── */
(function() {
  const btn = document.getElementById('share-btn');
  const toast = document.getElementById('share-toast');
  if (!btn) return;

  const shareData = {
    title: 'Yash Patil — Frontend Developer & Designer',
    text: 'Check out Yash Patil\'s portfolio — frontend dev, UI/UX designer, and creative builder from Pune.',
    url: 'https://yashpatil3495.github.io/'
  };

  btn.addEventListener('click', async () => {
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch(e) {
        if (e.name !== 'AbortError') fallbackCopy();
      }
    } else {
      fallbackCopy();
    }
  });

  function fallbackCopy() {
    navigator.clipboard.writeText(shareData.url).then(() => {
      showToast('✓ Link copied to clipboard');
    }).catch(() => {
      showToast('↗ yashpatil3495.github.io');
    });
  }

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
  }

  if (isPointerFine) {
    btn.addEventListener('mouseenter', () => document.getElementById('cursor-ring')?.classList.add('grow'));
    btn.addEventListener('mouseleave', () => document.getElementById('cursor-ring')?.classList.remove('grow'));
  }
})();
