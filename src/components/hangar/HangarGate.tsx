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
  color = "cyan",
}: {
  size: number;
  dash: string;
  duration: number;
  reverse?: boolean;
  opacity?: number;
  thickness?: number;
  flow?: boolean;
  pulse?: boolean;
  color?: "cyan" | "red" | "yellow" | "pink";
}) {
  const colorMap = {
    cyan: "#00ffff",
    red: "#ff2060",
    yellow: "#ffff00",
    pink: "#ff0080",
  };

  const r = size / 2 - thickness;
  return (
    <div
      className={`hud-ring-wrap ${reverse ? "hud-ring--reverse" : ""}`}
      style={{
        width: size,
        height: size,
        animationDuration: `${duration}s`,
        opacity,
      }}
      aria-hidden
    >
      <svg
        className={[
          "hud-ring",
          flow ? "hud-ring--flow" : "",
          pulse ? "hud-ring--pulse" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={colorMap[color]}
          strokeWidth={thickness}
          strokeDasharray={dash}
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 10px ${colorMap[color]})`,
          }}
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
              strokeWidth={major ? 2.5 : 1.2}
              opacity={major ? 1 : 0.6}
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
          <style>{String.raw`.hangar-login .hud-orbit-details{position:absolute;left:50%;top:50%;width:560px;height:560px;transform:translate(-50%,-50%);z-index:4;pointer-events:none}
.hangar-login .hud-orbit-arc{position:absolute;left:50%;top:50%;border-radius:50%;transform:translate(-50%,-50%);box-sizing:border-box;border:1px dashed rgba(0,255,255,.20)}
.hangar-login .hud-orbit-arc--outer{width:548px;height:548px;border-left-color:rgba(255,32,96,.72);border-right-color:transparent;animation:hud-orbit-arc-spin 24s linear infinite}
.hangar-login .hud-orbit-arc--inner{width:500px;height:500px;border-top-color:rgba(0,255,255,.52);border-bottom-color:rgba(255,255,0,.32);border-left-color:transparent;border-right-color:rgba(255,0,128,.36);animation:hud-orbit-arc-spin-reverse 18s linear infinite}
@keyframes hud-orbit-arc-spin{from{transform:translate(-50%,-50%) rotate(0deg)}to{transform:translate(-50%,-50%) rotate(360deg)}}
@keyframes hud-orbit-arc-spin-reverse{from{transform:translate(-50%,-50%) rotate(360deg)}to{transform:translate(-50%,-50%) rotate(0deg)}}
.hangar-login .hud-orbit-markers{position:absolute;inset:0;animation:hud-marker-wheel 32s linear infinite}
.hangar-login .hud-orbit-marker{position:absolute;width:6px;height:6px;border:1px solid #00ffff;background:rgba(0,255,255,.18);box-shadow:0 0 7px rgba(0,255,255,.75);transform:translate(-50%,-50%)}
.hangar-login .hud-orbit-marker:nth-child(1){left:50%;top:2%}.hangar-login .hud-orbit-marker:nth-child(2){left:74%;top:7%}.hangar-login .hud-orbit-marker:nth-child(3){left:93%;top:26%;background:rgba(255,32,96,.20);border-color:#ff2060;box-shadow:0 0 7px rgba(255,32,96,.8)}.hangar-login .hud-orbit-marker:nth-child(4){left:98%;top:50%}.hangar-login .hud-orbit-marker:nth-child(5){left:91%;top:75%;background:rgba(255,255,0,.16);border-color:#ffff00;box-shadow:0 0 7px rgba(255,255,0,.7)}.hangar-login .hud-orbit-marker:nth-child(6){left:72%;top:93%}.hangar-login .hud-orbit-marker:nth-child(7){left:50%;top:98%;background:rgba(255,32,96,.16);border-color:#ff2060;box-shadow:0 0 7px rgba(255,32,96,.8)}.hangar-login .hud-orbit-marker:nth-child(8){left:26%;top:93%}.hangar-login .hud-orbit-marker:nth-child(9){left:8%;top:75%}.hangar-login .hud-orbit-marker:nth-child(10){left:2%;top:50%}.hangar-login .hud-orbit-marker:nth-child(11){left:9%;top:25%;background:rgba(255,255,0,.16);border-color:#ffff00;box-shadow:0 0 7px rgba(255,255,0,.7)}.hangar-login .hud-orbit-marker:nth-child(12){left:27%;top:7%}
@keyframes hud-marker-wheel{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}
.hangar-login .hud-signal-dot{position:absolute;width:5px;height:5px;border-radius:50%;background:#00ffff;box-shadow:0 0 8px #00ffff,0 0 16px rgba(0,255,255,.42);animation:hud-signal-pulse 1.8s ease-in-out infinite}
.hangar-login .hud-signal-dot--top{left:50%;top:0;transform:translate(-50%,-50%)}.hangar-login .hud-signal-dot--right{right:0;top:50%;transform:translate(50%,-50%);background:#ff2060;box-shadow:0 0 8px #ff2060,0 0 16px rgba(255,32,96,.38);animation-delay:.45s}.hangar-login .hud-signal-dot--bottom{left:50%;bottom:0;transform:translate(-50%,50%);background:#ffff00;box-shadow:0 0 8px #ffff00,0 0 16px rgba(255,255,0,.34);animation-delay:.9s}.hangar-login .hud-signal-dot--left{left:0;top:50%;transform:translate(-50%,-50%);animation-delay:1.35s}
@keyframes hud-signal-pulse{0%,100%{opacity:.30;filter:brightness(.7)}50%{opacity:1;filter:brightness(1.4)}}
.hangar-login .hud-orbit-notch{position:absolute;width:22px;height:22px;opacity:.65}.hangar-login .hud-orbit-notch::before,.hangar-login .hud-orbit-notch::after{content:\"\";position:absolute;background:#00ffff;box-shadow:0 0 7px rgba(0,255,255,.48)}.hangar-login .hud-orbit-notch::before{width:22px;height:1px;top:10px;left:0}.hangar-login .hud-orbit-notch::after{width:1px;height:22px;top:0;left:10px}.hangar-login .hud-orbit-notch--top{left:50%;top:-11px;transform:translateX(-50%)}.hangar-login .hud-orbit-notch--right{right:-11px;top:50%;transform:translateY(-50%) rotate(90deg)}.hangar-login .hud-orbit-notch--bottom{left:50%;bottom:-11px;transform:translateX(-50%) rotate(180deg)}.hangar-login .hud-orbit-notch--left{left:-11px;top:50%;transform:translateY(-50%) rotate(270deg)}
@media(max-width:720px){.hangar-login .hud-orbit-details{width:392px;height:392px}.hangar-login .hud-orbit-arc--outer{width:382px;height:382px}.hangar-login .hud-orbit-arc--inner{width:350px;height:350px}}
@media(prefers-reduced-motion:reduce){.hangar-login .hud-orbit-details *{animation:none!important}}`}</style>>\n          <div className="hud-bg" aria-hidden />
          <div className="hud-scanlines" aria-hidden />
          <div className="hud-sweep" aria-hidden />
          <div className="hud-particles" aria-hidden>
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="hud-particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 8}s`,
                  animationDuration: `${5 + Math.random() * 10}s`,
                }}
              />
            ))}
          </div>

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
            <div className="hud-core__pulse hud-core__pulse--three" />

            {/* Outer rings with red/blue gradient effect */}
            <Ticks size={520} count={72} length={18} duration={65} />
            <Ticks size={480} count={144} length={10} duration={55} reverse />
            <Ring size={460} dash="1 20" duration={40} opacity={0.9} thickness={2.5} flow color="red" />
            <Ring size={440} dash="3 15" duration={45} opacity={0.8} thickness={2} color="cyan" />
            <Ring size={420} dash="8 12 4 12" duration={38} reverse opacity={0.75} thickness={1.8} flow pulse color="pink" />
            <Ring size={400} dash="6 14" duration={42} opacity={0.7} thickness={2} color="red" />
            <Ring size={380} dash="60 18 8 18" duration={35} reverse opacity={0.85} thickness={2.2} flow color="cyan" />

            {/* Middle rings */}
            <Ring size={360} dash="2 8" duration={32} opacity={0.65} thickness={1.5} color="red" />
            <Ring size={340} dash="16 8" duration={30} reverse opacity={0.7} color="cyan" />
            <Ring size={320} dash="4 10" duration={28} opacity={0.75} thickness={1.8} flow color="pink" />
            <Ring size={300} dash="92 16 12 14" duration={25} reverse opacity={0.8} thickness={2} flow pulse color="red" />
            <Ring size={280} dash="5 14" duration={23} opacity={0.65} color="cyan" />

            {/* Inner rings */}
            <Ring size={260} dash="120 30" duration={20} reverse opacity={1} thickness={2.8} color="red" />
            <Ring size={240} dash="16 5 2 8" duration={18} opacity={0.8} flow color="cyan" />
            <Ring size={220} dash="3 9" duration={16} reverse opacity={0.9} color="pink" />
            <Ring size={200} dash="30 12" duration={14} opacity={0.85} pulse color="red" />
            <Ring size={180} dash="8 6" duration={12} opacity={0.8} color="cyan" />

            {/* Elementos orbitais extras ao redor dos anéis */}
            <div className="hud-orbit-details" aria-hidden>
              <div className="hud-orbit-arc hud-orbit-arc--outer" />
              <div className="hud-orbit-arc hud-orbit-arc--inner" />
              <div className="hud-orbit-markers">
                {Array.from({ length: 12 }, (_, i) => <span key={i} className="hud-orbit-marker" />)}
              </div>
              <span className="hud-signal-dot hud-signal-dot--top" />
              <span className="hud-signal-dot hud-signal-dot--right" />
              <span className="hud-signal-dot hud-signal-dot--bottom" />
              <span className="hud-signal-dot hud-signal-dot--left" />
              <div className="hud-orbit-notch hud-orbit-notch--top" />
              <div className="hud-orbit-notch hud-orbit-notch--right" />
              <div className="hud-orbit-notch hud-orbit-notch--bottom" />
              <div className="hud-orbit-notch hud-orbit-notch--left" />
            </div>

            {/* Orbital elements */}
            <div className="hud-core__orbit hud-core__orbit--outer">
              <span className="hud-core__orbit-dot hud-core__orbit-dot--red" />
            </div>
            <div className="hud-core__orbit hud-core__orbit--middle">
              <span className="hud-core__orbit-dot hud-core__orbit-dot--cyan" />
            </div>
            <div className="hud-core__orbit hud-core__orbit--inner">
              <span className="hud-core__orbit-dot hud-core__orbit-dot--small hud-core__orbit-dot--red" />
            </div>

            {/* Center */}
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
