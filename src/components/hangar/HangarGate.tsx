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
  flow = false,
  pulse = false,
}: {
  size: number;
  dash: string;
  duration: number;
  reverse?: boolean;
  opacity?: number;
  thickness?: number;
  flow?: boolean;
  pulse?: boolean;
}) {
  const r = size / 2 - thickness;
  return (
    <div
      className={`hud-ring-wrap ${reverse ? "hud-ring--reverse" : ""}`}
      style={{ width: size, height: size, animationDuration: `${duration}s`, opacity }}
      aria-hidden
    >
      <svg
        className={[
          "hud-ring",
          flow ? "hud-ring--flow" : "",
          pulse ? "hud-ring--pulse" : "",
        ].filter(Boolean).join(" ")}
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
    </div>
  );
}

function Ticks({ size, count, length, duration, reverse = false }: { size: number; count: number; length: number; duration: number; reverse?: boolean }) {
  const c = size / 2;
  const r1 = c - length;
  const r2 = c - 2;
  return (
    <div
      className={`hud-ring-wrap ${reverse ? "hud-ring--reverse" : ""}`}
      style={{ width: size, height: size, animationDuration: `${duration}s` }}
      aria-hidden
    >
      <svg className="hud-ring" viewBox={`0 0 ${size} ${size}`} aria-hidden>
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
    </div>
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
            <div className="hud-core__pulse hud-core__pulse--one" />
            <div className="hud-core__pulse hud-core__pulse--two" />
            <Ticks size={460} count={72} length={14} duration={60} />
            <Ticks size={434} count={144} length={8} duration={48} reverse />
            <Ring size={416} dash="1 22" duration={34} opacity={0.38} thickness={1} flow />
            <Ring size={400} dash="4 10" duration={40} opacity={0.5} />
            <Ring size={376} dash="72 14 3 14" duration={31} reverse opacity={0.62} thickness={1.2} flow pulse />
            <Ring size={350} dash="8 18 42 16" duration={28} opacity={0.42} thickness={1} flow />
            <Ring size={340} dash="60 18 8 18" duration={26} reverse opacity={0.8} thickness={2} />
            <Ring size={316} dash="2 6" duration={22} opacity={0.34} thickness={1} />
            <Ring size={292} dash="18 8" duration={20} reverse opacity={0.5} />
            <Ring size={280} dash="2 6" duration={18} opacity={0.6} />
            <Ring size={246} dash="92 16 12 14" duration={15} reverse opacity={0.54} thickness={1.4} flow pulse />
            <Ring size={224} dash="5 14" duration={13} opacity={0.4} />
            <Ring size={210} dash="120 30" duration={12} reverse opacity={0.9} thickness={2.5} />
            <Ring size={188} dash="16 5 2 8" duration={10} opacity={0.54} flow />
            <Ring size={166} dash="3 9" duration={9} reverse opacity={0.46} />
            <Ring size={150} dash="30 12" duration={8} opacity={0.7} pulse />
            <div className="hud-core__orbit hud-core__orbit--outer">
              <span className="hud-core__orbit-dot" />
            </div>
            <div className="hud-core__orbit hud-core__orbit--inner">
              <span className="hud-core__orbit-dot hud-core__orbit-dot--small" />
            </div>
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
