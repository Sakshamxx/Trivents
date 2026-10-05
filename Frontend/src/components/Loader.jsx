"use client";

import { useEffect, useState } from "react";

export default function Loader() {
  const [progress, setProgress] = useState(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const remaining = 100 - prev;
        const increment = Math.max(2, remaining * 0.08);
        return Math.min(100, prev + increment);
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => setHidden(true), 400);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  useEffect(() => {
    const handleLoad = () => {
      setProgress(100);
    };

    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
      return () => window.removeEventListener("load", handleLoad);
    }
  }, []);

  if (hidden) return null;

  return (
    <div
      className={`loader ${progress >= 100 ? "loader-hidden" : ""}`}
      aria-hidden={progress >= 100}
    >
      <div className="loader-brand">
        <img
          src="/images/logo.png"
          alt="Trivents"
          className="loader-logo"
          width={72}
          height={72}
          decoding="async"
        />
        <span className="loader-wordmark">Trivents</span>
      </div>
      <div className="loader-bar">
        <div
          className="loader-bar-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
