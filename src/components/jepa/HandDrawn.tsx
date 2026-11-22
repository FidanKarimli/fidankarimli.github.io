import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import "@fontsource/caveat/latin-400.css";
import "@fontsource/caveat/latin-700.css";
import { ARMS, DATA, Figure, f3, f1, type Arm } from "./shared";
import { SEQ, N, SPATIAL, MUT, FOLD, RING } from "./ProteinGraph";

/**
 * Two small hand-drawn figures in the same style as the mutation drawing:
 *  - HandStability: what dG and ddG mean, with a slider.
 *  - HandMutationName: how to read a name such as E15Q.
 * Lines are wobbled with an SVG turbulence filter and the labels use the Caveat handwriting font (OFL).
 */

const r2 = (n: number) => Math.round(n * 100) / 100;
/** A slightly bowed line, so it does not look ruled. The wobble filter does the rest. */
const line = (x1: number, y1: number, x2: number, y2: number) =>
  `M${r2(x1)} ${r2(y1)} Q${r2((x1 + x2) / 2)} ${r2((y1 + y2) / 2 + 1.6)} ${r2(x2)} ${r2(y2)}`;

const STYLE = `
  .hd {
    --hd-ink: var(--foreground);
    --hd-soft: var(--fig-note);
    --hd-blue: #3b6fb6; --hd-red: #d9472b; --hd-green: #2f9a5a; --hd-orange: #f59e2b;
  }
  [data-theme="dark"] .hd { --hd-blue: #7fb0ee; --hd-red: #f08a6b; --hd-green: #6fcf8f; --hd-orange: #f5a742; }
  .hd svg { width: 100%; height: auto; display: block; overflow: visible; }
  .hd svg text.t { font-family: "Caveat", var(--font-ui), cursive; fill: var(--hd-ink); font-size: 21px; font-weight: 400; }
  .hd svg text.tb { font-weight: 700; }
  .hd svg text.ts { fill: var(--hd-soft); font-size: 18px; }
  .hd .st { fill: none; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2.6; }
`;

/* ---------------- Stability and ddG ---------------- */
const WT_GAP = 4; // illustrative, kcal/mol

