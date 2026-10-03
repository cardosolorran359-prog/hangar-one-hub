import { useId } from "react";

/** Monograma tático H1 — titânio, carmesim da tela de entrada e ciano do HUD. */
export function HangarLogo({ size = 32, className }: { size?: number; className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} role="img" aria-label="Hangar One">
      <defs>
        <linearGradient id={`ti${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a3340" />
          <stop offset="1" stopColor="#0b0f15" />
        </linearGradient>
        <linearGradient id={`cr${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff3a72" />
          <stop offset="1" stopColor="#b0103c" />
        </linearGradient>
        <filter id={`gl${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* escudo hexagonal chanfrado */}
      <path d="M32 2 L58 16 L58 48 L32 62 L6 48 L6 16 Z" fill={`url(#ti${id})`} stroke="#ff2060" strokeWidth="2" strokeLinejoin="round" filter={`url(#gl${id})`} />
      <path d="M32 7 L53 18.5 L53 45.5 L32 57 L11 45.5 L11 18.5 Z" fill="none" stroke="#94a3b8" strokeOpacity=".35" strokeWidth="1" />
      {/* H */}
      <path d="M17 19 h6 v10 h8 v-10 h4 v26 h-4 v-11 h-8 v11 h-6 Z" fill="#e2e8f0" />
      {/* 1 em carmesim */}
      <path d="M39 23 l6 -4 h4 v26 h-5 v-19 l-5 3 Z" fill={`url(#cr${id})`} filter={`url(#gl${id})`} />
      {/* trilhas PCB ciano */}
      <path d="M23 31.5 h8" stroke="#00f0ff" strokeWidth="1.2" />
      <circle cx="32" cy="52" r="1.8" fill="#00f0ff" filter={`url(#gl${id})`} />
      <circle cx="32" cy="12" r="1.2" fill="#ff2060" />
    </svg>
  );
}
