"use client";
export default function HeroOrbit() {
  return (
    <div className="hero-orbit" aria-hidden="true">
      {/* Warm ambient backlight */}
      <div className="hero-ambient-glow" />

      {/* Outer ring */}
      <div className="hero-orbit-ring hero-orbit-ring--outer">
        <span className="hero-orbit-node hero-orbit-node--a" />
        <span className="hero-orbit-node hero-orbit-node--b" />
      </div>

      {/* Inner ring */}
      <div className="hero-orbit-ring hero-orbit-ring--inner">
        <span className="hero-orbit-node hero-orbit-node--c" />
      </div>

      {/* Central pulse */}
      <span className="hero-orbit-core" />
    </div>
  );
}
