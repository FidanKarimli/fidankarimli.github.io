import { DATA, Figure, f3, type Arm } from "./shared";

const TRIO: Arm[] = ["B", "C", "D"];
const S = DATA.corpora.scope, A = DATA.corpora.alphafold;
const LO = 0.45, HI = 0.7;
const y = (v: number) => 62 + ((HI - v) / (HI - LO)) * 190;
const XL = 136, XR = 284;

/** Spread label positions so near-tied values don't overprint. */
function nudge(vals: Record<string, number>, gap = 16) {
  const items = Object.entries(vals).map(([k, v]) => ({ k, y: y(v) })).sort((a, b) => a.y - b.y);
  for (let i = 1; i < items.length; i++) if (items[i].y - items[i - 1].y < gap) items[i].y = items[i - 1].y + gap;
  return Object.fromEntries(items.map(i => [i.k, i.y]));
}

export default function MoreData() {
  const ly = nudge({ B: S.spearman.B.mean, C: S.spearman.C.mean, D: S.spearman.D.mean });
  const ry = nudge({ B: A.spearman.B.mean, C: A.spearman.C.mean, D: A.spearman.D.mean });
  const baseY = y(S.spearman.A.mean);
  const accS = S.letterAccuracy.C.mean, accA = A.letterAccuracy.C.mean;

  return (
    <Figure
      label="Arms B, C and D on the SCOPe and AlphaFold corpora"
      caption={<>More data moved the vector arm a little and the letter arms not at all.</>}
    >
      <div className="jf-card md">
        <p className="jf-title">More data, same lesson</p>
        <p className="jf-sub">Pooled Spearman for the same three models, pretrained on each corpus. Mean of 3 seeds.</p>

        <svg viewBox="0 0 420 270" role="img" aria-label={`Spearman on SCOPe versus AlphaFold. B: ${f3(S.spearman.B.mean)} to ${f3(A.spearman.B.mean)}. C: ${f3(S.spearman.C.mean)} to ${f3(A.spearman.C.mean)}. D: ${f3(S.spearman.D.mean)} to ${f3(A.spearman.D.mean)}. Baseline with no pretraining: ${f3(S.spearman.A.mean)}. Arm B stays below the baseline on both.`}>
          <text x={XL} y={14} textAnchor="middle" fontSize={13} fontWeight={700}>SCOPe</text>
          <text x={XL} y={29} textAnchor="middle" fontSize={10.5} className="muted">11,566 experimentally</text>
          <text x={XL} y={41} textAnchor="middle" fontSize={10.5} className="muted">determined domains</text>
          <text x={XR} y={14} textAnchor="middle" fontSize={13} fontWeight={700}>AlphaFold</text>
          <text x={XR} y={29} textAnchor="middle" fontSize={10.5} className="muted">26,057 predicted</text>
          <text x={XR} y={41} textAnchor="middle" fontSize={10.5} className="muted">structures</text>

          {[0.5, 0.6, 0.7].map(v => (
            <g key={v}>
              <line x1={30} x2={400} y1={y(v)} y2={y(v)} stroke="var(--fig-line)" strokeWidth={0.6} strokeDasharray="2 4" />
              <text x={414} y={y(v) + 3.5} textAnchor="end" fontSize={10} className="muted">{v.toFixed(1)}</text>
            </g>
          ))}
          <line x1={30} x2={400} y1={baseY} y2={baseY} stroke="var(--arm-a)" strokeWidth={1.8} strokeDasharray="6 4" />
          <text x={210} y={baseY + 15} textAnchor="middle" fontSize={10.5} style={{ fill: "var(--arm-a)" }} fontWeight={700}>A · no pretraining {f3(S.spearman.A.mean)}</text>

          {(["C", "D", "B"] as Arm[]).map(a => {
            const l = S.spearman[a].mean, r = A.spearman[a].mean, isB = a === "B";
            return (
              <g key={a} className={`arm-${a.toLowerCase()}`}>
                <line x1={XL} y1={y(l)} x2={XR} y2={y(r)} stroke="var(--c)" strokeWidth={isB ? 4 : a === "C" ? 7 : 2.5} strokeLinecap="round" />
                <circle cx={XL} cy={y(l)} r={6} fill="var(--c)" />
                <circle cx={XR} cy={y(r)} r={6} fill="var(--c)" />
                <text x={XL - 12} y={ly[a] + 4} textAnchor="end" fontSize={12.5}><tspan fontWeight={700}>{a}</tspan> {f3(l)}</text>
                <text x={XR + 12} y={ry[a] + 4} fontSize={12.5}>{f3(r)} <tspan fontWeight={700}>{a}</tspan></text>
              </g>
            );
          })}
          <text x={30} y={266} fontSize={10} className="muted">Vertical axis runs 0.45 – 0.70, not from zero.</text>
        </svg>

        <div className="md-acc">
          <div className="md-acc-h">Masked-letter accuracy, arm C <span className="muted">(held-out structures)</span></div>
          {[["SCOPe", accS], ["AlphaFold", accA]].map(([n, v]) => (
            <div key={n as string} className="md-acc-row arm-c">
              <span>{n}</span>
              <span className="md-acc-track"><span className="md-acc-fill" style={{ width: `${(v as number) * 100 * 2}%` }} /></span>
              <b>{((v as number) * 100).toFixed(1)}%</b>
            </div>
          ))}
        </div>

        <p className="md-punch">Better at predicting letters. Not better at predicting stability.</p>
        <p className="md-sub">Arm C: letter accuracy {(accS * 100).toFixed(1)}% → {(accA * 100).toFixed(1)}%, while Spearman went {f3(S.spearman.C.mean)} → {f3(A.spearman.C.mean)}. C and D moved by less than the {DATA.tieThreshold} tie threshold. B gained {f3(A.spearman.B.mean - S.spearman.B.mean)} and is still {f3(S.spearman.A.mean - A.spearman.B.mean)} below no pretraining.</p>

        <div className="md-caveat">
          <b>A caveat, not a scaling law.</b> The corpora differ in four ways at once: size, kind (predicted vs. experimental), protein length (median 157 vs. 126 residues for AlphaFold vs. SCOPe) and, because epochs were fixed at 100, the number of optimiser steps. What this shows is that the ordering held on a second, different corpus.
        </div>
      </div>
      <style>{`
        .md svg{max-width:30rem;margin:0 auto}
        .md-acc{margin:.6rem auto 0;max-width:30rem}
        .md-acc-h{font-size:.82rem;font-weight:700;margin-bottom:.25rem}
        .md-acc-row{display:grid;grid-template-columns:5rem 1fr 3.4rem;gap:.5rem;align-items:center;font-size:.85rem;margin:.2rem 0}
        .md-acc-row b{text-align:right;font-variant-numeric:tabular-nums}
        .md-acc-track{height:.8rem;background:var(--fig-faint);border-radius:.3rem;overflow:hidden}
        .md-acc-fill{display:block;height:100%;background:var(--c);border-radius:.3rem}
        .md-punch{margin:.9rem 0 .15rem;text-align:center;font-weight:700;font-style:italic;font-size:1.02rem}
        .md-sub{margin:0 auto;max-width:34rem;text-align:center;font-size:.82rem;color:var(--fig-note)}
        .md-caveat{margin-top:.8rem;padding:.55rem .75rem;border-left:4px solid var(--arm-d);background:var(--background);border-radius:.3rem;font-size:.82rem}
      `}</style>
    </Figure>
  );
}
