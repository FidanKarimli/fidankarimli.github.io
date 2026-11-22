import { useEffect, useState } from "react";

/**
 * A number that counts up when it scrolls into view (hydrated with client:visible).
 * Same idea as Animate UI's CountingNumber, written without extra dependencies.
 *
 * - The final value is always in the HTML (search, screen readers, no JavaScript).
 * - An invisible copy of the final value reserves the width, so nothing shifts while counting.
 * - Reduced-motion users get the final value at once.
 */
export default function CountingNumber({
  number,
  fromNumber = 0,
  decimalPlaces = 0,
  decimalSeparator = ".",
  thousandsSeparator = ",",
  padStart = false,
  delay = 0,
  duration = 1600,
  prefix = "",
  suffix = "",
  className = "",
}: {
  number: number;
  fromNumber?: number;
  decimalPlaces?: number;
  decimalSeparator?: string;
  thousandsSeparator?: string;
  padStart?: boolean;
  delay?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const format = (v: number) => {
    const [int, dec] = Math.abs(v).toFixed(decimalPlaces).split(".");
    let whole = int.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
    if (padStart) whole = whole.padStart(String(Math.trunc(Math.abs(number))).length, "0");
    return `${prefix}${v < 0 ? "-" : ""}${whole}${dec ? decimalSeparator + dec : ""}${suffix}`;
  };

  const [value, setValue] = useState(fromNumber);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(number);
      return;
    }
    let raf = 0;
    let start = 0;
    const timer = setTimeout(() => {
      const step = (t: number) => {
        if (!start) start = t;
        const p = Math.min(1, (t - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3); // ease-out: fast at first, settles gently
        setValue(fromNumber + (number - fromNumber) * eased);
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, delay);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [number, fromNumber, delay, duration]);

  const final = format(number);

  return (
    <span className={`cn ${className}`}>
      <span className="cn-sr">{final}</span>
      <span className="cn-ghost" aria-hidden="true" data-pagefind-ignore>
        {final}
      </span>
      <span className="cn-live" aria-hidden="true" data-pagefind-ignore>
        {format(value)}
      </span>
      <noscript>
        <style>{`.cn-ghost{visibility:visible!important}.cn-live{display:none}`}</style>
      </noscript>
      <style>{`
        /* Plain by default (it just counts); big stat rows style themselves via className. */
        .cn { position: relative; display: inline-block; font-variant-numeric: tabular-nums; }
        .cn-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
        .cn-ghost { visibility: hidden; }
        .cn-live { position: absolute; inset: 0; text-align: right; }
      `}</style>
    </span>
  );
}
