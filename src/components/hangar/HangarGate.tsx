import { useState, type ReactNode } from "react";

const EXIT_DELAY = 650;

export function HangarGate({ children }: { children: ReactNode }) {
  const [exiting, setExiting] = useState(false);
  const [ready, setReady] = useState(false);

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
        <div
          className={`hangar-login ${exiting ? "hangar-login--exiting" : ""}`}
          aria-label="Hangar One"
        >
          <video
            className="hangar-login__video"
            src="/hangar-one-login-background.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />

          <button
            type="button"
            className="hangar-login__button"
            onClick={enterHangar}
          >
            <span className="hangar-login__button-sweep" />
            <span className="hangar-login__button-text">ENTRAR NO HANGAR ONE</span>
            <i className="hangar-login__corner hangar-login__corner--tl" />
            <i className="hangar-login__corner hangar-login__corner--tr" />
            <i className="hangar-login__corner hangar-login__corner--bl" />
            <i className="hangar-login__corner hangar-login__corner--br" />
          </button>
        </div>
      )}
    </>
  );
}
