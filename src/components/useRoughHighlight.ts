import { useEffect, type RefObject } from "react";
import { annotate } from "rough-notation";

/**
 * The emphasis style of the blog: hand-drawn strokes (rough-notation) that draw themselves
 * when the text scrolls into view (the component is hydrated with client:visible).
 *
 *  - "highlight": a blue marker behind the text, for the key ideas.
 *  - "underline": an orange hand-drawn underline, for terms being introduced.
 *
 * Colours follow the site theme and update live when the reader switches theme. Wrapped text
 * gets one stroke per line. Reduced-motion users get the finished stroke without the drawing
 * animation. Without JavaScript the text is simply plain.
 */
export type RoughKind = "highlight" | "underline";

const COLOURS = {
  highlight: { light: "#9ed2f5", dark: "#245a85" }, // blue marker; muted on black so light text stays readable
  underline: { light: "#f59e2b", dark: "#f5a742" }, // orange pen
} as const;

const colour = (kind: RoughKind) =>
  COLOURS[kind][document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light"];

export function useRoughHighlight(
  ref: RefObject<HTMLElement | null>,
  delay = 0,
  kind: RoughKind = "highlight"
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const a = annotate(el, {
      type: kind,
      color: colour(kind),
      animationDuration: reduced ? 0 : 650,
      animate: !reduced,
      iterations: 2,
      strokeWidth: kind === "underline" ? 2 : 1.5,
      padding: kind === "underline" ? 2 : 5,
      multiline: true,
    });
    const timer = setTimeout(() => a.show(), delay);

    const observer = new MutationObserver(() => {
      a.color = colour(kind);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      clearTimeout(timer);
      observer.disconnect();
      a.remove();
    };
  }, [ref, delay, kind]);
}
