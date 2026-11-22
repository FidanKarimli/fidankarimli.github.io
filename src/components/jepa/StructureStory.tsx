import { useEffect, useState } from "react";
import { Figure } from "./shared";

/**
 * The four levels of protein structure as one short story, drawn in order:
 * a chain of beads, then helices and sheets, then one folded chain, then chains assembling.
 *
 * - Plays once when it scrolls into view (hydrate with client:visible); "Replay" runs it again.
 * - Uses the site's light/dark theme and the same residue colours as the other figures.
 * - Without JavaScript, or with reduced motion, you simply see the finished picture.
 * - Conceptual drawing, not real protein coordinates.
 */

const r2 = (v: number) => Math.round(v * 100) / 100;
const col = (k: "h" | "c" | "p") => `var(--aa-${k})`;

// A helix drawn as a sine wave.
const HELIX = Array.from({ length: 61 }, (_, i) => {
  const x = 26 + i * 2.8;
  const y = 62 + Math.sin((i / 60) * Math.PI * 2 * 5 - Math.PI / 2) * 24;
  return `${i ? "L" : "M"}${r2(x)} ${r2(y)}`;
}).join(" ");

const BEADS: [string, "h" | "c" | "p"][] = [["M", "h"], ["K", "c"], ["L", "h"], ["E", "c"], ["V", "h"], ["S", "p"], ["T", "p"]];

const STAGES = [
  { n: "01", title: "Primary", text: "the sequence of amino acids" },
  { n: "02", title: "Secondary", text: "local patterns: helices and sheets" },
  { n: "03", title: "Tertiary", text: "the full 3D shape of one chain" },
  { n: "04", title: "Quaternary", text: "how several chains fit together" },
];

