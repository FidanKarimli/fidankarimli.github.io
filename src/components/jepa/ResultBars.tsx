import { useState } from "react";
import { ARMS, DATA, Figure, f3, type Arm } from "./shared";

const MAX = 0.7;
const pct = (v: number) => `${(v / MAX) * 100}%`;
const TICKS = [0, 0.2, 0.4, 0.6];

export default function ResultBars() {
  const s = DATA.corpora.scope.spearman;
  const base = s.A.mean;
  const [active, setActive] = useState<Arm | null>(null);

  const why: Record<Arm, string> = {
    A: `Trained end to end on the labelled mutations from random weights: this is the number every pretrained encoder has to beat (${f3(base)}).`,
    B: `Predicting the teacher’s embedding gave a frozen encoder that scores ${f3(base - s.B.mean)} below the baseline, and the seeds disagree most (±${f3(s.B.sd)}).`,
    C: `Predicting the hidden letter gave a frozen encoder that scores ${f3(s.C.mean - base)} above the baseline, with the tightest spread across seeds (±${f3(s.C.sd)}).`,
    D: `Adding the vector loss to the letter loss lands ${f3(Math.abs(s.D.mean - s.C.mean))} from arm C, well inside the ${DATA.tieThreshold} tie threshold, so this experiment cannot separate them.`,
  };
  const note: Partial<Record<Arm, string>> = {
    B: "Pretraining made things worse.",
    C: "A frozen encoder beats the supervised baseline.",
    D: "Tied with C: not conclusively better.",
  };

  return (
    <Figure
      label="Pooled Spearman correlation for the four arms on the SCOPe experiment"
      caption={<>Same encoder, same data, same seeds. Only the pretraining target changes. B and C are the contrast to look at.</>}
    >
      <div className="jf-card rb">
        <p className="jf-title">Pooled Spearman correlation on held-out proteins</p>
        <p className="jf-sub">SCOPe pretraining · mean of 3 seeds, whiskers ± 1 standard deviation, dots are the individual seeds. Tap or hover a bar.</p>

        <div className="rb-chart">
          {(["A", "B", "C", "D"] as Arm[]).map(arm => {
            const st = s[arm];
            return (
              <button
                key={arm}
                type="button"
                className={`rb-row arm-${arm.toLowerCase()}${active === arm ? " on" : ""}`}
                aria-pressed={active === arm}
                aria-label={`${arm}, ${ARMS[arm].title}: ${f3(st.mean)} plus or minus ${f3(st.sd)}`}
                onPointerEnter={() => setActive(arm)}
                onFocus={() => setActive(arm)}
                onClick={() => setActive(arm)}
              >
                <span className="rb-name"><span className="jf-chip">{arm}</span> {ARMS[arm].title}</span>
                <span className="rb-track">
                  <span className="rb-base" style={{ left: pct(base) }} />
                  <span className="rb-bar jf-anim" style={{ width: pct(st.mean) }} />
                  <span className="rb-whisker" style={{ left: pct(st.mean - st.sd), width: `calc(${pct(2 * st.sd)})` }} />
                  {st.seeds.map((v, i) => <span key={i} className="rb-dot" style={{ left: pct(v) }} />)}
                </span>
                <span className="rb-val">{f3(st.mean)} <small>± {f3(st.sd)}</small></span>
                <span className="rb-note">{arm === "A" ? "baseline: trains the whole network" : note[arm]}</span>
              </button>
            );
          })}
          <div className="rb-axis" aria-hidden="true">
            <span />
            <span className="rb-ticks">
              {TICKS.map(t => <span key={t} style={{ left: pct(t) }}>{t === 0 ? "0" : t.toFixed(1)}</span>)}
              <span className="rb-baselabel" style={{ left: pct(base) }}>A’s {f3(base)}</span>
            </span>
          </div>
        </div>

        <p className="rb-read" aria-live="polite">{active ? why[active] : "Select a result for a one-line explanation."}</p>
        <noscript><ul>{(["A", "B", "C", "D"] as Arm[]).map(a => <li key={a}>{a}: {why[a]}</li>)}</ul></noscript>

        <p className="jf-note">
          n = 3 seeds per arm. Test set: 28 proteins. Arms B, C and D fine-tune a <b>frozen</b> encoder; arm A has nothing to freeze, so it trains everything. Differences under {DATA.tieThreshold} (about two standard deviations of A across seeds, fixed before any pretrained arm was run) count as ties.
        </p>
      </div>
      <style>{`
        .rb-chart{display:flex;flex-direction:column}
        .rb-row{all:unset;box-sizing:border-box;cursor:pointer;display:grid;grid-template-columns:10.5rem 1fr 6.6rem;grid-template-areas:"name track val" ". note note";column-gap:.7rem;align-items:center;padding:.5rem .4rem .35rem;border-radius:.5rem}
        .rb-row:hover,.rb-row.on{background:color-mix(in srgb,var(--c) 10%,transparent)}
        .rb-row:focus-visible{outline:2px dashed var(--accent);outline-offset:1px}
        .rb-name{grid-area:name;display:flex;align-items:center;gap:.45rem;font-size:.85rem;line-height:1.2}
        .rb-track{grid-area:track;position:relative;height:1.5rem}
        .rb-bar{position:absolute;left:0;top:.2rem;bottom:.2rem;background:var(--c);border-radius:0 .3rem .3rem 0;opacity:.88}
        .rb-row.arm-a .rb-bar{opacity:.7}
        .rb-whisker{position:absolute;top:50%;height:2px;background:var(--foreground);transform:translateY(-50%)}
        .rb-whisker::before,.rb-whisker::after{content:"";position:absolute;top:-4px;height:10px;width:2px;background:var(--foreground)}
        .rb-whisker::before{left:0}.rb-whisker::after{right:0}
        .rb-dot{position:absolute;top:50%;width:7px;height:7px;margin:-3.5px 0 0 -3.5px;border-radius:50%;background:var(--background);border:1.5px solid var(--foreground)}
        .rb-base{position:absolute;top:-.55rem;bottom:-.45rem;width:0;border-left:2px dashed var(--arm-a);z-index:1;pointer-events:none}
        .rb-val{grid-area:val;font-variant-numeric:tabular-nums;font-weight:700;font-size:.9rem;text-align:right}
        .rb-val small{font-weight:400;color:var(--fig-note);font-size:.75rem}
        .rb-note{grid-area:note;font-style:italic;font-size:.82rem;color:var(--c);min-height:1.2em;filter:brightness(1)}
        .rb-axis{display:grid;grid-template-columns:10.5rem 1fr 6.6rem;column-gap:.7rem;padding:0 .4rem;margin-top:.3rem}
        .rb-axis>span:last-child{grid-column:2}
        .rb-ticks{position:relative;height:1.4rem;font-size:.72rem;color:var(--fig-note);border-top:1px solid var(--fig-line)}
        .rb-ticks>span{position:absolute;top:.15rem;transform:translateX(-50%)}
        .rb-ticks>.rb-baselabel{top:.85rem;color:var(--arm-a);white-space:nowrap}
        .rb-axis{margin-bottom:.9rem}
        .rb-read{min-height:3.2em;margin:.2rem 0 0;font-size:.9rem}
        @media(max-width:560px){
          .rb-row{grid-template-columns:1fr auto;grid-template-areas:"name val" "track track" "note note";row-gap:.25rem}
          .rb-axis{grid-template-columns:1fr}.rb-axis>span:last-child{grid-column:1}
          .rb-read{min-height:5.4em}
        }
      `}</style>
    </Figure>
  );
}
