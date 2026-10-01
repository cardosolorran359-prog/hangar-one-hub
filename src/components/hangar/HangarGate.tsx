import { useEffect, useRef, useState, type ReactNode } from "react";
import gundam from "@/assets/gundam.png.asset.json";

const KEY = "hangar-one:gate";

const BOOT_LINES = [
  "INICIALIZANDO NÚCLEO DA BANCADA",
  "CALIBRANDO SENSORES DE DIAGNÓSTICO",
  "CANAL USB EM ESPERA",
  "ESTAÇÃO 01 SINCRONIZADA",
];

const LOCKS = [
  { top: "19%", left: "47.5%", label: "ÓPTICA: ATIVA", delay: 1.6 },
  { top: "37%", left: "52.5%", label: "NÚCLEO TÉRMICO: ESTÁVEL", delay: 2.6 },
  { top: "58%", left: "44%", label: "ATUADORES: SINCRONIZADOS", delay: 3.6 },
  { top: "76%", left: "51%", label: "HIDRÁULICA: 100%", delay: 4.6 },
];

const STEAM = [
  { left: "41%", top: "46%", delay: 2.4, dur: 6.5 },
  { left: "56%", top: "48%", delay: 4.1, dur: 7.4 },
  { left: "48%", top: "72%", delay: 3.2, dur: 8 },
];

type Phase = "boot" | "intro" | "leaving" | "done";

function Corner({ className }: { className: string }) {
  return (
    <div className={`pointer-events-none absolute h-10 w-10 border-primary/60 ${className}`} />
  );
}

