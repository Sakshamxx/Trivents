"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import "./Gallery.css";

/* =====================================================
   GALLERY MOSAIC DATA
   No external photos — uses gradients, shapes, and type.
===================================================== */

const mosaicItems = [
  { label: "AAKRITI 2.0", tag: "01", accent: "#ff552d", sub: "COLLEGE EVENT", type: "large", icon: "◈" },
  { label: "BEAST LIFE", tag: "02", accent: "#ff7a5a", sub: "BRAND COLLAB", type: "wide", icon: "◉" },
  { label: "LENS CRAFT", tag: "03", accent: "#ff3a1a", sub: "WORKSHOP", type: "tall", icon: "▲" },
  { label: "CODE RANGERS", tag: "04", accent: "#ff9070", sub: "HACKATHON", type: "small", icon: "◆" },
  { label: "STARRY NIGHT", tag: "05", accent: "#ff5533", sub: "PROM NIGHT", type: "medium", icon: "◎" },
  { label: "UNTAMED LIVING", tag: "06", accent: "#ff6644", sub: "BRAND COLLAB", type: "small", icon: "❋" },
  { label: "EVENT BASH", tag: "07", accent: "#ff4422", sub: "GARBA EVENT", type: "wide", icon: "◐" },
  { label: "IGMAE ODS", tag: "08", accent: "#ff7744", sub: "COMMUNITY", type: "medium", icon: "✦" },
  { label: "BEHIND THE LENS", tag: "09", accent: "#ff6633", sub: "BTS CONTENT", type: "tall", icon: "◑" },
];

const stats = [
  { value: "20+", label: "Events Covered" },
  { value: "500+", label: "Content Pieces" },
  { value: "10+", label: "Brand Collabs" },
  { value: "2K+", label: "Instagram Followers" },
];

/* =====================================================
   MOSAIC CARD
===================================================== */

function MosaicCard({ item, index }) {
  return (
    <div
      className={`gallery-mosaic-card gallery-mosaic-card--${item.type}`}
      style={{ "--card-accent": item.accent }}
      data-index={index}
    >
      <div className="gallery-mosaic-card-bg" />
      <div className="gallery-mosaic-card-glow" />
      <div className="gallery-mosaic-card-noise" />

      <div className="gallery-mosaic-card-content">
        <div className="gallery-mosaic-card-header">
          <span className="gallery-mosaic-card-tag">{item.tag}</span>
          <span className="gallery-mosaic-card-icon">{item.icon}</span>
        </div>

        <div className="gallery-mosaic-card-body">
          <p className="gallery-mosaic-card-sub">{item.sub}</p>
          <h3 className="gallery-mosaic-card-label">{item.label}</h3>
        </div>

        <div className="gallery-mosaic-card-corner" />
      </div>
    </div>
  );
}

/* =====================================================
   FLOATING TICKER
===================================================== */

function GalleryTicker() {
  const trackRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    const wrap = wrapRef.current;
    if (!track || !wrap) return;

    const tween = gsap.to(track, {
      xPercent: -50,
      duration: 22,
      ease: "none",
      repeat: -1,
    });

    // Pause the infinite tween while the ticker is off-screen.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) tween.play();
        else tween.pause();
      },
      { threshold: 0 }
    );
    observer.observe(wrap);

    return () => {
      observer.disconnect();
      tween.kill();
    };
  }, []);

  const words = ["TRIVENTS", "TIIPS GN", "LENS CRAFT", "AAKRITI", "BEAST LIFE", "STARRY NIGHT", "CODE RANGERS", "COLLABS"];
  const repeated = [...words, ...words, ...words, ...words];

  return (
    <div className="gallery-ticker" ref={wrapRef}>
      <div className="gallery-ticker-track" ref={trackRef}>
        {repeated.map((word, i) => (
          <span key={i} className="gallery-ticker-word">
            {word}
            <span className="gallery-ticker-dot">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* =====================================================
   STATS ROW
===================================================== */

function GalleryStats() {
  return (
    <div className="gallery-stats">
      {stats.map((stat) => (
        <div key={stat.label} className="gallery-stat">
          <span className="gallery-stat-value">{stat.value}</span>
          <span className="gallery-stat-label">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}

/* =====================================================
   GALLERY
===================================================== */

export default function Gallery() {
  const mosaicRef = useRef(null);
  const mouseX = useRef(0.5);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.current = e.clientX / window.innerWidth;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const cards = mosaicRef.current?.querySelectorAll(".gallery-mosaic-card");
    if (!cards || cards.length === 0) return;

    // Cache one quickTo setter per card per axis: creating a new
    // gsap.to() tween inside the ticker every frame churns memory
    // and forces overwrite resolution 60x/sec. quickTo reuses a
    // single tween per target with the same duration/ease feel.
    const setters = Array.from(cards).map((card, i) => ({
      xTo: gsap.quickTo(card, "x", {
        duration: 1.2 + i * 0.05,
        ease: "power2.out",
        overwrite: "auto",
      }),
      yTo: gsap.quickTo(card, "y", {
        duration: 1.2 + i * 0.05,
        ease: "power2.out",
        overwrite: "auto",
      }),
    }));

    const ticker = () => {
      const offset = (mouseX.current - 0.5) * 18;
      setters.forEach((setter, i) => {
        const dir = i % 2 === 0 ? 1 : -1;
        const depth = 0.4 + (i % 3) * 0.3;
        setter.yTo(offset * dir * depth);
        setter.xTo(offset * dir * depth * 0.4);
      });
    };

    gsap.ticker.add(ticker);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      gsap.ticker.remove(ticker);
    };
  }, []);

  return (
    <section id="gallery" className="gallery-section">
      <div className="gallery-inner">
        {/* ---- HEADER ---- */}
        <div className="gallery-header">
          <div className="section-pill">
            <span>GALLERY</span>
          </div>

          <h2 className="section-title">
            COLLABS &amp; <span className="highlight">EVENTS</span>
          </h2>

          <p>
            A collection of moments, collaborations and
            experiences created along the way.
          </p>
        </div>
      </div>

      {/* ---- TICKER (Full Viewport Width edge-to-edge) ---- */}
      <GalleryTicker />

      <div className="gallery-inner">
        {/* ---- MOSAIC GRID ---- */}
        <div className="gallery-mosaic" ref={mosaicRef}>
          {mosaicItems.map((item, index) => (
            <MosaicCard key={item.tag} item={item} index={index} />
          ))}

          {/* Decorative accent orb */}
          <div className="gallery-mosaic-orb" />
        </div>

        {/* ---- STATS ---- */}
        <GalleryStats />

        {/* ---- FOOTER LABEL ---- */}
        <div className="gallery-footer">
          <span>TRIVENTS / @trivent_s</span>
          <span>TIIPS GREATER NOIDA</span>
        </div>

      </div>
    </section>
  );
}