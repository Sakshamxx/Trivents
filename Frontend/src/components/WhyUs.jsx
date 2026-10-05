"use client";

import { useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────────────────
   DATA — from Trivents Knowledge Base
   ───────────────────────────────────────────────────────── */

const cards = [
  {
    number: "01",
    title: "CREATE",
    description:
      "Turn ideas into reels, photographs, posters and stories. From concept to final cut — we build moments with intention.",
    icon: "◈",
    metric: "500+",
    metricLabel: "Content Pieces Made",
    features: ["Reels & Short Videos", "Poster Design", "Creative Direction"],
    hue: "#ff552d",
  },
  {
    number: "02",
    title: "CAPTURE",
    description:
      "Record the energy, people and memories that make campus life special — cinematically, candidly, beautifully.",
    icon: "◉",
    metric: "20+",
    metricLabel: "Events Covered",
    features: ["Cinematography", "Event Photography", "Behind the Scenes"],
    hue: "#ff7a5a",
  },
  {
    number: "03",
    title: "CONNECT",
    description:
      "Work with students, clubs, brands and creators. 10+ real collaborations. A community of 2,000+ on Instagram.",
    icon: "✦",
    metric: "10+",
    metricLabel: "Brand Collaborations",
    features: ["Brand Partnerships", "Social Media", "Community Building"],
    hue: "#ff6644",
  },
];

/* ─────────────────────────────────────────────────────────
   ANIMATED RING
   ───────────────────────────────────────────────────────── */

function AnimatedRing({ hue, active }) {
  return (
    <div className="why-us-ring-wrap" style={{ "--ring-hue": hue }}>
      <div className={`why-us-ring why-us-ring--1 ${active ? "why-us-ring--active" : ""}`} />
      <div className={`why-us-ring why-us-ring--2 ${active ? "why-us-ring--active" : ""}`} />
      <div className={`why-us-ring why-us-ring--3 ${active ? "why-us-ring--active" : ""}`} />
      <div className="why-us-ring-center">
        <div className="why-us-ring-dot" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   FEATURE TAG
   ───────────────────────────────────────────────────────── */

function FeatureTag({ label }) {
  return (
    <span className="why-us-feature-tag">
      <span className="why-us-feature-tag-dot" />
      {label}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────
   ANIMATED METRIC COUNTER
   ───────────────────────────────────────────────────────── */

function AnimatedMetric({ value }) {
  const [display, setDisplay] = useState(() =>
    /[0-9]/.test(value) ? "0" : value
  );
  const ref = useRef(null);
  const done = useRef(false);

  useEffect(() => {
    const numeric = parseInt(value.replace(/\D/g, ""), 10);
    const suffix = value.replace(/[\d]/g, "");
    if (!numeric) return;

    let raf = 0;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !done.current) {
          done.current = true;
          let start = 0;
          const step = Math.ceil(numeric / 35);
          const tick = () => {
            start = Math.min(start + step, numeric);
            setDisplay(start + suffix);
            if (start < numeric) raf = requestAnimationFrame(tick);
          };
          raf = requestAnimationFrame(tick);
        }
      },
      { threshold: 0.6 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => {
      cancelAnimationFrame(raf);
      obs.disconnect();
    };
  }, [value]);

  return <span ref={ref}>{display}</span>;
}

/* ─────────────────────────────────────────────────────────
   CARD
   ───────────────────────────────────────────────────────── */

function WhyUsCard({ card }) {
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef(null);
  const glowRef = useRef(null);
  const frameRef = useRef(null);
  const resetTimerRef = useRef(null);

  // Clear any pending rAF / reset timer on unmount.
  useEffect(() => {
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  const handleMouseMove = (e) => {
    const el = cardRef.current;
    const glow = glowRef.current;
    if (!el || !glow) return;

    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      glow.style.background = `radial-gradient(420px circle at ${x}px ${y}px, ${card.hue}22 0%, transparent 65%)`;

      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotateY = ((x - cx) / cx) * 6;
      const rotateX = -((y - cy) / cy) * 6;
      el.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
    });
  };

  const handleMouseLeave = () => {
    setHovered(false);
    const el = cardRef.current;
    if (el) {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)";
      el.style.transition = "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)";
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => {
        if (cardRef.current) cardRef.current.style.transition = "";
      }, 450);
    }
  };

  return (
    <article
      ref={cardRef}
      className="why-us-card"
      data-hue={card.hue}
      style={{ "--card-hue": card.hue, position: "relative", zIndex: 50, isolation: "isolate" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      <div ref={glowRef} className="why-us-card-magnetic-glow" />
      <div className={`why-us-card-accent-layer ${hovered ? "why-us-card-accent-layer--active" : ""}`} />

      {/* TOP */}
      <div className="why-us-card-top" style={{ position: "relative", zIndex: 10 }}>
        <span className="why-us-card-number">{card.number}</span>
        <AnimatedRing hue={card.hue} active={hovered} />
      </div>

      {/* VISUAL AREA */}
      <div className="why-us-visual-area">
        <div className={`why-us-visual-icon ${hovered ? "why-us-visual-icon--active" : ""}`}>
          {card.icon}
        </div>

        <div className="why-us-visual-metric">
          <span className="why-us-visual-metric-value">
            <AnimatedMetric value={card.metric} />
          </span>
          <span className="why-us-visual-metric-label">{card.metricLabel}</span>
        </div>

        <div className="why-us-visual-grid">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="why-us-visual-grid-line" />
          ))}
        </div>

        <div className="why-us-visual-bracket why-us-visual-bracket--tl" />
        <div className="why-us-visual-bracket why-us-visual-bracket--br" />
      </div>

      {/* BOTTOM */}
      <div className="why-us-card-bottom" style={{ position: "relative", zIndex: 10 }}>
        <div>
          <h3>{card.title}</h3>
          <p>{card.description}</p>
          <div className="why-us-features">
            {card.features.map((f) => (
              <FeatureTag key={f} label={f} />
            ))}
          </div>
        </div>
      </div>

      <div className="why-us-card-line" style={{ position: "relative", zIndex: 10 }} />
    </article>
  );
}

/* ─────────────────────────────────────────────────────────
   WHY US SECTION
   ───────────────────────────────────────────────────────── */

export default function WhyUs() {
  return (
    <section
      id="why-us"
      className="why-us-section"
      style={{ position: "relative", zIndex: 50, isolation: "isolate" }}
    >
      <div className="why-us-inner" style={{ position: "relative", zIndex: 50 }}>

        {/* HEADER */}
        <div className="why-us-header" style={{ position: "relative", zIndex: 50 }}>
          <div className="section-pill">
            <span>WHY TRIVENTS</span>
          </div>

          <h2 className="section-title">
            THE CREATIVE <span className="highlight">HEARTBEAT</span> OF <span className="highlight">TRINITY</span> 
          </h2>

          <p>
            We Create. We Capture. We Connect. — the three pillars that drive
            every photograph, every reel, every story we tell for TIIPS.
          </p>
        </div>

        {/* CARDS */}
        <div className="why-us-grid" style={{ position: "relative", zIndex: 50 }}>
          {cards.map((card) => (
            <WhyUsCard key={card.title} card={card} />
          ))}
        </div>

      </div>
    </section>
  );
}