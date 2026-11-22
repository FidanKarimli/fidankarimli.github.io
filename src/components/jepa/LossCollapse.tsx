import { useMemo, useState, type PointerEvent } from "react";
import { DATA, Figure, Segmented, useWidth, f1 } from "./shared";

type Span = "full" | "early";
const D = DATA.corpora.scope.curves;
const NE = D.B.epochs.length; // 100
const RANK_MAX = 80;
const LOSS_MAX = Math.max(0.32, Math.max(...D.D.vectorLoss.seeds.flat(), ...D.B.vectorLoss.seeds.flat()) * 1.03);
const B_TOP = Math.max(...D.B.rank.mean);
const lossText = (v: number) => (v < 0.01 ? v.toFixed(4) : v.toFixed(3));

// Deterministic pseudo-random points for the schematic.
const CLOUD = (() => {
  let s = 7;
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const g = () => Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(2 * Math.PI * r());
  return Array.from({ length: 44 }, () => [g(), g()] as const);
})();

function Cloud({ rank, armClass, label }: { rank: number; armClass: string; label: string }) {
  const t = Math.min(1, Math.max(0, (rank - 6) / (B_TOP - 6)));
  const sx = 5 + 40 * t, sy = 4 + 22 * t;
  return (
    <svg viewBox="0 0 120 80" className={`lc-cloud ${armClass}`} role="img" aria-label={label}>
      <rect x={0.5} y={0.5} width={119} height={79} rx={8} fill="var(--background)" stroke="var(--fig-line)" />
      {CLOUD.map(([a, b], i) => (
        <circle key={i} cx={Math.round((60 + a * sx) * 100) / 100} cy={Math.round((40 + b * sy) * 100) / 100} r={2.6} fill="var(--c)" fillOpacity={0.75} className="jf-anim" />
      ))}
    </svg>
  );
}