export function HandStability() {
  const [dd, setDd] = useState(1.2);
  const gap = WT_GAP + dd;
  const S = 17;
  const TOP = 56;
  const wtY = TOP + WT_GAP * S;
  const muY = TOP + gap * S;
  const state = dd > 0.3 ? "up" : dd < -0.3 ? "down" : "same";
  const colour = state === "up" ? "var(--hd-green)" : state === "down" ? "var(--hd-red)" : "var(--hd-soft)";
  const verdict = state === "up" ? "stabilises" : state === "down" ? "destabilises" : "barely changes";
  const sign = dd > 0 ? "+" : "";

  const column = (cx: number, g: number, title: string, c: string) => {
    const y = TOP + g * S;
    return (
      <g>
        <text className="t tb" x={cx} y={20} textAnchor="middle">{title}</text>
        <text className="t ts" x={cx} y={TOP - 12} textAnchor="middle">unfolded</text>
        <path className="st" d={line(cx - 48, TOP, cx + 48, TOP)} stroke="var(--hd-ink)" filter="url(#hd-wob-a)" />
        <path className="st" d={line(cx - 48, y, cx + 48, y)} stroke={c} strokeWidth={4} filter="url(#hd-wob-a)" />
        <text className="t ts" x={cx} y={y + 20} textAnchor="middle">folded</text>
        {/* the gap, as a two-headed arrow */}
        <path className="st" d={line(cx, TOP + 6, cx, y - 6)} stroke="var(--hd-ink)" strokeWidth={2} filter="url(#hd-wob-a)" />
        {g * S >= 40 && (
          <g>
            <path className="st" d={`M${cx - 5} ${TOP + 13} L${cx} ${TOP + 5} L${cx + 5} ${TOP + 13}`} stroke="var(--hd-ink)" strokeWidth={2} />
            <path className="st" d={`M${cx - 5} ${r2(y - 13)} L${cx} ${r2(y - 5)} L${cx + 5} ${r2(y - 13)}`} stroke="var(--hd-ink)" strokeWidth={2} />
          </g>
        )}
        <text className="t tb" x={cx + 10} y={r2(TOP + (g * S) / 2 + 6)}>ΔG</text>
      </g>
    );
  };

  return (
    <Figure label="Stability as an energy gap, and what ΔΔG measures">
      <div className="hd hs">
        <p className="hs-title">How much a mutation changes stability</p>
        <svg viewBox="0 0 440 232" role="img" aria-label={`Two columns. The normal protein has a gap ΔG of ${WT_GAP.toFixed(1)} between unfolded and folded. With the mutation the gap is ${gap.toFixed(1)}, so ΔΔG is ${sign}${dd.toFixed(1)}.`}>
          <defs>
            <filter id="hd-wob-a" filterUnits="userSpaceOnUse" x="-20" y="-20" width="480" height="300">
              <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4" result="n" />
              <feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" />
            </filter>
          </defs>
          {column(88, WT_GAP, "normal protein", "var(--hd-blue)")}
          {column(250, gap, "with the mutation", colour)}
          {/* how far the folded level moved */}
          <path className="st" d={line(136, wtY, 338, wtY)} stroke="var(--hd-soft)" strokeWidth={1.6} strokeDasharray="2 7" />
          {Math.abs(dd) > 0.15 && (
            <g>
              <path className="st" d={line(340, wtY, 340, muY)} stroke="var(--hd-orange)" strokeWidth={3} filter="url(#hd-wob-a)" />
              <path className="st" d={line(334, wtY, 346, wtY)} stroke="var(--hd-orange)" strokeWidth={3} />
              <path className="st" d={line(334, muY, 346, muY)} stroke="var(--hd-orange)" strokeWidth={3} />
              <text className="t tb" x={352} y={r2((wtY + muY) / 2 + 6)} style={{ fill: "var(--hd-orange)" }}>ΔΔG</text>
            </g>
          )}
        </svg>
        <label className="hs-slider">
          <span>less stable</span>
          <input type="range" min={-2.5} max={3.5} step={0.1} value={dd} onChange={e => setDd(parseFloat(e.target.value))} aria-label="Change in stability caused by the mutation, ΔΔG" aria-valuetext={`ΔΔG ${sign}${dd.toFixed(1)}`} />
          <span>more stable</span>
        </label>
        <p className="hs-read" aria-live="polite">
          <span className="hs-sum">{gap.toFixed(1)} − {WT_GAP.toFixed(1)} = <b style={{ color: colour }}>{sign}{dd.toFixed(1)}</b></span>
          <span>This mutation <b>{verdict}</b> the protein.</span>
        </p>
      </div>
      <style>{STYLE + `
        .hs { max-width: 34rem; margin: 0 auto; padding: 0 0.4rem; }
        .hs-title { font-family: "Caveat", var(--font-ui), cursive; font-size: 1.55rem; line-height: 1.1; margin: 0 0 0.2rem; text-align: center; }
        .hs-slider { display: flex; gap: 0.6rem; align-items: center; font-family: "Caveat", var(--font-ui), cursive; font-size: 1.1rem; color: var(--fig-note); margin-top: 0.3rem; }
        .hs-slider input { flex: 1; accent-color: var(--hd-orange); min-width: 0; }
        .hs-read { display: flex; flex-direction: column; align-items: center; margin: 0.4rem 0 0; font-family: "Caveat", var(--font-ui), cursive; font-size: 1.4rem; line-height: 1.2; }
        .hs-sum { font-size: 1.15rem; color: var(--fig-note); }
      `}</style>
    </Figure>
  );
}

/* ---------------- How to read E15Q ---------------- */
const PARTS = [
  { big: "E", x: 78, c: "var(--hd-blue)", a: "the original", b: "glutamate", d: 0 },
  { big: "15", x: 210, c: "var(--hd-soft)", a: "its place", b: "15th from the start", d: 0.45 },
  { big: "Q", x: 342, c: "var(--hd-red)", a: "the new one", b: "glutamine", d: 0.9 },
];

