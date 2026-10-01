import { useEffect, useMemo, useState, type ReactNode } from "react";

const LOADER_MS = 6200;

const TOP_PANELS = [
  { c: "p-tl", d: "0.35s", kind: "metrics" },
  { c: "p-t1", d: "0.65s", kind: "wave" },
  { c: "p-t2", d: "0.95s", kind: "wave" },
  { c: "p-t3", d: "1.25s", kind: "metrics" },
  { c: "p-t4", d: "1.55s", kind: "bars" },
  { c: "p-tr", d: "1.85s", kind: "wave" },
] as const;

const LOWER_PANELS = [
  { c: "p-l-code", d: "2.05s", kind: "code" },
  { c: "p-l-spark", d: "2.25s", kind: "spark" },
  { c: "p-map", d: "2.45s", kind: "map" },
  { c: "p-mid-chart", d: "2.7s", kind: "chart" },
  { c: "p-mid-bars", d: "2.95s", kind: "bars" },
  { c: "p-radar", d: "3.15s", kind: "radar" },
  { c: "p-r-code", d: "3.35s", kind: "code" },
  { c: "p-r-spark", d: "3.55s", kind: "spark" },
] as const;

const MAP_PATH =
  "M39 28 C52 18 67 14 81 19 C91 23 101 30 112 30 C121 30 129 24 138 25 C151 26 159 36 166 43 C174 51 182 54 189 60 C195 65 198 75 194 83 C188 93 178 95 169 90 C161 86 158 78 149 78 C140 78 136 91 126 97 C116 103 104 105 94 99 C86 94 83 84 74 82 C64 79 57 88 47 85 C37 82 34 70 28 63 C21 55 25 38 39 28 Z";

function Panel({
  className,
  delay,
  title,
  children,
}: {
  className: string;
  delay: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      className={`hud-panel ${className}`}
      style={{ "--hud-delay": delay } as React.CSSProperties}
    >
      <div className="hud-panel__head">
        <span>{title}</span>
        <span className="hud-led" />
      </div>
      {children}
    </section>
  );
}

