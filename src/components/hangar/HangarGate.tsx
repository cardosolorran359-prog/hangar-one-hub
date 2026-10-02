<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>HUD Login Background</title>
<style>
  :root { --bg:#050607; --red:255,60,40; --white:235,245,245; }
  html, body { height:100%; margin:0; background:var(--bg); overflow:hidden; }
  .cabin { position:fixed; inset:0; filter:blur(7px) brightness(.8);
    background:
      linear-gradient(115deg, transparent 0 18%, #14181c 18% 22%, transparent 22%),
      linear-gradient(65deg, transparent 0 74%, #14181c 74% 78%, transparent 78%),
      radial-gradient(ellipse at 20% 0%, #3a4650 0, transparent 35%),
      radial-gradient(ellipse at 80% 0%, #3a4650 0, transparent 35%),
      linear-gradient(#0c0f12, #050607 60%); }
  .leds { position:fixed; left:2%; top:62%; width:9%; height:1.6%; filter:blur(3px);
    background:repeating-linear-gradient(90deg, rgb(var(--red)) 0 18%, transparent 18% 30%); opacity:.8; }
  #c { position:fixed; inset:0; width:100%; height:100%; }
  .vig { position:fixed; inset:0; pointer-events:none;
    background:radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,.75)); }
</style>
</head>
<body>
<div class="cabin"></div><div class="leds"></div>
<canvas id="c"></canvas>
<div class="vig"></div>
<script>
// ===== AJUSTES (mexa aqui para deixar idêntico) =====
const CFG = {
  loop: 10,          // duração do loop em segundos
  centerY: 0.5,      // posição vertical do HUD (0-1)
  size: 0.40,        // raio do HUD relativo à altura
  glow: 1,           // intensidade do brilho
  red: '255,60,40',
  white: '235,245,245'
};
// cada anel: [raio, largura, comprimento(rad), ângulo inicial, voltas por loop, cor, tipo]
const RINGS = [
  [1.00, .050, 1.35, .3,   1, 'w'], [1.00, .050, 1.00, 2.6,  1, 'w'], [1.00, .050, 1.60, 4.4,  1, 'w'],
  [.86,  .030, 2.20, 1.0, -2, 'r'], [.86,  .030, 1.40, 4.0, -2, 'r'],
  [.72,  .035, 1.90, 2.0,  3, 'r'], [.72,  .035, 1.30, 5.0,  3, 'r'],
  [.60,  .040, 2.60, .5,  -1, 'r'], [.60,  .040, 1.20, 4.2, -1, 'r'],
  [.47,  .045, 2.00, 3.0,  2, 'r'], [.47,  .045, 1.50, 0.2,  2, 'r'],
  [.35,  .030, 1.70, 1.5, -3, 'r'], [.35,  .030, 1.30, 4.6, -3, 'r']
];
const cv = document.getElementById('c'), ctx = cv.getContext('2d');
const TAU = Math.PI * 2;
let W, H, dpr;
function resize() {
  dpr = Math.min(devicePixelRatio || 1, 2);
  W = innerWidth; H = innerHeight;
  cv.width = W * dpr; cv.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
addEventListener('resize', resize); resize();

function arc(cx, cy, r, w, a0, len, col, alpha, glow) {
  ctx.beginPath(); ctx.arc(cx, cy, r, a0, a0 + len);
  ctx.lineWidth = w; ctx.strokeStyle = `rgba(${col},${alpha})`;
  ctx.shadowColor = `rgba(${col === CFG.white ? '255,255,255' : '255,50,30'},${alpha})`;
  ctx.shadowBlur = glow * CFG.glow; ctx.stroke();
}
function line(x1, y1, x2, y2, w, col, alpha) {
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
  ctx.lineWidth = w; ctx.strokeStyle = `rgba(${col},${alpha})`; ctx.stroke();
}
function dot(x, y, r, a) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU);
  ctx.fillStyle = `rgba(${CFG.red},${a})`; ctx.shadowColor = `rgba(255,50,30,1)`;
  ctx.shadowBlur = 10 * CFG.glow; ctx.fill();
}

function draw(t) {
  const u = (t % CFG.loop) / CFG.loop;          // 0..1 do loop
  const k = 0.5 - 0.5 * Math.cos(TAU * u);       // intensidade: pico no meio (~5s)
  const cx = W / 2, cy = H * CFG.centerY, R = H * CFG.size;
  ctx.clearRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'lighter';

  // linhas horizontais com pontos
  const ys = [-.13, .02, .17];
  ys.forEach((o, i) => {
    const y = cy + o * R, a = .35 + .5 * k;
    line(0, y, cx - R * 1.05, y, 1.2, CFG.red, a);
    line(cx + R * 1.05, y, W, y, 1.2, CFG.red, a);
    const d = Math.sin(TAU * (u + i / 3)) * R * .12;
    dot(cx - R * 1.25 - d - i * R * .25, y, 3, .9);
    dot(cx + R * 1.25 + d + i * R * .2, y, 3, .9);
  });

  // disco escuro central dá profundidade
  ctx.globalCompositeOperation = 'source-over';
  ctx.shadowBlur = 0;
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
  g.addColorStop(0, 'rgba(0,0,0,.85)'); g.addColorStop(1, 'rgba(0,0,0,.35)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * .97, 0, TAU); ctx.fill();
  ctx.globalCompositeOperation = 'lighter';

  // anéis finos
  [1.0, .93, .80, .66, .54].forEach((f, i) => {
    ctx.beginPath(); ctx.arc(cx, cy, R * f, 0, TAU);
    ctx.lineWidth = 1; ctx.strokeStyle = `rgba(${i < 2 ? CFG.white : CFG.red},${.25 + .2 * k})`;
    ctx.shadowBlur = 0; ctx.stroke();
  });

  // régua de marcações (mais forte no meio do loop)
  const nT = 120, tr = R * .83;
  for (let i = 0; i < nT; i++) {
    const a = (i / nT) * TAU + u * TAU * -1, long = i % 5 === 0;
    const r1 = tr, r2 = tr + R * (long ? .05 : .025);
    line(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1, cx + Math.cos(a) * r2, cy + Math.sin(a) * r2,
      1, CFG.red, (long ? .8 : .4) * (.4 + .6 * k));
  }
  // marcações internas finas
  for (let i = 0; i < 180; i++) {
    const a = (i / 180) * TAU + u * TAU * 2, r1 = R * .66, r2 = R * .685;
    line(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1, cx + Math.cos(a) * r2, cy + Math.sin(a) * r2,
      .8, CFG.red, .55 * k);
  }

  // raios (aparecem no meio do loop)
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * TAU + u * TAU * 1;
    ctx.shadowColor = 'rgba(255,50,30,1)'; ctx.shadowBlur = 8 * CFG.glow;
    line(cx, cy, cx + Math.cos(a) * R * .72, cy + Math.sin(a) * R * .72, 1.4, CFG.red, .85 * k);
  }

  // arcos grossos
  RINGS.forEach(([f, w, len, a0, turns, c]) => {
    const col = c === 'w' ? CFG.white : CFG.red;
    const a = a0 + u * TAU * turns;
    const breathe = c === 'r' ? (.55 + .45 * k) : 1;
    arc(cx, cy, R * f, R * w, a, len, col, .95 * breathe, c === 'w' ? 14 : 18);
  });

  // arcos externos vermelhos finos (aparecem no pico)
  for (let i = 0; i < 3; i++)
    arc(cx, cy, R * (1.1 + i * .05), 1.5, u * TAU * (i % 2 ? -1 : 1) + i * 2, 1.2 + i * .4, CFG.red, .7 * k, 8);

  // ponto central
  dot(cx, cy, 2.5, .6 + .4 * k);
  ctx.shadowBlur = 0; ctx.globalCompositeOperation = 'source-over';
}
(function loop(ms) { draw(ms / 1000); requestAnimationFrame(loop); })(0);
</script>
</body>
</html>
