import CountingNumber from "../CountingNumber";
import "./jepa.css";

/* Figures come from the research repo's README: SCOPe corpus size, MegaScale labelled
   mutations, and the number of held-out test proteins. */
const STATS = [
  { step: "Pretrain", n: 11566, label: "protein domains", sub: "no labels, structure only (SCOPe)", tone: "blue" },
  { step: "Fine-tune", n: 271231, label: "mutations", sub: "each with a measured ΔΔG (MegaScale)", tone: "orange" },
  { step: "Test", n: 28, label: "proteins", sub: "held out, never seen in training", tone: "green" },
];

export default function DatasetNumbers() {
  return (
    <div className="jf not-prose dn" role="group" aria-label="The data at a glance">
      {STATS.map((s, i) => (
        <div key={s.label} className={`dn-item dn-${s.tone}`}>
          <span className="dn-step">{s.step}</span>
          <CountingNumber number={s.n} delay={i * 150} className="dn-num" />
          <b>{s.label}</b>
          <span className="dn-sub">{s.sub}</span>
        </div>
      ))}
      <style>{`
        .dn { --dn-blue: #2f6fb5; --dn-orange: #c8700a; --dn-green: #25804a; display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.7rem; margin: 1.6rem auto; }
        [data-theme="dark"] .dn { --dn-blue: #86b6ee; --dn-orange: #f5a742; --dn-green: #77d49a; }
        .dn-blue { --t: var(--dn-blue); } .dn-orange { --t: var(--dn-orange); } .dn-green { --t: var(--dn-green); }
        .dn-item { display: flex; flex-direction: column; align-items: flex-start; gap: 0.15rem; min-width: 0; padding: 0.85rem 1rem 0.95rem; border-radius: 0.9rem; background: color-mix(in srgb, var(--t) 9%, var(--background)); }
        .dn-step { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--t); margin-bottom: 0.25rem; }
        .dn .dn-num { font-size: clamp(1.7rem, 5vw, 2.4rem); line-height: 1.1; font-weight: 700; color: var(--foreground); font-variant-numeric: tabular-nums; }
        .dn-item b { font-size: 0.95rem; }
        .dn-item .dn-sub { font-size: 0.78rem; color: var(--fig-note); line-height: 1.35; }
        @media (max-width: 640px) { .dn { grid-template-columns: 1fr; gap: 0.5rem; } }
      `}</style>
    </div>
  );
}
