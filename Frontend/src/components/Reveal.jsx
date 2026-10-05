"use client";

import { useEffect, useRef, useState } from "react";

// Shared observer for every Reveal instance on the page —
// one native observer is cheaper than dozens of identical ones.
let sharedObserver = null;
const pendingCallbacks = new Map();

function getSharedObserver() {
  if (sharedObserver) return sharedObserver;

  sharedObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const callback = pendingCallbacks.get(entry.target);
          if (callback) {
            pendingCallbacks.delete(entry.target);
            sharedObserver.unobserve(entry.target);
            callback();
          }
        }
      }
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    }
  );

  return sharedObserver;
}

export default function Reveal({
  children,
  className = "",
  delay = 0,
  as: Tag = "div",
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = getSharedObserver();
    pendingCallbacks.set(element, () => setVisible(true));
    observer.observe(element);

    return () => {
      pendingCallbacks.delete(element);
      observer.unobserve(element);
    };
  }, []);

  const delayClass = delay > 0 ? ` reveal-delay-${Math.min(delay, 4)}` : "";

  return (
    <Tag
      ref={ref}
      className={`reveal${visible ? " visible" : ""}${delayClass} ${className}`.trim()}
    >
      {children}
    </Tag>
  );
}
