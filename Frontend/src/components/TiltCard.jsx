"use client";

import { useEffect, useRef } from "react";

/**
 * TiltCard — wraps children and applies a 3D perspective tilt
 * based on mouse position. Works via inline style, no re-renders.
 */
export default function TiltCard({ children, className = "", intensity = 8, style = {} }) {
  const cardRef = useRef(null);
  const frameRef = useRef(null);
  const resetTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  const handleMove = (e) => {
    const card = cardRef.current;
    if (!card) return;

    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);

      card.style.transform = `perspective(900px) rotateY(${dx * intensity}deg) rotateX(${-dy * intensity}deg) scale3d(1.015, 1.015, 1.015)`;
    });
  };

  const handleLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    card.style.transform = `perspective(900px) rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)`;
    card.style.transition = "transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)";
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    resetTimerRef.current = setTimeout(() => {
      if (cardRef.current) cardRef.current.style.transition = "";
    }, 600);
  };

  return (
    <div
      ref={cardRef}
      className={className}
      style={{ ...style, transformStyle: "preserve-3d", willChange: "transform" }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {children}
    </div>
  );
}
