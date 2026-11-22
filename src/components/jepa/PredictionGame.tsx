import { useState } from "react";
import { Figure, Segmented } from "./shared";

type Mode = "letter" | "vector" | "both";

/* Conceptual 10-residue graph. Masking 2 of 10 mirrors the experiment's 20% mask rate. */
const SEQ = "SGLKVEDIAT".split("");
const MASKED = new Set([3, 7]);
const INSPECT = 3; // the masked residue whose target we follow
const POS = [[22, 92], [58, 52], [104, 30], [150, 58], [194, 36], [198, 98], [152, 118], [104, 92], [60, 126], [24, 136]];
const EDGES = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [1, 7], [2, 7], [3, 6], [3, 5], [0, 9], [1, 8], [0, 8], [4, 6]];

const AA = "ACDEFGHIKLMNPQRSTVWY".split("");
// Illustrative probabilities only: not a model output.
const PROB: Record<string, number> = { K: 0.26, R: 0.17, E: 0.12, Q: 0.08, D: 0.06, N: 0.05, S: 0.05, T: 0.04, A: 0.04 };
const rest = (1 - Object.values(PROB).reduce((a, b) => a + b, 0)) / (20 - Object.keys(PROB).length);
const p = (l: string) => PROB[l] ?? rest;
const pMax = Math.max(...AA.map(p));

// Illustrative 12-d embeddings: the teacher's target and the student's imperfect guess.
const TARGET = [0.8, -0.3, 0.5, 0.9, -0.7, 0.2, -0.1, 0.6, -0.5, 0.4, 0.7, -0.8];
const GUESS = [0.55, -0.1, 0.6, 0.5, -0.4, 0.45, 0.2, 0.3, -0.6, 0.1, 0.8, -0.4];

function MiniGraph({ showMasks, revealed, label }: { showMasks: boolean; revealed: boolean; label: string }) {
  return (
    <svg viewBox="0 0 220 160" role="img" aria-label={label} className="pg2-graph">
      {EDGES.map(([a, b]) => (
        <line key={`${a}-${b}`} x1={POS[a][0]} y1={POS[a][1]} x2={POS[b][0]} y2={POS[b][1]} stroke="var(--fig-line)" strokeWidth={1.4} />
      ))}
      {POS.map(([x, y], i) => {
        const masked = showMasks && MASKED.has(i);
        const shown = !masked || (revealed && i === INSPECT);
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={13} fill={masked ? (revealed && i === INSPECT ? "color-mix(in srgb, var(--fig-sel) 25%, var(--background))" : "var(--background)") : "var(--background)"} stroke={masked ? "var(--fig-sel)" : "var(--foreground)"} strokeOpacity={masked ? 1 : 0.45} strokeWidth={masked ? 2.4 : 1.5} strokeDasharray={masked ? "4 3" : undefined} className="jf-anim" />
            <text x={x} y={y + 4.5} textAnchor="middle" fontSize={12} fontWeight={700}>{shown ? SEQ[i] : "?"}</text>
          </g>
        );
      })}
    </svg>
  );
}

function Strip({ values, armClass, label }: { values: number[]; armClass: string; label: string }) {
  return (
    <svg viewBox="0 0 120 18" className={`pg2-strip ${armClass}`} role="img" aria-label={label}>
      {values.map((v, i) => (
        <rect key={i} x={i * 10 + 0.5} y={1} width={9} height={16} rx={2} fill={v >= 0 ? "var(--c)" : "var(--foreground)"} fillOpacity={0.15 + 0.8 * Math.abs(v)} className="jf-anim" />
      ))}
    </svg>
  );
}

const Box = ({ title, sub, strong }: { title: string; sub?: string; strong?: boolean }) => (
  <div className={`pg2-box${strong ? " strong" : ""}`}>
    <b>{title}</b>
    {sub && <span>{sub}</span>}
  </div>
);
const Arrow = () => <span className="pg2-arrow" aria-hidden="true" />;

