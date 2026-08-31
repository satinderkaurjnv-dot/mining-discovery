"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * Fade-and-rise on first entry into the viewport, then it stays put — the observer
 * disconnects on the first intersection so a section never re-animates on scroll-back.
 *
 * Lifted out of Stats so the About page's stat rows and cards reveal on exactly the same
 * curve and threshold as the homepage's "Market Influence & Reach" block rather than on a
 * near-copy that drifts.
 */
export const RevealOnScroll: React.FC<{
  children: React.ReactNode;
  className?: string;
  /** Seconds of stagger, for grids that should reveal card by card rather than at once. */
  delay?: number;
}> = ({ children, className = "", delay = 0 }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
      // duration and curve are EASE from SectionReveal, restated in CSS: this component
      // predates the shared variants and stays CSS-driven, but it must not move to a
      // different rhythm than the framer sections do.
      className={`transition-all duration-[650ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default RevealOnScroll;
