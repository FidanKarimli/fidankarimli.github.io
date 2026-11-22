import { useEffect, useState } from "react";
import { Figure, ReplayButton } from "./shared";
import { BEADS, CHAIN_PATH } from "./chainData";

/**
 * A polypeptide chain drawn bead by bead, then a zoom into four neighbouring amino acids.
 *
 * - Plays once when it scrolls into view (hydrate with client:visible); "Replay" runs it again.
 * - Colours follow the site's light/dark theme.
 * - On phones the zoomed-in view sits below the chain, so its labels stay readable.
 * - Without JavaScript, or with reduced motion, you simply see the finished picture.
 * - Conceptual drawing: the colours are arbitrary, not real amino acids except the four zoomed ones.
 */

const ZOOM = [
  { label: "Phe", hue: 0 },
  { label: "Leu", hue: 1 },
  { label: "Ser", hue: 2 },
  { label: "Cys", hue: 3 },
];
const hue = (i: number) => `var(--h${i})`;

export default function PolypeptideChain() {
  const [armed, setArmed] = useState(false);
  const [play, setPlay] = useState(false);

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
      label="A polypeptide chain drawn as a string of colored beads, zooming in on four neighbouring amino acids: Phe, Leu, Ser and Cys"
      caption="Zoom in on any four neighbours and you can see the amino acids one by one."
    >
      <p className="jf-title">A polypeptide chain</p>
      <p className="jf-sub">Many amino acids linked in a row. Each bead is one amino acid.</p>
      <div className={`pc${armed ? " armed" : ""}${play ? " play" : ""}`}>
        <svg viewBox="0 26 720 404" role="img" aria-label="A long winding chain of colored beads. A box marks four neighbouring beads, which are shown larger as Phe, Leu, Ser and Cys.">
          <path className="pc-line draw" d={CHAIN_PATH} pathLength={1} style={{ ["--d" as string]: "0.2s", ["--t" as string]: "3s" }} />
          {BEADS.map(([x, y, c], i) => (
            <circle key={i} cx={x} cy={y} r={5.6} fill={hue(c)} className="a bead" style={{ ["--d" as string]: `${(0.2 + i * 0.0325).toFixed(3)}s` }} />
          ))}
          <rect x={561.4} y={157.4} width={69.2} height={29.2} rx={8} className="pc-box a" style={{ ["--d" as string]: "3.5s" }} />

          {/* The zoom-in, drawn inside the picture on wide screens. */}
          <g className="desk">
            <line x1={561.4} y1={186.6} x2={460} y2={262} pathLength={1} className="pc-cn draw" style={{ ["--d" as string]: "3.8s", ["--t" as string]: "0.6s" }} />
            <line x1={630.6} y1={186.6} x2={692} y2={262} pathLength={1} className="pc-cn draw" style={{ ["--d" as string]: "3.8s", ["--t" as string]: "0.6s" }} />
            <g className="a slide" style={{ ["--d" as string]: "4.2s" }}>
              <rect x={452} y={262} width={248} height={158} rx={12} className="pc-ins" />
              <text x={576} y={292} textAnchor="middle" className="pc-h">Amino acids</text>
            </g>
            {[0, 1, 2].map(i => (
              <line key={i} x1={498 + i * 52} y1={354} x2={550 + i * 52} y2={354} className="pc-bond a" style={{ ["--d" as string]: "5.8s" }} />
            ))}
            {ZOOM.map((z, i) => (
              <g key={z.label} className="a bead" style={{ ["--d" as string]: `${4.7 + i * 0.25}s` }}>
                <circle cx={498 + i * 52} cy={354} r={21} fill={hue(z.hue)} />
                <text x={498 + i * 52} y={358.3} textAnchor="middle" className="pc-bl">{z.label}</text>
              </g>
            ))}
            <text x={576} y={406} textAnchor="middle" className="pc-d a" style={{ ["--d" as string]: "5.9s" }}>each bead is one amino acid</text>
          </g>
        </svg>

        {/* The zoom-in for phones, below the chain. */}
        <div className="mob a slide" style={{ ["--d" as string]: "4.2s" }}>
          <div className="mob-title">Zoom in: four neighbouring amino acids</div>
          <div className="mob-row">
            {ZOOM.map((z, i) => (
              <span key={z.label} className="mob-item">
                <span className="mob-bead a bead" style={{ background: hue(z.hue), ["--d" as string]: `${4.7 + i * 0.25}s` }}>{z.label}</span>
                {i < ZOOM.length - 1 && <span className="mob-bond a" style={{ ["--d" as string]: "5.8s" }} />}
              </span>
            ))}
          </div>
        </div>

        <ReplayButton onClick={replay} />
      </div>

      <noscript>
        <style>{`.pc .a,.pc .draw{opacity:1!important;animation:none!important;stroke-dashoffset:0!important}`}</style>
      </noscript>
      <style>{`
        .pc {
          --h0: #d9822b; --h1: #7fae45; --h2: #3f86b8; --h3: #e0b82e; --h4: #8d62a8; --h5: #d9707e;
          position: relative; padding-top: 0.2rem;
        }
        [data-theme="dark"] .pc { --h0: #f0a05a; --h1: #a6d374; --h2: #5aa5dc; --h3: #f2d05e; --h4: #b58bcb; --h5: #f09aa7; }
        .pc svg { width: 100%; height: auto; display: block; }
        .pc-line { fill: none; stroke: var(--fig-note); stroke-opacity: 0.55; stroke-width: 1.6; stroke-dasharray: 1 1; }
        .pc-box { fill: none; stroke: var(--fig-note); stroke-width: 1.4; }
        .pc-cn { stroke: var(--fig-note); stroke-width: 1.2; stroke-dasharray: 1 1; }
        .pc-ins { fill: none; stroke: var(--fig-line); stroke-width: 1.2; }
        .pc-bond { stroke: var(--fig-note); stroke-opacity: 0.6; stroke-width: 4; }
        .pc-h { font-family: var(--font-ui); font-size: 15px; font-weight: 700; fill: var(--foreground); }
        .pc-d { font-family: var(--font-ui); font-size: 12px; }
        .pc-bl { font-family: var(--font-ui); font-size: 12px; font-weight: 700; }
        /* More specific than the site-wide figure text rule, so these colours win. */
        .pc svg .pc-d { fill: var(--fig-note); }
        .pc svg .pc-bl { fill: #14181f; }
        .pc svg .bead, .pc .mob-bead { transform-box: fill-box; transform-origin: center; }

        .mob { display: none; margin-top: 0.6rem; padding-top: 0.6rem; border-top: 1px solid var(--fig-line); }
        .mob-title { font-size: 0.8rem; color: var(--fig-note); margin-bottom: 0.5rem; }
        .mob-row { display: flex; align-items: center; justify-content: center; }
        .mob-item { display: inline-flex; align-items: center; }
        .mob-bead { display: grid; place-items: center; width: 2.9rem; height: 2.9rem; border-radius: 50%; font-size: 0.82rem; font-weight: 700; color: #14181f; }
        .mob-bond { width: 1.1rem; height: 4px; border-radius: 2px; background: var(--fig-note); opacity: 0.6; }
        @media (max-width: 640px) { .desk { display: none; } .mob { display: block; } }

        .pc-replay {
          margin-top: 0.7rem; padding: 0; background: none; border: 0; font: inherit; font-size: 0.78rem;
          color: var(--fig-note); text-decoration: underline; text-decoration-style: dashed; text-underline-offset: 3px; cursor: pointer;
        }
        .pc-replay:hover { color: var(--foreground); }

        /* Hidden until the story starts (only once JavaScript is running). */
        .pc.armed .a { opacity: 0; }
        .pc.armed .draw { opacity: 0; stroke-dashoffset: 1; }

        .pc.play .bead { animation: pc-pop 0.4s cubic-bezier(0.2, 1.4, 0.4, 1) var(--d, 0s) both; }
        .pc.play .a:not(.bead):not(.slide) { animation: pc-fade 0.6s ease-out var(--d, 0s) both; }
        .pc.play .slide { animation: pc-slide 0.7s ease-out var(--d, 0s) both; }
        .pc.play .draw { animation: pc-draw var(--t, 1s) linear var(--d, 0s) both; }

        @keyframes pc-pop { from { opacity: 0; transform: scale(0.2); } to { opacity: 1; transform: scale(1); } }
        @keyframes pc-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pc-slide { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        @keyframes pc-draw { from { opacity: 1; stroke-dashoffset: 1; } to { opacity: 1; stroke-dashoffset: 0; } }

        @media (prefers-reduced-motion: reduce) {
          .pc.armed .a, .pc.armed .draw { opacity: 1; stroke-dashoffset: 0; }
          .pc.play .a, .pc.play .draw, .pc.play .slide { animation: none; }
          .pc-replay { display: none; }
        }
      `}</style>
    </Figure>
  );
}
