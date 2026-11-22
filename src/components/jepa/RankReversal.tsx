import { useId, useState } from "react";
import { CORPORA, DATA, Figure, Segmented, f1, f3, type Arm, type CorpusKey } from "./shared";

const TRIO: Arm[] = ["B", "C", "D"];
const cls = (a: Arm) => `arm-${a.toLowerCase()}`;

function Spectrum() {
  const [spread, setSpread] = useState(0.6); // 0 = concentrated, 1 = perfectly even
  const alpha = 3 * (1 - spread);
  const id = useId();
  const n = 16;
  const s = Array.from({ length: n }, (_, i) => Math.pow(i + 1, -alpha));
  const tot = s.reduce((a, b) => a + b, 0);
  const p = s.map(v => v / tot);
  const er = Math.exp(-p.reduce((a, v) => a + v * Math.log(v), 0));
  return (
    <div className="rr-spec">
      <p>
        Imagine a table with one row per residue and one column per embedding dimension. Its <b>singular values</b> say how strongly the table stretches along each independent direction. Divide each by their sum and you get a set of proportions. If a few directions hold nearly all of it, the table is effectively low-dimensional. <b>Effective rank</b> is the entropy of those proportions, exponentiated: roughly, <i>how many directions are really being used</i>.
      </p>
      <svg viewBox="0 0 320 110" role="img" aria-label={`Illustrative spectrum of ${n} proportions. Effective rank about ${er.toFixed(1)} of ${n}.`}>
        {p.map((v, i) => (
          <rect key={i} x={i * 20 + 3} y={86 - v * 230} width={14} height={Math.max(1, v * 230)} rx={2} fill="var(--foreground)" fillOpacity={0.55} />
        ))}
        <line x1={0} x2={320} y1={86} y2={86} stroke="var(--fig-line)" />
        <text x={0} y={104} fontSize={11} className="muted">direction 1</text>
        <text x={320} y={104} fontSize={11} textAnchor="end" className="muted">direction {n}</text>
      </svg>
      <label className="rr-slider" htmlFor={id}>
        <span>Concentrated</span>
        <input id={id} type="range" min={0} max={1} step={0.02} value={spread} onChange={e => setSpread(parseFloat(e.target.value))} aria-valuetext={`effective rank about ${er.toFixed(1)} of ${n}`} />
        <span>Even</span>
      </label>
      <p className="rr-er">Effective rank ≈ <b>{er.toFixed(1)}</b> of {n} <span className="muted">· the real encoders use 128 directions</span></p>
    </div>
  );
}

