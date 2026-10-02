import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

const BUTTON_DELAY = 2200;
const EXIT_DELAY = 650;

function Ring({
  size,
  duration,
  reverse = false,
  opacity = 1,
  color = "red",
  variant = "red",
  flow = false,
  pulse = false,
}: {
  size: number;
  duration: number;
  reverse?: boolean;
  opacity?: number;
  color?: "white" | "red" | "orange";
  variant?: "outer" | "fine" | "red" | "redThin" | "orange" | "inner";
  flow?: boolean;
  pulse?: boolean;
}) {
  const colors = {
    white: "#eef7f6",
    red: "#f03b2d",
    orange: "#ff812f",
  };
  const stroke = colors[color];
  const center = size / 2;
  const r = size / 2 - 5;

  const pattern = {
    outer: "170 34 132 46 92 64 146 230",
    fine: "520 8",
    red: "188 28 112 24 74 46",
    redThin: "126 18 72 28 48 38",
    orange: "160 34 92 48 58 78",
    inner: "108 24 62 34 38 58",
  }[variant];

  return (
    <div
      className={`hud-ring-wrap hud-ring-ref hud-ring-ref--${variant} ${reverse ? "hud-ring--reverse" : ""}`}
      data-ring-size={size}
      data-ring-variant={variant}
      style={{
        width: size,
        height: size,
        animationDuration: `${duration}s`,
        opacity,
      }}
      aria-hidden
    >
      <svg className="hud-ring hud-ring-ref__svg" viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle
          className="hud-ring-model__track"
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke="rgba(0,0,0,.94)"
          strokeWidth={variant === "outer" ? 14 : variant === "red" || variant === "orange" ? 8 : 3}
          strokeDasharray={variant === "fine" ? "999 1" : pattern}
          strokeLinecap="butt"
        />

        <circle
          className="hud-ring-model__base"
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth={
            variant === "outer" ? 1.8 :
            variant === "red" ? 2.4 :
            variant === "redThin" ? 1.6 :
            variant === "orange" ? 2.2 :
            1.2
          }
          strokeDasharray={variant === "fine" ? "999 1" : pattern}
          strokeLinecap="butt"
          opacity={variant === "fine" ? ".55" : ".82"}
          vectorEffect="non-scaling-stroke"
        />

        {(variant === "outer" || variant === "red" || variant === "orange" || variant === "inner") && (
          <circle
            className="hud-ring-model__band"
            cx={center}
            cy={center}
            r={variant === "outer" ? r + 1 : r - 1}
            fill="none"
            stroke={stroke}
            strokeWidth={
              variant === "outer" ? 10 :
              variant === "red" ? 5.8 :
              variant === "orange" ? 5.2 :
              3.2
            }
            strokeDasharray={variant === "outer" ? "154 42 136 48 118 205" : pattern}
            strokeLinecap="butt"
            opacity={variant === "outer" ? ".96" : variant === "inner" ? ".76" : ".88"}
            vectorEffect="non-scaling-stroke"
          />
        )}

        {variant === "fine" && (
          <g className="hud-ring-model__ticks">
            {Array.from({ length: 60 }, (_, i) => {
              const angle = (i / 60) * Math.PI * 2;
              const outer = r + 2;
              const inner = outer - (i % 5 === 0 ? 11 : 5);
              return (
                <line
                  key={i}
                  x1={center + Math.cos(angle) * inner}
                  y1={center + Math.sin(angle) * inner}
                  x2={center + Math.cos(angle) * outer}
                  y2={center + Math.sin(angle) * outer}
                  stroke={stroke}
                  strokeWidth={i % 5 === 0 ? 1.4 : 0.8}
                  opacity={i % 5 === 0 ? ".78" : ".28"}
                />
              );
            })}
          </g>
        )}

        {(flow || pulse) && (
          <circle
            className="hud-ring-model__sweep"
            cx={center}
            cy={center}
            r={r - 2}
            fill="none"
            stroke={stroke}
            strokeWidth={variant === "outer" ? 2 : 1.6}
            strokeDasharray={variant === "outer" ? "34 310" : "24 230"}
            strokeLinecap="round"
            opacity=".92"
          />
        )}
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


function HudWaveform() {
  const levels = [8, 14, 6, 20, 12, 30, 10, 44, 18, 58, 26, 72, 38, 88, 22, 54, 12, 34, 8, 22, 6];
  return (
    <div className="hud-waveform" aria-hidden>
      <div className="hud-waveform__labels">
        <span>ANALYZER</span>
        <span>AUDIO / SIGNAL</span>
      </div>
      <div className="hud-waveform__frame">
        <span className="hud-waveform__bracket hud-waveform__bracket--l" />
        <span className="hud-waveform__bracket hud-waveform__bracket--r" />
        <div className="hud-waveform__line" />
        <div className="hud-waveform__bars">
          {levels.map((h, i) => (
            <i key={i} style={{ height: h, animationDelay: `${-i * 0.11}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function HudScope() {
  return (
    <div className="hud-scope" aria-hidden>
      <div className="hud-tabs"><span className="hud-tabs__active">SYSTEM</span><span>STATUS</span><span>LINK</span></div>
      <div className="hud-scope__title">TRACKING / 03</div>
      <div className="hud-scope__dial">
        <span className="hud-scope__ring" />
        <span className="hud-scope__ring hud-scope__ring--inner" />
        <span className="hud-scope__cross hud-scope__cross--h" />
        <span className="hud-scope__cross hud-scope__cross--v" />
        <span className="hud-scope__sweep" />
        <b className="hud-scope__target hud-scope__target--1" />
        <b className="hud-scope__target hud-scope__target--2" />
      </div>
      <div className="hud-scope__meta"><span>LOCK</span><strong>ACTIVE</strong></div>
    </div>
  );
}

function HudMiniPanel() {
  return (
    <div className="hud-mini-panel" aria-hidden>
      <div className="hud-mini-panel__title">SYSTEM / MATRIX</div>
      <div className="hud-mini-panel__copy">
        <span>CORE STATUS</span>
        <span>RANGE / 04.82</span>
        <span>SYNC / 99.8</span>
        <span>PHASE / 12.04</span>
      </div>
      <div className="hud-mini-panel__rail"><span style={{ width: "82%" }} /><span style={{ width: "58%" }} /><span style={{ width: "71%" }} /></div>
    </div>
  );
}

function HudBars() {
  const values = [32, 58, 43, 76, 54, 82, 44, 68, 88, 61, 42, 77, 56, 36, 66, 48, 72];
  return (
    <div className="hud-bars" aria-hidden>
      <div className="hud-module-label"><span>LOAD / CHANNEL</span><b>ACTIVE</b></div>
      <div className="hud-bars__grid">
        {values.map((v, i) => (
          <i key={i} style={{ height: `${v}%`, animationDelay: `${-i * 0.08}s` }} />
        ))}
      </div>
      <div className="hud-bars__axis"><span>01</span><span>08</span><span>16</span><span>24</span><span>32</span></div>
    </div>
  );
}

function HudLineGraph() {
  return (
    <div className="hud-linegraph" aria-hidden>
      <div className="hud-module-label"><span>VECTOR / FLOW</span><b>LIVE</b></div>
      <svg viewBox="0 0 420 110" preserveAspectRatio="none">
        <path className="hud-linegraph__grid" d="M0 22H420M0 55H420M0 88H420M70 0V110M140 0V110M210 0V110M280 0V110M350 0V110" />
        <path className="hud-linegraph__path" pathLength="1" d="M0 82 L34 82 L60 48 L88 70 L114 38 L142 74 L172 62 L200 86 L232 38 L261 58 L290 28 L322 72 L350 52 L378 92 L420 34" />
      </svg>
    </div>
  );
}

function HudGauge({ value, label, delay = 0 }: { value: number; label: string; delay?: number }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    let start = 0;
    let active = true;
    const duration = 14000;

    const tick = (now: number) => {
      if (!active) return;
      if (!start) start = now + delay;

      if (now < start) {
        frame = window.requestAnimationFrame(tick);
        return;
      }

      const elapsed = Math.min(now - start, duration);
      const ratio = elapsed / duration;
      const eased = 1 - Math.pow(1 - ratio, 3);
      setProgress(Math.round(value * eased));

      if (elapsed < duration) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    frame = window.requestAnimationFrame(tick);
    return () => {
      active = false;
      window.cancelAnimationFrame(frame);
    };
  }, [value, delay]);

  return (
    <div className="hud-gauge" aria-hidden>
      <div className="hud-gauge__dial">
        <span className="hud-gauge__arc" style={{ "--value": `${progress * 3.6}deg` } as CSSProperties} />
        <span className="hud-gauge__tick hud-gauge__tick--1" />
        <span className="hud-gauge__tick hud-gauge__tick--2" />
        <strong>{progress}%</strong>
      </div>
      <span className="hud-gauge__label">{label}</span>
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
          <style>{`/* HANGAR_ORBIT_RING_FINISH */
.hangar-login .hud-rayfield{position:absolute;left:50%;top:50%;width:620px;height:620px;transform:translate(-50%,-50%);z-index:0;pointer-events:none;overflow:visible;opacity:.72;mix-blend-mode:screen}
.hangar-login .hud-ray{position:absolute;inset:0;display:block;transform-origin:center center}
.hangar-login .hud-ray__beam{position:absolute;left:50%;top:50%;width:1px;height:49%;transform:translateX(-50%);transform-origin:50% 0;background:linear-gradient(to bottom,rgba(0,255,255,.02) 0%,rgba(0,255,255,.56) 20%,rgba(0,255,255,.22) 58%,rgba(0,255,255,0) 100%);filter:drop-shadow(0 0 4px rgba(0,255,255,.45));clip-path:inset(96% 0 0 0);animation:hud-ray-surge 3.4s ease-in-out infinite}
.hangar-login .hud-ray:nth-child(3n) .hud-ray__beam{background:linear-gradient(to bottom,rgba(82,142,255,.02) 0%,rgba(82,142,255,.50) 20%,rgba(82,142,255,.20) 58%,rgba(82,142,255,0) 100%);filter:drop-shadow(0 0 4px rgba(82,142,255,.42))}
.hangar-login .hud-ray:nth-child(5n) .hud-ray__beam{background:linear-gradient(to bottom,rgba(190,215,255,.01) 0%,rgba(190,215,255,.40) 18%,rgba(190,215,255,.14) 58%,rgba(190,215,255,0) 100%);filter:drop-shadow(0 0 3px rgba(190,215,255,.34))}
.hangar-login .hud-ray:nth-child(4n+2) .hud-ray__beam{animation-delay:-.8s}
.hangar-login .hud-ray:nth-child(4n+3) .hud-ray__beam{animation-delay:-1.55s}
.hangar-login .hud-ray:nth-child(4n) .hud-ray__beam{animation-delay:-2.2s}
@keyframes hud-ray-surge{0%,100%{opacity:.18;clip-path:inset(96% 0 0 0)}16%{opacity:.82;clip-path:inset(26% 0 0 0)}42%{opacity:.44;clip-path:inset(0 0 0 0)}70%{opacity:.20;clip-path:inset(14% 0 0 0)}}
.hangar-login .hud-core>.hud-ring-wrap{z-index:2}
.hangar-login .hud-core>.hud-ring-wrap .hud-ring{overflow:visible}
.hangar-login .hud-core>.hud-ring-wrap .hud-ring__body{opacity:.92;vector-effect:non-scaling-stroke}
.hangar-login .hud-core>.hud-ring-wrap .hud-ring__highlight{transform-box:fill-box;transform-origin:center;stroke-linecap:round;filter:drop-shadow(0 0 7px currentColor);animation:hud-ring-highlight 4.2s linear infinite}
.hangar-login .hud-core>.hud-ring-wrap:nth-child(7) .hud-ring__highlight,.hangar-login .hud-core>.hud-ring-wrap:nth-child(11) .hud-ring__highlight,.hangar-login .hud-core>.hud-ring-wrap:nth-child(15) .hud-ring__highlight{stroke-width:2.5}
@keyframes hud-ring-highlight{from{stroke-dashoffset:0;opacity:.30}38%{opacity:1}to{stroke-dashoffset:-220;opacity:.28}}
.hangar-login .hud-core__pulse--three{width:298px;height:298px;animation-delay:4s;animation-duration:6.2s;border-color:rgba(255,0,128,.12)}
.hangar-login .hud-core__orbit--middle{width:286px;height:132px;transform:rotate(58deg);animation-duration:15s;border-color:rgba(0,255,255,.10)}
.hangar-login .hud-core__orbit-dot--red{background:#ff2060;box-shadow:0 0 8px rgba(255,32,96,.95),0 0 18px rgba(255,32,96,.38)}
.hangar-login .hud-core__orbit-dot--cyan{background:#00ffff;box-shadow:0 0 8px rgba(0,255,255,.95),0 0 18px rgba(0,255,255,.36)}
@media(max-width:720px){.hangar-login .hud-rayfield{width:430px;height:430px;opacity:.58}.hangar-login .hud-core__pulse--three{width:248px;height:248px}.hangar-login .hud-core__orbit--middle{width:230px;height:106px}}
@media(prefers-reduced-motion:reduce){.hangar-login .hud-ray__beam,.hangar-login .hud-core>.hud-ring-wrap .hud-ring__highlight{animation:none!important;clip-path:none;opacity:.35}}`}</style>
\n          <div className="hud-bg" aria-hidden />

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

          <HudScope />
          <HudWaveform />
          <HudMiniPanel />
          <Radar />
          <HudBars />
          <HudLineGraph />
          <HudGauge value={93} label="AUDIO / POWER" delay={0} />
          <div className="hud-gauges hud-gauges--bottom" aria-hidden>
            <HudGauge value={99} label="CORE" delay={1200} />
            <HudGauge value={97} label="SYNC" delay={2400} />
          </div>

          <div className="hud-core" aria-hidden>
            <div className="hud-core__pulse hud-core__pulse--one" />
            <div className="hud-core__pulse hud-core__pulse--two" />
            <div className="hud-core__pulse hud-core__pulse--three" />

            <div className="hud-rayfield" aria-hidden>
              {Array.from({ length: 24 }, (_, i) => (
                <span
                  key={i}
                  className="hud-ray"
                  style={{ transform: `rotate(${i * 15}deg)` }}
                >
                  <span className="hud-ray__beam" />
                </span>
              ))}
            </div>

            {/* Modelo dos anéis — reconstrução fiel da referência */}
            <Ring size={470} duration={46} opacity={1} color="white" variant="outer" flow />
            <Ring size={425} duration={38} reverse opacity={0.42} color="red" variant="fine" />
            <Ring size={395} duration={32} opacity={0.96} color="red" variant="red" flow />
            <Ring size={355} duration={28} reverse opacity={0.72} color="red" variant="redThin" />
            <Ring size={315} duration={24} opacity={0.92} color="orange" variant="orange" flow pulse />
            <Ring size={270} duration={30} reverse opacity={0.48} color="white" variant="fine" />
            <Ring size={225} duration={18} opacity={0.86} color="orange" variant="inner" flow />
            <Ring size={190} duration={14} reverse opacity={0.90} color="red" variant="inner" flow />

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

            <div className="hud-core__fine-ticks" aria-hidden>
              {Array.from({ length: 48 }, (_, i) => (
                <i key={i} style={{ transform: `translate(-50%, -50%) rotate(${i * 7.5}deg) translateY(-74px)` }} />
              ))}
            </div>

            <div className="hud-core__triangles" aria-hidden>
              <span className="hud-core__triangle hud-core__triangle--top" />
              <span className="hud-core__triangle hud-core__triangle--right" />
              <span className="hud-core__triangle hud-core__triangle--bottom" />
              <span className="hud-core__triangle hud-core__triangle--left" />
              <span className="hud-core__chevron hud-core__chevron--top" />
              <span className="hud-core__chevron hud-core__chevron--right" />
              <span className="hud-core__chevron hud-core__chevron--bottom" />
              <span className="hud-core__chevron hud-core__chevron--left" />
            </div>

            <span className="hud-core__side-node hud-core__side-node--left"><b>+</b></span>
            <span className="hud-core__side-node hud-core__side-node--right"><b>+</b></span>

            {/* Center */}
            <div className="hud-core__center">
              <span className="hud-core__dot" />
              <span className="hud-core__label">HANGAR ONE</span>
              <span className="hud-core__sub">SYSTEM ONLINE · CORE LINK</span>
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


// Clean motion sync.


// Rings-only reference rebuild synchronized.

// Literal ring reference model sync.