export function HandMutationName() {
  const [armed, setArmed] = useState(false);
  const [play, setPlay] = useState(false);
  useEffect(() => {
    setArmed(true);
    const t = setTimeout(() => setPlay(true), 250);
    return () => clearTimeout(t);
  }, []);

  return (
    <Figure label="How to read the mutation name E15Q: glutamate at position 15 becomes glutamine">
      <div className={`hd hm${armed ? " armed" : ""}${play ? " play" : ""}`}>
        <svg viewBox="0 0 420 215" role="img" aria-label="E15Q is made of three pieces: E, the original amino acid glutamate; 15, its position in the chain; and Q, the new amino acid glutamine.">
          <defs>
            <filter id="hd-wob-b" filterUnits="userSpaceOnUse" x="-20" y="-40" width="480" height="300">
              <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="7" result="n" />
              <feDisplacementMap in="SourceGraphic" in2="n" scale="3" />
            </filter>
          </defs>

          {/* E turns into Q */}
          <path className="st d" pathLength={1} d="M92 38 Q210 -12 328 34" stroke="var(--hd-orange)" strokeWidth={2.4} filter="url(#hd-wob-b)" style={{ ["--d" as string]: "1.5s" }} />
          <path className="st d" pathLength={1} d="M316 24 L329 35 L312 42" stroke="var(--hd-orange)" strokeWidth={2.4} style={{ ["--d" as string]: "2s" }} />

          {PARTS.map(p => (
            <g key={p.big}>
              <text className="t tb f" x={p.x} y={110} textAnchor="middle" style={{ fontSize: 86, fill: "var(--hd-ink)", ["--d" as string]: `${p.d}s` }}>{p.big}</text>
              <path className="st d" pathLength={1} d={line(p.x - 38, 124, p.x + 38, 124)} stroke={p.c} strokeWidth={4} filter="url(#hd-wob-b)" style={{ ["--d" as string]: `${p.d + 0.3}s` }} />
              <path className="st d" pathLength={1} d={`M${p.x} 134 L${p.x} 156`} stroke="var(--hd-soft)" strokeWidth={2} filter="url(#hd-wob-b)" style={{ ["--d" as string]: `${2.1 + p.d * 0.5}s` }} />
              <path className="st d" pathLength={1} d={`M${p.x - 5} 150 L${p.x} 157 L${p.x + 5} 150`} stroke="var(--hd-soft)" strokeWidth={2} style={{ ["--d" as string]: `${2.3 + p.d * 0.5}s` }} />
              <text className="t tb f" x={p.x} y={180} textAnchor="middle" style={{ ["--d" as string]: `${2.4 + p.d * 0.5}s` }}>{p.a}</text>
              <text className="t ts f" x={p.x} y={203} textAnchor="middle" style={{ ["--d" as string]: `${2.5 + p.d * 0.5}s` }}>{p.b}</text>
            </g>
          ))}
        </svg>
      </div>
      <noscript>
        <style>{`.hm .d,.hm .f{opacity:1!important;animation:none!important;stroke-dashoffset:0!important}`}</style>
      </noscript>
      <style>{STYLE + `
        .hm { max-width: 32rem; margin: 0 auto; }
        .hm.armed .d { opacity: 0; stroke-dasharray: 1 1; stroke-dashoffset: 1; }
        .hm.armed .f { opacity: 0; }
        .hm.play .d { animation: hm-draw 0.6s ease-out var(--d, 0s) both; }
        .hm.play .f { animation: hm-fade 0.5s ease-out var(--d, 0s) both; }
        @keyframes hm-draw { from { opacity: 1; stroke-dashoffset: 1; } to { opacity: 1; stroke-dashoffset: 0; } }
        @keyframes hm-fade { from { opacity: 0; } to { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) {
          .hm.armed .d, .hm.armed .f { opacity: 1; stroke-dashoffset: 0; }
          .hm.play .d, .hm.play .f { animation: none; }
        }
      `}</style>
    </Figure>
  );
}

/* ---------------- How a protein becomes a graph ---------------- */
const far = (a: number, b: number) => Math.abs(a - b) > 4;
const EDGES: [number, number][] = (() => {
  const m = new Map<string, [number, number]>();
  SPATIAL.forEach((list, i) => list.forEach(j => m.set(i < j ? `${i}-${j}` : `${j}-${i}`, i < j ? [i, j] : [j, i])));
  return [...m.values()];
})();
const DEPTHS = FOLD.map(f => f.depth);
const D_MIN = Math.min(...DEPTHS);
const D_MAX = Math.max(...DEPTHS);
const dn = (d: number) => (d - D_MIN) / (D_MAX - D_MIN);
const FOLD_SEGS = [...Array(N - 1).keys()].sort((a, b) => FOLD[a].depth + FOLD[a + 1].depth - (FOLD[b].depth + FOLD[b + 1].depth));
const FOLD_NODES = [...Array(N).keys()].sort((a, b) => FOLD[a].depth - FOLD[b].depth);
const BX = (i: number) => r2(32 + i * 49.5);

