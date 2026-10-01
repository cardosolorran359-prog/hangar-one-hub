import { useEffect, useState, type ReactNode } from "react";

const BUTTON_DELAY = 5200;
const EXIT_DELAY = 820;

const TOP_KINDS = [
  "wave", "spectrum", "metrics", "bars", "dial", "dots",
  "wave", "pulse", "spectrum", "metrics", "segmented", "signal",
  "bars", "wave", "dial", "dots", "spectrum", "pulse",
  "metrics", "signal", "wave", "segmented", "bars", "dial",
  "dots", "wave", "spectrum", "metrics", "pulse", "signal",
] as const;

const TOP = TOP_KINDS.map((kind, i) => ({
  id: `t${i}`,
  delay: `${0.08 + i * 0.055}s`,
  kind,
}));

function Panel({ className = "", delay, children }: { className?: string; delay: string; children: ReactNode }) {
  return (
    <section
      className={`hud-panel ${className}`}
      style={{ "--hud-delay": delay } as React.CSSProperties}
      aria-hidden="true"
    >
      <div className="hud-panel__chrome">
        <span className="hud-panel__ticks" />
        <span className="hud-panel__led" />
      </div>
      {children}
    </section>
  );
}

function Wave({ variant = 0, tall = false }: { variant?: number; tall?: boolean }) {
  const waves = [
    "M0 36 C8 25 14 48 24 34 S40 23 48 37 S63 50 72 28 S89 16 97 34 S111 46 122 24 S143 14 154 30",
    "M0 28 C11 40 17 46 27 29 S41 12 52 35 S68 48 76 24 S91 18 103 38 S120 50 131 27 S145 17 154 25",
    "M0 41 C12 42 18 21 29 35 S44 49 55 33 S67 22 77 39 S91 47 101 31 S116 18 126 35 S140 45 154 21",
    "M0 23 C13 18 18 46 30 29 S44 17 55 31 S70 46 82 21 S99 14 108 32 S120 47 132 28 S145 19 154 36",
  ];
  const d = waves[variant % waves.length];
  return (
    <svg className={`hud-wave ${tall ? "hud-wave--tall" : ""}`} viewBox="0 0 154 60" preserveAspectRatio="none">
      <path d={d} fill="none" className="hud-wave__ghost" />
      <path d={d} fill="none" className="hud-wave__line" />
      <path d={d} fill="none" className="hud-wave__spark" />
    </svg>
  );
}

function Mini() {
  return (
    <div className="hud-mini" aria-hidden="true">
      {Array.from({ length: 13 }, (_, i) => <i key={i} style={{ "--i": i } as React.CSSProperties} />)}
    </div>
  );
}

function Bars() {
  return (
    <div className="hud-bars" aria-hidden="true">
      {[28, 52, 42, 72, 48, 84, 36, 64, 54, 77, 46, 88, 58, 34, 70].map((h, i) => (
        <i key={i} style={{ "--h": `${h}%`, "--i": i } as React.CSSProperties} />
      ))}
    </div>
  );
}

function Spectrum() {
  const bars = [18, 44, 72, 53, 88, 66, 36, 92, 57, 77, 43, 69, 31, 82, 51, 63];
  return (
    <div className="hud-spectrum" aria-hidden="true">
      {bars.map((h, i) => <i key={i} style={{ "--h": `${h}%`, "--i": i } as React.CSSProperties} />)}
    </div>
  );
}

function DotMatrix() {
  return (
    <div className="hud-dotmatrix" aria-hidden="true">
      {Array.from({ length: 48 }, (_, i) => <i key={i} style={{ "--i": i } as React.CSSProperties} />)}
    </div>
  );
}

function Segmented() {
  return (
    <div className="hud-segmented" aria-hidden="true">
      <div className="hud-segmented__arc" />
      <div className="hud-segmented__arc arc-2" />
      <div className="hud-segmented__arc arc-3" />
      <div className="hud-segmented__readout"><b>72.4</b><span>SYNC</span></div>
    </div>
  );
}

function Pulse() {
  return (
    <div className="hud-pulse" aria-hidden="true">
      <span /><span /><span />
      <i className="hud-pulse__beam" />
    </div>
  );
}

function SignalGrid() {
  return (
    <div className="hud-signal-grid" aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => <i key={i} style={{ "--i": i } as React.CSSProperties} />)}
    </div>
  );
}

