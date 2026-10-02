import hud from "@/assets/hangar-hud.mp4.asset.json";
import { useEffect, useState, type ReactNode } from "react";

const BUTTON_DELAY = 2500;
const EXIT_DELAY = 650;

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
        <section
          className={`hangar-login ${exiting ? "hangar-login--exiting" : ""}`}
          aria-label="Acesso ao Hangar One"
        >
          <video
            className="hangar-login__video"
            src={hud.url}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />

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
