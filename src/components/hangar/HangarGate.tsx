import { useEffect, useState, type ReactNode } from "react";

const BUTTON_DELAY = 4400;
const EXIT_DELAY = 900;

function MicroCross({ className = "", delay = "0s" }: { className?: string; delay?: string }) {
  return <span className={`micro-cross ${className}`} style={{ "--delay": delay } as React.CSSProperties} aria-hidden="true" />;
}

function SatelliteTarget({ className = "", delay = "0s", size = "md", reverse = false }: { className?: string; delay?: string; size?: "sm" | "md"; reverse?: boolean }) {
  return (
    <div className={`sat-target sat-target--${size} ${className} ${reverse ? "sat-target--reverse" : ""}`} style={{ "--delay": delay } as React.CSSProperties} aria-hidden="true">
      <span className="sat-target__ring r1" />
      <span className="sat-target__ring r2" />
      <span className="sat-target__ring r3" />
      <span className="sat-target__axis axis-h" />
      <span className="sat-target__axis axis-v" />
      <span className="sat-target__dot" />
      <span className="sat-target__tick t1" />
      <span className="sat-target__tick t2" />
      <span className="sat-target__tick t3" />
      <span className="sat-target__tick t4" />
    </div>
  );
}

function MainTarget() {
  return (
    <div className="main-target" aria-hidden="true">
      <span className="main-target__glow" />
      <span className="main-target__outer" />
      <span className="main-target__outer outer-2" />
      <span className="main-target__segmented" />
      <span className="main-target__arc arc-1" />
      <span className="main-target__arc arc-2" />
      <span className="main-target__arc arc-3" />
      <span className="main-target__ring ring-1" />
      <span className="main-target__ring ring-2" />
      <span className="main-target__ring ring-3" />
      <span className="main-target__ring ring-4" />
      <span className="main-target__ring ring-5" />
      <span className="main-target__cross cross-h" />
      <span className="main-target__cross cross-v" />
      <span className="main-target__dot" />
      <span className="main-target__reticle reticle-left" />
      <span className="main-target__reticle reticle-right" />
      <span className="main-target__reticle reticle-top" />
      <span className="main-target__reticle reticle-bottom" />
      <span className="main-target__tab tab-left" />
      <span className="main-target__tab tab-right" />
      <span className="main-target__tab tab-top" />
      <span className="main-target__tab tab-bottom" />
      <span className="main-target__scan" />
    </div>
  );
}

function SideNode({ side }: { side: "left" | "right" }) {
  return (
    <div className={`side-node side-node--${side}`} aria-hidden="true">
      <span className="side-node__ring" />
      <span className="side-node__inner" />
      <span className="side-node__plus" />
      <span className="side-node__beam" />
      <i />
    </div>
  );
}

function DataColumn({ className = "" }: { className?: string }) {
  const rows = ["SIGNAL 98.42", "LOCK 100.00", "RANGE 042.7", "VECTOR +12.8", "STATUS TRACK"];
  return (
    <div className={`data-column ${className}`} aria-hidden="true">
      <b>TARGET ANALYSIS</b>
      {rows.map((row, i) => <span key={row} style={{ "--i": i } as React.CSSProperties}>{row}</span>)}
      <i className="data-column__bar bar-1" /><i className="data-column__bar bar-2" /><i className="data-column__bar bar-3" />
    </div>
  );
}

function RightStack() {
  return (
    <div className="right-stack" aria-hidden="true">
      <div className="right-stack__meter">
        {Array.from({ length: 11 }, (_, i) => <i key={i} style={{ "--i": i } as React.CSSProperties} />)}
      </div>
      <div className="right-stack__blocks">
        {Array.from({ length: 8 }, (_, i) => <i key={i} style={{ "--i": i } as React.CSSProperties} />)}
      </div>
    </div>
  );
}

function BottomGraph() {
  return (
    <div className="bottom-graph" aria-hidden="true">
      <div className="bottom-graph__grid" />
      <svg viewBox="0 0 520 92" preserveAspectRatio="none">
        <polyline
          className="bottom-graph__line"
          points="0,78 18,71 35,77 53,66 70,72 87,59 104,64 122,48 140,58 158,43 176,53 194,32 212,45 230,29 248,40 266,23 284,35 302,20 320,39 338,26 356,45 374,31 392,42 410,25 428,36 446,18 464,31 482,15 500,22 520,11"
        />
      </svg>
      <div className="bottom-graph__bars">{Array.from({ length: 17 }, (_, i) => <i key={i} style={{ "--i": i } as React.CSSProperties} />)}</div>
    </div>
  );
}

export function HangarGate({ children }: { children: ReactNode }) {
  const [showButton, setShowButton] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setShowButton(true), BUTTON_DELAY);
    return () => window.clearTimeout(t);
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
        <div className={`target-loader ${exiting ? "target-loader--exiting" : ""}`} role="status" aria-label="Inicializando Hangar One">
          <div className="target-loader__vignette" />
          <div className="target-loader__grid" />
          <div className="target-loader__scan" />

          <div className="target-ui">
            <span className="hud-cross c-a" /><span className="hud-cross c-b" /><span className="hud-cross c-c" /><span className="hud-cross c-d" />

            <MainTarget />

            <SatelliteTarget className="sat-a" delay=".45s" size="sm" />
            <SatelliteTarget className="sat-b" delay=".7s" size="md" reverse />
            <SatelliteTarget className="sat-c" delay=".9s" size="sm" />
            <SatelliteTarget className="sat-d" delay="1.1s" size="md" />
            <SatelliteTarget className="sat-e" delay="1.3s" size="sm" reverse />

            <SideNode side="left" />
            <SideNode side="right" />

            <DataColumn className="data-left" />
            <DataColumn className="data-right" />
            <RightStack />
            <BottomGraph />

            <div className="vertical-rail rail-right"><span /><span /><span /><span /><span /></div>
            <div className="vertical-rail rail-left"><span /><span /><span /></div>

            <div className="target-loader__brand">
              <span>HANGAR ONE</span>
              <small>CONTROL INTERFACE // SYSTEM READY</small>
            </div>

            <div className={`target-entry ${showButton ? "target-entry--visible" : ""}`}>
              <button type="button" className="target-entry__button" onClick={enter}>
                <span className="target-entry__sweep" />
                <span className="target-entry__text">ENTRAR NO HANGAR ONE</span>
                <span className="target-entry__sub">ACCESS CONTROL // PRESS TO CONTINUE</span>
                <i className="c1" /><i className="c2" /><i className="c3" /><i className="c4" />
              </button>
            </div>

            <div className="target-status">
              <span>LINK: ONLINE</span><span>SCAN: ACTIVE</span><span>LOCK: STABLE</span><b>WAITING FOR AUTHORIZATION</b>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
