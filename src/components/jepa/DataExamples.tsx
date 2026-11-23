import "./jepa.css";

/* One real record from each dataset, copied from the files used in the experiment. */
const ROWS = [
  {
    name: "SCOPe",
    role: "no labels",
    what: "3D structures, measured in a lab",
    lines: [
      "domain    d1y2oa1",
      "residue   2  SER",
      "x, y, z  -12.3, 23.8, -7.5",
    ],
    note: "11,566 domains",
  },
  {
    name: "AlphaFold DB",
    role: "no labels",
    what: "3D structures, predicted by AI",
    lines: [
      "protein   A0A023FFD0",
      "residue   1  TRP",
      "pLDDT    86.2",
    ],
    note: "26,057 structures",
  },
  {
    name: "MegaScale",
    role: "with labels",
    what: "Mutations with measured stability",
    lines: [
      "protein   r10_437",
      "mutation  E1Q",
      "ΔΔG      0.29",
    ],
    note: "271,231 mutations",
  },
];

export default function DataExamples() {
  return (
    <div className="jf not-prose de" role="group" aria-label="One example record from each dataset">
      {ROWS.map(r => (
        <div key={r.name} className="de-item">
          <b>{r.name}</b>
          <p>{r.what}</p>
          <div className="de-rec">
            {r.lines.map(l => (
              <div key={l}>{l}</div>
            ))}
          </div>
          <span className="de-note">{r.note} · {r.role}</span>
        </div>
      ))}
      <style>{`
        .de { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.4rem; margin: 1.6rem auto; }
        .de-item { display: flex; flex-direction: column; gap: 0.25rem; min-width: 0; }
        .de-item b { font-size: 1rem; }
        .de-role { font-size: 0.78rem; color: var(--fig-note); }
        .de-item p { margin: 0.2rem 0 0.4rem; font-size: 0.88rem; line-height: 1.4; }
        .de-rec { font: 0.72rem/1.65 ui-monospace, "SF Mono", Menlo, Consolas, monospace; padding: 0.55rem 0.7rem; border-left: 2px solid var(--accent); background: color-mix(in srgb, var(--foreground) 4%, transparent); white-space: pre-wrap; overflow-x: auto; }
        .de-note { font-size: 0.78rem; color: var(--fig-note); margin-top: 0.2rem; }
        @media (max-width: 760px) { .de { grid-template-columns: 1fr; gap: 1.2rem; } }
      `}</style>
    </div>
  );
}
