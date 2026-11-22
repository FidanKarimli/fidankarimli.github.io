import { useState } from "react";
import { Figure, Segmented } from "./shared";

type Kind = "h" | "p" | "c";
const KIND: Record<Kind, { name: string; ex: string; text: string }> = {
  h: { name: "Water-avoiding", ex: "e.g. leucine, valine", text: "Water-avoiding (hydrophobic) side chains tend to tuck into the middle of the protein, away from water." },
  p: { name: "Polar", ex: "e.g. serine, asparagine", text: "Polar side chains are comfortable near water and can form hydrogen bonds." },
  c: { name: "Charged", ex: "e.g. lysine, glutamate", text: "Charged side chains carry a positive (lysine, arginine) or negative (aspartate, glutamate) charge, so they can pair up with their opposites." },
};
const col = (k: Kind) => `var(--aa-${k})`;

/* ---------- Amino acid anatomy ---------- */
export function AminoAcid() {
  const [k, setK] = useState<Kind>("h");
  const chain: [string, Kind][] = [["M", "h"], ["K", "c"], ["L", "h"], ["E", "c"], ["V", "h"], ["S", "p"]];
  return (
    <Figure label="Anatomy of an amino acid and how amino acids join into a chain" caption="Every amino acid shares the same backbone. Only the side chain changes.">
      <div className="jf-card">
        <p className="jf-title">An amino acid</p>
        <p className="jf-sub">Pick a kind of side chain. <span className="jf-tag">Schematic</span></p>
        <Segmented<Kind> name="aa-kind" legend="Side chain" value={k} onChange={setK}
          options={[{ value: "h", label: "Water-avoiding" }, { value: "p", label: "Polar" }, { value: "c", label: "Charged" }]} />
        <svg viewBox="0 0 340 220" role="img" aria-label="An amino acid: an amino group and a carboxyl group joined through a central alpha carbon, with a hydrogen and a variable side chain R attached to the alpha carbon.">
          <g stroke="var(--foreground)" strokeWidth={4} strokeLinecap="round" opacity={0.75}>
            <line x1={92} y1={104} x2={170} y2={104} /><line x1={170} y1={104} x2={236} y2={104} />
          </g>
          <line x1={170} y1={104} x2={170} y2={50} stroke="var(--foreground)" strokeWidth={2.5} opacity={0.5} />
          <line x1={170} y1={104} x2={170} y2={152} stroke={col(k)} strokeWidth={4} strokeLinecap="round" className="jf-anim" />
          <circle cx={170} cy={104} r={17} fill="var(--background)" stroke="var(--foreground)" strokeWidth={2.5} />
          <text x={170} y={109} textAnchor="middle" fontSize={13} fontWeight={700}>Cα</text>
          <text x={170} y={40} textAnchor="middle" fontSize={13}>H</text>
          <text x={74} y={109} textAnchor="middle" fontSize={14} fontWeight={700}>H₂N</text>
          <text x={266} y={109} textAnchor="middle" fontSize={14} fontWeight={700}>COOH</text>
          <circle cx={170} cy={176} r={24} fill={col(k)} className="jf-anim" />
          <text x={170} y={182} textAnchor="middle" fontSize={16} fontWeight={700} style={{ fill: "var(--background)" }}>R</text>
          <text x={74} y={134} textAnchor="middle" fontSize={11} className="muted">amino group</text>
          <text x={266} y={134} textAnchor="middle" fontSize={11} className="muted">carboxyl group</text>
          <text x={206} y={72} fontSize={11} className="muted">alpha carbon</text>
          <text x={204} y={180} fontSize={11.5} fontWeight={700}>side chain</text>
          <text x={204} y={195} fontSize={11} className="muted">{KIND[k].ex}</text>
        </svg>
        <p className="ab-read" aria-live="polite"><b style={{ color: col(k) }}>{KIND[k].name}.</b> {KIND[k].text}</p>

        <div className="ab-chain" role="img" aria-label="A short chain of amino acids joined by peptide bonds: M, K, L, E, V, S, coloured by side-chain kind.">
          {chain.map(([l, kk], i) => (
            <span key={i} className="ab-link">
              <span className="ab-bead" style={{ background: col(kk) }}>{l}</span>
              {i < chain.length - 1 && <span className="ab-bond" title="peptide bond" />}
            </span>
          ))}
        </div>
        <p className="jf-note">Amino acids are joined by <b>peptide bonds</b> into a chain called a polypeptide. The order of letters is the <b>sequence</b>. Beads are coloured by side-chain kind: <span style={{ color: col("h") }}>■</span> water-avoiding, <span style={{ color: col("p") }}>■</span> polar, <span style={{ color: col("c") }}>■</span> charged.</p>
      </div>
      <style>{`
        .ab-read{margin:.4rem 0 .8rem;min-height:3.9em;font-size:.9rem}
        .ab-chain{display:flex;flex-wrap:wrap;align-items:center;gap:.25rem 0;padding:.6rem 0 .2rem;border-top:1px dashed var(--fig-line)}
        .ab-link{display:inline-flex;align-items:center}
        .ab-bead{display:grid;place-items:center;width:2rem;height:2rem;border-radius:50%;font-weight:700;color:var(--background)}
        .ab-bond{width:1.1rem;height:4px;background:var(--foreground);opacity:.6;border-radius:2px}
      `}</style>
    </Figure>
  );
}

