import { useEffect, useState } from "react";
import { Figure, ReplayButton } from "./shared";

/**
 * The four levels of protein structure as one short story, drawn in order:
 * a chain of beads, then a coiled helix, then one folded chain, then four chains assembling.
 *
 * - Plays once when it scrolls into view (hydrate with client:visible); "Replay" runs it again.
 * - Uses the site's light/dark theme. Tubes are shaded with short coloured segments.
 * - Without JavaScript, or with reduced motion, you simply see the finished picture.
 * - Conceptual drawing, not real protein coordinates.
 */

const r2 = (v: number) => Math.round(v * 100) / 100;
type Pt = [number, number];
type Seg = { x1: number; y1: number; x2: number; y2: number; m: number; z: number };

/** Turn a list of points into short segments, each with a shade (m, 0..1) and a depth (z). */
function tube(pts: Pt[], shade: (u: number, i: number) => number): Seg[] {
  const out: Seg[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const u = i / (pts.length - 2 || 1);
    const m = shade(u, i);
    out.push({ x1: r2(pts[i][0]), y1: r2(pts[i][1]), x2: r2(pts[i + 1][0]), y2: r2(pts[i + 1][1]), m: r2(m), z: m });
  }
  return out;
}

/** Smooth curve through the given points (Catmull-Rom), sampled into `per` steps per span. */
function smooth(p: Pt[], per = 9): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[Math.max(0, i - 1)], p1 = p[i], p2 = p[i + 1], p3 = p[Math.min(p.length - 1, i + 2)];
    for (let s = 0; s < per; s++) {
      const t = s / per, t2 = t * t, t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) =>
        0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(p[p.length - 1]);
  return out;
}

// 02 · a helix: a spring seen from the side. Front strands are darker.
const HELIX = (() => {
  const pts: Pt[] = [];
  const turns = 3.3, steps = 130;
  for (let i = 0; i <= steps; i++) {
    const th = (i / steps) * turns * 2 * Math.PI;
    pts.push([26 + 8.2 * th - 17 * Math.sin(th), 78 + 27 * Math.cos(th)]);
  }
  return tube(pts, (_u, i) => 0.5 + 0.5 * Math.sin((i / 130) * turns * 2 * Math.PI)).sort((a, b) => a.z - b.z);
})();

// 03 · one folded chain.
const FOLD_PTS: Pt[] = [[30, 120], [24, 80], [48, 42], [92, 34], [128, 52], [124, 88], [98, 94], [84, 70], [108, 56], [152, 62], [180, 90], [170, 122], [140, 128], [122, 108]];
const FOLD = tube(smooth(FOLD_PTS, 8), u => 0.5 + 0.5 * Math.sin(u * 5.2 * Math.PI));

// 04 · four small folded chains coming together (two teal, two pink).
const SMALL = (ox: number, oy: number, flip: boolean) =>
  tube(
    smooth(FOLD_PTS.map(([x, y]): Pt => [ox + (flip ? 190 - x : x) * 0.4, oy + y * 0.4]), 5),
    u => 0.5 + 0.5 * Math.sin(u * 4.6 * Math.PI + (flip ? 1.2 : 0))
  );
// They finish packed into one cluster, after sliding in from the corners.
const SUBS = [
  { segs: SMALL(30, 20, false), kind: "tl", dx: -46, dy: -34 },
  { segs: SMALL(80, 24, true), kind: "pk", dx: 46, dy: -34 },
  { segs: SMALL(30, 62, true), kind: "pk", dx: -46, dy: 34 },
  { segs: SMALL(80, 66, false), kind: "tl", dx: 46, dy: 34 },
];

const BEADS: [string, "h" | "c" | "p"][] = [["M", "h"], ["K", "c"], ["L", "h"], ["E", "c"], ["V", "h"], ["S", "p"], ["T", "p"]];
const col = (k: "h" | "c" | "p") => `var(--aa-${k})`;

const STAGES = [
  { n: "01", title: "Primary", text: "the sequence of amino acids" },
  { n: "02", title: "Secondary", text: "local patterns: helices and sheets" },
  { n: "03", title: "Tertiary", text: "the full 3D shape of one chain" },
  { n: "04", title: "Quaternary", text: "how several chains fit together" },
];

