import { useEffect, useState } from "react";

/**
 * Types a heading out letter by letter, with a rounded cursor bar.
 * Same idea as Animate UI's TypingText, written without extra dependencies.
 *
 * - The full title is always in the HTML (screen readers, search, no-JS).
 * - An invisible copy reserves the final size, so nothing jumps while typing.
 * - Reduced-motion users get the full title at once.
 */
export default function TypingTitle({
  text,
  delay = 400,
  speed = 55,
  cursor = true,
}: {
  text: string;
  delay?: number;
  speed?: number;
  cursor?: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCount(text.length);
      return;
    }
    setCount(0);
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      i += 1;
      setCount(i);
      if (i < text.length) {
        // A little irregularity so it feels typed, not mechanical.
        timer = setTimeout(tick, speed + Math.random() * 45);
      }
    };
    timer = setTimeout(tick, delay);
    return () => clearTimeout(timer);
  }, [text, delay, speed]);

  const done = count >= text.length;

  return (
    <span className="tt">
      <span className="tt-sr">{text}</span>
      <span className="tt-ghost" aria-hidden="true" data-pagefind-ignore>
        {text}
      </span>
      <span className="tt-live" aria-hidden="true" data-pagefind-ignore>
        {text.slice(0, count)}
        {cursor && <span className={`tt-cursor${done ? " done" : ""}`} />}
      </span>
      <noscript>
        <style>{`.tt-ghost{visibility:visible!important}.tt-live{display:none}`}</style>
      </noscript>
      <style>{`
        /* Right padding leaves room for the cursor after the last letter, so it never wraps. */
        .tt { position: relative; display: inline-block; padding-right: 0.4em; }
        .tt-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
        .tt-ghost { visibility: hidden; }
        .tt-live { position: absolute; inset: 0; }
        .tt-cursor {
          display: inline-block;
          width: 0.14em;
          min-width: 3px;
          height: 0.95em;
          margin-left: 0.12em;
          vertical-align: -0.12em;
          border-radius: 999px;
          background: currentColor;
        }
        @media (prefers-reduced-motion: no-preference) {
          .tt-cursor.done { animation: tt-blink 1.1s steps(1) infinite; }
          @keyframes tt-blink { 50% { opacity: 0; } }
        }
        @media (prefers-reduced-motion: reduce) { .tt-cursor { display: none; } }
      `}</style>
    </span>
  );
}
