import { useEffect, useRef, useState } from "react";

/**
 * Detalhes EXTERNOS da tela de login. Não toca no anel central:
 * - brasas não são desenhadas dentro do círculo do anel
 * - scanlines/barra de luz usam máscara que recorta o círculo do anel
 */
const TAU = Math.PI * 2;
const RING_CY = 0.5; // centro vertical do anel (fração da altura)
const RING_R = 0.41; // raio do anel (fração da altura)
const p2 = (n: number) => String(n).padStart(2, "0");
const jit = (base: number, spread: number) => base + (Math.random() - 0.5) * spread;

const CSS = `
.hdt{position:fixed;inset:0;pointer-events:none;z-index:2;--c:255,105,85;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:rgba(var(--c),.78)}
.hdt canvas{position:absolute;inset:0;width:100%;height:100%}
.hdt-fx{position:absolute;inset:0;-webkit-mask-image:radial-gradient(circle at 50% 50%,transparent 42vh,#000 42.6vh);mask-image:radial-gradient(circle at 50% 50%,transparent 42vh,#000 42.6vh)}
.hdt-scan{position:absolute;inset:0;opacity:.28;background:repeating-linear-gradient(to bottom,rgba(0,0,0,.28) 0 1px,transparent 1px 3px)}
.hdt-bar{position:absolute;left:0;right:0;top:0;height:14%;background:linear-gradient(transparent,rgba(255,255,255,.04),transparent);animation:hdtBar 9s linear infinite}
@keyframes hdtBar{from{transform:translateY(-120%)}to{transform:translateY(780%)}}
.hdt-br{position:absolute;width:30px;height:30px;border:0 solid rgba(var(--c),.7);filter:drop-shadow(0 0 4px rgba(255,60,40,.6))}
.hdt-br.tl{left:14px;top:14px;border-left-width:1.5px;border-top-width:1.5px}
.hdt-br.tr{right:14px;top:14px;border-right-width:1.5px;border-top-width:1.5px}
.hdt-br.bl{left:14px;bottom:14px;border-left-width:1.5px;border-bottom-width:1.5px}
.hdt-br.brr{right:14px;bottom:14px;border-right-width:1.5px;border-bottom-width:1.5px}
.hdt-txt{position:absolute;font-size:10px;letter-spacing:.16em;line-height:1.7;text-shadow:0 0 8px rgba(255,60,40,.55);transform:translate3d(calc(var(--px,0)*-.5px),calc(var(--py,0)*-.5px),0)}
.hdt-txt strong{display:block;font-weight:600;color:rgba(255,255,255,.88);letter-spacing:.3em;font-size:12px}
.hdt-tl{left:30px;top:28px}.hdt-tr{right:30px;top:28px;text-align:right}
.hdt-tr strong{font-size:15px;letter-spacing:.18em;font-variant-numeric:tabular-nums}
.hdt-log{left:30px;bottom:34px;width:270px}
.hdt-log p{margin:0;display:flex;gap:6px;opacity:0;animation:hdtIn .45s forwards;animation-delay:var(--d)}
.hdt-log u{flex:1;text-decoration:none;border-bottom:1px dotted rgba(var(--c),.35);transform:translateY(-4px);min-width:20px}
.hdt-log b{font-weight:600;color:#fff}
.hdt-log .w b{color:rgba(var(--c),1);animation:hdtBlink 1.1s steps(2) infinite}
@keyframes hdtIn{to{opacity:.9}}@keyframes hdtBlink{50%{opacity:.15}}
.hdt-tel{right:30px;bottom:34px;text-align:right;min-width:190px}
.hdt-tel p{margin:0;display:flex;justify-content:space-between;gap:16px}
.hdt-tel b{color:#fff;font-weight:600;font-variant-numeric:tabular-nums}
.hdt-pwr{display:inline-block;letter-spacing:2px;color:rgba(255,70,45,.95)}
.hdt-ruler{position:absolute;top:24%;bottom:24%;width:12px;opacity:.7;background:repeating-linear-gradient(to bottom,rgba(var(--c),.55) 0 1px,transparent 1px 8px)}
.hdt-ruler::before{content:"";position:absolute;top:0;bottom:0;width:20px;background:repeating-linear-gradient(to bottom,rgba(var(--c),.85) 0 1px,transparent 1px 40px)}
.hdt-ruler.l{left:12px}.hdt-ruler.l::before{left:0}.hdt-ruler.r{right:12px}.hdt-ruler.r::before{right:0}
.hdt-ruler b{position:absolute;left:-3px;width:18px;height:2px;background:#ff4a30;box-shadow:0 0 8px #ff3a20;animation:hdtMk 7s ease-in-out infinite alternate}
.hdt-ruler.r b{animation-duration:9s;animation-delay:-3s}
@keyframes hdtMk{from{top:6%}to{top:94%}}
@media(max-width:720px){.hdt-log,.hdt-tel,.hdt-ruler{display:none}.hdt-tl{left:22px;top:22px}.hdt-tr{right:22px;top:22px}}
@media(prefers-reduced-motion:reduce){.hdt-bar,.hdt-ruler b,.hdt-log .w b{animation:none}.hdt-log p{opacity:.9;animation:none}}
`;

