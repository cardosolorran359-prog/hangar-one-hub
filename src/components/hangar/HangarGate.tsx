import { useEffect, useState, type ReactNode } from "react";

const BUTTON_DELAY = 4400;
const EXIT_DELAY = 850;

const TOP = [
  ["top-a", "0.15s", "metrics"],
  ["top-b", "0.32s", "wave"],
  ["top-c", "0.48s", "mini"],
  ["top-d", "0.64s", "wave"],
  ["top-e", "0.8s", "metrics"],
  ["top-f", "0.96s", "wave"],
  ["top-g", "1.12s", "bars"],
  ["top-h", "1.28s", "wave"],
  ["top-i", "1.44s", "mini"],
  ["top-j", "1.6s", "bars"],
  ["top-k", "1.76s", "wave"],
  ["top-l", "1.92s", "dial"],
] as const;

const BOTTOM = [
  ["bottom-code", "1.25s", "code"],
  ["bottom-left-wave", "1.55s", "waveTall"],
  ["bottom-map", "1.8s", "map"],
  ["bottom-map-wave", "2.15s", "waveTall"],
  ["bottom-chart", "2.05s", "chart"],
  ["bottom-radar", "2.35s", "radar"],
  ["bottom-data", "2.55s", "data"],
  ["bottom-dial", "2.8s", "dial"],
  ["bottom-bars", "3.05s", "bars"],
] as const;

function Panel({
  className,
  delay,
  children,
}: {
  className: string;
  delay: string;
  children: ReactNode;
}) {
  return (
    <section className={`hud-panel ${className}`} style={{ "--hud-delay": delay } as React.CSSProperties}>
      <div className="hud-panel__chrome">
        <span className="hud-panel__ticks" />
        <span className="hud-panel__led" />
      </div>
      {children}
    </section>
  );
}

function Wave({ tall = false, variant = 0 }: { tall?: boolean; variant?: number }) {
  const paths = [
    "M0 42 C8 38 15 45 22 42 S35 26 43 39 S57 48 65 34 S80 23 88 41 S102 47 110 31 S123 20 131 34 S145 48 154 25",
    "M0 35 C12 18 19 49 29 31 S45 18 55 38 S71 53 82 27 S98 15 107 40 S125 47 136 24 S148 16 154 29",
    "M0 47 C12 44 15 29 27 38 S42 52 51 34 S64 27 72 43 S86 49 97 24 S110 31 118 38 S133 42 142 19 S149 29 154 21",
    "M0 24 C10 31 15 39 24 34 S38 20 47 36 S61 50 71 32 S82 13 92 28 S108 48 118 33 S131 18 142 31 S150 45 154 37",
  ];
  const d = paths[variant % paths.length];
  return (
    <svg className={tall ? "hud-wave hud-wave--tall" : "hud-wave"} viewBox="0 0 154 60" preserveAspectRatio="none" aria-hidden="true">
      <path d={d} pathLength="1" fill="none" className="hud-wave__ghost" />
      <path d={d} pathLength="1" fill="none" className="hud-wave__line" />
      <path d={d} pathLength="1" fill="none" className="hud-wave__spark" />
    </svg>
  );
}

function MiniSignal() {
  return (
    <div className="hud-mini-signal" aria-hidden="true">
      <i /><i /><i /><i /><i /><i /><i /><i /><i /><i />
    </div>
  );
}

function Bars() {
  return (
    <div className="hud-bars" aria-hidden="true">
      {[36, 62, 47, 76, 54, 88, 43, 71, 58, 93, 49, 81, 64, 38].map((h, i) => (
        <i key={i} style={{ "--h": `${h}%`, "--i": i } as React.CSSProperties} />
      ))}
    </div>
  );
}

