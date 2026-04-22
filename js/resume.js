const GH_USER = 'yashpatil3495';

async function fetchGitHub() {
  setLoadingText('Fetching GitHub profile…');
  try {
    // User profile
    const userRes = await fetch(`https://api.github.com/users/${GH_USER}`);
    if (!userRes.ok) throw new Error('GitHub API error');
    const user = await userRes.json();

    // Avatar
    const avatarWrap = document.getElementById('avatar-wrap');
    if (user.avatar_url) {
      avatarWrap.innerHTML = `<img src="${user.avatar_url}" alt="Yash Patil" class="resume-avatar">`;
    }

    // Bio as about text if available
    if (user.bio) {
      document.getElementById('about-text').textContent = user.bio;
    }

    // Stats
    document.getElementById('gh-repos').textContent = user.public_repos ?? '—';
    document.getElementById('gh-followers').textContent = user.followers ?? '—';
    document.getElementById('gh-following').textContent = user.following ?? '—';

    // Repos
    setLoadingText('Fetching repositories…');
    const reposRes = await fetch(`https://api.github.com/users/${GH_USER}/repos?sort=updated&per_page=30`);
    const repos = await reposRes.json();

    // Total stars
    const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
    document.getElementById('gh-stars').textContent = totalStars;

    // Top repos (exclude forks, sort by stars then updated)
    const topRepos = repos
      .filter(r => !r.fork && r.name !== GH_USER)
      .sort((a, b) => (b.stargazers_count - a.stargazers_count) || (new Date(b.updated_at) - new Date(a.updated_at)))
      .slice(0, 6);

    const reposGrid = document.getElementById('repos-grid');
    if (topRepos.length === 0) {
      reposGrid.innerHTML = `<div style="font-family:var(--font-mono);font-size:0.75rem;color:var(--muted);">No public repositories found.</div>`;
    } else {
      reposGrid.innerHTML = topRepos.map(r => `
        <a href="${r.html_url}" target="_blank" class="repo-card">
          <div class="repo-name">${r.name}</div>
          <div class="repo-desc">${r.description || 'No description'}</div>
          <div class="repo-meta">
            ${r.language ? `<span class="repo-lang">● ${r.language}</span>` : ''}
            <span class="repo-stars">★ ${r.stargazers_count}</span>
          </div>
        </a>
      `).join('');
    }

    // Languages from repos
    const langCounts = {};
    repos.filter(r => r.language).forEach(r => {
      langCounts[r.language] = (langCounts[r.language] || 0) + 1;
    });
    const topLangs = Object.entries(langCounts).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([l])=>l);
    if (topLangs.length) {
      const langEl = document.getElementById('gh-languages');
      langEl.innerHTML = topLangs.map(l => `<span class="skill-pill">${l}</span>`).join('');
    }

    setSyncSuccess();
  } catch(err) {
    setSyncError(err.message);
  }
}

function setLoadingText(t) {
  const el = document.getElementById('loading-text');
  if (el) el.textContent = t;
}

function setSyncSuccess() {
  const now = new Date();
  document.getElementById('sync-label').textContent = 'Live · GitHub';
  document.getElementById('last-updated').textContent =
    'Last synced: ' + now.toLocaleString('en-IN', { dateStyle:'medium', timeStyle:'short' });
  document.getElementById('loading-overlay').classList.add('hidden');
  document.getElementById('resume-content').style.opacity = '1';
}

function setSyncError(msg) {
  document.getElementById('sync-label').textContent = 'Offline';
  document.querySelector('.sync-dot').style.background = 'var(--rust)';
  document.getElementById('gh-source-badge').innerHTML = `<span class="fetch-error">⚠ API limit / offline</span>`;
  document.getElementById('repos-grid').innerHTML = `<div style="font-family:var(--font-mono);font-size:0.75rem;color:var(--muted);">Could not load repos — GitHub API may be rate-limited. Try refreshing in a minute.</div>`;
  document.getElementById('loading-overlay').classList.add('hidden');
  document.getElementById('resume-content').style.opacity = '1';
  console.warn('GitHub fetch error:', msg);
}

document.getElementById('btn-refresh').addEventListener('click', () => {
  document.getElementById('loading-overlay').classList.remove('hidden');
  document.getElementById('resume-content').style.opacity = '0';
  document.getElementById('sync-label').textContent = 'Syncing…';
  fetchGitHub();
});

/* ── THEME SWITCHER ── */
(function() {
  const saved = localStorage.getItem('yp-resume-theme') || 'dark';
  applyTheme(saved);
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      applyTheme(btn.dataset.theme);
      localStorage.setItem('yp-resume-theme', btn.dataset.theme);
    });
  });
  function applyTheme(theme) {
    document.documentElement.className = theme === 'dark' ? '' : 'theme-' + theme;
    document.querySelectorAll('.theme-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.theme === theme);
    });
  }
})();


// Init
fetchGitHub();

// ── SCROLL-REVEAL ──
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('revealed');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.resume-section').forEach((el, i) => {
  el.style.transitionDelay = (i * 0.06) + 's';
  revealObs.observe(el);
});

// ── SCROLL TO TOP BUTTON ──
window.addEventListener('scroll', () => {
  const btn = document.getElementById('resume-scroll-top');
  if (btn) btn.classList.toggle('visible', window.scrollY > 400);
  const toolbar = document.querySelector('.toolbar');
  if (toolbar) toolbar.classList.toggle('shadowed', window.scrollY > 10);
});

// ── SHIMMER NAME ON LOAD ──
setTimeout(() => {
  const name = document.querySelector('.resume-name');
  if (name) name.querySelectorAll('br + *').forEach(el => el.classList.add('shimmer-run'));
}, 800);

// ── TOAST HELPER ──
function showToast(msg) {
  const t = document.getElementById('resume-toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ── PDF GENERATION (print-to-PDF with pre-styling) ──
function generatePDF() {
  const btn = document.getElementById('btn-pdf');
  if (btn) { btn.textContent = '⏳ Preparing…'; btn.classList.add('loading'); }
  
  // Apply print theme for clean output
  const prevClass = document.documentElement.className;
  document.documentElement.className = 'theme-print';
  
  setTimeout(() => {
    window.print();
    // Restore after print dialog closes
    setTimeout(() => {
      document.documentElement.className = prevClass;
      if (btn) { btn.textContent = '⬇ Download PDF'; btn.classList.remove('loading'); }
      showToast('💡 In print dialog: choose "Save as PDF"');
    }, 1000);
  }, 300);
}

// ── CONTACT COPY ──
document.querySelectorAll('.contact-item').forEach(item => {
  item.style.cursor = 'pointer';
  item.addEventListener('click', function(e) {
    if (this.href && (this.href.startsWith('mailto:') || this.href.startsWith('tel:'))) return;
    e.preventDefault();
    const text = this.textContent.trim();
    navigator.clipboard?.writeText(text).then(() => showToast('✓ Copied: ' + text.slice(0, 30)));
  });
});

// ── STAT CARDS COUNTER ANIMATION ──
function animateCounter(el, target) {
  const duration = 900;
  const start = performance.now();
  const from = 0;
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(from + (target - from) * eased);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// Animate stats when section becomes visible
const statsSection = document.querySelector('.gh-stats-grid');
if (statsSection) {
  const statsObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        document.querySelectorAll('.gh-stat-num').forEach(numEl => {
          const val = parseInt(numEl.textContent);
          if (!isNaN(val) && val > 0) animateCounter(numEl, val);
        });
        statsObs.disconnect();
      }
    });
  }, { threshold: 0.3 });
  statsObs.observe(statsSection);
}