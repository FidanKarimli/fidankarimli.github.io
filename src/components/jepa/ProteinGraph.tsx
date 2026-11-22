import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Figure, Segmented } from "./shared";

/* A made-up 14-residue helix-turn-helix. Conceptual only: not an experimental structure. */
const SEQ = "MSKLIEVALFDRAY".split("");
const NAMES: Record<string, string> = { M: "Met", S: "Ser", K: "Lys", L: "Leu", I: "Ile", E: "Glu", V: "Val", A: "Ala", F: "Phe", D: "Asp", R: "Arg", Y: "Tyr" };
const N = SEQ.length;
const K_SHOWN = 4; // the real experiment uses 16

const P3 = Array.from({ length: N }, (_, i) => {
  const th = (100 * i * Math.PI) / 180;
  const [step, rad, sep] = [1.1, 0.8, 0.7];
  return i < 7
    ? { x: Math.cos(th) * rad - sep, y: i * step, z: Math.sin(th) * rad }
    : { x: Math.cos(th) * rad + sep, y: (6 - (i - 7)) * step + 0.2, z: Math.sin(th) * rad };
});
const dist = (a: number, b: number) => Math.hypot(P3[a].x - P3[b].x, P3[a].y - P3[b].y, P3[a].z - P3[b].z);
const SPATIAL = Array.from({ length: N }, (_, i) =>
  [...Array(N).keys()].filter(j => j !== i).sort((a, b) => dist(i, a) - dist(i, b)).slice(0, K_SHOWN)
);
const SEQNB = Array.from({ length: N }, (_, i) => [i - 2, i - 1, i + 1, i + 2].filter(j => j >= 0 && j < N));
const farCount = (i: number) => SPATIAL[i].filter(j => Math.abs(j - i) > 4).length;
// The mutation example: the buried-looking hydrophobic residue with the most far-apart contacts.
const MUT = [...Array(N).keys()]
  .filter(i => ["L", "I", "V", "F"].includes(SEQ[i]))
  .sort((a, b) => farCount(b) - farCount(a) || a - b)[0];

// Rounded so server and browser print identical coordinates (hydration).
const r2 = (v: number) => Math.round(v * 100) / 100;
const PHI = (35 * Math.PI) / 180;
const FOLD = P3.map(p => {
  const X = p.x * Math.cos(PHI) + p.z * Math.sin(PHI);
  const depth = -p.x * Math.sin(PHI) + p.z * Math.cos(PHI);
  return { sx: r2(130 + X * 38), sy: r2(232 - p.y * 28.5), depth: r2(depth) };
});
const RING = Array.from({ length: N }, (_, i) => {
  const a = ((-90 + (i * 360) / N) * Math.PI) / 180;
  return { sx: r2(120 + 88 * Math.cos(a)), sy: r2(120 + 88 * Math.sin(a)) };
});

type Mode = "seq" | "space";