export default function RankReversal() {
  const [corpus, setCorpus] = useState<CorpusKey>("scope");
  const [open, setOpen] = useState(false);
  const d = DATA.corpora[corpus];
  const rank = (a: Arm) => d.effectiveRank[a as "B"].mean;
  const sp = (a: Arm) => d.spearman[a].mean;
  const byRank = [...TRIO].sort((a, b) => rank(b) - rank(a));
  const bySp = [...TRIO].sort((a, b) => sp(b) - sp(a));
  const y = (i: number) => 66 + i * 46;

  return (
    <Figure
      label="Effective rank versus downstream Spearman for arms B, C and D"
      caption={<>The arm that spreads its embeddings across the most dimensions transfers worst.</>}
    >
      <div className="jf-card rr">
        <p className="jf-title">Better rank, worse performance</p>
        <p className="jf-sub">Two different measurements of the same three frozen encoders. They do not share units.</p>

        <Segmented<CorpusKey>
          name="rr-corpus"
          legend="Pretraining corpus"
          value={corpus}
          onChange={setCorpus}
          options={[{ value: "scope", label: "SCOPe" }, { value: "alphafold", label: "AlphaFold" }]}
        />

        <svg viewBox="0 0 400 200" role="img" aria-label={`Ranking by effective rank: ${byRank.map(a => `${a} ${f1(rank(a))}`).join(", ")}. Ranking by Spearman: ${bySp.map(a => `${a} ${f3(sp(a))}`).join(", ")}. Arm B is first by effective rank and last by Spearman.`} className="rr-slope">
          <text x={2} y={20} textAnchor="start" fontSize={12} fontWeight={700}>Ranked by effective rank</text>
          <text x={398} y={20} textAnchor="end" fontSize={12} fontWeight={700}>Ranked by Spearman</text>
          <text x={2} y={36} textAnchor="start" fontSize={10.5} className="muted">embedding spread, of 128 dimensions</text>
          <text x={398} y={36} textAnchor="end" fontSize={10.5} className="muted">stability prediction, held-out</text>
          {TRIO.map(a => {
            const i1 = byRank.indexOf(a), i2 = bySp.indexOf(a), isB = a === "B";
            return (
              <g key={a} className={cls(a)}>
                <line x1={124} y1={y(i1)} x2={276} y2={y(i2)} stroke="var(--c)" strokeWidth={isB ? 5 : 3} strokeLinecap="round" opacity={isB ? 1 : 0.8} className="jf-anim" />
                <circle cx={124} cy={y(i1)} r={7} fill="var(--c)" />
                <circle cx={276} cy={y(i2)} r={7} fill="var(--c)" />
              </g>
            );
          })}
          {byRank.map((a, i) => (
            <text key={a} x={112} y={y(i) + 4} textAnchor="end" fontSize={13}><tspan fontWeight={700}>{a}</tspan>  {f1(rank(a))}</text>
          ))}
          {bySp.map((a, i) => (
            <text key={a} x={288} y={y(i) + 4} fontSize={13}>{f3(sp(a))}  <tspan fontWeight={700}>{a}</tspan></text>
          ))}
        </svg>
        <p className="rr-ann" style={{ color: "var(--arm-b)" }}>More dimensions. Less useful information.</p>

        <div className="rr-bars">
          <div>
            <div className="rr-h">Effective rank <span className="muted">(scale 0 – 128 dimensions)</span></div>
            {TRIO.map(a => (
              <div key={a} className={`rr-bar ${cls(a)}`}>
                <span className="jf-chip">{a}</span>
                <span className="rr-track"><span className="rr-fill jf-anim" style={{ width: `${(rank(a) / 128) * 100}%` }} /></span>
                <b>{f1(rank(a))}</b>
              </div>
            ))}
          </div>
          <div>
            <div className="rr-h">Downstream Spearman <span className="muted">(scale 0 – 0.7)</span></div>
            {TRIO.map(a => (
              <div key={a} className={`rr-bar ${cls(a)}`}>
                <span className="jf-chip">{a}</span>
                <span className="rr-track"><span className="rr-fill jf-anim" style={{ width: `${(sp(a) / 0.7) * 100}%` }} /></span>
                <b>{f3(sp(a))}</b>
              </div>
            ))}
          </div>
        </div>

        <p className="jf-note">
          {CORPORA[corpus].name}: {CORPORA[corpus].detail}. Mean of 3 seeds. Effective rank is measured on a fixed 80,000 held-out pretraining residues. Arm A is absent because it has no pretrained encoder to measure. C and D are close on both measures; what to look at is where B moves. This compares geometry with usefulness for one encoder and one task. It does not show that effective rank measures model quality, or that high rank is bad in general.
        </p>

        <button type="button" className="jf-btn rr-toggle" aria-expanded={open} onClick={() => setOpen(o => !o)}>
          {open ? "Hide" : "What is effective rank?"} <span aria-hidden="true">{open ? "▴" : "▾"}</span>
        </button>
        {open && <Spectrum />}
      </div>
      <style>{`
        .rr-slope{width:100%;max-width:34rem;margin:0 auto}
        .rr-ann{text-align:center;font-weight:700;font-style:italic;margin:.1rem 0 .9rem;font-size:1rem}
        .rr-bars{display:grid;grid-template-columns:1fr 1fr;gap:1.2rem}
        @media(max-width:560px){.rr-bars{grid-template-columns:1fr}}
        .rr-h{font-size:.82rem;font-weight:700;margin-bottom:.3rem}
        .rr-bar{display:grid;grid-template-columns:1.45rem 1fr 3.2rem;gap:.5rem;align-items:center;margin:.25rem 0}
        .rr-bar b{font-variant-numeric:tabular-nums;font-size:.85rem;text-align:right}
        .rr-track{height:.9rem;background:var(--fig-faint);border-radius:.3rem;overflow:hidden}
        .rr-fill{display:block;height:100%;background:var(--c);border-radius:.3rem}
        .rr-toggle{margin-top:.8rem}
        .rr-spec{margin-top:.8rem;padding-top:.8rem;border-top:1px dashed var(--fig-line);font-size:.88rem}
        .rr-spec p{margin:.2rem 0 .6rem}
        .rr-spec svg{max-width:22rem}
        .rr-slider{display:flex;gap:.6rem;align-items:center;font-size:.78rem;color:var(--fig-note);margin-top:.4rem}
        .rr-slider input{flex:1;max-width:14rem;accent-color:var(--accent)}
      `}</style>
    </Figure>
  );
}
