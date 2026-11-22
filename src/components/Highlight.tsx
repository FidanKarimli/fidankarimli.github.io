import { useRef } from "react";
import { useRoughHighlight, type RoughKind } from "./useRoughHighlight";

/**
 * Text with a hand-drawn stroke that draws itself when it scrolls into view.
 * Use it with client:visible.
 *
 *   <Highlight text="a key idea" client:visible />                    orange hand-drawn underline (default)
 *   <Highlight text="a phrase" type="highlight" client:visible />     blue marker
 *
 * The blue marker is reserved for words with a pop-up explanation (see HoverCard), so blue
 * always means "hover or tap for more"; orange is the everyday emphasis.
 */
export default function Highlight({
  text,
  type = "underline",
  delay = 150,
}: {
  text: string;
  type?: RoughKind;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useRoughHighlight(ref, delay, type);

  return (
    <span ref={ref} className={type === "underline" ? "hl hl-underline" : "hl"}>
      {text}
    </span>
  );
}
