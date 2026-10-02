import { useEffect, useState, type ReactNode } from "react";

const BUTTON_DELAY = 2200;
const EXIT_DELAY = 650;

function Ring({
  size,
  dash,
  duration,
  reverse = false,
  opacity = 1,
  thickness = 1.5,
}: {
  size: number;
  dash: string;
  duration: number;
  reverse?: boolean;
  opacity?: number;
  thickness?: number;
}) {
  const r = size / 2 - thickness;
  return (
    <svg
      className={`hud-ring ${reverse ? "hud-ring--reverse" : ""}`}
      style={{ width: size, height: size, animationDuration: `${duration}s`, opacity }}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={thickness}
        strokeDasharray={dash}
        strokeLinecap="round"
      />
    </svg>
  );
}

function Ticks({ size, count, length, duration }: { size: number; count: number; length: number; duration: number }) {
  const c = size / 2;
  const r1 = c - length;
  const r2 = c - 2;
  return (
    <svg className="hud-ring" style={{ width: size, height: size, animationDuration: `${duration}s` }} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      {Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2;
        const major = i % (count / 4) === 0;
        const rd = (n: number) => Math.round(n * 100) / 100;
        return (
          <line
            key={i}
            x1={rd(c + Math.cos(a) * r1)}
            y1={rd(c + Math.sin(a) * r1)}
            x2={rd(c + Math.cos(a) * r2)}
            y2={rd(c + Math.sin(a) * r2)}
            stroke="currentColor"
            strokeWidth={major ? 2 : 1}
            opacity={major ? 0.9 : 0.45}
          />
        );
      })}
    </svg>
  );
}

function Radar() {
  return (
    <div className="hud-radar" aria-hidden>
      <div className="hud-radar__grid" />
      <div className="hud-radar__sweep" />
      <span className="hud-radar__blip" style={{ top: "30%", left: "62%" }} />
      <span className="hud-radar__blip hud-radar__blip--dim" style={{ top: "64%", left: "38%" }} />
      <span className="hud-radar__blip" style={{ top: "48%", left: "76%", animationDelay: "1.1s" }} />
    </div>
  );
}

function Telemetry({ side }: { side: "left" | "right" }) {
  const rows =
    side === "left"
      ? [
          ["NÚCLEO", "ESTÁVEL"],
          ["BANCADA", "EST. 01"],
          ["CANAL USB", "EM ESPERA"],
          ["SENSORES", "CALIBRADOS"],
        ]
      : [
          ["ENERGIA", "98.2%"],
          ["TEMPERATURA", "36.4°C"],
          ["PROTOCOLO", "HGR-1"],
          ["REDE LOCAL", "ATIVA"],
        ];
  return (
    <div className={`hud-telemetry hud-telemetry--${side}`} aria-hidden>
      <div className="hud-telemetry__title">{side === "left" ? "SISTEMA" : "TELEMETRIA"}</div>
      {rows.map(([k, v], i) => (
        <div className="hud-telemetry__row" key={k} style={{ animationDelay: `${0.4 + i * 0.25}s` }}>
          <span>{k}</span>
          <span className="hud-telemetry__value">{v}</span>
        </div>
      ))}
      <div className="hud-telemetry__bars">
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} style={{ animationDelay: `${i * 0.12}s` }} />
        ))}
      </div>
    </div>
  );
}

export function HangarGate({ children }: { children: ReactNode }) {
  const [showButton, setShowButton] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowButton(true), BUTTON_DELAY);
    return () => window.clearTimeout(timer);
  }, []);

  const enterHangar = () => {
    if (exiting) return;
    setExiting(true);
    window.setTimeout(() => setReady(true), EXIT_DELAY);
  };

  return (
    <>
      <div className={ready ? "hud-app hud-app--ready" : "hud-app"} aria-hidden={!ready}>
        {children}
      </div>

      {!ready && (
        <section className={`hangar-login ${exiting ? "hangar-login--exiting" : ""}`} aria-label="Acesso ao Hangar One">
          <div className="hud-bg" aria-hidden />
          <div className="hud-scanlines" aria-hidden />
          <div className="hud-sweep" aria-hidden />

          <span className="hud-corner hud-corner--tl" aria-hidden />
          <span className="hud-corner hud-corner--tr" aria-hidden />
          <span className="hud-corner hud-corner--bl" aria-hidden />
          <span className="hud-corner hud-corner--br" aria-hidden />

          <Radar />
          <Telemetry side="left" />
          <Telemetry side="right" />

          <div className="hud-core" aria-hidden>
            <Ticks size={460} count={72} length={14} duration={60} />
            <Ring size={400} dash="4 10" duration={40} opacity={0.5} />
            <Ring size={340} dash="60 18 8 18" duration={26} reverse opacity={0.8} thickness={2} />
            <Ring size={280} dash="2 6" duration={18} opacity={0.6} />
            <Ring size={210} dash="120 30" duration={12} reverse opacity={0.9} thickness={2.5} />
            <Ring size={150} dash="30 12" duration={8} opacity={0.7} />
            <div className="hud-core__center">
              <span className="hud-core__dot" />
              <span className="hud-core__label">HANGAR ONE</span>
              <span className="hud-core__sub">BANCADA TÉCNICA · SISTEMA ONLINE</span>
            </div>
            <span className="hud-core__crosshair hud-core__crosshair--h" />
            <span className="hud-core__crosshair hud-core__crosshair--v" />
          </div>

          <div className="hud-bottom" aria-hidden>
            <span className="hud-bottom__line" />
            <span className="hud-bottom__text">INICIALIZAÇÃO COMPLETA — ACESSO LIBERADO</span>
            <span className="hud-bottom__line" />
          </div>

          <button
            type="button"
            onClick={enterHangar}
            className={showButton ? "hangar-login__button hangar-login__button--visible" : "hangar-login__button"}
            aria-hidden={!showButton}
            tabIndex={showButton ? 0 : -1}
          >
            ENTRAR NO HANGAR ONE
          </button>
        </section>
      )}
    </>
  );
}