function Metrics() {
  return (
    <div className="hud-metrics" aria-hidden="true">
      {[
        ["CPU", "42.8"],
        ["RAM", "68.1"],
        ["I/O", "7.44"],
        ["NET", "981"],
        ["SYS", "99.6"],
        ["TEMP", "36.2"],
      ].map(([name, value]) => (
        <div className="hud-metric" key={name}>
          <span>{name}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

function Data() {
  return (
    <div className="hud-data" aria-hidden="true">
      <div className="hud-data__row"><span>STREAM</span><b>ONLINE</b></div>
      <div className="hud-data__row"><span>SYNC</span><b>100%</b></div>
      <div className="hud-data__row"><span>PACKETS</span><b>24.8K</b></div>
      <div className="hud-data__row"><span>LATENCY</span><b>04 ms</b></div>
      <div className="hud-data__row"><span>CORE</span><b>STABLE</b></div>
      <div className="hud-data__stripe" />
      <div className="hud-data__stripe stripe-2" />
      <div className="hud-data__stripe stripe-3" />
    </div>
  );
}

function Code() {
  const lines = [
    "01  const node = monitor.resolve();",
    "02  stream.attach('/telemetry');",
    "03  signal.level = 0x7F;",
    "04  calibrate.matrix();",
    "05  if (channel.ready) {",
    "06      sync.channels();",
    "07      render.dashboard();",
    "08  }",
    "09  await diagnostics.flush();",
    "10  return system.ready;",
    "11  matrix.route('/core');",
    "12  telemetry.commit();",
    "13  archive.session();",
  ];
  return (
    <div className="hud-code" aria-hidden="true">
      <div className="hud-code__cursor" />
      {lines.map((line, i) => <div key={i} style={{ "--i": i } as React.CSSProperties}><code>{line}</code></div>)}
    </div>
  );
}

function Chart() {
  return (
    <div className="hud-chart" aria-hidden="true">
      <svg viewBox="0 0 280 120" preserveAspectRatio="none">
        <g className="hud-chart__grid">
          <path d="M0 20H280M0 50H280M0 80H280M0 110H280" />
          <path d="M35 0V120M70 0V120M105 0V120M140 0V120M175 0V120M210 0V120M245 0V120" />
        </g>
        <path className="hud-chart__fill" d="M0 94 C17 92 25 71 41 80 C54 87 60 58 76 67 C92 76 101 45 116 55 C134 68 145 38 160 47 C178 58 189 71 206 48 C224 25 236 40 250 28 C263 18 270 22 280 12 L280 120 L0 120 Z" />
        <path className="hud-chart__line" d="M0 94 C17 92 25 71 41 80 C54 87 60 58 76 67 C92 76 101 45 116 55 C134 68 145 38 160 47 C178 58 189 71 206 48 C224 25 236 40 250 28 C263 18 270 22 280 12" />
      </svg>
    </div>
  );
}

function Radar() {
  return (
    <div className="hud-radar" aria-hidden="true">
      <div className="hud-radar__grid" />
      <div className="hud-radar__sweep" />
      <i className="hud-radar__dot dot-1" />
      <i className="hud-radar__dot dot-2" />
      <i className="hud-radar__dot dot-3" />
    </div>
  );
}

function Dial() {
  return (
    <div className="hud-dial" aria-hidden="true">
      <div className="hud-dial__ticks">{Array.from({ length: 18 }, (_, i) => <i key={i} style={{ "--i": i } as React.CSSProperties} />)}</div>
      <div className="hud-dial__ring" />
      <div className="hud-dial__needle" />
      <div className="hud-dial__hub" />
    </div>
  );
}

function WorldMap() {
  return (
    <div className="hud-map" aria-hidden="true">
      <svg viewBox="0 0 420 210" preserveAspectRatio="none">
        <path className="continent c-na" d="M42 47 L68 32 L88 38 L99 52 L94 71 L78 73 L69 88 L51 78 L45 62 Z" />
        <path className="continent c-sa" d="M108 88 L124 94 L132 119 L124 151 L113 174 L102 154 L106 130 L100 112 Z" />
        <path className="continent c-eu" d="M171 44 L191 37 L210 42 L224 51 L215 60 L191 58 L178 66 L163 60 Z" />
        <path className="continent c-af" d="M181 73 L206 67 L221 81 L215 104 L204 124 L191 141 L180 117 L171 94 Z" />
        <path className="continent c-as" d="M219 43 L248 37 L277 49 L303 48 L328 61 L318 79 L286 75 L266 88 L245 78 L229 88 L217 70 Z" />
        <path className="continent c-au" d="M306 132 L328 128 L350 139 L342 157 L315 159 L299 149 Z" />
        <path className="continent c-gr" d="M334 31 L348 26 L357 35 L349 44 L337 42 Z" />
        <path className="map-route route-1" d="M82 57 C143 30 226 42 315 69" />
        <path className="map-route route-2" d="M119 136 C179 99 230 92 311 144" />
      </svg>
      <span className="map-node n1" />
      <span className="map-node n2" />
      <span className="map-node n3" />
      <span className="map-node n4" />
      <span className="map-scan" />
    </div>
  );
}

function Progress() {
  return (
    <div className="hud-progress">
      <div className="hud-progress__label"><span>INITIALIZING CONTROL MATRIX</span><b>READY</b></div>
      <div className="hud-progress__track"><i /></div>
    </div>
  );
}

export function HangarGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowButton(true), BUTTON_DELAY);
    return () => window.clearTimeout(timer);
  }, []);

  const enter = () => {
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
        <div className={`hud-loader ${exiting ? "hud-loader--exiting" : ""}`} role="status" aria-label="Inicializando Hangar One">
          <div className="hud-loader__grid" />
          <div className="hud-loader__noise" />
          <div className="hud-loader__scan" />
          <div className="hud-loader__frame">
            <span className="hud-corner hud-corner--tl" />
            <span className="hud-corner hud-corner--tr" />
            <span className="hud-corner hud-corner--bl" />
            <span className="hud-corner hud-corner--br" />

            <header className="hud-topline">
              <span>HANGAR ONE // MOBILE REPAIR</span>
              <span className="hud-topline__live"><i /> LIVE TELEMETRY</span>
              <span>STATION 01</span>
            </header>

            <div className="hud-top">
              {TOP.map(([name, delay, kind], index) => (
                <Panel key={name} className={name} delay={delay}>
                  {kind === "metrics" ? <Metrics /> : kind === "wave" ? <Wave variant={index} /> : kind === "mini" ? <MiniSignal /> : kind === "bars" ? <Bars /> : <Dial />}
                </Panel>
              ))}
            </div>

            <div className="hud-bottom">
              {BOTTOM.map(([name, delay, kind], index) => (
                <Panel key={name} className={name} delay={delay}>
                  {kind === "code" ? <Code /> :
                    kind === "waveTall" ? <Wave tall variant={index} /> :
                    kind === "map" ? <WorldMap /> :
                    kind === "chart" ? <Chart /> :
                    kind === "radar" ? <Radar /> :
                    kind === "data" ? <Data /> :
                    kind === "dial" ? <Dial /> : <Bars />}
                </Panel>
              ))}
            </div>

            <div className="hud-center">
              <div className="hud-center__crosshair">
                <span className="ch-ring ring-1" />
                <span className="ch-ring ring-2" />
                <span className="ch-ring ring-3" />
                <span className="ch-dot" />
                <span className="ch-line ch-line-h" />
                <span className="ch-line ch-line-v" />
              </div>
              <div className="hud-center__brand">HANGAR ONE</div>
              <div className="hud-center__sub">DIAGNOSTIC CONTROL INTERFACE</div>
            </div>

            <div className={`hud-entry ${showButton ? "hud-entry--visible" : ""}`}>
              <button type="button" onClick={enter} className="hud-entry__button">
                <span className="hud-entry__beam" />
                <span className="hud-entry__text">ENTRAR NO HANGAR ONE</span>
                <span className="hud-entry__subtext">ACCESS CONTROL // PRESS TO CONTINUE</span>
                <i className="hud-entry__corner c1" />
                <i className="hud-entry__corner c2" />
                <i className="hud-entry__corner c3" />
                <i className="hud-entry__corner c4" />
              </button>
            </div>

            <footer className="hud-footer">
              <Progress />
              <div className="hud-footer__status">
                <span>LINK: ONLINE</span>
                <span>CHANNELS: 24</span>
                <span>CORE: STABLE</span>
                <b>WAITING FOR AUTHORIZATION</b>
              </div>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