export function HangarGate({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>("boot");
  const [step, setStep] = useState(0);
  const timers = useRef<number[]>([]);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem(KEY) === "1"; } catch { /* ignore */ }
    if (seen) { setPhase("done"); return; }
    setPhase("intro");
    BOOT_LINES.forEach((_, i) => {
      timers.current.push(window.setTimeout(() => setStep(i + 1), 500 + i * 420));
    });
    return () => { timers.current.forEach(clearTimeout); timers.current = []; };
  }, []);

  // Parallax 3D (mouse + giroscópio)
  useEffect(() => {
    if (phase !== "intro") return;
    let raf = 0;
    const apply = (nx: number, ny: number) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = stageRef.current;
        if (!el) return;
        el.style.transform =
          `translate(-50%, -50%) rotateY(${nx * 6}deg) rotateX(${-ny * 5}deg) translate3d(${nx * -26}px, ${ny * -18}px, 0) scale(1.06)`;
      });
    };
    const onMove = (e: PointerEvent) => {
      apply((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    };
    const onTilt = (e: DeviceOrientationEvent) => {
      const g = Math.max(-1, Math.min(1, (e.gamma ?? 0) / 35));
      const b = Math.max(-1, Math.min(1, ((e.beta ?? 45) - 45) / 35));
      apply(g, b);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("deviceorientation", onTilt);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("deviceorientation", onTilt);
    };
  }, [phase]);

  const enter = () => {
    try { sessionStorage.setItem(KEY, "1"); } catch { /* ignore */ }
    setPhase("leaving");
    window.setTimeout(() => setPhase("done"), 700);
  };

  return (
    <>
      <div className={phase === "done" ? "" : "pointer-events-none select-none opacity-0"} aria-hidden={phase !== "done"}>
        {children}
      </div>

      {phase !== "done" && (
        <div
          className="gate-anim fixed inset-0 z-[80] overflow-hidden bg-[#05080d]"
          style={phase === "leaving" ? { animation: "gate-exit 0.7s cubic-bezier(0.7,0,0.3,1) forwards" } : undefined}
        >
          {/* Palco 3D com o robô */}
          <div className="absolute inset-0" style={{ perspective: "1200px" }}>
            <div
              ref={stageRef}
              className="gate-stage absolute left-1/2 top-1/2"
              style={{ transform: "translate(-50%,-50%) scale(1.06)" }}
            >
              <img
                src={gundam.url}
                alt="Hangar de manutenção"
                className="absolute inset-0 h-full w-full object-cover"
                style={phase === "intro" ? { animation: "gate-reveal 2.2s cubic-bezier(0.2,0.7,0.2,1) forwards, gate-drift 22s 2.2s ease-in-out infinite alternate" } : { opacity: 0 }}
              />

              {/* Visor óptico */}
              <div
                className="pointer-events-none absolute h-16 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-screen"
                style={{
                  left: "47.5%", top: "21%",
                  background: "radial-gradient(ellipse at center, rgba(255,120,110,0.95) 0%, rgba(255,70,60,0.45) 35%, transparent 70%)",
                  animation: "gate-ignite 1.6s 1.4s both, gate-core 4.5s 3s ease-in-out infinite",
                }}
              />
              {/* Reator do peito */}
              <div
                className="pointer-events-none absolute h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-screen"
                style={{
                  left: "49%", top: "38%",
                  background: "radial-gradient(circle at center, color-mix(in oklab, var(--primary) 85%, white) 0%, color-mix(in oklab, var(--primary) 45%, transparent) 30%, transparent 68%)",
                  animation: "gate-ignite 1.8s 2s both, gate-core 3.4s 3.6s ease-in-out infinite",
                }}
              />

              {/* Vapor de arrefecimento */}
              {STEAM.map((s) => (
                <div
                  key={s.left + s.top}
                  className="pointer-events-none absolute h-24 w-24 -translate-x-1/2 rounded-full blur-2xl mix-blend-screen"
                  style={{
                    left: s.left, top: s.top,
                    background: "radial-gradient(circle, rgba(190,215,255,0.45) 0%, transparent 70%)",
                    animation: `gate-steam ${s.dur}s ${s.delay}s ease-out infinite`,
                  }}
                />
              ))}

              {/* Varredura laser de diagnóstico */}
              <div
                className="pointer-events-none absolute inset-x-0 h-[2px] mix-blend-screen"
                style={{
                  background: "linear-gradient(90deg, transparent, color-mix(in oklab, var(--primary) 90%, white) 50%, transparent)",
                  boxShadow: "0 0 24px 6px color-mix(in oklab, var(--primary) 55%, transparent)",
                  animation: "gate-laser 7s 2s linear infinite",
                }}
              />

              {/* Miras de telemetria */}
              {LOCKS.map((l) => (
                <div
                  key={l.label}
                  className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: l.left, top: l.top, animation: `gate-reticle 7s ${l.delay}s ease-out infinite` }}
                >
                  <div className="relative h-14 w-14">
                    <span className="absolute left-0 top-0 h-3 w-3 border-l border-t border-primary" />
                    <span className="absolute right-0 top-0 h-3 w-3 border-r border-t border-primary" />
                    <span className="absolute bottom-0 left-0 h-3 w-3 border-b border-l border-primary" />
                    <span className="absolute bottom-0 right-0 h-3 w-3 border-b border-r border-primary" />
                  </div>
                  <span className="absolute left-16 top-1/2 hidden -translate-y-1/2 whitespace-nowrap font-mono text-[9px] tracking-[0.18em] text-primary/90 sm:inline">
                    {l.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Vinhetas e grade */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,#05080d_100%)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#05080d] via-[#05080d]/15 to-[#05080d]/45" />
          <div
            className="absolute inset-0 opacity-[0.14] mix-blend-screen"
            style={{ backgroundImage: "repeating-linear-gradient(to bottom, color-mix(in oklab, var(--primary) 40%, transparent) 0 1px, transparent 1px 4px)" }}
          />
          <div
            className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-primary/25 to-transparent mix-blend-screen"
            style={{ animation: "gate-sweep 5.5s linear infinite" }}
          />

          {/* Flash de despressurização ao entrar */}
          {phase === "leaving" && (
            <div
              className="pointer-events-none absolute inset-0 bg-primary/70 mix-blend-screen"
              style={{ animation: "gate-flash 0.6s ease-out forwards" }}
            />
          )}

          {/* HUD cantos */}
          <Corner className="left-5 top-5 border-l-2 border-t-2" />
          <Corner className="right-5 top-5 border-r-2 border-t-2" />
          <Corner className="bottom-5 left-5 border-b-2 border-l-2" />
          <Corner className="bottom-5 right-5 border-b-2 border-r-2" />

          {/* Conteúdo */}
          <div className="relative z-10 flex h-full flex-col items-center justify-between px-6 py-10 sm:px-10 sm:py-14">
            <div className="flex w-full max-w-5xl items-center justify-between font-mono text-[10px] tracking-[0.2em] text-primary/80 sm:text-xs">
              <span style={{ animation: "gate-flicker 2.6s ease-in-out infinite" }}>● SISTEMA: ONLINE</span>
              <span className="hidden sm:inline">ESTAÇÃO 01 CONECTADA</span>
              <span>PROTOCOLO BANCADA</span>
            </div>

            <div className="flex w-full max-w-2xl flex-col items-center text-center">
              <p
                className="font-mono text-[10px] tracking-[0.42em] text-primary/80 sm:text-xs"
                style={{ animation: "gate-up 0.8s 0.9s both" }}
              >
                MOBILE REPAIR DIVISION
              </p>
              <h1
                className="mt-3 text-5xl font-bold uppercase leading-none tracking-tight text-foreground sm:text-7xl md:text-8xl"
                style={{ fontFamily: "var(--font-display)", animation: "gate-up 1s 1.1s both", textShadow: "0 0 40px color-mix(in oklab, var(--primary) 35%, transparent)" }}
              >
                Hangar One
              </h1>
              <p
                className="mt-4 max-w-md text-sm text-muted-foreground sm:text-base"
                style={{ animation: "gate-up 1s 1.35s both" }}
              >
                Bancada técnica integrada para diagnóstico, reparo e gestão de ordens de serviço.
              </p>

              <button
                onClick={enter}
                className="gate-clip group relative mt-9 overflow-hidden border border-primary/60 bg-gradient-to-b from-primary/25 to-primary/5 px-9 py-4 font-semibold uppercase tracking-[0.22em] text-foreground transition-all duration-300 hover:border-primary hover:from-primary/40 hover:to-primary/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                style={{ fontFamily: "var(--font-display)", animation: "gate-up 0.9s 1.6s both, gate-pulse 3s 2.5s ease-in-out infinite" }}
              >
                <span className="relative z-10 text-sm sm:text-base">Entrar no Hangar</span>
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-primary/35 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </button>
            </div>

            <div className="w-full max-w-md" style={{ animation: "gate-up 0.8s 1.8s both" }}>
              <div className="h-px w-full bg-primary/20">
                <div className="h-px bg-primary" style={{ animation: "gate-bar 2.4s 0.4s ease-out forwards" }} />
              </div>
              <ul className="mt-3 space-y-1 font-mono text-[10px] tracking-[0.16em] text-muted-foreground sm:text-[11px]">
                {BOOT_LINES.map((l, i) => (
                  <li key={l} className={`flex items-center justify-between transition-opacity duration-500 ${i < step ? "opacity-100" : "opacity-20"}`}>
                    <span>{l}</span>
                    <span className={i < step ? "text-primary" : ""}>{i < step ? "OK" : "···"}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