export default function PredictionGame() {
  const [mode, setMode] = useState<Mode>("letter");
  const [revealed, setRevealed] = useState(false);
  const change = (m: Mode) => { setMode(m); setRevealed(false); };
  const letter = mode !== "vector";
  const vector = mode !== "letter";
  const diff = TARGET.map((t, i) => Math.abs(t - GUESS[i]));

  return (
    <Figure
      label="The prediction game: predicting the hidden letter versus the teacher's embedding"
      caption="Same graph. Same encoder. Different prediction target."
    >
      <div className="jf-card">
        <p className="jf-title">The prediction game</p>
        <p className="jf-sub">Hide 20% of residues, then change only what the model has to predict. <span className="jf-tag">Schematic · values illustrative</span></p>

        <Segmented<Mode>
          name="pg2-mode"
          legend="Pretraining target"
          value={mode}
          onChange={change}
          options={[{ value: "letter", label: "Predict the letter" }, { value: "vector", label: "Predict the vector" }, { value: "both", label: "Both" }]}
        />

        <div className="pg2-lane">
          <div className="pg2-lane-label">Student</div>
          <div className="pg2-flow">
            <div className="pg2-cell">
              <MiniGraph showMasks revealed={revealed && letter} label="Residue graph with two residues hidden behind a question mark; the backbone geometry stays visible." />
              <small>Masked graph: identity hidden, geometry kept</small>
            </div>
            <Arrow />
            <Box title="Encoder" sub="4 GINE layers · 128-d" strong />
            <Arrow />
            <div className="pg2-heads">
              {letter && <Box title="Letter head" sub="→ 20 scores" />}
              {vector && <Box title="Predictor" sub="small MLP, dropped after pretraining" />}
            </div>
          </div>
        </div>

        {vector && (
          <div className="pg2-lane jf-fade" key={`t-${mode}`}>
            <div className="pg2-lane-label">Teacher</div>
            <div className="pg2-flow">
              <div className="pg2-cell">
                <MiniGraph showMasks={false} revealed label="The same residue graph with nothing hidden; every residue shows its letter." />
                <small>Unmasked graph</small>
              </div>
              <Arrow />
              <Box title="EMA teacher" sub="slowly updated copy of the encoder · no gradient" />
              <Arrow />
              <div className="pg2-cell">
                <Strip values={TARGET} armClass="arm-b" label="Illustrative target embedding of the masked residue" />
                <small>Target: teacher’s embedding of the hidden residue</small>
              </div>
            </div>
          </div>
        )}

        <div className="pg2-out jf-fade" key={`o-${mode}`}>
          {letter && (
            <div className="pg2-panel arm-c">
              <div className="pg2-ph"><span className="jf-chip">C</span> <b>Letter:</b> which amino acid was hidden at the highlighted ring?</div>
              <svg viewBox="0 0 400 96" role="img" aria-label="Illustrative probability over the 20 amino acids for the hidden residue; the true letter is lysine.">
                {AA.map((l, i) => {
                  const h = (p(l) / pMax) * 54, x = i * 20 + 2, isT = revealed && l === SEQ[INSPECT];
                  return (
                    <g key={l}>
                      <rect x={x} y={64 - h} width={16} height={h} rx={2} fill="var(--c)" fillOpacity={isT ? 1 : 0.42} className="jf-anim" />
                      {isT && <rect x={x - 2} y={2} width={20} height={80} rx={4} fill="none" stroke="var(--c)" strokeWidth={1.5} strokeDasharray="3 2" />}
                      <text x={x + 8} y={80} textAnchor="middle" fontSize={11} fontWeight={isT ? 700 : 400}>{l}</text>
                    </g>
                  );
                })}
                <line x1={0} x2={400} y1={64} y2={64} stroke="var(--fig-line)" />
              </svg>
              <div className="pg2-row">
                <button type="button" className="jf-btn" onClick={() => setRevealed(r => !r)} aria-pressed={revealed}>{revealed ? "Hide the answer" : "Reveal the hidden letter"}</button>
                <span aria-live="polite">{revealed ? `It was ${SEQ[INSPECT]}. The loss is cross-entropy against that one letter.` : "The model spreads its guess over 20 letters."}</span>
              </div>
            </div>
          )}

          {vector && (
            <div className="pg2-panel arm-b">
              <div className="pg2-ph"><span className="jf-chip">B</span> <b>Vector:</b> match the teacher’s embedding, not its letter.</div>
              <div className="pg2-cmp">
                <span>Student’s prediction</span><Strip values={GUESS} armClass="arm-b" label="Illustrative predicted embedding" />
                <span>Teacher’s target</span><Strip values={TARGET} armClass="arm-b" label="Illustrative target embedding" />
                <span>Mismatch</span><Strip values={diff} armClass="arm-a" label="Illustrative per-dimension mismatch" />
              </div>
              <div className="pg2-row">
                <span>Loss = 1 − cosine similarity between the two vectors: only the <i>direction</i> has to match. No letter is predicted anywhere in this arm.</span>
              </div>
            </div>
          )}

          {mode === "both" && (
            <div className="pg2-panel arm-d pg2-both">
              <div className="pg2-ph"><span className="jf-chip">D</span> <b>Both:</b> loss = letter loss + 0.45 × vector loss</div>
            </div>
          )}
        </div>

        <p className="jf-note">
          Everything else is held fixed across arms: the graph, the encoder, the corpus, the masking rate, the optimiser and the seeds. The teacher is an exponential moving average of the student that reads the <i>unmasked</i> graph. The residue graph, probabilities and vectors above are illustrative, not model outputs.
        </p>
      </div>
      <style>{`
        .pg2-lane{display:grid;grid-template-columns:4.2rem 1fr;gap:.6rem;align-items:center;padding:.6rem 0;border-top:1px dashed var(--fig-line)}
        .pg2-lane-label{font-size:.72rem;text-transform:uppercase;letter-spacing:.05em;color:var(--fig-note)}
        .pg2-flow{display:flex;align-items:center;flex-wrap:wrap;gap:.4rem .5rem}
        .pg2-cell{display:flex;flex-direction:column;gap:.2rem;max-width:9.5rem}
        .pg2-cell small{color:var(--fig-note);font-size:.72rem;line-height:1.25}
        .pg2-graph{width:9.5rem}
        .pg2-box{border:1px solid var(--fig-line);border-radius:.5rem;background:var(--background);padding:.35rem .6rem;display:flex;flex-direction:column;font-size:.8rem;max-width:11rem}
        .pg2-box span{color:var(--fig-note);font-size:.72rem}
        .pg2-box.strong{border-color:var(--foreground)}
        .pg2-heads{display:flex;flex-direction:column;gap:.35rem}
        .pg2-arrow::before{content:"→";color:var(--fig-note)}
        .pg2-out{display:grid;gap:.7rem;padding-top:.7rem;border-top:1px dashed var(--fig-line)}
        .pg2-panel{background:var(--background);border:1px solid var(--fig-line);border-left:4px solid var(--c);border-radius:.5rem;padding:.6rem .75rem}
        .pg2-ph{display:flex;gap:.4rem;align-items:center;margin-bottom:.4rem;flex-wrap:wrap}
        .pg2-row{display:flex;gap:.7rem;align-items:center;flex-wrap:wrap;margin-top:.4rem;font-size:.85rem}
        .pg2-cmp{display:grid;grid-template-columns:9rem 1fr;gap:.3rem .7rem;align-items:center;font-size:.82rem}
        .pg2-strip{width:100%;max-width:15rem}
        .pg2-both .pg2-ph{margin:0}
        @media(max-width:560px){
          .pg2-lane{grid-template-columns:1fr;gap:.3rem}
          .pg2-arrow::before{content:"↓"}
          .pg2-flow{flex-direction:column;align-items:flex-start}
          .pg2-cmp{grid-template-columns:1fr}
          .pg2-cell,.pg2-graph{max-width:100%}
        }
      `}</style>
    </Figure>
  );
}
