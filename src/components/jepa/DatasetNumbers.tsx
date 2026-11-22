import CountingNumber from "../CountingNumber";
import "./jepa.css";

/* Figures come from the research repo's README: SCOPe corpus size, MegaScale labelled
   mutations, and the number of held-out test proteins. */
const STATS = [
  { n: 11566, label: "protein domains", sub: "pretraining, no labels (SCOPe)" },
  { n: 271231, label: "mutations", sub: "labelled ΔΔG (MegaScale)" },
  { n: 28, label: "test proteins", sub: "held out, never seen in training" },
];

export default function DatasetNumbers() {
  return (
    <div className="jf not-prose dn" role="group" aria-label="The data at a glance">
      {STATS.map((s, i) => (
        <div key={s.label} className="dn-item">
          <CountingNumber number={s.n} delay={i * 150} className="dn-num" />
          <b>{s.label}</b>
          <span>{s.sub}</span>
        </div>
      ))}
      <style>{`
        .dn { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; text-align: center; margin: 1.6rem auto; padding: 0.9rem 0.5rem; border-top: 1px solid var(--fig-line); border-bottom: 1px solid var(--fig-line); }
        .dn-item { display: flex; flex-direction: column; align-items: center; gap: 0.1rem; min-width: 0; }
        .dn .dn-num { font-size: clamp(1.5rem, 6.2vw, 2.3rem); line-height: 1.15; }
        .dn-item b { font-size: 0.85rem; }
        .dn-item span:last-child { font-size: 0.72rem; color: var(--fig-note); line-height: 1.3; }
      `}</style>
    </div>
  );
}
