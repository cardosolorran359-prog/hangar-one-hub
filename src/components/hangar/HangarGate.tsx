import { useEffect, useRef, useState, type ReactNode } from "react";

const PARTS = Array.from(
  { length: 20 },
  (_, i) => `/loader-reference-parts/part${String(i).padStart(2, "0")}.txt`,
);

const BUTTON_DELAY = 4400;
const EXIT_DELAY = 850;

async function buildReferenceVideo(): Promise<string> {
  const chunks = await Promise.all(
    PARTS.map(async (path) => {
      const response = await fetch(path, { cache: "force-cache" });
      if (!response.ok) throw new Error(`Loader part failed: ${path}`);
      return response.text();
    }),
  );

  const encoded = chunks.join("");
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return URL.createObjectURL(new Blob([bytes], { type: "video/webm" }));
}

export function HangarGate({ children }: { children: ReactNode }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [showButton, setShowButton] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    let objectUrl = "";

    buildReferenceVideo()
      .then((url) => {
        objectUrl = url;
        if (!alive) {
          URL.revokeObjectURL(url);
          return;
        }
        setVideoUrl(url);
      })
      .catch((error) => console.error("Hangar One loader:", error));

    return () => {
      alive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  useEffect(() => {
    if (!videoUrl) return;
    const timer = window.setTimeout(() => setShowButton(true), BUTTON_DELAY);
    return () => window.clearTimeout(timer);
  }, [videoUrl]);

  useEffect(() => {
    if (!videoUrl || !videoRef.current) return;
    const video = videoRef.current;
    video.currentTime = 0;
    video.play().catch(() => undefined);
  }, [videoUrl]);

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
          {videoUrl && (
            <video
              ref={videoRef}
              className="reference-loader__video"
              src={videoUrl}
              autoPlay
              muted
              playsInline
              loop
              preload="auto"
            />
          )}

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