export function HandGraph() {
  const [sel, setSel] = useState(MUT);
  const refs = useRef<(SVGGElement | null)[]>([]);
  const nb = SPATIAL[sel];
  const nbSet = new Set(nb);
  const farOnes = nb.filter(j => far(j, sel));

  const onKey = (e: KeyboardEvent) => {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = Math.min(N - 1, Math.max(0, sel + step));
    refs.current[next]?.focus();
    setSel(next);
  };

  /** One residue, drawn the same way in all three pictures. */
  const node = (i: number, x: number, y: number, r: number, fs: number, key: string, interactive = false) => {
    const isSel = i === sel;
    const isNb = nbSet.has(i);
    return (
      <g
        key={key}
        onPointerEnter={() => setSel(i)}
        onClick={() => setSel(i)}
        style={{ cursor: "pointer" }}
        {...(interactive
          ? {
              ref: (el: SVGGElement | null) => { refs.current[i] = el; },
              tabIndex: i === sel ? 0 : -1,
              role: "button",
              "aria-label": `Residue ${i + 1}, ${SEQ[i]}`,
              "aria-pressed": isSel,
              onFocus: () => setSel(i),
            }
          : { "aria-hidden": true })}
      >
        <circle cx={x} cy={y} r={r} fill={isSel || isNb ? "var(--hd-orange)" : "var(--background)"} fillOpacity={isSel ? 0.95 : isNb ? 0.35 : 1} stroke={isSel || isNb ? "var(--hd-orange)" : "var(--hd-ink)"} strokeOpacity={isSel || isNb ? 1 : 0.55} strokeWidth={isSel ? 2.8 : 2} filter="url(#hd-wob-c)" />
        <text className="t tb" x={x} y={r2(y + fs * 0.32)} textAnchor="middle" style={{ fontSize: fs, pointerEvents: "none", fill: isSel ? "#14181f" : undefined }}>{SEQ[i]}</text>
      </g>
    );
  };

  return (
    <Figure label="How a protein becomes a graph: a chain of amino acids, its folded shape, and the graph of which ones touch">
      <div className="hd hg">
        <p className="hg-title">How a protein becomes a graph</p>
        <p className="hg-sub">Hover a letter to see who it touches.</p>

        <svg viewBox="0 0 720 132" role="group" aria-label="The chain of 14 amino acids. Use the left and right arrow keys to pick one." onKeyDown={onKey}>
          <defs>
            <filter id="hd-wob-c" filterUnits="userSpaceOnUse" x="-20" y="-20" width="760" height="320">
              <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="11" result="n" />
              <feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" />
            </filter>
          </defs>
          {nb.map(j => {
            const a = BX(sel), b = BX(j), h = Math.min(60, 16 + Math.abs(a - b) * 0.1);
            return <path key={j} className="st" d={`M${a} 66 Q${r2((a + b) / 2)} ${r2(66 - h * 1.7)} ${b} 66`} stroke="var(--hd-orange)" strokeWidth={far(j, sel) ? 3 : 2} strokeDasharray={far(j, sel) ? undefined : "2 6"} filter="url(#hd-wob-c)" />;
          })}
          <path className="st" d={`M${BX(0) - 8} 98 L${BX(N - 1) + 8} 98`} stroke="var(--hd-soft)" strokeWidth={1.6} strokeOpacity={0.5} filter="url(#hd-wob-c)" />
          {SEQ.map((_, i) => node(i, BX(i), 98, 19, 26, `c${i}`, true))}
          <text className="t ts" x={360} y={128} textAnchor="middle" style={{ fontSize: 21 }}>1 · a chain of amino acids</text>
        </svg>

        <div className="hg-two">
          <svg viewBox="0 0 260 262" role="img" aria-label="The same chain folded into a compact shape. Lines join the selected residue to the residues it touches.">
            <text className="t ts" x={130} y={14} textAnchor="middle" style={{ fontSize: 17 }}>2 · it folds</text>
            {FOLD_SEGS.map(i => {
              const a = FOLD[i], b = FOLD[i + 1], d = dn((a.depth + b.depth) / 2);
              return <line key={i} x1={a.sx} y1={a.sy + 12} x2={b.sx} y2={b.sy + 12} stroke="var(--hd-ink)" strokeOpacity={0.14 + 0.2 * d} strokeWidth={3 + 5 * d} strokeLinecap="round" filter="url(#hd-wob-c)" />;
            })}
            {nb.map(j => (
              <line key={j} x1={FOLD[sel].sx} y1={FOLD[sel].sy + 12} x2={FOLD[j].sx} y2={FOLD[j].sy + 12} stroke="var(--hd-orange)" strokeWidth={far(j, sel) ? 3 : 2} strokeDasharray={far(j, sel) ? undefined : "2 6"} strokeLinecap="round" filter="url(#hd-wob-c)" />
            ))}
            {FOLD_NODES.map(i => node(i, FOLD[i].sx, FOLD[i].sy + 12, r2(9 + 3 * dn(FOLD[i].depth)), 15, `f${i}`))}
          </svg>
          <svg viewBox="0 0 240 262" role="img" aria-label="The residues as dots on a ring. A line joins two dots when those residues touch in the folded shape.">
            <text className="t ts" x={120} y={14} textAnchor="middle" style={{ fontSize: 17 }}>3 · a graph</text>
            {EDGES.map(([a, b]) => {
              const on = (a === sel && nbSet.has(b)) || (b === sel && nbSet.has(a));
              return <line key={`${a}-${b}`} x1={RING[a].sx} y1={RING[a].sy + 20} x2={RING[b].sx} y2={RING[b].sy + 20} stroke={on ? "var(--hd-orange)" : "var(--hd-ink)"} strokeOpacity={on ? 1 : 0.2} strokeWidth={on ? (far(a, b) ? 3 : 2) : 1.3} strokeLinecap="round" filter="url(#hd-wob-c)" />;
            })}
            {SEQ.map((_, i) => node(i, RING[i].sx, RING[i].sy + 20, 12, 16, `g${i}`))}
          </svg>
        </div>

        <p className="hg-read" aria-live="polite">
          Residue {sel + 1} touches <b>{nb.length}</b> others{farOnes.length ? <>, and <b>{farOnes.length}</b> of them sit far away along the chain.</> : "."}
        </p>
        <p className="hg-note">Each node is one amino acid. A line means they touch in 3D. (A made-up 14-letter protein, with 4 neighbours each.)</p>
      </div>
      <style>{STYLE + `
        .hg { max-width: 44rem; margin: 0 auto; padding: 0 0.3rem; }
        .hg-title { font-family: "Caveat", var(--font-ui), cursive; font-size: 1.6rem; line-height: 1.1; margin: 0; text-align: center; }
        .hg-sub { font-family: "Caveat", var(--font-ui), cursive; font-size: 1.15rem; color: var(--fig-note); margin: 0 0 0.3rem; text-align: center; }
        .hg-two { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; align-items: start; margin-top: 1.1rem; }
        .hg-two svg { max-width: 20rem; margin: 0 auto; }
        @media (max-width: 560px) { .hg-two { grid-template-columns: 1fr; } .hg-two svg { max-width: 17rem; } }
        .hg-read { font-family: "Caveat", var(--font-ui), cursive; font-size: 1.4rem; line-height: 1.2; text-align: center; margin: 0.3rem 0 0; min-height: 2.4em; }
        .hg-note { font-family: "Caveat", var(--font-ui), cursive; font-size: 1.05rem; color: var(--fig-note); text-align: center; margin: 0; }
        .hg svg g[role="button"]:focus-visible { outline: 2px dashed var(--hd-orange); outline-offset: 2px; }
      `}</style>
    </Figure>
  );
}