function Metrics() {
  return (
    <div className="hud-metrics" aria-hidden="true">
      {[["CPU", "42.8"], ["RAM", "68.1"], ["I/O", "7.44"], ["NET", "981"], ["SYS", "99.6"], ["TMP", "36.2"]].map(([k, v]) => (
        <div key={k}><span>{k}</span><b>{v}</b></div>
      ))}
    </div>
  );
}

function Dial() {
  return (
    <div className="hud-dial" aria-hidden="true">
      <div className="hud-dial__ring" />
      <div className="hud-dial__ticks">
        {Array.from({ length: 18 }, (_, i) => <i key={i} style={{ "--i": i } as React.CSSProperties} />)}
      </div>
      <div className="hud-dial__needle" />
      <div className="hud-dial__hub" />
    </div>
  );
}

function Code() {
  const rows = [
    "const system = monitor.resolve();",
    "stream.attach('/telemetry');",
    "signal = channel.read();",
    "matrix.calibrate();",
    "if (signal.valid) {",
    "  sync.channels();",
    "  render.dashboard();",
    "}",
    "await diagnostics.flush();",
    "telemetry.commit();",
    "return system.ready;",
    "archive.session();",
    "matrix.route('/core');",
    "channel.open(24);",
    "status.online = true;",
  ];
  return (
    <div className="hud-code" aria-hidden="true">
      <div className="hud-code__cursor" />
      {rows.map((row, i) => <code key={i} style={{ "--i": i } as React.CSSProperties}>{row}</code>)}
    </div>
  );
}

function WorldMap() {
  return (
    <div className="hud-map" aria-hidden="true">
      <svg viewBox="0 0 460 220" preserveAspectRatio="none">
        <path className="continent" d="M52 45 L72 32 L93 38 L108 53 L102 71 L84 73 L73 88 L55 79 L49 61 Z" />
        <path className="continent" d="M119 88 L136 96 L144 119 L136 151 L123 178 L113 153 L117 130 L110 110 Z" />
        <path className="continent" d="M171 43 L194 36 L216 43 L229 53 L219 62 L193 58 L178 67 L163 60 Z" />
        <path className="continent" d="M186 73 L212 67 L228 82 L222 105 L210 126 L198 145 L186 117 L176 94 Z" />
        <path className="continent" d="M222 42 L254 36 L283 49 L314 48 L343 62 L333 80 L297 75 L274 90 L248 79 L233 88 L218 68 Z" />
        <path className="continent" d="M322 134 L347 129 L372 140 L363 158 L333 161 L315 149 Z" />
        <path className="continent" d="M365 31 L380 26 L389 36 L382 45 L369 42 Z" />
        <path className="map-route route-1" d="M91 57 C160 28 244 43 341 72" />
        <path className="map-route route-2" d="M127 138 C191 98 255 97 335 146" />
      </svg>
      <span className="map-node n1" />
      <span className="map-node n2" />
      <span className="map-node n3" />
      <span className="map-node n4" />
      <span className="map-scan" />
    </div>
  );
}

function Chart() {
  return (
    <div className="hud-chart" aria-hidden="true">
      <svg viewBox="0 0 280 120" preserveAspectRatio="none">
        <g><path d="M0 25H280M0 55H280M0 85H280" /><path d="M40 0V120M80 0V120M120 0V120M160 0V120M200 0V120M240 0V120" /></g>
        <path className="hud-chart__fill" d="M0 86 C16 80 23 61 37 74 C49 85 62 52 77 63 C91 74 106 43 119 55 C136 70 146 35 164 47 C179 58 188 70 204 50 C221 29 233 43 247 31 C260 20 272 22 280 11 L280 120 L0 120Z" />
        <path className="hud-chart__line" d="M0 86 C16 80 23 61 37 74 C49 85 62 52 77 63 C91 74 106 43 119 55 C136 70 146 35 164 47 C179 58 188 70 204 50 C221 29 233 43 247 31 C260 20 272 22 280 11" />
      </svg>
    </div>
  );
}

function Radar() {
  return (
    <div className="hud-radar" aria-hidden="true">
      <div className="hud-radar__sweep" />
      <i className="hud-radar__dot a" /><i className="hud-radar__dot b" /><i className="hud-radar__dot c" />
    </div>
  );
}

