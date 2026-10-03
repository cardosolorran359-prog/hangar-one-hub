import { useEffect, useRef, useState, type ReactNode } from "react";
import { HudDetails } from "./HudDetails";

const BUTTON_DELAY = 2200;
const EXIT_DELAY = 650;

function HudLoginBackground({ onEnter }: { onEnter: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showEnter, setShowEnter] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowEnter(true), BUTTON_DELAY);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;

    const ctx = cv.getContext("2d");
    if (!ctx) return;

    // ===== CÓDIGO-FONTE FORNECIDO =====
    const CFG = {
      loop: 10,
      centerY: 0.5,
      size: 0.40,
      glow: 1,
      red: "255,60,40",
      white: "235,245,245",
    };

    const RINGS = [
      [1.00, 0.050, 1.35, 0.3, 1, "w"],
      [1.00, 0.050, 1.00, 2.6, 1, "w"],
      [1.00, 0.050, 1.60, 4.4, 1, "w"],
      [0.86, 0.030, 2.20, 1.0, -2, "r"],
      [0.86, 0.030, 1.40, 4.0, -2, "r"],
      [0.72, 0.035, 1.90, 2.0, 3, "r"],
      [0.72, 0.035, 1.30, 5.0, 3, "r"],
      [0.60, 0.040, 2.60, 0.5, -1, "r"],
      [0.60, 0.040, 1.20, 4.2, -1, "r"],
      [0.47, 0.045, 2.00, 3.0, 2, "r"],
      [0.47, 0.045, 1.50, 0.2, 2, "r"],
      [0.35, 0.030, 1.70, 1.5, -3, "r"],
      [0.35, 0.030, 1.30, 4.6, -3, "r"],
    ] as const;

    const TAU = Math.PI * 2;
    let W = 0;
    let H = 0;
    let dpr = 1;
    let raf = 0;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      cv.width = W * dpr;
      cv.height = H * dpr;
      cv.style.width = "100%";
      cv.style.height = "100%";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function arc(cx: number, cy: number, r: number, w: number, a0: number, len: number, col: string, alpha: number, glow: number) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, a0, a0 + len);
      ctx.lineWidth = w;
      ctx.strokeStyle = `rgba(${col},${alpha})`;
      ctx.shadowColor = `rgba(${col === CFG.white ? "255,255,255" : "255,50,30"},${alpha})`;
      ctx.shadowBlur = glow * CFG.glow;
      ctx.stroke();
    }

    function line(x1: number, y1: number, x2: number, y2: number, w: number, col: string, alpha: number) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineWidth = w;
      ctx.strokeStyle = `rgba(${col},${alpha})`;
      ctx.stroke();
    }

    function dot(x: number, y: number, r: number, a: number) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
      ctx.fillStyle = `rgba(${CFG.red},${a})`;
      ctx.shadowColor = "rgba(255,50,30,1)";
      ctx.shadowBlur = 10 * CFG.glow;
      ctx.fill();
    }

    function draw(t: number) {
      const u = (t % CFG.loop) / CFG.loop;
      const k = 0.5 - 0.5 * Math.cos(TAU * u);
      const cx = W / 2;
      const cy = H * CFG.centerY;
      const R = H * CFG.size;

      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";

      const ys = [-0.13, 0.02, 0.17];
      ys.forEach((o, i) => {
        const y = cy + o * R;
        const a = 0.35 + 0.5 * k;
        line(0, y, cx - R * 1.05, y, 1.2, CFG.red, a);
        line(cx + R * 1.05, y, W, y, 1.2, CFG.red, a);

        const d = Math.sin(TAU * (u + i / 3)) * R * 0.12;
        dot(cx - R * 1.25 - d - i * R * 0.25, y, 3, 0.9);
        dot(cx + R * 1.25 + d + i * R * 0.2, y, 3, 0.9);
      });

      ctx.globalCompositeOperation = "source-over";
      ctx.shadowBlur = 0;

      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
      g.addColorStop(0, "rgba(0,0,0,.85)");
      g.addColorStop(1, "rgba(0,0,0,.35)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.97, 0, TAU);
      ctx.fill();

      ctx.globalCompositeOperation = "lighter";

      [1.0, 0.93, 0.80, 0.66, 0.54].forEach((factor, i) => {
        ctx.beginPath();
        ctx.arc(cx, cy, R * factor, 0, TAU);
        ctx.lineWidth = 1;
        ctx.strokeStyle = `rgba(${i < 2 ? CFG.white : CFG.red},${0.25 + 0.2 * k})`;
        ctx.shadowBlur = 0;
        ctx.stroke();
      });

      const nT = 120;
      const tr = R * 0.83;
      for (let i = 0; i < nT; i++) {
        const a = (i / nT) * TAU + u * TAU * -1;
        const long = i % 5 === 0;
        const r1 = tr;
        const r2 = tr + R * (long ? 0.05 : 0.025);
        line(
          cx + Math.cos(a) * r1,
          cy + Math.sin(a) * r1,
          cx + Math.cos(a) * r2,
          cy + Math.sin(a) * r2,
          1,
          CFG.red,
          (long ? 0.8 : 0.4) * (0.4 + 0.6 * k),
        );
      }

      for (let i = 0; i < 180; i++) {
        const a = (i / 180) * TAU + u * TAU * 2;
        const r1 = R * 0.66;
        const r2 = R * 0.685;
        line(
          cx + Math.cos(a) * r1,
          cy + Math.sin(a) * r1,
          cx + Math.cos(a) * r2,
          cy + Math.sin(a) * r2,
          0.8,
          CFG.red,
          0.55 * k,
        );
      }

      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * TAU + u * TAU;
        ctx.shadowColor = "rgba(255,50,30,1)";
        ctx.shadowBlur = 8 * CFG.glow;
        line(
          cx,
          cy,
          cx + Math.cos(a) * R * 0.72,
          cy + Math.sin(a) * R * 0.72,
          1.4,
          CFG.red,
          0.85 * k,
        );
      }

      RINGS.forEach(([f, w, len, a0, turns, color]) => {
        const col = color === "w" ? CFG.white : CFG.red;
        const a = a0 + u * TAU * turns;
        const breathe = color === "r" ? 0.55 + 0.45 * k : 1;
        arc(cx, cy, R * f, R * w, a, len, col, 0.95 * breathe, color === "w" ? 14 : 18);
      });

      for (let i = 0; i < 3; i++) {
        arc(
          cx,
          cy,
          R * (1.1 + i * 0.05),
          1.5,
          u * TAU * (i % 2 ? -1 : 1) + i * 2,
          1.2 + i * 0.4,
          CFG.red,
          0.7 * k,
          8,
        );
      }

      // Detalhes adicionais: escala externa, marcadores orbitais, bracketes e um scanner.
      const outerR = R * 1.075;
      const outerTicks = 48;
      for (let i = 0; i < outerTicks; i++) {
        const a = (i / outerTicks) * TAU - u * TAU * 0.5;
        const major = i % 6 === 0;
        const r1 = outerR;
        const r2 = outerR + R * (major ? 0.040 : 0.018);
        line(
          cx + Math.cos(a) * r1,
          cy + Math.sin(a) * r1,
          cx + Math.cos(a) * r2,
          cy + Math.sin(a) * r2,
          major ? 1.5 : 0.8,
          CFG.white,
          major ? 0.72 + 0.18 * k : 0.26 + 0.20 * k,
        );
      }

      // Quatro marcadores maiores giram lentamente com o mesmo ciclo de 10s.
      for (let i = 0; i < 4; i++) {
        const a = i * (TAU / 4) + u * TAU * (i % 2 ? -0.35 : 0.35);
        const rr = R * 1.035;
        const x = cx + Math.cos(a) * rr;
        const y = cy + Math.sin(a) * rr;
        ctx.beginPath();
        ctx.arc(x, y, R * 0.014, 0, TAU);
        ctx.fillStyle = `rgba(${CFG.white},${0.34 + 0.42 * k})`;
        ctx.shadowColor = "rgba(240,250,250,0.9)";
        ctx.shadowBlur = 8 * CFG.glow;
        ctx.fill();
        line(
          x - Math.cos(a) * R * 0.026,
          y - Math.sin(a) * R * 0.026,
          x + Math.cos(a) * R * 0.026,
          y + Math.sin(a) * R * 0.026,
          1,
          CFG.white,
          0.28 + 0.35 * k,
        );
      }

      // Brackets técnicos quadrados na horizontal e vertical.
      const bracketAlpha = 0.18 + 0.34 * k;
      const b = R * 0.12;
      const gap = R * 1.18;
      line(cx - gap, cy - b, cx - gap + b, cy - b, 1, CFG.white, bracketAlpha);
      line(cx - gap, cy - b, cx - gap, cy - b + b, 1, CFG.white, bracketAlpha);
      line(cx + gap, cy - b, cx + gap - b, cy - b, 1, CFG.white, bracketAlpha);
      line(cx + gap, cy - b, cx + gap, cy - b + b, 1, CFG.white, bracketAlpha);
      line(cx - gap, cy + b, cx - gap + b, cy + b, 1, CFG.white, bracketAlpha);
      line(cx - gap, cy + b, cx - gap, cy + b - b, 1, CFG.white, bracketAlpha);
      line(cx + gap, cy + b, cx + gap - b, cy + b, 1, CFG.white, bracketAlpha);
      line(cx + gap, cy + b, cx + gap, cy + b - b, 1, CFG.white, bracketAlpha);

      // Scanner que atravessa uma faixa do anel externo.
      const scanA = u * TAU * 1.2 - 0.7;
      const scanR1 = R * 0.94;
      const scanR2 = R * 1.085;
      line(
        cx + Math.cos(scanA) * scanR1,
        cy + Math.sin(scanA) * scanR1,
        cx + Math.cos(scanA) * scanR2,
        cy + Math.sin(scanA) * scanR2,
        2,
        CFG.white,
        0.18 + 0.72 * k,
      );
      dot(
        cx + Math.cos(scanA) * scanR2,
        cy + Math.sin(scanA) * scanR2,
        R * 0.010,
        0.35 + 0.55 * k,
      );

      // Micro-retícula ao redor do ponto central.
      [0.16, 0.20].forEach((factor, index) => {
        ctx.beginPath();
        ctx.arc(cx, cy, R * factor, 0, TAU);
        ctx.lineWidth = index === 0 ? 1.2 : 0.7;
        ctx.strokeStyle = `rgba(${CFG.white},${0.15 + 0.16 * k})`;
        ctx.shadowBlur = 0;
        ctx.stroke();
      });

      dot(cx, cy, 2.5, 0.6 + 0.4 * k);
      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = "source-over";
    }

    function loop(ms: number) {
      draw(ms / 1000);
      raf = window.requestAnimationFrame(loop);
    }

    resize();
    window.addEventListener("resize", resize);
    raf = window.requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="hud-source-login" aria-label="Acesso ao Hangar One">
      <style>{`
        .hud-source-login {
          position:fixed;
          inset:0;
          z-index:90;
          overflow:hidden;
          background:#050607;
        }
        .hud-source-login .cabin {
          position:fixed;
          inset:0;
          filter:blur(7px) brightness(.8);
          background:
            linear-gradient(115deg, transparent 0 18%, #14181c 18% 22%, transparent 22%),
            linear-gradient(65deg, transparent 0 74%, #14181c 74% 78%, transparent 78%),
            radial-gradient(ellipse at 20% 0%, #3a4650 0, transparent 35%),
            radial-gradient(ellipse at 80% 0%, #3a4650 0, transparent 35%),
            linear-gradient(#0c0f12, #050607 60%);
        }
        .hud-source-login .leds {
          position:fixed;
          left:2%;
          top:62%;
          width:9%;
          height:1.6%;
          filter:blur(3px);
          background:repeating-linear-gradient(90deg, rgb(var(--hud-source-red)) 0 18%, transparent 18% 30%);
          opacity:.8;
        }
        .hud-source-login #hud-source-canvas {
          position:fixed;
          inset:0;
          width:100%;
          height:100%;
        }
        .hud-source-login .vig {
          position:fixed;
          inset:0;
          pointer-events:none;
          background:radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,.75));
        }
        .hud-source-login__enter {
          position:fixed;
          left:50%;
          bottom:34px;
          transform:translateX(-50%);
          z-index:5;
          min-width:390px;
          padding:17px 34px;
          border:1px solid rgba(235,245,245,.48);
          background:
            linear-gradient(180deg,rgba(20,24,27,.78),rgba(5,6,7,.70));
          color:rgba(245,252,252,.96);
          font:600 13px/1.2 ui-monospace,SFMono-Regular,Menlo,monospace;
          letter-spacing:.28em;
          text-indent:.28em;
          cursor:pointer;
          opacity:0;
          pointer-events:none;
          overflow:hidden;
          clip-path:polygon(0 0,97% 0,100% 18%,100% 82%,97% 100%,0 100%);
          transition:
            opacity .35s ease,
            border-color .35s ease,
            box-shadow .35s ease,
            transform .25s ease;
        }
        .hud-source-login__enter::before {
          content:"";
          position:absolute;
          inset:0;
          background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,.10) 46%,rgba(255,255,255,.38) 50%,rgba(255,255,255,.10) 54%,transparent 100%);
          transform:translateX(-120%);
          animation:hud-button-scan 3.2s linear infinite;
          pointer-events:none;
        }
        .hud-source-login__enter::after {
          content:"";
          position:absolute;
          left:14px;
          right:14px;
          top:5px;
          height:1px;
          background:linear-gradient(90deg,transparent,rgba(255,90,64,.80),transparent);
          animation:hud-button-pulse 2s ease-in-out infinite;
          pointer-events:none;
        }
        .hud-source-login__enter[data-visible="true"] {
          opacity:1;
          pointer-events:auto;
          box-shadow:
            0 0 18px rgba(255,60,40,.13),
            0 0 42px rgba(235,245,245,.05),
            inset 0 0 18px rgba(255,60,40,.035);
          animation:hud-button-idle 2.8s ease-in-out infinite;
        }
        .hud-source-login__enter:hover {
          border-color:rgba(255,245,242,.92);
          box-shadow:
            0 0 25px rgba(255,60,40,.22),
            0 0 52px rgba(235,245,245,.08),
            inset 0 0 24px rgba(255,60,40,.07);
          transform:translateX(-50%) translateY(-2px);
        }
        @keyframes hud-button-scan {
          0%{transform:translateX(-120%);opacity:0}
          15%{opacity:1}
          52%{opacity:.85}
          100%{transform:translateX(120%);opacity:0}
        }
        @keyframes hud-button-pulse {
          0%,100%{opacity:.28;transform:scaleX(.65)}
          50%{opacity:1;transform:scaleX(1)}
        }
        @keyframes hud-button-idle {
          0%,100%{box-shadow:0 0 18px rgba(255,60,40,.10),inset 0 0 18px rgba(255,60,40,.025)}
          50%{box-shadow:0 0 28px rgba(255,60,40,.18),inset 0 0 22px rgba(255,60,40,.045)}
        }
        @media (max-width:720px) {
          .hud-source-login__enter {
            min-width:calc(100vw - 48px);
            padding:15px 20px;
            font-size:12px;
            letter-spacing:.20em;
            text-indent:.20em;
          }
        }
        :root {
          --hud-source-red:255,60,40;
        }
      `}</style>

      <div className="cabin" />
      <div className="leds" />
      <canvas ref={canvasRef} id="hud-source-canvas" aria-hidden />
      <div className="vig" />
      <HudDetails />
      <button
        type="button"
        className="hud-source-login__enter"
        data-visible={showEnter}
        onClick={onEnter}
        aria-hidden={!showEnter}
        tabIndex={showEnter ? 0 : -1}
      >
        ENTRAR NO HANGAR ONE
      </button>