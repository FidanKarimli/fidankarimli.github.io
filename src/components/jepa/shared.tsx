import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import "./jepa.css";
import raw from "@/data/jepa-results.json";

export type Arm = "A" | "B" | "C" | "D";
export type CorpusKey = "scope" | "alphafold";
export type Stat = { mean: number; sd: number; seeds: number[] };
export type Curve = { mean: number[]; seeds: number[][] };
export type CorpusData = {
  spearman: Record<Arm, Stat>;
  effectiveRank: Record<"B" | "C" | "D", Stat>;
  letterAccuracy: Record<"C" | "D", Stat>;
  curves: Record<"B" | "D", { epochs: number[]; rank: Curve; vectorLoss: Curve }>;
};
export const DATA = raw as unknown as {
  tieThreshold: number;
  corpora: Record<CorpusKey, CorpusData>;
};

export const ARMS: Record<Arm, { title: string; short: string }> = {
  A: { title: "No pretraining", short: "None" },
  B: { title: "Vector only", short: "Vector" },
  C: { title: "Letter only", short: "Letter" },
  D: { title: "Letter + vector", short: "Both" },
};
export const CORPORA: Record<CorpusKey, { name: string; detail: string }> = {
  scope: { name: "SCOPe", detail: "11,566 experimentally determined domains" },
  alphafold: { name: "AlphaFold", detail: "26,057 predicted structures" },
};

export function Figure(props: { children: ReactNode; caption?: ReactNode; label: string }) {
  return (
    <figure className="jf not-prose" aria-label={props.label}>
      {props.children}
      {props.caption && <figcaption className="jf-caption">{props.caption}</figcaption>}
    </figure>
  );
}

export function Segmented<T extends string>(props: {
  name: string;
  legend: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <fieldset className="jf-seg">
      <legend>{props.legend}</legend>
      <div className="opts">
        {props.options.map(o => (
          <label key={o.value}>
            <input
              type="radio"
              name={props.name}
              value={o.value}
              checked={props.value === o.value}
              onChange={() => props.onChange(o.value)}
            />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Pixel width of an element, so charts can lay out for the real screen. SSR value is `fallback`. */
export function useWidth(fallback: number): [RefObject<HTMLDivElement | null>, number] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [w, setW] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setW(Math.max(280, Math.round(el.getBoundingClientRect().width)));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

export const f3 = (x: number) => x.toFixed(3);
export const f1 = (x: number) => x.toFixed(1);
