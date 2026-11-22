import CountingNumber from "../CountingNumber";
import "./jepa.css";

/* Figures come from the research repo's README: SCOPe corpus size, MegaScale labelled
   mutations, and the number of held-out test proteins. */
const STATS = [
  { n: 11566, label: "protein domains", sub: "for pretraining, no labels (SCOPe)" },
  { n: 271231, label: "mutations", sub: "each with a measured ΔΔG (MegaScale)" },
  { n: 28, label: "test proteins", sub: "held out, never seen in training" },
];

export default function DatasetNumbers() {
  return (
    <div className="jf not-prose dn" role="group" aria-label="The data at a glance">
      {STATS.map((s, i) => (
        <div key={s.label} className="dn-item">
          <CountingNumber number={s.n} delay={i * 150} className="dn-num" />
          <b>{s.label}</b>
          <span className="dn-sub">{s.sub}</span>
        </div>
      ))}
      <style>{`
        .dn { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin: 1.8rem auto; }
        .dn-item { display: flex; flex-direction: column; gap: 0.1rem; min-width: 0; }
        .dn .dn-num { font-size: clamp(1.7rem, 5vw, 2.4rem); line-height: 1.1; font-weight: 700; color: var(--foreground); font-variant-numeric: tabular-nums; }
        .dn-item b { font-size: 0.95rem; }
        .dn-item .dn-sub { font-size: 0.8rem; color: var(--fig-note); line-height: 1.35; }
        @media (max-width: 640px) { .dn { grid-template-columns: 1fr; gap: 0.9rem; } }
      `}</style>
    </div>
  );
}