function Data() {
  return (
    <div className="hud-data" aria-hidden="true">
      {[["MEMORY", "82%"], ["CACHE", "64%"], ["THREADS", "24"], ["PACKET", "99.8%"], ["LAT", "04ms"], ["CORE", "STABLE"]].map(([k,v]) =>
        <div key={k}><span>{k}</span><b>{v}</b></div>
      )}
      <span className="hud-data__meter m1" /><span className="hud-data__meter m2" /><span className="hud-data__meter m3" />
    </div>
  );
}

function Progress() {
  return (
    <div className="hud-progress">
      <div><span>INITIALIZING CONTROL MATRIX</span><b>READY</b></div>
      <section><i /></section>
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

  const enter = () => {
    if (exiting) return;
    setExiting(true);
    window.setTimeout(() => setReady(true), EXIT_DELAY);
  };

  return (
    <>
      <div className={ready ? "hud-app hud-app--ready" : "hud-app"} aria-hidden={!ready}>{children}</div>
      {!ready && (
        <div className={`hud-loader ${exiting ? "hud-loader--exiting" : ""}`}>
          <div className="hud-loader__grid" />
          <div className="hud-loader__scan" />
          <div className="hud-loader__frame">
            <span className="hud-corner hud-corner--tl" /><span className="hud-corner hud-corner--tr" />
            <span className="hud-corner hud-corner--bl" /><span className="hud-corner hud-corner--br" />

            <header className="hud-topline">
              <span>HANGAR ONE // MOBILE REPAIR</span>
              <span className="hud-topline__live"><i /> LIVE TELEMETRY</span>
              <span>STATION 01</span>
            </header>

            <div className="hud-top">
              {TOP.map((item, i) => (
                <Panel key={item.id} className={item.id} delay={item.delay}>
                  {item.kind === "wave" ? <Wave variant={i} /> :
                    item.kind === "spectrum" ? <Spectrum /> :
                    item.kind === "metrics" ? <Metrics /> :
                    item.kind === "bars" ? <Bars /> :
                    item.kind === "dial" ? <Dial /> :
                    item.kind === "dots" ? <DotMatrix /> :
                    item.kind === "pulse" ? <Pulse /> :
                    item.kind === "segmented" ? <Segmented /> : <SignalGrid />}
                </Panel>
              ))}
            </div>

            <div className="hud-bottom">
              <Panel className="bottom-code" delay="1.35s"><Code /></Panel>

              <div className="bottom-center">
                <Panel className="center-map" delay="1.75s"><WorldMap /></Panel>
                <Panel className="center-wave" delay="2s"><Wave tall variant={1} /></Panel>
                <Panel className="center-chart" delay="2.2s"><Chart /></Panel>
              </div>

              <div className="bottom-right">
                <Panel className="right-chart" delay="2.05s"><Chart /></Panel>
                <Panel className="right-data" delay="2.25s"><Data /></Panel>
                <Panel className="right-radar" delay="2.4s"><Radar /></Panel>
                <Panel className="right-dial" delay="2.6s"><Dial /></Panel>
                <Panel className="right-bars" delay="2.8s"><Bars /></Panel>
              </div>
            </div>

            <div className="hud-center">
              <div className="hud-center__crosshair">
                <span className="ring ring-a" /><span className="ring ring-b" /><span className="ring ring-c" />
                <span className="cross-dot" /><span className="cross-h" /><span className="cross-v" />
              </div>
              <div className="hud-center__brand">HANGAR ONE</div>
              <div className="hud-center__sub">DIAGNOSTIC CONTROL INTERFACE</div>
            </div>

            <div className={`hud-entry ${showButton ? "hud-entry--visible" : ""}`}>
              <button type="button" className="hud-entry__button" onClick={enter}>
                <span className="hud-entry__beam" />
                <span className="hud-entry__text">ENTRAR NO HANGAR ONE</span>
                <span className="hud-entry__subtext">ACCESS CONTROL // PRESS TO CONTINUE</span>
                <i className="c1" /><i className="c2" /><i className="c3" /><i className="c4" />
              </button>
            </div>

            <footer className="hud-footer">
              <Progress />
              <div className="hud-footer__status">
                <span>LINK: ONLINE</span><span>CHANNELS: 24</span><span>CORE: STABLE</span>
                <b>WAITING FOR AUTHORIZATION</b>
              </div>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