export default function ProteinGraph() {
  const [sel, setSel] = useState(MUT);
  const [mode, setMode] = useState<Mode>("space");
  const [mutated, setMutated] = useState(false);

  const nb = (mode === "space" ? SPATIAL[sel] : SEQNB[sel]);
  const nbSet = new Set(nb);
  const far = nb.filter(j => Math.abs(j - sel) > 4);
  const letter = (i: number) => (mutated && i === MUT ? "D" : SEQ[i]);
  const edges = useMemo(() => {
    const set = new Map<string, [number, number]>();
    const src = mode === "space" ? SPATIAL : SEQNB;
    src.forEach((list, i) => list.forEach(j => set.set(i < j ? `${i}-${j}` : `${j}-${i}`, i < j ? [i, j] : [j, i])));
    return [...set.values()];
  }, [mode]);

  const nodeProps = (i: number) => ({
    onPointerEnter: () => setSel(i),
    onClick: () => setSel(i),
    style: { cursor: "pointer" } as const,
  });
  const nodeStyle = (i: number) => {
    const isSel = i === sel, isNb = nbSet.has(i);
    const isFar = isNb && Math.abs(i - sel) > 4;
    return {
      fill: isSel ? "var(--fig-sel)" : isNb ? "color-mix(in srgb, var(--fig-sel) 28%, var(--background))" : "var(--background)",
      stroke: isSel || isNb ? "var(--fig-sel)" : "var(--fig-line)",
      sw: isSel ? 2.5 : isFar ? 3 : 1.6,
      text: isSel ? "var(--accent-foreground)" : "var(--foreground)",
    };
  };
  const Node = ({ i, x, y, r }: { i: number; x: number; y: number; r: number }) => {
    const s = nodeStyle(i);
    const mut = i === MUT && mutated;
    return (
      <g {...nodeProps(i)}>
        {mut ? (
          <rect x={x - r} y={y - r} width={2 * r} height={2 * r} transform={`rotate(45 ${x} ${y})`} fill={s.fill} stroke={s.stroke === "var(--fig-line)" ? "var(--foreground)" : s.stroke} strokeWidth={2.5} strokeDasharray="4 2.5" />
        ) : (
          <circle cx={x} cy={y} r={r} fill={s.fill} stroke={s.stroke} strokeWidth={s.sw} className="jf-anim" />
        )}
        <text x={x} y={y + 4} textAnchor="middle" fontSize={11} fontWeight={700} style={{ fill: s.text, pointerEvents: "none" }}>{letter(i)}</text>
      </g>
    );
  };

  const btns = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: KeyboardEvent) => {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    let next: number | null = null;
    if (e.key === "Home") next = 0;
    else if (e.key === "End") next = N - 1;
    else if (step) next = Math.min(N - 1, Math.max(0, sel + step));
    if (next !== null) { e.preventDefault(); btns.current[next]?.focus(); setSel(next); }
  };

  const sortedFold = [...Array(N - 1).keys()].sort((a, b) => FOLD[a].depth + FOLD[a + 1].depth - (FOLD[b].depth + FOLD[b + 1].depth));
  const sortedNodes = [...Array(N).keys()].sort((a, b) => FOLD[a].depth - FOLD[b].depth);
  const dMin = Math.min(...FOLD.map(f => f.depth)), dMax = Math.max(...FOLD.map(f => f.depth));
  const dn = (d: number) => (d - dMin) / (dMax - dMin);

  const readout =
    mode === "space"
      ? `Residue ${sel + 1} (${NAMES[letter(sel)] ?? letter(sel)}) touches ${nb.length} residues in space: ${nb.map(j => j + 1).sort((a, b) => a - b).join(", ")}. ${far.length} of them ${far.length === 1 ? "is" : "are"} more than 4 steps away along the chain.`
      : `Residue ${sel + 1} (${NAMES[letter(sel)] ?? letter(sel)}) only “sees” its chain neighbours: ${nb.map(j => j + 1).join(", ")}. Whatever it touches across the fold is invisible here.`;

  return (
    <Figure
      label="How a protein becomes a graph: sequence, folded shape, residue graph"
      caption="Proteins are chains, but their interactions happen in three dimensions."
    >
      <div className="jf-card">
        <p className="jf-title">How a protein becomes a graph</p>
        <p className="jf-sub">Hover, tap, or use the arrow keys on the sequence. <span className="jf-tag">Conceptual sketch</span></p>

        <Segmented<Mode>
          name="pg-mode"
          legend="Neighbours"
          value={mode}
          onChange={setMode}
          options={[{ value: "seq", label: "Sequence neighbours" }, { value: "space", label: "3D neighbours" }]}
        />

        {/* 1. sequence */}
        <div className="pg-label">1 · The chain</div>
        <div className="pg-seq">
          <svg className="pg-arcs" viewBox={`0 0 ${N} 46`} preserveAspectRatio="none" aria-hidden="true">
            {nb.map(j => {
              const a = sel + 0.5, b = j + 0.5, h = Math.min(40, 6 + Math.abs(a - b) * 6);
              const longRange = Math.abs(j - sel) > 4;
              return (
                <path key={j} d={`M${a},46 Q${(a + b) / 2},${46 - h * 2} ${b},46`} fill="none" stroke="var(--fig-sel)" strokeWidth={longRange ? 2.5 : 1.5} strokeDasharray={longRange ? undefined : "3 3"} vectorEffect="non-scaling-stroke" opacity={0.9} />
              );
            })}
          </svg>
          <div className="pg-row" role="group" aria-label="Amino-acid sequence. Use left and right arrow keys to choose a residue." onKeyDown={onKey}>
            {SEQ.map((_, i) => {
              const s = nodeStyle(i);
              return (
                <button
                  key={i}
                  type="button"
                  tabIndex={i === sel ? 0 : -1}
                  className="pg-res"
                  aria-pressed={i === sel}
                  aria-label={`Residue ${i + 1}, ${NAMES[letter(i)] ?? letter(i)}${i === MUT && mutated ? " (mutated)" : ""}`}
                  onPointerEnter={() => setSel(i)}
                  onFocus={() => setSel(i)}
                  onClick={() => setSel(i)}
                  ref={el => { btns.current[i] = el; }}
                  style={{ background: s.fill, borderColor: s.stroke, color: s.text, borderWidth: s.sw > 2 ? 2 : 1, borderRadius: i === MUT && mutated ? "0.2rem" : "999px", borderStyle: i === MUT && mutated ? "dashed" : "solid" }}
                >
                  <span className="pg-l">{letter(i)}</span>
                  <span className="pg-n">{i + 1}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="pg-two">
          <div>
            <div className="pg-label">2 · It folds</div>
            <svg viewBox="0 0 260 250" role="img" aria-label="A folded chain of 14 residues drawn in perspective: two helices packed side by side, joined by a turn.">
              {sortedFold.map(i => {
                const a = FOLD[i], b = FOLD[i + 1], d = dn((a.depth + b.depth) / 2);
                return <line key={i} x1={a.sx} y1={a.sy} x2={b.sx} y2={b.sy} stroke="var(--foreground)" strokeOpacity={0.16 + 0.2 * d} strokeWidth={4 + 5 * d} strokeLinecap="round" />;
              })}
              {nb.map(j => (
                <line key={j} x1={FOLD[sel].sx} y1={FOLD[sel].sy} x2={FOLD[j].sx} y2={FOLD[j].sy} stroke="var(--fig-sel)" strokeWidth={Math.abs(j - sel) > 4 ? 2.5 : 1.5} strokeDasharray={Math.abs(j - sel) > 4 ? undefined : "4 3"} />
              ))}
              {sortedNodes.map(i => <Node key={i} i={i} x={FOLD[i].sx} y={FOLD[i].sy} r={9 + 3 * dn(FOLD[i].depth)} />)}
            </svg>
          </div>
          <div>
            <div className="pg-label">3 · It becomes a graph</div>
            <svg viewBox="0 0 240 240" role="img" aria-label="The same 14 residues as nodes on a ring in chain order. Lines join residues that are neighbours; long chords join residues far apart in the chain.">
              {Array.from({ length: N - 1 }, (_, i) => (
                <line key={`c${i}`} x1={RING[i].sx} y1={RING[i].sy} x2={RING[i + 1].sx} y2={RING[i + 1].sy} stroke="var(--fig-line)" strokeWidth={1} />
              ))}
              {edges.map(([a, b]) => {
                const on = (a === sel && nbSet.has(b)) || (b === sel && nbSet.has(a));
                return <line key={`${a}-${b}`} x1={RING[a].sx} y1={RING[a].sy} x2={RING[b].sx} y2={RING[b].sy} stroke={on ? "var(--fig-sel)" : "var(--fig-line)"} strokeWidth={on ? (Math.abs(a - b) > 4 ? 2.5 : 1.5) : 1} />;
              })}
              {[...Array(N).keys()].map(i => <Node key={i} i={i} x={RING[i].sx} y={RING[i].sy} r={11} />)}
            </svg>
          </div>
        </div>

        <p className="pg-read" aria-live="polite">{readout}</p>

        <div className="pg-mut">
          <button type="button" className="jf-btn" aria-pressed={mutated} onClick={() => { setMutated(m => !m); setSel(MUT); }}>
            {mutated ? `Undo: ${NAMES[SEQ[MUT]]}${MUT + 1}→Asp` : `Mutate ${NAMES[SEQ[MUT]]}${MUT + 1} → Asp`}
          </button>
          <p className="pg-mut-text">
            {mutated
              ? `Residue ${MUT + 1} stays in the same place, so the graph’s shape barely changes. What changes is the node itself: a charged Asp now sits among ${far.length || "several"} far-apart neighbours that were packing around a hydrophobic ${NAMES[SEQ[MUT]]}. A swap like this can disturb the interactions holding the fold together, which is the kind of change ΔΔG measures. (Illustrative only: not a measured value.)`
              : `Try swapping residue ${MUT + 1}. In the sketch it is a hydrophobic residue with ${farCount(MUT)} far-apart spatial neighbours.`}
          </p>
        </div>

        <p className="jf-note">
          The sketch is a made-up 14-residue chain with {K_SHOWN} neighbours per residue so it stays legible. The real experiment builds one node per residue at its Cα atom and joins each to its <b>16</b> nearest neighbours in 3D. Node features are backbone torsions; edge features are distances and sequence separation. No feature reveals which amino acid a residue is.
        </p>
      </div>
      <style>{`
        .pg-label{font-size:.78rem;color:var(--fig-note);margin:.4rem 0 .25rem}
        .pg-seq{position:relative;margin-bottom:.4rem}
        .jf svg.pg-arcs{width:100%;height:46px;position:relative}
        .pg-row{display:flex;gap:2px}
        .pg-res{flex:1 1 0;min-width:0;display:flex;flex-direction:column;align-items:center;padding:.15rem 0;border:1px solid;font:inherit;line-height:1.1;cursor:pointer}
        .pg-l{font-weight:700;font-size:.95rem}.pg-n{font-size:.62rem;opacity:.7}
        .pg-res:focus-visible{outline:2px dashed var(--accent);outline-offset:2px}
        .pg-two{display:grid;grid-template-columns:1fr 1fr;gap:1rem;align-items:start}
        @media(max-width:560px){.pg-two{grid-template-columns:1fr}.pg-n{display:none}.pg-res{padding:.55rem 0}}
        .pg-read{margin:.6rem 0 0;min-height:2.9em;font-size:.88rem}
        .pg-mut{display:flex;flex-direction:column;gap:.5rem;margin-top:.6rem;padding-top:.7rem;border-top:1px dashed var(--fig-line)}
        .pg-mut-text{margin:0;min-height:5.2em;font-size:.85rem;color:var(--foreground)}
      `}</style>
    </Figure>
  );
}