function Tube({ segs, kind, width, start, step }: { segs: Seg[]; kind: "tl" | "pk"; width: number; start: number; step: number }) {
  return (
    <>
      {segs.map((s, i) => (
        <line
          key={i}
          x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
          className="a seg"
          strokeWidth={width}
          style={{
            stroke: `color-mix(in srgb, var(--${kind}2) ${Math.round(s.m * 100)}%, var(--${kind}0))`,
            ["--d" as string]: `${(start + i * step).toFixed(3)}s`,
          }}
        />
      ))}
    </>
  );
}

export default function StructureStory({
  layout = "row",
  caption = "Each level builds on the one before it.",
}: {
  /** "row": four small plates side by side. "grid": a larger two-over-two version. */
  layout?: "row" | "grid";
  caption?: string;
}) {
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

  // The helix and the fold are drawn in order along their length; sorting for depth changes
  // the DOM order, so the delay follows each segment's original position, not its place in the DOM.
  const helixOrdered = HELIX.map((s, i) => ({ ...s, i }));

  return (
    <Figure
      label="The four levels of protein structure, drawn one after another: primary, secondary, tertiary and quaternary"
      caption={caption}
    >
      <div className={`ss${layout === "grid" ? " ss-big" : ""}${armed ? " armed" : ""}${play ? " play" : ""}`}>
        <div className="ss-grid">
          {/* 01 Primary */}
          <div className="ss-col">
            <svg viewBox="0 0 220 150" role="img" aria-label="Seven amino acids in a row, joined like beads on a string.">
              {BEADS.map(([l, k], i) => (
                <g key={i}>
                  {i > 0 && <line x1={32 + (i - 1) * 26 + 11.5} y1={75} x2={32 + i * 26 - 11.5} y2={75} className="ss-link a" style={{ ["--d" as string]: `${i * 0.12}s` }} />}
                  <g className="a bead" style={{ ["--d" as string]: `${i * 0.12}s` }}>
                    <circle cx={32 + i * 26} cy={75} r={11.5} fill={col(k)} />
                    <text x={32 + i * 26} y={79.2} className="ss-bl">{l}</text>
                  </g>
                </g>
              ))}
            </svg>
            <Caption s={STAGES[0]} delay={0.9} />
          </div>

          {/* 02 Secondary */}
          <div className="ss-col">
            <svg viewBox="0 0 220 150" role="img" aria-label="A helix drawn as a shaded coil, like a spring seen from the side.">
              {helixOrdered.map(s => (
                <line
                  key={s.i}
                  x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
                  className="a seg"
                  strokeWidth={8.5}
                  style={{
                    stroke: `color-mix(in srgb, var(--tl2) ${Math.round(s.m * 100)}%, var(--tl0))`,
                    ["--d" as string]: `${(1.5 + s.i * 0.012).toFixed(3)}s`,
                  }}
                />
              ))}
            </svg>
            <Caption s={STAGES[1]} delay={1.5} />
          </div>

          {/* 03 Tertiary */}
          <div className="ss-col">
            <svg viewBox="0 0 220 150" role="img" aria-label="One chain looping back on itself into a folded, shaded shape.">
              <Tube segs={FOLD} kind="pk" width={8.5} start={3.6} step={0.014} />
            </svg>
            <Caption s={STAGES[2]} delay={3.6} />
          </div>

          {/* 04 Quaternary */}
          <div className="ss-col">
            <svg viewBox="0 0 220 150" role="img" aria-label="Four separate folded chains, two teal and two pink, sliding together into one assembly.">
              {SUBS.map((s, k) => (
                <g key={k} className="sub" style={{ ["--dx" as string]: `${s.dx}px`, ["--dy" as string]: `${s.dy}px`, ["--ad" as string]: "7.5s" }}>
                  <Tube segs={s.segs} kind={s.kind as "tl" | "pk"} width={5.5} start={5.5 + k * 0.4} step={0.012} />
                </g>
              ))}
            </svg>
            <Caption s={STAGES[3]} delay={5.6} />
          </div>
        </div>

        <ReplayButton onClick={replay} />
      </div>

      <noscript>
        <style>{`.ss .a,.ss .ss-cap{opacity:1!important;animation:none!important}.ss .sub{animation:none!important}`}</style>
      </noscript>
      <style>{`
        .ss {
          --tl0: #9fd9db; --tl2: #1f9fa8; --pk0: #f8bccb; --pk2: #e0577f;
          position: relative; padding: 0.4rem 0 0;
        }
        [data-theme="dark"] .ss { --tl0: #1e6770; --tl2: #62dbe0; --pk0: #8a3a57; --pk2: #f68fb0; }
        .ss-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0 1.4rem; }
        @media (max-width: 640px) { .ss-grid { grid-template-columns: 1fr 1fr; gap: 1.2rem 1.2rem; } }
        /* The larger version: two plates over two, with roomier text. One column on small phones. */
        .ss-big .ss-grid { grid-template-columns: 1fr 1fr; gap: 1.6rem 2rem; max-width: 36rem; margin-inline: auto; }
        .ss-big svg { max-width: 20rem; margin-inline: auto; }
        .ss-big .jf-replay-row { max-width: 36rem; margin-inline: auto; }
        @media (max-width: 480px) { .ss-big .ss-grid { grid-template-columns: 1fr; } }
        .ss-big .ss-cap .n { font-size: 0.75rem; }
        .ss-big .ss-cap .t { font-size: 1.05rem; }
        .ss-big .ss-cap .d { font-size: 0.9rem; }
        .ss-col { min-width: 0; }
        .ss svg { width: 100%; height: auto; display: block; }
        .ss .seg { stroke-linecap: round; }
        .ss-link { stroke: var(--fig-line); stroke-width: 3; stroke-linecap: round; }
        .ss-bl { font-family: var(--font-ui); font-size: 11px; font-weight: 700; text-anchor: middle; }
        /* More specific than the site-wide figure text rule, so the letters stay readable on the beads. */
        .ss svg .ss-bl { fill: #14181f; }

        .ss-cap { border-top: 1px solid var(--fig-line); padding-top: 0.5rem; margin-top: 0.2rem; }
        .ss-cap .n { display: block; font-size: 0.7rem; letter-spacing: 0.08em; color: var(--fig-note); }
        .ss-cap .t { display: block; font-size: 0.95rem; font-weight: 600; }
        .ss-cap .d { display: block; font-size: 0.8rem; color: var(--fig-note); line-height: 1.35; }

        /* Hidden until the story starts (only once JavaScript is running). */
        .ss.armed .a, .ss.armed .ss-cap { opacity: 0; }

        .ss.play .bead { animation: ss-pop 0.5s cubic-bezier(0.2, 1.4, 0.4, 1) var(--d, 0s) both; transform-box: fill-box; transform-origin: center; }
        .ss.play .ss-link, .ss.play .seg { animation: ss-fade 0.3s ease-out var(--d, 0s) both; }
        .ss.play .ss-cap { animation: ss-fade 0.6s ease-out var(--d, 0s) both; }
        .ss.play .sub { animation: ss-join 1.2s cubic-bezier(0.3, 0.7, 0.2, 1) var(--ad, 0s) both; }

        @keyframes ss-pop { from { opacity: 0; transform: scale(0.3); } to { opacity: 1; transform: scale(1); } }
        @keyframes ss-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes ss-join { from { transform: translate(var(--dx), var(--dy)); } to { transform: none; } }

        .ss-replay {
          margin-top: 0.9rem; padding: 0; background: none; border: 0; font: inherit; font-size: 0.78rem;
          color: var(--fig-note); text-decoration: underline; text-decoration-style: dashed; text-underline-offset: 3px; cursor: pointer;
        }
        .ss-replay:hover { color: var(--foreground); }

        @media (prefers-reduced-motion: reduce) {
          .ss.armed .a, .ss.armed .ss-cap { opacity: 1; }
          .ss.play .a, .ss.play .ss-cap, .ss.play .sub { animation: none; }
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
