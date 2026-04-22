/* particle canvas */
const canvas = document.getElementById('glitch-canvas');
const ctx = canvas.getContext('2d');
let W, H, particles = [];

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

for (let i = 0; i < 60; i++) {
  particles.push({
    x: Math.random() * 2000,
    y: Math.random() * 1200,
    w: Math.random() * 80 + 10,
    h: Math.random() * 2 + 1,
    speed: Math.random() * 0.4 + 0.1,
    opacity: Math.random() * 0.5 + 0.1,
    color: Math.random() > 0.5 ? '#e8a832' : '#2abfb3'
  });
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  particles.forEach(p => {
    ctx.globalAlpha = p.opacity * (0.7 + 0.3 * Math.sin(Date.now() * 0.001 + p.x));
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x % W, p.y % H, p.w, p.h);
    p.x += p.speed;
    if (p.x > W + p.w) p.x = -p.w;
  });
  ctx.globalAlpha = 1;
  requestAnimationFrame(draw);
}
draw();

/* countdown auto-redirect */
let t = 10;
const countEl = document.getElementById('countdown');
const iv = setInterval(() => {
  t--;
  countEl.textContent = t;
  if (t <= 0) { clearInterval(iv); window.location.href = '/'; }
}, 1000);

/* cancel redirect on any interaction */
document.addEventListener('click', () => {
  clearInterval(iv);
  document.getElementById('auto-redirect').style.display = 'none';
}, { once: true });