function Wave({ dense = false }: { dense?: boolean }) {
  const points = dense
    ? "0,52 8,48 16,54 24,38 32,49 40,42 48,52 56,33 64,47 72,36 80,45 88,34 96,40 104,30 112,44 120,28 128,42 136,25 144,37 152,31"
    : "0,45 10,39 18,45 26,41 34,46 42,34 50,42 58,23 66,39 74,30 82,45 90,36 98,42 106,28 114,39 122,21 130,35 138,16 146,31 154,22";
  return (
    <svg className="hud-wave" viewBox="0 0 154 60" preserveAspectRatio="none" aria-hidden="true">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="8" opacity=".08" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function Spark({ tall = false }: { tall?: boolean }) {
  const points = tall
    ? "0,52 8,49 16,31 24,46 32,22 40,44 48,18 56,36 64,12 72,38 80,26 88,48 96,19 104,44 112,29 120,49 128,24 136,42 144,19 152,40"
    : "0,42 8,35 16,38 24,30 32,36 40,24 48,33 56,26 64,31 72,19 80,34 88,28 96,38 104,22 112,35 120,25 128,31 136,17 144,28 152,21";
  return (
    <svg className="hud-wave" viewBox="0 0 154 60" preserveAspectRatio="none" aria-hidden="true">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function Bars() {
  return (
    <div className="hud-bars" aria-hidden="true">
      {[44, 72, 58, 88, 63, 94, 51, 76, 67, 98, 56, 84].map((h, i) => (
        <i key={i} style={{ "--h": `${h}%`, "--i": i } as React.CSSProperties} />
      ))}
    </div>
  );
}

function MetricGrid() {
  return (
    <div className="hud-metrics">
      {[["SYNC", "98.4"], ["LOAD", "41.8"], ["TEMP", "36.2"], ["VOLT", "12.84"], ["DATA", "7.9"], ["LINK", "100"]].map(([l, v]) => (
        <div key={l} className="hud-metric">
          <span>{l}</span>
          <strong>{v}</strong>
        </div>
      ))}
    </div>
  );
}

function CodeLines() {
  const rows = useMemo(
    () =>
      [
        "const node = monitor.resolve();",
        "stream.attach('/telemetry');",
        "if (signal.ok) {",
        "  sync.channels();",
        "  render.matrix();",
        "}",
        "await diagnostics.flush();",
        "return status.ready;",
      ],
    [],
  );
  return (
    <div className="hud-code" aria-hidden="true">
      {rows.map((row, i) => (
        <div key={i} style={{ "--i": i } as React.CSSProperties}>
          <span>{String(i + 1).padStart(2, "0")}</span>
          <code>{row}</code>
        </div>
      ))}
    </div>
  );
}

function LineChart() {
  return (
    <div className="hud-chart" aria-hidden="true">
      <svg viewBox="0 0 240 92" preserveAspectRatio="none">
        <g className="grid-lines">
          <path d="M0 18H240M0 46H240M0 74H240" />
          <path d="M40 0V92M80 0V92M120 0V92M160 0V92M200 0V92" />
        </g>
        <path
          className="chart-fill"
          d="M0 73 C14 70 18 64 31 68 C43 71 52 55 63 59 C76 64 82 42 96 50 C108 58 116 33 130 41 C142 48 151 56 164 44 C179 30 185 38 199 28 C211 19 225 21 240 11 L240 92 L0 92 Z"
        />
        <path
          className="chart-line"
          d="M0 73 C14 70 18 64 31 68 C43 71 52 55 63 59 C76 64 82 42 96 50 C108 58 116 33 130 41 C142 48 151 56 164 44 C179 30 185 38 199 28 C211 19 225 21 240 11"
        />
      </svg>
    </div>
  );
}

function Radar() {
  return (
    <div className="hud-radar" aria-hidden="true">
      <div className="hud-radar__rings" />
      <div className="hud-radar__sweep" />
      <span className="hud-radar__dot d1" />
      <span className="hud-radar__dot d2" />
      <span className="hud-radar__dot d3" />
    </div>
  );
}

function WorldMap() {
  return (
    <div className="hud-map">
      <svg viewBox="0 0 220 120" aria-hidden="true">
        <defs>
          <filter id="map-glow">
            <feGaussianBlur stdDeviation="1.7" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path d={MAP_PATH} fill="currentColor" opacity=".08" />
        <path d={MAP_PATH} fill="none" stroke="currentColor" strokeWidth="1.4" filter="url(#map-glow)" />
        <path d="M84 29C97 37 104 44 110 53C117 62 119 74 126 80" />
        <path d="M132 31C140 43 142 55 150 66" />
        <path d="M53 47C65 51 73 57 82 68" />
      </svg>
      <div className="hud-map__pulse mp1" />
      <div className="hud-map__pulse mp2" />
      <div className="hud-map__pulse mp3" />
    </div>
  );
}

function Progress() {
  return (
    <div className="hud-progress">
      <div className="hud-progress__head">
        <span>BOOT SEQUENCE</span>
        <strong>100%</strong>
      </div>
      <div className="hud-progress__track">
        <div className="hud-progress__fill" />
      </div>
    </div>
  );
}

export function HangarGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), LOADER_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      <div className={ready ? "hud-app hud-app--ready" : "hud-app"} aria-hidden={!ready}>
        {children}
      </div>

      {!ready && (
        <div className="hud-loader" role="status" aria-label="Inicializando Hangar One">
          <div className="hud-loader__grid" />
          <div className="hud-loader__vignette" />
          <div className="hud-loader__scan" />
          <div className="hud-loader__frame">
            <span className="corner corner-tl" />
            <span className="corner corner-tr" />
            <span className="corner corner-bl" />
            <span className="corner corner-br" />

            <div className="hud-loader__topline">
              <span>HANGAR ONE // MOBILE REPAIR</span>
              <span className="hud-live"><b /> SYSTEM BOOT</span>
              <span>STATION 01</span>
            </div>

            <div className="hud-loader__matrix">
              {TOP_PANELS.map((panel) => (
                <Panel key={panel.c} className={panel.c} delay={panel.d} title="TELEMETRY">
                  {panel.kind === "metrics" ? <MetricGrid /> : panel.kind === "wave" ? <Wave /> : <Bars />}
                </Panel>
              ))}

              {LOWER_PANELS.map((panel) => (
                <Panel key={panel.c} className={panel.c} delay={panel.d} title="DATA STREAM">
                  {panel.kind === "code" ? (
                    <CodeLines />
                  ) : panel.kind === "spark" ? (
                    <Spark tall={panel.c === "p-r-spark"} />
                  ) : panel.kind === "map" ? (
                    <WorldMap />
                  ) : panel.kind === "chart" ? (
                    <LineChart />
                  ) : panel.kind === "bars" ? (
                    <Bars />
                  ) : (
                    <Radar />
                  )}
                </Panel>
              ))}
            </div>

            <div className="hud-loader__center">
              <div className="hud-core">
                <span className="hud-core__ring r1" />
                <span className="hud-core__ring r2" />
                <span className="hud-core__ring r3" />
                <span className="hud-core__pulse" />
              </div>
              <div className="hud-loader__brand">HANGAR ONE</div>
              <div className="hud-loader__sub">DIAGNOSTIC CONTROL INTERFACE</div>
            </div>

            <div className="hud-loader__bottom">
              <Progress />
              <div className="hud-loader__status">
                <span>LINK: ONLINE</span>
                <span>CHANNELS: 24</span>
                <span>CORE: STABLE</span>
                <span>READY</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