/* ---------------- Results: Spearman bars and the rank reversal (SCOPe) ---------------- */
const SC = DATA.corpora.scope;
const ARM_COLOUR: Record<Arm, string> = { A: "var(--hd-soft)", B: "var(--hd-red)", C: "var(--hd-green)", D: "var(--hd-blue)" };
const WOBBLE_D = (id: string, seed: number) => (
  <filter id={id} filterUnits="userSpaceOnUse" x="-20" y="-20" width="700" height="320">
    <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed={seed} result="n" />
    <feDisplacementMap in="SourceGraphic" in2="n" scale="3" />
  </filter>
);

export function HandResults() {
  const base = SC.spearman.A.mean;
  const X0 = 196;
  const W = 300; // width for a score of 0.7
  const xs = (v: number) => r2(X0 + (v / 0.7) * W);
  const rows: { arm: Arm; note?: string }[] = [
    { arm: "A", note: "the baseline" },
    { arm: "B", note: "worse than nothing" },
    { arm: "C", note: "better" },
    { arm: "D", note: "about the same" },
  ];
  return (
    <Figure label="Pooled Spearman correlation on held-out proteins for the four ways of pretraining">
      <div className="hd hr">
        <p className="hr-title">Pooled Spearman correlation on held-out proteins</p>
        <p className="hr-sub">Higher is better. Average of 3 runs.</p>
        <svg viewBox="0 0 700 236" role="img" aria-label={`Spearman correlation: no pretraining ${f3(base)}, vector only ${f3(SC.spearman.B.mean)}, letter only ${f3(SC.spearman.C.mean)}, letter plus vector ${f3(SC.spearman.D.mean)}.`}>
          <defs>{WOBBLE_D("hd-wob-d", 5)}</defs>
          {rows.map(({ arm, note }, i) => {
            const y = 28 + i * 52;
            const v = SC.spearman[arm].mean;
            return (
              <g key={arm}>
                <text className="t" x={X0 - 14} y={y + 26} textAnchor="end" style={{ fontSize: 23 }}>{ARMS[arm].title}</text>
                <rect x={X0} y={y} width={r2(xs(v) - X0)} height={34} rx={4} fill={ARM_COLOUR[arm]} fillOpacity={0.28} stroke={ARM_COLOUR[arm]} strokeWidth={2.6} filter="url(#hd-wob-d)" />
                <text className="t tb" x={r2(xs(v) + 12)} y={y + 26} style={{ fontSize: 24 }}>{f3(v)}</text>
                {note && <text className="t ts" x={r2(xs(v) + 78)} y={y + 25} style={{ fontSize: 20, fill: arm === "B" ? "var(--hd-red)" : arm === "C" ? "var(--hd-green)" : undefined }}>{note}</text>}
              </g>
            );
          })}
          <path className="st" d={`M${xs(base)} 18 L${xs(base)} 232`} stroke="var(--hd-ink)" strokeWidth={1.8} strokeDasharray="2 7" strokeOpacity={0.6} filter="url(#hd-wob-d)" />
        </svg>
      </div>
      <style>{STYLE + `
        .hr { max-width: 42rem; margin: 0 auto; padding: 0 0.3rem; }
        .hr-title { font-family: "Caveat", var(--font-ui), cursive; font-size: 1.55rem; line-height: 1.1; margin: 0; text-align: center; }
        .hr-sub { font-family: "Caveat", var(--font-ui), cursive; font-size: 1.15rem; color: var(--fig-note); margin: 0 0 0.4rem; text-align: center; }
      `}</style>
    </Figure>
  );
}

