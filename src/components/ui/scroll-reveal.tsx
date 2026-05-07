"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  /** Stagger delay in ms — useful when rendering a list of items */
  delay?: number;
}

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect reduced-motion preference
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReduced) {
      el.classList.remove("scroll-hidden");
      return;
    }

    // Set the stagger delay as a CSS custom property so the keyframe picks it up
    if (delay > 0) {
      el.style.setProperty("--reveal-delay", `${delay}ms`);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.remove("scroll-hidden");
          el.classList.add("scroll-visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={`scroll-hidden ${className}`}>
      {children}
    </div>
  );
}
