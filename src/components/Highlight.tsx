import { useEffect, useState } from "react";

/**
 * Text with a gradient highlight that sweeps in from the left when it scrolls into view
 * (hydrated with client:visible). Same look as Animate UI's HighlightText, without extra
 * dependencies.
 *
 * - Without JavaScript the highlight is simply shown.
 * - Reduced-motion users get the finished highlight at once.
 * - Wrapped text keeps the rounded highlight on every line.
 */
export default function Highlight({
  text,
  delay = 150,
}: {
  text: string;
  delay?: number;
}) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setOn(true);
      return;
    }
    const t = setTimeout(() => setOn(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <span className={`hl${on ? " on" : ""}`}>
      {text}
      <noscript>
        <style>{`.hl{background-size:100% 100%!important}`}</style>
      </noscript>
      <style>{`
        .hl {
          padding: 0.05em 0.3em;
          border-radius: 0.4em;
          background-image: linear-gradient(to right, #dbeafe, #f3e8ff);
          background-repeat: no-repeat;
          background-size: 0% 100%;
          -webkit-box-decoration-break: clone;
          box-decoration-break: clone;
        }
        .hl.on { background-size: 100% 100%; }
        [data-theme="dark"] .hl { background-image: linear-gradient(to right, #2f58c8, #7a3fc2); }
        @media (prefers-reduced-motion: no-preference) {
          .hl { transition: background-size 0.9s cubic-bezier(0.22, 1, 0.36, 1); }
        }
      `}</style>
    </span>
  );
}
