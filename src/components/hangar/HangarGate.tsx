import { useEffect, useState, type ReactNode } from "react";

const BUTTON_DELAY = 5200;
const EXIT_DELAY = 850;

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
      <div className={ready ? "hud-app hud-app--ready" : "hud-app"} aria-hidden={!ready}>
        {children}
      </div>

      {!ready && (
        <div className={`reference-loader ${exiting ? "reference-loader--exiting" : ""}`} role="status" aria-label="Inicializando Hangar One">
          <video
            className="reference-loader__video"
            src="/loader-reference.webm"
            autoPlay
            muted
            playsInline
            loop
            preload="auto"
          />

          <div className="reference-loader__veil" />

          <div className={`reference-loader__entry ${showButton ? "reference-loader__entry--visible" : ""}`}>
            <button type="button" onClick={enter} className="reference-loader__button">
              <span className="reference-loader__beam" />
              <span>ENTRAR NO HANGAR ONE</span>
              <small>ACCESS CONTROL // PRESS TO CONTINUE</small>
              <i className="corner corner-tl" />
              <i className="corner corner-tr" />
              <i className="corner corner-bl" />
              <i className="corner corner-br" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