const LOG: [string, string, boolean?][] = [
  ["NÚCLEO", "OK"],
  ["LINK CRIPTOGRAFADO", "OK"],
  ["SENSORES DO HANGAR", "OK"],
  ["AUTENTICAÇÃO", "AGUARDANDO", true],
];

export function HudDetails() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const cvRef = useRef<HTMLCanvasElement | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [tel, setTel] = useState({ temp: "41.2°C", lat: "12 ms", sync: "99.8%", pwr: 6 });

  useEffect(() => {
    const c = window.setInterval(() => setNow(new Date()), 1000);
    const t = window.setInterval(
      () => setTel({
        temp: `${jit(41.2, 1.6).toFixed(1)}°C`,
        lat: `${Math.round(jit(12, 6))} ms`,
        sync: `${jit(99.7, 0.4).toFixed(1)}%`,
        pwr: 5 + Math.round(Math.random() * 2),
      }),
      1100,
    );
    return () => { window.clearInterval(c); window.clearInterval(t); };
  }, []);

  // brasas flutuantes (nunca desenhadas dentro do anel)
  useEffect(() => {
    const cv = cvRef.current, root = rootRef.current, ctx = cv?.getContext("2d");
    if (!cv || !root || !ctx) return;
    let W = 0, H = 0, dpr = 1, raf = 0, last = performance.now();
    let tx = 0, ty = 0, ox = 0, oy = 0;
    const embers = Array.from({ length: 46 }, () => ({
      x: Math.random(), y: Math.random(), v: 6 + Math.random() * 16,
      r: 0.6 + Math.random() * 1.5, ph: Math.random() * TAU, tw: 1 + Math.random() * 2,
    }));
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.clientWidth || window.innerWidth;
      H = cv.clientHeight || window.innerHeight;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
    };
    const onMove = (e: PointerEvent) => { tx = (e.clientX / W - 0.5) * 2; ty = (e.clientY / H - 0.5) * 2; };
    const frame = (ts: number) => {
      const dt = Math.min(0.05, (ts - last) / 1000);
      last = ts;
      const t = ts / 1000;
      ox += (tx - ox) * 0.05;
      oy += (ty - oy) * 0.05;
      root.style.setProperty("--px", (ox * 8).toFixed(2));
      root.style.setProperty("--py", (oy * 5).toFixed(2));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      const cx = W / 2, cy = H * RING_CY, keepOut = H * RING_R * 1.04;
      embers.forEach((p) => {
        p.y -= (p.v * dt) / H;
        p.x += Math.sin(t * 0.4 + p.ph) * 0.00012;
        if (p.y < -0.02) { p.y = 1.02; p.x = Math.random(); }
        const x = p.x * W + ox * 14 * p.r, y = p.y * H + oy * 8 * p.r;
        if (Math.hypot(x - cx, y - cy) < keepOut) return;
        ctx.beginPath();
        ctx.arc(x, y, p.r, 0, TAU);
        ctx.fillStyle = `rgba(255,100,60,${0.25 + 0.45 * (0.5 + 0.5 * Math.sin(t * p.tw + p.ph))})`;
        ctx.shadowColor = "rgba(255,60,30,1)";
        ctx.shadowBlur = 8 * dpr;
        ctx.fill();
      });
      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = "source-over";
    };
    resize();
    window.addEventListener("resize", resize);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      frame(performance.now());
    } else {
      window.addEventListener("pointermove", onMove);
      const loop = (ts: number) => { frame(ts); raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop);
    }
    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  const clock = `${p2(now.getHours())}:${p2(now.getMinutes())}:${p2(now.getSeconds())}`;
  const date = `${p2(now.getDate())}.${p2(now.getMonth() + 1)}.${now.getFullYear()}`;

  return (
    <div className="hdt" ref={rootRef} aria-hidden>
      <style>{CSS}</style>
      <canvas ref={cvRef} />
      <div className="hdt-fx"><div className="hdt-scan" /><div className="hdt-bar" /></div>
      <i className="hdt-br tl" /><i className="hdt-br tr" /><i className="hdt-br bl" /><i className="hdt-br brr" />
      <div className="hdt-ruler l"><b /></div>
      <div className="hdt-ruler r"><b /></div>

      <div className="hdt-txt hdt-tl"><strong>HANGAR ONE</strong>TERMINAL DE ACESSO · v7.4</div>
      <div className="hdt-txt hdt-tr"><strong>{clock}</strong><span>{date}</span></div>

      <div className="hdt-txt hdt-log">
        {LOG.map(([label, status, wait], i) => (
          <p key={label} className={wait ? "w" : undefined} style={{ ["--d" as string]: `${0.4 + i * 0.45}s` }}>
            &gt; {label} <u /> <b>{status}</b>
          </p>
        ))}
      </div>

      <div className="hdt-txt hdt-tel">
        <p>NÚCLEO <b>{tel.temp}</b></p>
        <p>LATÊNCIA <b>{tel.lat}</b></p>
        <p>SINCRONIA <b>{tel.sync}</b></p>
        <p>ENERGIA <span className="hdt-pwr">{"▮".repeat(tel.pwr)}{"▯".repeat(7 - tel.pwr)}</span></p>
      </div>
    </div>
  );
}
