import { useState, type ReactNode } from "react";

const EXIT_MS = 500;

export function HangarGate({ children }: { children: ReactNode }) {
  const [exiting, setExiting] = useState(false);
  const [ready, setReady] = useState(false);

  function enterHangar() {
    if (exiting) return;
    setExiting(true);
    window.setTimeout(() => setReady(true), EXIT_MS);
  }

  return (
    <>
      <div className={ready ? "hud-app hud-app--ready" : "hud-app"} aria-hidden={!ready}>
        {children}
      </div>

      {!ready && (
        <section
          className={exiting ? "hangar-login hangar-login--exiting" : "hangar-login"}
          aria-label="Acesso ao Hangar One"
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
            className="hangar-login__button"
            type="button"
            onClick={enterHangar}
            aria-label="Entrar no Hangar One"
          >
            ENTRAR NO HANGAR ONE
          </button>
        </section>
      )}
    </>
  );
}