/* ---------- Four levels of structure ---------- */
const st = { fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
export function StructureLevels() {
  const cards = [
    { n: "1", t: "Primary", d: "the sequence of amino acids", g: (
      <g>{["M", "K", "L", "E", "V", "S", "T"].map((l, i) => (
        <g key={i}><circle cx={14 + i * 15.5} cy={45} r={7} fill={col((["h", "c", "h", "c", "h", "p", "p"] as Kind[])[i])} /><text x={14 + i * 15.5} y={48.5} textAnchor="middle" fontSize={8.5} fontWeight={700} style={{ fill: "var(--background)" }}>{l}</text></g>
      ))}</g>) },
    { n: "2", t: "Secondary", d: "local patterns: helices and sheets", g: (
      <g>
        <path d="M10,28 C16,8 24,48 30,28 S44,8 50,28 S64,48 70,28 S84,8 90,28 S104,48 110,28" {...st} stroke={col("h")} strokeWidth={5} />
        <polygon points="10,52 66,52 66,47 80,56 66,65 66,60 10,60" fill={col("p")} opacity={0.9} />
        <polygon points="110,72 54,72 54,67 40,76 54,85 54,80 110,80" fill={col("p")} opacity={0.55} />
      </g>) },
    { n: "3", t: "Tertiary", d: "the full 3D shape of one chain", g: (
      <path d="M12,70 C10,30 36,14 52,30 C66,44 40,52 52,64 C64,76 92,62 96,38 C98,22 80,14 70,22" {...st} stroke={col("c")} strokeWidth={6} />) },
    { n: "4", t: "Quaternary", d: "how several chains fit together", g: (
      <g>
        <path d="M10,68 C8,34 30,22 42,36 C52,48 30,56 40,68" {...st} stroke={col("h")} strokeWidth={6} />
        <path d="M110,22 C112,56 90,68 78,54 C68,42 90,34 80,22" {...st} stroke={col("c")} strokeWidth={6} />
        <path d="M56,24 C70,16 78,18 84,28 C70,36 62,34 56,24" {...st} stroke={col("p")} strokeWidth={6} />
      </g>) },
  ];
  return (
    <Figure label="The four levels of protein structure" caption="Each level builds on the one before it.">
      <div className="jf-card">
        <p className="jf-title">Four levels of protein structure <span className="jf-tag">Schematic</span></p>
        <div className="sl-grid">
          {cards.map(c => (
            <div key={c.n} className="sl-card">
              <svg viewBox="0 0 120 90" role="img" aria-label={`${c.t}: ${c.d}`}>{c.g}</svg>
              <b>{c.n} · {c.t}</b>
              <span>{c.d}</span>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .sl-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:.7rem;margin-top:.5rem}
        @media(max-width:560px){.sl-grid{grid-template-columns:1fr 1fr}}
        .sl-card{display:flex;flex-direction:column;gap:.15rem;background:var(--background);border:1px solid var(--fig-line);border-radius:.5rem;padding:.5rem .55rem}
        .sl-card span{font-size:.78rem;color:var(--fig-note);line-height:1.3}
        .sl-card b{font-size:.85rem}
      `}</style>
    </Figure>
  );
}

/* ---------- A mutation: sickle cell hemoglobin, position 6 ---------- */
// Start of the hemoglobin beta chain (146 residues): normal and sickle-cell (HbS) differ at position 6.
const HB = "VHLTPEEKSA".split("");
const kindOf = (l: string): Kind => ("AVLIMFWYC".includes(l) ? "h" : "KRDE".includes(l) ? "c" : "p");
export function MutationSwap() {
  const [mut, setMut] = useState(false);
  const seq = HB.map((l, i) => (mut && i === 5 ? "V" : l));
  return (
    <Figure label="A single amino-acid swap in hemoglobin" caption="One letter out of 146. Sometimes that is enough.">
      <div className="jf-card">
        <p className="jf-title">A point mutation in hemoglobin</p>
        <p className="jf-sub">The first 10 of 146 residues of the hemoglobin β chain.</p>
        <Segmented<"w" | "m"> name="mut-sw" legend="Version" value={mut ? "m" : "w"} onChange={v => setMut(v === "m")}
          options={[{ value: "w", label: "Healthy" }, { value: "m", label: "Sickle cell" }]} />
        <div className="ms-row" role="img" aria-label={`Residues 1 to 10: ${seq.join(" ")}. Position 6 is ${seq[5]}.`}>
          {seq.map((l, i) => (
            <div key={i} className="ms-cell">
              <span className={`ms-bead${i === 5 ? " hot" : ""}`} style={{ background: col(kindOf(l)) }}>{l}</span>
              <small>{i + 1}</small>
            </div>
          ))}
        </div>
        <p className="ms-read" aria-live="polite">
          {mut
            ? "Position 6 now holds valine (V), a water-avoiding residue, instead of charged glutamate (E). That is the whole difference, written E6V. It is enough to change the shape of red blood cells."
            : "Position 6 holds glutamate (E), a charged residue."}
        </p>
      </div>
      <style>{`
        .ms-row{display:grid;grid-template-columns:repeat(10,1fr);gap:.2rem;margin:.3rem 0}
        .ms-cell{display:flex;flex-direction:column;align-items:center;gap:.1rem}
        .ms-cell small{font-size:.7rem;color:var(--fig-note)}
        .ms-bead{display:grid;place-items:center;width:100%;max-width:2.3rem;aspect-ratio:1;border-radius:50%;font-weight:700;color:var(--background)}
        .ms-bead.hot{outline:3px solid var(--foreground);outline-offset:2px}
        .ms-read{margin:.4rem 0 0;min-height:4.5em;font-size:.9rem}
      `}</style>
    </Figure>
  );
}

/* ---------- How to read a mutation name ---------- */
export function MutationNotation() {
  const parts = [
    { big: "E", small: "original amino acid", sub: "glutamate", k: "c" as Kind },
    { big: "15", small: "position in the chain", sub: "counting from the start", k: "p" as Kind },
    { big: "Q", small: "new amino acid", sub: "glutamine", k: "p" as Kind },
  ];
  return (
    <Figure label="How to read the mutation name E15Q" caption="E15Q: glutamate at position 15 becomes glutamine.">
      <div className="jf-card mn">
        {parts.map((p, i) => (
          <div key={i} className="mn-part">
            <span className="mn-big">{p.big}</span>
            <b>{p.small}</b>
            <span>{p.sub}</span>
          </div>
        ))}
      </div>
      <style>{`
        .mn{display:grid;grid-template-columns:repeat(3,1fr);gap:.5rem;text-align:center}
        .mn-part{display:flex;flex-direction:column;align-items:center;gap:.1rem;font-size:.8rem}
        .mn-part span:last-child{color:var(--fig-note)}
        .mn-big{font-size:2rem;font-weight:700;line-height:1.1;border-bottom:3px solid var(--foreground);padding:0 .5rem;margin-bottom:.3rem}
      `}</style>
    </Figure>
  );
}

/* ---------- Stability: the energy gap and ΔΔG ---------- */
const WT_GAP = 4; // illustrative, kcal/mol
export function Stability() {
  const [dd, setDd] = useState(1.2);
  const gap = WT_GAP + dd;
  const S = 19, TOP = 44;
  const verdict = dd > 0.3 ? "stabilises" : dd < -0.3 ? "destabilises" : "has little effect on";
  const Col = ({ x, g, label, color }: { x: number; g: number; label: string; color: string }) => (
    <g>
      <line x1={x} x2={x + 84} y1={TOP} y2={TOP} stroke="var(--foreground)" strokeWidth={4} strokeLinecap="round" opacity={0.5} />
      <line x1={x} x2={x + 84} y1={TOP + g * S} y2={TOP + g * S} stroke={color} strokeWidth={5} strokeLinecap="round" className="jf-anim" />
      <line x1={x + 42} x2={x + 42} y1={TOP + 4} y2={TOP + g * S - 4} stroke="var(--foreground)" strokeWidth={1.5} markerEnd="url(#sa)" markerStart="url(#sa)" />
      <text x={x + 48} y={TOP + (g * S) / 2 + 4} fontSize={12} fontWeight={700}>ΔG</text>
      <text x={x + 42} y={TOP - 12} textAnchor="middle" fontSize={11} className="muted">unfolded</text>
      <text x={x + 42} y={TOP + g * S + 17} textAnchor="middle" fontSize={11} className="muted">folded</text>
      <text x={x + 42} y={12} textAnchor="middle" fontSize={12.5} fontWeight={700}>{label}</text>
    </g>
  );
  return (
    <Figure label="Stability as an energy gap, and what ΔΔG measures" caption="Stability is the gap between the unfolded and folded states. ΔΔG is how much a mutation changes that gap.">
      <div className="jf-card">
        <p className="jf-title">Stability and ΔΔG</p>
        <p className="jf-sub">Slide to change how the mutation shifts the folded state. <span className="jf-tag">Illustrative numbers</span></p>
        <svg viewBox="0 0 340 215" role="img" aria-label={`Two columns of energy levels. Wild type has an energy gap of ${WT_GAP}. The mutant has a gap of ${gap.toFixed(1)}, so ΔΔG is ${dd.toFixed(1)}.`}>
          <defs>
            <marker id="sa" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L6,3 L0,6 z" fill="var(--foreground)" /></marker>
          </defs>
          <Col x={40} g={WT_GAP} label="Wild type" color="var(--arm-a)" />
          <Col x={216} g={gap} label="Mutant" color={dd > 0.3 ? "var(--arm-c)" : dd < -0.3 ? "var(--arm-b)" : "var(--arm-a)"} />
          <line x1={124} x2={216} y1={TOP + WT_GAP * S} y2={TOP + WT_GAP * S} stroke="var(--fig-line)" strokeDasharray="3 4" />
        </svg>
        <label className="st-slider">
          <span>destabilising</span>
          <input type="range" min={-3.5} max={3.5} step={0.1} value={dd} onChange={e => setDd(parseFloat(e.target.value))} aria-label="Change in stability caused by the mutation, ΔΔG" aria-valuetext={`ΔΔG ${dd.toFixed(1)}`} />
          <span>stabilising</span>
        </label>
        <p className="st-read" aria-live="polite">
          ΔΔG = ΔG(mutant) − ΔG(wild type) = <b>{gap.toFixed(1)} − {WT_GAP.toFixed(1)} = {dd > 0 ? "+" : ""}{dd.toFixed(1)}</b>. This mutation <b>{verdict}</b> the protein.
        </p>
        <p className="jf-note">A larger ΔG means a more stable protein. In the data I use, ΔΔG &gt; 0 means stabilising and ΔΔG &lt; 0 destabilising. Papers differ on this sign, so check it before comparing datasets.</p>
      </div>
      <style>{`
        .st-slider{display:flex;gap:.6rem;align-items:center;font-size:.78rem;color:var(--fig-note)}
        .st-slider input{flex:1;accent-color:var(--accent)}
        .st-read{margin:.5rem 0 0;min-height:3em;font-size:.92rem}
      `}</style>
    </Figure>
  );
}
