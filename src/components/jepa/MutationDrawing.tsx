import { useEffect, useState } from "react";
import { Figure, ReplayButton } from "./shared";

/**
 * The hand-drawn comparison of a normal gene and a mutated gene.
 *
 * It lives in two standalone SVG files (light and dark) in /public/images, shown as ordinary
 * images so their styles cannot clash with the page. The drawing starts when it scrolls into
 * view (hydrate with client:visible), plays once and holds the final picture. "Replay" runs it
 * again. Switching the site theme swaps in the matching file.
 *
 * Without JavaScript the light version is shown. With reduced motion the SVG itself skips
 * the animation and shows the finished drawing.
 */
const ALT =
  "A hand-drawn comparison of a normal gene and a mutated gene. A change in the DNA letters makes the protein misfold, so it can no longer do its job and the normal characteristic is lost.";

export default function MutationDrawing() {
  const [run, setRun] = useState(0); // 0 = not started yet
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const read = () => setDark(document.documentElement.getAttribute("data-theme") === "dark");
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const t = setTimeout(() => setRun(1), 250);
    return () => {
      observer.disconnect();
      clearTimeout(t);
    };
  }, []);

  const file = `/images/mutation-handdrawn-${dark ? "dark" : "light"}.svg`;

  return (
    <Figure label="A normal gene compared with a mutated gene, hand-drawn">
      <div className="md-frame">
        {run > 0 && <img src={`${file}?r=${run}`} alt={ALT} width={720} height={664} decoding="async" />}
      </div>
      <ReplayButton onClick={() => setRun(r => r + 1)} />
      <noscript>
        <img src="/images/mutation-handdrawn-light.svg" alt={ALT} width={720} height={664} />
      </noscript>
      <style>{`
        .md-frame { aspect-ratio: 720 / 664; max-width: 44rem; margin: 0 auto; }
        .jf .md-frame img { display: block; width: 100%; height: auto; border: 0; margin: 0 auto; }
        .md-frame + .jf-replay-row { max-width: 44rem; margin-inline: auto; }
      `}</style>
    </Figure>
  );
}