export function HandRank() {
  const trio: Arm[] = ["B", "C", "D"];
  const rank = (a: Arm) => SC.effectiveRank[a as "B"].mean;
  const sp = (a: Arm) => SC.spearman[a].mean;
  const byRank = [...trio].sort((a, b) => rank(b) - rank(a));
  const bySp = [...trio].sort((a, b) => sp(b) - sp(a));
  const y = (i: number) => 112 + i * 52;
  return (
    <Figure label="The vector-only encoder is the most spread out but the worst at predicting stability">
      <div className="hd hr">
        <p className="hr-title">More spread out, yet worse</p>
        <p className="hr-sub">The same three encoders, measured two ways. Top is best.</p>
        <svg viewBox="0 0 660 250" role="img" aria-label={`Ranked by effective rank: ${byRank.map(a => `${ARMS[a].title} ${f1(rank(a))}`).join(", ")}. Ranked by Spearman: ${bySp.map(a => `${ARMS[a].title} ${f3(sp(a))}`).join(", ")}. Vector only is first on the left and last on the right.`}>
          <defs>{WOBBLE_D("hd-wob-e", 9)}</defs>
          <text className="t tb" x={250} y={26} textAnchor="end" style={{ fontSize: 23 }}>How spread out</text>
          <text className="t ts" x={250} y={50} textAnchor="end" style={{ fontSize: 19 }}>effective rank</text>
          <text className="t tb" x={410} y={26} style={{ fontSize: 23 }}>How well it predicts</text>
          <text className="t ts" x={410} y={50} style={{ fontSize: 19 }}>Spearman correlation</text>
          {trio.map(a => {
            const l = byRank.indexOf(a), r = bySp.indexOf(a);
            const hot = a === "B";
            return (
              <g key={a}>
                <path className="st" d={`M262 ${y(l) - 8} C320 ${y(l) - 8} 350 ${y(r) - 8} 398 ${y(r) - 8}`} stroke={ARM_COLOUR[a]} strokeWidth={hot ? 5 : 3} strokeOpacity={hot ? 1 : 0.55} filter="url(#hd-wob-e)" />
                <text className="t" x={250} y={y(l)} textAnchor="end" style={{ fontSize: 23, fontWeight: hot ? 700 : 400 }}>{ARMS[a].title} · {f1(rank(a))}</text>
                <text className="t" x={410} y={y(r)} style={{ fontSize: 23, fontWeight: hot ? 700 : 400 }}>{ARMS[a].title} · {f3(sp(a))}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <style>{STYLE}</style>
    </Figure>
  );
}

/* ---------------- The loss that went the wrong way ---------------- */
export function HandLoss() {
  const C = DATA.corpora.scope.curves.B;
  const rank = C.rank.mean;
  const loss = C.vectorLoss.mean;
  const NE = rank.length;
  const X0 = 70, XW = 530;
  const x = (e: number) => r2(X0 + (e / (NE - 1)) * XW);
  const yRank = (v: number) => r2(130 - (v / 80) * 92);
  const yLoss = (v: number) => r2(282 - (v / 0.17) * 92);
  const trace = (vals: number[], fy: (v: number) => number) => vals.map((v, e) => `${e ? "L" : "M"}${x(e)} ${fy(v)}`).join("");
  const last = NE - 1;
  const hand = (x1: number, y1: number, x2: number, y2: number, bow: number) =>
    `M${x1} ${y1} Q${r2((x1 + x2) / 2)} ${r2((y1 + y2) / 2 + bow)} ${x2} ${y2}`;
  return (
    <Figure label="The vector-only run through 100 epochs: the effective rank starts low and climbs, and the loss starts near zero and rises">
      <div className="hd hr">
        <p className="hr-title">The loss that went the wrong way</p>
        <p className="hr-sub">Vector-only pretraining, average of 3 runs.</p>
        <svg viewBox="0 0 660 336" role="img" aria-label={`Two charts over 100 training epochs. Effective rank is ${f1(rank[1])} at epoch 1, then climbs to ${f1(rank[last])}. Loss is ${loss[1].toFixed(3)} at epoch 1, then rises to about ${f3(loss[last])}.`}>
          <defs>{WOBBLE_D("hd-wob-f", 13)}</defs>

          <text className="t tb" x={X0} y={22} style={{ fontSize: 22 }}>How spread out the embeddings are</text>
          <text className="t ts" x={X0 + 300} y={22} style={{ fontSize: 19 }}>(effective rank)</text>
          <path className="st" d={`M${X0} 130 L${X0 + XW} 130`} stroke="var(--hd-ink)" strokeWidth={1.6} strokeOpacity={0.4} filter="url(#hd-wob-f)" />
          <path className="st" d={trace(rank, yRank)} stroke="var(--hd-red)" strokeWidth={3.2} filter="url(#hd-wob-f)" />
          <text className="t tb" x={X0 + XW + 10} y={yRank(rank[last]) + 7} style={{ fontSize: 22 }}>{Math.round(rank[last])}</text>

          <text className="t tb" x={X0} y={178} style={{ fontSize: 22 }}>The loss</text>
          <text className="t ts" x={X0 + 82} y={178} style={{ fontSize: 19 }}>(how hard the prediction is)</text>
          <path className="st" d={`M${X0} 282 L${X0 + XW} 282`} stroke="var(--hd-ink)" strokeWidth={1.6} strokeOpacity={0.4} filter="url(#hd-wob-f)" />
          <path className="st" d={trace(loss, yLoss)} stroke="var(--hd-red)" strokeWidth={3.2} filter="url(#hd-wob-f)" />
          <text className="t tb" x={X0 + XW + 10} y={yLoss(loss[last]) + 7} style={{ fontSize: 22 }}>{f3(loss[last])}</text>

          {/* epoch 1, in both charts */}
          <path className="st" d={`M${x(1)} 36 L${x(1)} 282`} stroke="var(--hd-ink)" strokeWidth={1.6} strokeDasharray="2 7" strokeOpacity={0.5} filter="url(#hd-wob-f)" />
          <circle cx={x(1)} cy={yRank(rank[1])} r={5.5} fill="var(--hd-orange)" />
          <circle cx={x(1)} cy={yLoss(loss[1])} r={5.5} fill="var(--hd-orange)" />
          <text className="t tb" x={190} y={121} style={{ fontSize: 21, fill: "var(--hd-orange)" }}>epoch 1: almost collapsed</text>
          <path className="st" d={hand(184, 117, x(1) + 12, yRank(rank[1]) + 2, 6)} stroke="var(--hd-orange)" strokeWidth={2.2} />
          <path className="st" d={`M${x(1) + 21} ${yRank(rank[1]) - 3} L${x(1) + 12} ${yRank(rank[1]) + 2} L${x(1) + 20} ${yRank(rank[1]) + 8}`} stroke="var(--hd-orange)" strokeWidth={2.2} />
          <text className="t tb" x={190} y={270} style={{ fontSize: 21, fill: "var(--hd-orange)" }}>epoch 1: loss almost zero</text>
          <path className="st" d={hand(184, 266, x(1) + 12, yLoss(loss[1]) - 1, 6)} stroke="var(--hd-orange)" strokeWidth={2.2} />
          <path className="st" d={`M${x(1) + 21} ${yLoss(loss[1]) - 6} L${x(1) + 12} ${yLoss(loss[1]) - 1} L${x(1) + 20} ${yLoss(loss[1]) + 5}`} stroke="var(--hd-orange)" strokeWidth={2.2} />

          {[0, 25, 50, 75, 99].map(t => (
            <text key={t} className="t ts" x={x(t)} y={306} textAnchor="middle" style={{ fontSize: 18 }}>{t}</text>
          ))}
          <text className="t ts" x={X0 + XW / 2} y={330} textAnchor="middle" style={{ fontSize: 19 }}>training epoch</text>
        </svg>
      </div>
      <style>{STYLE}</style>
    </Figure>
  );
}

/* ---------------- More data, same lesson ---------------- */
export function HandMore() {
  const S = DATA.corpora.scope, A = DATA.corpora.alphafold;
  const y = (v: number) => r2(74 + ((0.66 - v) / 0.18) * 180);
  const XL = 200, XR = 440;
  const spread = (vals: Record<string, number>, gap = 24) => {
    const items = Object.entries(vals).map(([k, v]) => ({ k, y: y(v) })).sort((a, b) => a.y - b.y);
    for (let i = 1; i < items.length; i++) if (items[i].y - items[i - 1].y < gap) items[i].y = items[i - 1].y + gap;
    return Object.fromEntries(items.map(i => [i.k, i.y]));
  };
  const trio: Arm[] = ["C", "D", "B"];
  const ly = spread({ B: S.spearman.B.mean, C: S.spearman.C.mean, D: S.spearman.D.mean });
  const ry = spread({ B: A.spearman.B.mean, C: A.spearman.C.mean, D: A.spearman.D.mean });
  const base = y(S.spearman.A.mean);
  const accS = (S.letterAccuracy.C.mean * 100).toFixed(1), accA = (A.letterAccuracy.C.mean * 100).toFixed(1);
  return (
    <Figure label="The three pretrained models on the SCOPe and AlphaFold corpora: the ordering stays the same">
      <div className="hd hr">
        <p className="hr-title">More data, same lesson</p>
        <p className="hr-sub">The same three models, pretrained on a bigger corpus. Higher is better.</p>
        <svg viewBox="0 0 640 276" role="img" aria-label={`Spearman on SCOPe versus AlphaFold. Vector only ${f3(S.spearman.B.mean)} to ${f3(A.spearman.B.mean)}, letter only ${f3(S.spearman.C.mean)} to ${f3(A.spearman.C.mean)}, letter plus vector ${f3(S.spearman.D.mean)} to ${f3(A.spearman.D.mean)}. With no pretraining the score is ${f3(S.spearman.A.mean)}, and vector only stays below it on both.`}>
          <defs>{WOBBLE_D("hd-wob-g", 17)}</defs>
          <text className="t tb" x={XL} y={24} textAnchor="middle" style={{ fontSize: 24 }}>SCOPe</text>
          <text className="t ts" x={XL} y={46} textAnchor="middle" style={{ fontSize: 18 }}>11,566 real structures</text>
          <text className="t tb" x={XR} y={24} textAnchor="middle" style={{ fontSize: 24 }}>AlphaFold</text>
          <text className="t ts" x={XR} y={46} textAnchor="middle" style={{ fontSize: 18 }}>26,057 predicted</text>

          <path className="st" d={`M${XL - 20} ${base} L${XR + 20} ${base}`} stroke="var(--hd-ink)" strokeWidth={1.8} strokeDasharray="2 7" strokeOpacity={0.6} filter="url(#hd-wob-g)" />
          <text className="t ts" x={320} y={base + 24} textAnchor="middle" style={{ fontSize: 19 }}>no pretraining · {f3(S.spearman.A.mean)}</text>

          {trio.map(a => {
            const l = S.spearman[a].mean, r = A.spearman[a].mean;
            const hot = a === "B";
            return (
              <g key={a}>
                <path className="st" d={`M${XL} ${y(l)} L${XR} ${y(r)}`} stroke={ARM_COLOUR[a]} strokeWidth={hot ? 5 : 4} filter="url(#hd-wob-g)" />
                <circle cx={XL} cy={y(l)} r={7} fill={ARM_COLOUR[a]} />
                <circle cx={XR} cy={y(r)} r={7} fill={ARM_COLOUR[a]} />
                <text className="t" x={XL - 16} y={ly[a] + 7} textAnchor="end" style={{ fontSize: 22, fontWeight: 700 }}>{f3(l)}</text>
                <text className="t" x={XR + 16} y={ry[a] + 7} style={{ fontSize: 22, fontWeight: 700 }}>{f3(r)}</text>
                <text className="t ts" x={XL - 80} y={ly[a] + 7} textAnchor="end" style={{ fontSize: 20 }}>{ARMS[a].title}</text>
              </g>
            );
          })}
        </svg>
        <p className="hm-punch">Better at guessing letters. Not better at predicting stability.</p>
        <p className="hm-sub">Letter accuracy went from {accS}% to {accA}%, but the score barely moved.</p>
        <p className="hm-note">The two corpora differ in size, kind, protein length and training steps, so this is not a scaling law. It only shows the ordering held on a second corpus.</p>
      </div>
      <style>{STYLE + `
        .hm-punch { font-family: "Caveat", var(--font-ui), cursive; font-size: 1.5rem; line-height: 1.2; text-align: center; margin: 0.4rem 0 0; }
        .hm-sub { font-family: "Caveat", var(--font-ui), cursive; font-size: 1.15rem; color: var(--fig-note); text-align: center; margin: 0; }
        .hm-note { font-size: 0.78rem; color: var(--fig-note); text-align: center; margin: 0.6rem auto 0; max-width: 32rem; line-height: 1.4; }
      `}</style>
    </Figure>
  );
}
