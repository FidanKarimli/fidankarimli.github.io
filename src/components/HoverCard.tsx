import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import "./jepa/jepa.css"; // shared colour tokens

/**
 * A word with a small definition card that pops up on hover, keyboard focus, or tap.
 * Same idea as Animate UI's hover card, written without extra dependencies.
 *
 * - Hover (with a short delay), focus, or tap opens it. Escape or a tap elsewhere closes it.
 * - The card stays inside the screen: it shifts sideways, or flips above, when needed.
 * - Without JavaScript the definition is still available as a native tooltip.
 * - Reduced-motion users get no animation.
 */
export default function HoverCard({
  label,
  title,
  body,
}: {
  label: string;
  title: string;
  body: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [shift, setShift] = useState(0);
  const [above, setAbove] = useState(false);
  const root = useRef<HTMLSpanElement>(null);
  const card = useRef<HTMLSpanElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const id = useId();

  useEffect(() => setMounted(true), []);

  const openSoon = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(true), 80);
  };
  const closeSoon = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), 140);
  };

  // Keep the card on screen.
  useLayoutEffect(() => {
    if (!open || !card.current || !root.current) return;
    setShift(0);
    setAbove(false);
    const r = card.current.getBoundingClientRect();
    const margin = 10;
    let dx = 0;
    if (r.left < margin) dx = margin - r.left;
    else if (r.right > window.innerWidth - margin) dx = window.innerWidth - margin - r.right;
    setShift(dx);
    if (r.bottom > window.innerHeight - margin) {
      const t = root.current.getBoundingClientRect();
      if (t.top > r.height + margin) setAbove(true);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  return (
    <span
      className="hc"
      ref={root}
      onMouseEnter={openSoon}
      onMouseLeave={closeSoon}
    >
      <span
        className="hc-trigger"
        role="button"
        tabIndex={0}
        aria-describedby={id}
        aria-expanded={open}
        title={mounted ? undefined : `${title}: ${body}`}
        onFocus={openSoon}
        onBlur={closeSoon}
        onClick={() => setOpen(o => !o)}
        onKeyDown={e => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(o => !o);
          }
        }}
      >
        {label}
      </span>
      <span
        id={id}
        ref={card}
        role="tooltip"
        className={`hc-card${open ? " open" : ""}${above ? " above" : ""}`}
        style={{ ["--hc-shift" as string]: `${shift}px` }}
      >
        <span className="hc-title">{title}</span>
        <span className="hc-body">{body}</span>
      </span>
      <style>{`
        .hc { position: relative; display: inline; }
        .hc-trigger {
          cursor: help;
          font-weight: 700;
          text-decoration: underline dotted var(--accent);
          text-decoration-thickness: 2px;
          text-underline-offset: 0.2em;
        }
        .hc-trigger:hover, .hc-trigger[aria-expanded="true"] { color: var(--accent); }
        .hc-trigger:focus-visible { outline: 2px dashed var(--accent); outline-offset: 2px; border-radius: 2px; }
        .hc-card {
          position: absolute;
          z-index: 30;
          left: 50%;
          top: calc(100% + 8px);
          display: block;
          width: min(17rem, 78vw);
          padding: 0.65rem 0.8rem;
          font-family: var(--font-ui);
          font-size: 0.85rem;
          font-weight: 400;
          font-style: normal;
          line-height: 1.45;
          text-align: left;
          color: var(--foreground);
          background: var(--background);
          border: 1px solid var(--fig-line);
          border-radius: 0.65rem;
          box-shadow: 0 8px 24px color-mix(in srgb, var(--foreground) 14%, transparent);
          transform: translateX(calc(-50% + var(--hc-shift, 0px)));
          transform-origin: top center;
          /* Not in the page at all until opened, so copying text around it stays clean. */
          display: none;
        }
        .hc-card.above { top: auto; bottom: calc(100% + 8px); transform-origin: bottom center; }
        .hc-card.open { display: block; }
        .hc-title { display: block; font-weight: 700; margin-bottom: 0.15rem; }
        .hc-body { display: block; color: var(--muted-foreground); }
        @media (prefers-reduced-motion: no-preference) {
          .hc-card.open { animation: hc-in 0.16s ease both; }
          .hc-card.open.above { animation-name: hc-in-up; }
          @keyframes hc-in {
            from { opacity: 0; transform: translateX(calc(-50% + var(--hc-shift, 0px))) translateY(4px) scale(0.97); }
            to { opacity: 1; transform: translateX(calc(-50% + var(--hc-shift, 0px))); }
          }
          @keyframes hc-in-up {
            from { opacity: 0; transform: translateX(calc(-50% + var(--hc-shift, 0px))) translateY(-4px) scale(0.97); }
            to { opacity: 1; transform: translateX(calc(-50% + var(--hc-shift, 0px))); }
          }
        }
      `}</style>
    </span>
  );
}