export default function LossCollapse() {
  const [ref, width] = useWidth(640);
  const [epoch, setEpoch] = useState(1);
  const [withD, setWithD] = useState(false);
  const [span, setSpan] = useState<Span>("full");

  const xmax = span === "full" ? NE - 1 : 20;
  const L = 44, R = 12, T = 26, PH = 112, GAP = 44, AX = 24;
  const W = width, H = T + PH + GAP + PH + AX;
  const r2 = (v: number) => Math.round(v * 100) / 100; // identical output on server and client
  const x = (e: number) => r2(L + (e / xmax) * (W - L - R));
  const yR = (v: number) => r2(T + PH - (v / RANK_MAX) * PH);
  const yL = (v: number) => r2(T + PH + GAP + PH - (v / LOSS_MAX) * PH);

  const path = (vals: number[], fy: (v: number) => number) =>
    vals.slice(0, xmax + 1).map((v, e) => `${e ? "L" : "M"}${x(e).toFixed(1)},${fy(v).toFixed(1)}`).join("");

  const arms = (withD ? ["B", "D"] : ["B"]) as ("B" | "D")[];
  const e = Math.min(epoch, xmax);
  const setFromPointer = (ev: PointerEvent<SVGSVGElement>) => {
    const box = ev.currentTarget.getBoundingClientRect();
    const px = ((ev.clientX - box.left) / box.width) * W;
    setEpoch(Math.round(Math.min(xmax, Math.max(0, ((px - L) / (W - L - R)) * xmax))));
  };

  const rankB = D.B.rank.mean[e], lossB = D.B.vectorLoss.mean[e];
  const collapsed = rankB < 25;
  const ticks = useMemo(() => (span === "full" ? [0, 25, 50, 75, 99] : [0, 5, 10, 15, 20]), [span]);
  const e1 = { r: D.B.rank.mean[1], l: D.B.vectorLoss.mean[1] };

  const Panel = ({ kind }: { kind: "rank" | "loss" }) => {
    const fy = kind === "rank" ? yR : yL, top = kind === "rank" ? T : T + PH + GAP;
    const grid = kind === "rank" ? [0, 20, 40, 60, 80] : [0, 0.1, 0.2, 0.3];
    return (
      <g>
        {grid.map(v => (
          <g key={v}>
            <line x1={L} x2={W - R} y1={fy(v)} y2={fy(v)} stroke="var(--fig-line)" strokeWidth={v === 0 ? 1 : 0.6} strokeDasharray={v === 0 ? undefined : "2 4"} />
            <text x={L - 6} y={fy(v) + 3.5} textAnchor="end" fontSize={10.5} className="muted">{kind === "rank" ? v : v.toFixed(2)}</text>
          </g>
        ))}
        {arms.map(a => (
          <g key={a} className={`arm-${a.toLowerCase()}`}>
            {(kind === "rank" ? D[a].rank.seeds : D[a].vectorLoss.seeds).map((s, i) => (
              <path key={i} d={path(s, fy)} fill="none" stroke="var(--c)" strokeWidth={1} opacity={0.3} />
            ))}
            <path d={path(kind === "rank" ? D[a].rank.mean : D[a].vectorLoss.mean, fy)} fill="none" stroke="var(--c)" strokeWidth={2.6} strokeLinejoin="round" />
            <circle cx={x(e)} cy={fy((kind === "rank" ? D[a].rank.mean : D[a].vectorLoss.mean)[e])} r={4.5} fill="var(--c)" stroke="var(--background)" strokeWidth={1.5} />
          </g>
        ))}
        <text x={L} y={top - 9} fontSize={11.5} fontWeight={700}>
          {kind === "rank" ? "Effective rank (of 128)" : "JEPA loss on held-out structures"}
        </text>
      </g>
    );
  };

  return (
    <Figure
      label="Effective rank and JEPA loss through pretraining for arm B on SCOPe"
      caption={<>A rising loss isn’t always a failing model when the target itself is moving.</>}
    >
      <div className="jf-card" ref={ref}>
        <p className="jf-title">The loss that went the wrong way</p>
        <p className="jf-sub">Arm B (vector only), SCOPe. Bold line: mean of 3 seeds; faint lines: each seed. Drag across the chart or use the slider.</p>

        <div className="lc-controls">
          <Segmented<Span> name="lc-span" legend="Epochs" value={span} onChange={setSpan} options={[{ value: "full", label: "All 100" }, { value: "early", label: "First 20" }]} />
          <label className="lc-check"><input type="checkbox" checked={withD} onChange={ev => setWithD(ev.target.checked)} /> Compare with arm D (letter + vector)</label>
        </div>

        <svg
          width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ touchAction: "pan-y", cursor: "ew-resize", width: "100%", height: "auto" }}
          role="img"
          aria-label={`Two panels over training epochs. Arm B effective rank starts near 15, is ${f1(e1.r)} at epoch 1, then climbs to about ${f1(D.B.rank.mean[NE - 1])}. Arm B loss is ${lossText(e1.l)} at epoch 1, then rises to about ${lossText(Math.max(...D.B.vectorLoss.mean))}.`}
          onPointerDown={ev => setFromPointer(ev)}
          onPointerMove={ev => ev.buttons === 1 && setFromPointer(ev)}
        >
          <Panel kind="rank" />
          <Panel kind="loss" />
          <line x1={x(e)} x2={x(e)} y1={T} y2={T + PH + GAP + PH} stroke="var(--foreground)" strokeWidth={1.2} strokeDasharray="3 3" />
          {/* the known point */}
          <g>
            <line x1={x(1)} x2={x(1)} y1={yR(e1.r)} y2={yR(e1.r) - 20} stroke="var(--arm-b)" strokeWidth={1} />
            <text x={x(1) + 4} y={yR(e1.r) - 24} fontSize={10.5} fontWeight={700} style={{ fill: "var(--arm-b)" }}>epoch 1: rank {f1(e1.r)}</text>
            <text x={x(1) + 4} y={yL(e1.l) - 10} fontSize={10.5} fontWeight={700} style={{ fill: "var(--arm-b)" }}>epoch 1: loss {e1.l.toFixed(3)}</text>
          </g>
          {ticks.map(t => (
            <text key={t} x={x(t)} y={H - 6} textAnchor="middle" fontSize={10.5} className="muted">{t}</text>
          ))}
        </svg>
        <div className="lc-axis muted">training epoch (0 = first)</div>

        <div className="lc-slider">
          <label htmlFor="lc-ep">Epoch</label>
          <input id="lc-ep" type="range" min={0} max={xmax} step={1} value={e} onChange={ev => setEpoch(+ev.target.value)} aria-valuetext={`epoch ${e}, effective rank ${f1(rankB)}, loss ${lossText(lossB)}`} />
          <output>{e}</output>
        </div>

        <div className="lc-read" aria-live="polite">
          <div className="lc-clouds">
            <div><Cloud rank={rankB} armClass="arm-b" label={collapsed ? "Schematic: embeddings bunched together" : "Schematic: embeddings spread out"} /><small>B at epoch {e}</small></div>
            {withD && <div><Cloud rank={D.D.rank.mean[e]} armClass="arm-d" label="Schematic of arm D's spread" /><small>D at epoch {e}</small></div>}
          </div>
          <div>
            <p className="lc-msg">
              {collapsed ? "Representations collapse toward similar vectors." : "Embeddings spread out; the teacher’s targets become harder to predict."}
            </p>
            <p className="lc-nums">
              B · rank <b>{f1(rankB)}</b> · loss <b>{lossText(lossB)}</b>
              {withD && <><br />D · rank <b>{f1(D.D.rank.mean[e])}</b> · loss <b>{lossText(D.D.vectorLoss.mean[e])}</b></>}
            </p>
          </div>
        </div>

        <p className="jf-note">
          Values are logged per epoch on held-out structures with the same masks every epoch. Loss is 1 − cosine similarity between prediction and teacher target (for D, the vector term alone). The cloud is a schematic whose spread follows effective rank, not real embeddings. {withD ? `Arm D’s rank was already ${f1(D.D.rank.mean[1])} at epoch 1: it never collapsed. ` : ""}Rising loss accompanying recovery from collapse under an EMA teacher is the interpretation this experiment supports, not a general law of JEPA.
        </p>
      </div>
      <style>{`
        .lc-controls{display:flex;flex-wrap:wrap;gap:.2rem 1.2rem;align-items:center}
        .lc-check{display:flex;gap:.4rem;align-items:center;font-size:.85rem;margin-bottom:.75rem;cursor:pointer}
        .lc-check input{accent-color:var(--accent);width:1rem;height:1rem}
        .lc-axis{text-align:center;font-size:.72rem;margin-top:-.2rem}
        .lc-slider{display:flex;gap:.6rem;align-items:center;margin:.5rem 0}
        .lc-slider input{flex:1;accent-color:var(--accent)}
        .lc-slider output{min-width:2ch;font-weight:700;font-variant-numeric:tabular-nums}
        .lc-read{display:flex;gap:1rem;align-items:center;flex-wrap:wrap;padding:.6rem .7rem;background:var(--background);border:1px solid var(--fig-line);border-radius:.5rem;min-height:6.2rem}
        .lc-clouds{display:flex;gap:.6rem}
        .lc-clouds small{display:block;font-size:.7rem;color:var(--fig-note);text-align:center}
        .lc-cloud{width:7.5rem}
        .lc-msg{margin:0 0 .2rem;font-weight:700}
        .lc-nums{margin:0;font-size:.85rem;font-variant-numeric:tabular-nums}
      `}</style>
    </Figure>
  );
}
