import { useEffect, useRef, useState } from "react";
import { DATA, Figure, ReplayButton } from "./shared";

/**
 * A small terminal that "prints" the vector-only pretraining log, one line at a time.
 * The numbers are the real three-seed averages from the results file (SCOPe corpus).
 * It plays once when it scrolls into view (hydrate with client:visible); "Replay" runs it again.
 * Without JavaScript, or with reduced motion, the whole log is simply shown.
 */
const B = DATA.corpora.scope.curves.B;
const EPOCHS = [0, 1, 2, 5, 10, 20, 50, 99];

type Row = { text: string; note?: string; muted?: boolean };
const ROWS: Row[] = [
  { text: "vector-only · SCOPe · mean of 3 seeds", muted: true },
  ...EPOCHS.map(e => {
    const loss = B.vectorLoss.mean[e];
    const rank = B.rank.mean[e];
    return {
      text: `epoch ${String(e).padStart(2, " ")}   loss ${loss < 0.01 ? loss.toFixed(4) : loss.toFixed(3)}   rank ${rank.toFixed(1)}`,
      note: e === 1 ? "nearly collapsed" : e === 99 ? "spread out again" : undefined,
    };
  }),
];

export default function TerminalReplay() {
  const [shown, setShown] = useState(ROWS.length); // everything visible until the animation starts
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const play = () => {
    clearTimeout(timer.current);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setShown(ROWS.length);
    let n = 0;
    setShown(0);
    const tick = () => {
      n += 1;
      setShown(n);
      if (n < ROWS.length) timer.current = setTimeout(tick, n === 1 ? 700 : 650);
    };
    timer.current = setTimeout(tick, 400);
  };

  useEffect(() => {
    play();
    return () => clearTimeout(timer.current);
  }, []);

  return (
    <Figure label="A terminal printing the loss and effective rank of vector-only pretraining at selected epochs">
      <div className="tr">
        <div className="tr-bar" aria-hidden="true">
          <i /><i /><i />
          <span>training log</span>
        </div>
        <div className="tr-body" role="log" aria-label="Training log">
          {ROWS.map((r, i) => (
            <div key={i} className={`tr-line${i < shown ? " on" : ""}${r.muted ? " muted" : ""}`}>
              {r.muted ? "" : <span className="tr-p">$ </span>}
              {r.text}
              {r.note && <span className="tr-note">{`  ↳ ${r.note}`}</span>}
            </div>
          ))}
          <span className={`tr-cursor${shown >= ROWS.length ? " idle" : ""}`} aria-hidden="true" />
        </div>
      </div>
      <ReplayButton onClick={play} />
      <style>{`
        .tr { max-width: 40rem; margin: 0 auto; border-radius: 0.7rem; overflow: hidden; background: #15171c; border: 1px solid rgb(255 255 255 / 0.1); box-shadow: 0 6px 22px rgb(0 0 0 / 0.14); }
        .tr-bar { display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem 0.8rem; background: #1e2127; }
        .tr-bar i { width: 0.65rem; height: 0.65rem; border-radius: 50%; background: #4a4f58; }
        .tr-bar span { margin-left: 0.5rem; font: 0.72rem var(--font-ui); color: #8b919c; }
        .tr-body { margin: 0; padding: 0.9rem 1rem 1rem; overflow-x: auto; font: 0.8rem/1.75 ui-monospace, "SF Mono", Menlo, Consolas, monospace; color: #e6e8ec; background: none; border: 0; white-space: pre; }
        .tr-line { opacity: 0; transform: translateY(3px); transition: opacity 0.25s ease, transform 0.25s ease; }
        .tr-line.on { opacity: 1; transform: none; }
        .tr-line.muted { color: #8b919c; }
        .tr-p { color: #6fcf8f; }
        .tr-note { display: block; color: #f5a742; }
        .tr-cursor { display: inline-block; width: 0.5em; height: 1em; vertical-align: -0.15em; background: #e6e8ec; opacity: 0.8; animation: tr-blink 1s steps(2) infinite; }
        .tr-cursor.idle { opacity: 0.35; }
        @keyframes tr-blink { 50% { opacity: 0; } }
        @media (prefers-reduced-motion: reduce) {
          .tr-line { transition: none; opacity: 1; transform: none; }
          .tr-cursor { animation: none; }
        }
      `}</style>
    </Figure>
  );
}
