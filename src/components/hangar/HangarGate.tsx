import { useEffect, useState, type ReactNode } from "react";

const BUTTON_DELAY = 5200;
const EXIT_DELAY = 900;

function SmallTarget({ className = "", reverse = false }: { className?: string; reverse?: boolean }) {
  return (
    <div className={`target target--small ${className} ${reverse ? "target--reverse" : ""}`} aria-hidden="true">
      <span className="target__orbit orbit-1" />
      <span className="target__orbit orbit-2" />
      <span className="target__orbit orbit-3" />
      <span className="target__cross horizontal" />
      <span className="target__cross vertical" />
      <span className="target__dot" />
      <span className="target__pointer" />
    </div>
  );
}

function MainTarget() {
  return (
    <div className="target target--main" aria-hidden="true">
      <span className="target__halo" />
      <span className="target__orbit orbit-outer" />
      <span className="target__orbit orbit-dashed" />
      <span className="target__orbit orbit-red" />
      <span className="target__orbit orbit-inner" />
      <span className="target__arc arc-a" />
      <span className="target__arc arc-b" />
      <span className="target__arc arc-c" />
      <span className="target__ticks" />
      <span className="target__cross horizontal" />
      <span className="target__cross vertical" />
      <span className="target__dot" />
      <span className="target__pointer pointer-left" />
      <span className="target__pointer pointer-right" />
      <span className="target__pointer pointer-top" />
      <span className="target__pointer pointer-bottom" />
      <span className="target__scanline" />
    </div>
  );
}

function DataBlock({ className = "" }: { className?: string }) {
  return (
    <div className={`red-data ${className}`} aria-hidden="true">
      <div className="red-data__title">TARGET ANALYSIS</div>
      <div className="red-data__lines">
        {["SIGNAL  98.42", "LOCK    100.00", "RANGE   042.7", "VECTOR  +12.8", "STATUS  TRACKING"].map((line) => (
          <span key={line}>{line}</span>
        ))}
      </div>
      <i className="red-data__bar" />
      <i className="red-data__bar red-data__bar--2" />
      <i className="red-data__bar red-data__bar--3" />
    </div>
  );
}

function BottomGraph() {
  return (
    <div className="red-graph" aria-hidden="true">
      <div className="red-graph__grid" />
      <svg viewBox="0 0 330 80" preserveAspectRatio="none">
        <polyline
          points="0,66 13,60 25,64 37,52 50,58 63,42 77,51 91,32 106,39 121,24 137,35 153,15 168,29 184,18 201,34 215,22 231,37 245,29 260,42 277,24 293,31 310,14 330,19"
          fill="none"
          className="red-graph__line"
        />
      </svg>
      <div className="red-graph__labels"><span>01</span><span>07</span><span>14</span><span>21</span><span>30</span></div>
    </div>
  );
}

function SideLines() {
  return (
    <div className="red-side-lines" aria-hidden="true">
      {Array.from({ length: 8 }, (_, i) => <i key={i} style={{ "--i": i } as React.CSSProperties} />)}
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
        <div className={`target-loader ${exiting ? "target-loader--exiting" : ""}`} role="status" aria-label="Inicializando Hangar One">
          <div className="target-loader__grain" />
          <div className="target-loader__glow" />

          <div className="target-ui">
            <MainTarget />

            <SmallTarget className="target-pos-1" />
            <SmallTarget className="target-pos-2" reverse />
            <SmallTarget className="target-pos-3" />
            <SmallTarget className="target-pos-4" reverse />

            <DataBlock className="data-left" />
            <DataBlock className="data-right" />
            <SideLines />
            <BottomGraph />

            <div className="red-cross cross-1" />
            <div className="red-cross cross-2" />
            <div className="red-cross cross-3" />
            <div className="red-cross cross-4" />
            <div className="red-bracket bracket-left" />
            <div className="red-bracket bracket-right" />

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
              <span>LINK: ONLINE</span>
              <span>SCAN: ACTIVE</span>
              <span>LOCK: STABLE</span>
              <b>WAITING FOR AUTHORIZATION</b>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