export default function StructureStory() {
  const [play, setPlay] = useState(false);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    setArmed(true);
    const t = setTimeout(() => setPlay(true), 250);
    return () => clearTimeout(t);
  }, []);

  const replay = () => {
    setPlay(false);
    setTimeout(() => setPlay(true), 80);
  };

  return (
    <Figure
      label="The four levels of protein structure, drawn one after another: primary, secondary, tertiary and quaternary"
      caption="Each level builds on the one before it."
    >
      <div className={`ss${armed ? " armed" : ""}${play ? " play" : ""}`}>
        <div className="ss-grid">
          {/* 01 Primary */}
          <div className="ss-col">
            <svg viewBox="0 20 220 150" role="img" aria-label="Seven amino acids in a row, joined like beads on a string.">
              {BEADS.map(([l, k], i) => (
                <g key={i}>
                  {i > 0 && <line x1={32 + (i - 1) * 26 + 11.5} y1={100} x2={32 + i * 26 - 11.5} y2={100} className="ss-link a" style={{ ["--d" as string]: `${i * 0.12}s` }} />}
                  <g className="a bead" style={{ ["--d" as string]: `${i * 0.12}s` }}>
                    <circle cx={32 + i * 26} cy={100} r={11.5} fill={col(k)} />
                    <text x={32 + i * 26} y={104.2} className="ss-bl">{l}</text>
                  </g>
                </g>
              ))}
            </svg>
            <Caption s={STAGES[0]} delay={0.9} />
          </div>

          {/* 02 Secondary */}
          <div className="ss-col">
            <svg viewBox="0 20 220 150" role="img" aria-label="A helix, drawn as a coil, above two sheet strands drawn as arrows running in opposite directions.">
              <path className="draw" pathLength={1} d={HELIX} stroke={col("h")} strokeWidth={6} style={{ ["--d" as string]: "1.5s", ["--t" as string]: "1.5s" }} />
              <path className="a arrow-r" d="M30 109 H156 V102 L172 116 L156 130 V123 H30 Z" fill={col("p")} fillOpacity={0.9} style={{ ["--d" as string]: "2.9s" }} />
              <path className="a arrow-l" d="M190 139 H64 V132 L48 146 L64 160 V153 H190 Z" fill={col("p")} fillOpacity={0.5} style={{ ["--d" as string]: "3.2s" }} />
            </svg>
            <Caption s={STAGES[1]} delay={1.5} />
          </div>

          {/* 03 Tertiary */}
          <div className="ss-col">
            <svg viewBox="0 20 220 150" role="img" aria-label="One chain looping back on itself into a folded shape.">
              <path className="draw" pathLength={1} d="M42 140 C 22 92, 52 44, 96 58 C 130 70, 124 112, 96 108 C 76 105, 84 74, 112 74 C 150 74, 190 96, 176 130 C 168 150, 138 150, 128 138" stroke={col("c")} strokeWidth={6} style={{ ["--d" as string]: "3.6s", ["--t" as string]: "1.8s" }} />
            </svg>
            <Caption s={STAGES[2]} delay={3.6} />
          </div>

          {/* 04 Quaternary */}
          <div className="ss-col">
            <svg viewBox="0 20 220 150" role="img" aria-label="Three separate chains, each folded, sitting together as one assembly.">
              <path className="draw" pathLength={1} d="M44 142 C 34 96, 44 54, 78 56 C 108 58, 104 104, 86 122" stroke={col("h")} strokeWidth={6} style={{ ["--d" as string]: "5.6s", ["--t" as string]: "1s" }} />
              <path className="draw" pathLength={1} d="M186 56 C 194 102, 186 138, 152 136 C 124 134, 120 106, 128 92" stroke={col("c")} strokeWidth={6} style={{ ["--d" as string]: "6.3s", ["--t" as string]: "1s" }} />
              <path className="draw" pathLength={1} d="M92 80 C 100 56, 150 56, 140 76 C 132 92, 98 96, 92 80 Z" stroke={col("p")} strokeWidth={6} style={{ ["--d" as string]: "7s", ["--t" as string]: "1s" }} />
            </svg>
            <Caption s={STAGES[3]} delay={5.6} />
          </div>
        </div>

        <button type="button" className="ss-replay" onClick={replay}>↻ Replay</button>
      </div>

      <noscript>
        <style>{`.ss .a,.ss .draw,.ss .ss-cap{opacity:1!important;animation:none!important;stroke-dashoffset:0!important}`}</style>
      </noscript>
      <style>{`
        .ss { position: relative; padding: 0.4rem 0 0; }
        .ss-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0 1.4rem; }
        @media (max-width: 640px) { .ss-grid { grid-template-columns: 1fr 1fr; gap: 1.2rem 1.2rem; } }
        .ss-col { min-width: 0; }
        .ss svg { width: 100%; height: auto; display: block; }
        .ss .draw { fill: none; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 1 1; }
        .ss-link { stroke: var(--fig-line); stroke-width: 3; stroke-linecap: round; }
        .ss-bl { font-family: var(--font-ui); font-size: 11px; font-weight: 700; text-anchor: middle; fill: var(--background); }

        .ss-cap { border-top: 1px solid var(--fig-line); padding-top: 0.5rem; margin-top: 0.2rem; }
        .ss-cap .n { display: block; font-size: 0.7rem; letter-spacing: 0.08em; color: var(--fig-note); }
        .ss-cap .t { display: block; font-size: 0.95rem; font-weight: 600; }
        .ss-cap .d { display: block; font-size: 0.8rem; color: var(--fig-note); line-height: 1.35; }

        /* Hidden until the story starts (only once JavaScript is running). */
        .ss.armed .a, .ss.armed .ss-cap { opacity: 0; }
        .ss.armed .draw { opacity: 0; stroke-dashoffset: 1; }

        .ss.play .bead { animation: ss-pop 0.5s cubic-bezier(0.2, 1.4, 0.4, 1) var(--d, 0s) both; transform-box: fill-box; transform-origin: center; }
        .ss.play .ss-link { animation: ss-fade 0.3s ease-out var(--d, 0s) both; }
        .ss.play .draw { animation: ss-draw var(--t, 1.2s) ease-in-out var(--d, 0s) both; }
        .ss.play .arrow-r { animation: ss-slide-r 0.7s ease-out var(--d, 0s) both; }
        .ss.play .arrow-l { animation: ss-slide-l 0.7s ease-out var(--d, 0s) both; }
        .ss.play .ss-cap { animation: ss-fade 0.6s ease-out var(--d, 0s) both; }

        @keyframes ss-pop { from { opacity: 0; transform: scale(0.3); } to { opacity: 1; transform: scale(1); } }
        @keyframes ss-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes ss-draw { from { opacity: 1; stroke-dashoffset: 1; } to { opacity: 1; stroke-dashoffset: 0; } }
        @keyframes ss-slide-r { from { opacity: 0; transform: translateX(-24px); } to { opacity: 1; transform: none; } }
        @keyframes ss-slide-l { from { opacity: 0; transform: translateX(24px); } to { opacity: 1; transform: none; } }

        .ss-replay {
          margin-top: 0.9rem; padding: 0; background: none; border: 0; font: inherit; font-size: 0.78rem;
          color: var(--fig-note); text-decoration: underline; text-decoration-style: dashed; text-underline-offset: 3px; cursor: pointer;
        }
        .ss-replay:hover { color: var(--foreground); }

        @media (prefers-reduced-motion: reduce) {
          .ss.armed .a, .ss.armed .ss-cap, .ss.armed .draw { opacity: 1; stroke-dashoffset: 0; }
          .ss.play .a, .ss.play .draw, .ss.play .ss-cap, .ss.play .ss-link { animation: none; }
          .ss-replay { display: none; }
        }
      `}</style>
    </Figure>
  );
}

function Caption({ s, delay }: { s: { n: string; title: string; text: string }; delay: number }) {
  return (
    <div className="ss-cap" style={{ ["--d" as string]: `${delay}s` }}>
      <span className="n">{s.n}</span>
      <span className="t">{s.title}</span>
      <span className="d">{s.text}</span>
    </div>
  );
}
