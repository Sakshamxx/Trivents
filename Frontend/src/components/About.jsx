"use client";

import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";
import { Sparkles, Camera, Video, Palette, Users, Megaphone, Star } from "lucide-react";

/* ─────────────────────────────────────────────────────────
   DATA — filled from Trivents Knowledge Base
   ───────────────────────────────────────────────────────── */

const FOUNDERS = ["Varshini", "Ankit", "Nadish", "Saksham"];

const WHAT_WE_DO = [
  {
    icon: Camera,
    title: "Photography",
    description:
      "Event photography, portraits, candid moments, and behind-the-scenes — capturing the energy of every occasion.",
  },
  {
    icon: Video,
    title: "Cinematography",
    description:
      "Cinematic reels, event films, and short-form video for social media — the visual heartbeat of our campus.",
  },
  {
    icon: Palette,
    title: "Graphic Design",
    description:
      "Event posters, announcements, and social creatives built in Canva, Photoshop, and beyond.",
  },
  {
    icon: Megaphone,
    title: "Social Media",
    description:
      "Content calendars, captions, promotions, and campaigns — growing Trinity's online presence intentionally.",
  },
  {
    icon: Users,
    title: "Collaborations",
    description:
      "Brand partnerships with Beast Life, Untamed Living, IOTA Water, Code Rangers, IGMAE ODS, and more.",
  },
  {
    icon: Star,
    title: "Workshops",
    description:
      "Lens Craft and skill-sharing sessions — we don't just create content, we create opportunities to learn.",
  },
];

const COLLABS = [
  { name: "Beast Life", type: "Brand Collab" },
  { name: "Code Rangers", type: "Hackathon" },
  { name: "Untamed Living", type: "Brand Collab" },
  { name: "IGMAE ODS", type: "Community" },
  { name: "IOTA Water", type: "Sponsor" },
  { name: "Event Bash", type: "Startup" },
];

/* ─────────────────────────────────────────────────────────
   ANIMATED COUNTER
   ───────────────────────────────────────────────────────── */

function AnimatedStat({ value, label }) {
  const [display, setDisplay] = useState(() =>
    /[0-9]/.test(value) ? "0" : value
  );
  const ref = useRef(null);
  const triggered = useRef(false);

  useEffect(() => {
    const numeric = parseInt(value.replace(/\D/g, ""), 10);
    const suffix = value.replace(/[\d]/g, "");
    if (!numeric) return;

    let raf = 0;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered.current) {
          triggered.current = true;
          let start = 0;
          const step = Math.ceil(numeric / 40);
          const tick = () => {
            start = Math.min(start + step, numeric);
            setDisplay(start + suffix);
            if (start < numeric) raf = requestAnimationFrame(tick);
          };
          raf = requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => {
      cancelAnimationFrame(raf);
      obs.disconnect();
    };
  }, [value]);

  return (
    <div ref={ref} className="about-stat-item">
      <span className="about-stat-value">{display}</span>
      <span className="about-stat-label">{label}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   COLLAB PILL (marquee style)
   ───────────────────────────────────────────────────────── */

function CollabTicker() {
  const trackRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    const wrap = wrapRef.current;
    if (!track || !wrap) return;
    let x = 0;
    let raf;
    let running = true;
    const speed = 0.5;
    const animate = () => {
      if (running) {
        x -= speed;
        const half = track.scrollWidth / 2;
        if (Math.abs(x) >= half) x = 0;
        track.style.transform = `translateX(${x}px)`;
      }
      raf = requestAnimationFrame(animate);
    };
    // Don't burn frames animating a ticker nobody can see.
    const observer = new IntersectionObserver(
      ([entry]) => {
        running = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    observer.observe(wrap);
    raf = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  const pills = [...COLLABS, ...COLLABS];

  return (
    <div className="about-collab-ticker" ref={wrapRef}>
      <div className="about-collab-ticker-inner" ref={trackRef}>
        {pills.map((c, i) => (
          <span key={i} className="about-collab-pill">
            <span className="about-collab-pill-dot" />
            <strong>{c.name}</strong>
            <span className="about-collab-pill-type">{c.type}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   WHAT WE DO CARD
   ───────────────────────────────────────────────────────── */

function WhatWeDoCard({ item, index }) {
  const Icon = item.icon;
  const [hovered, setHovered] = useState(false);
  const glowRef = useRef(null);
  const cardRef = useRef(null);
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
    if (!el || !glowRef.current) return;
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      glowRef.current.style.background = `radial-gradient(280px circle at ${x}px ${y}px, rgba(255,85,45,0.14) 0%, transparent 70%)`;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotateY = ((x - cx) / cx) * 5;
      const rotateX = -((y - cy) / cy) * 5;
      el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });
  };

  const handleMouseLeave = () => {
    setHovered(false);
    const el = cardRef.current;
    if (el) {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      el.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0)";
      el.style.transition = "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)";
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => {
        if (cardRef.current) cardRef.current.style.transition = "";
      }, 400);
    }
  };

  return (
    <Reveal delay={index % 3 + 1}>
      <div
        ref={cardRef}
        className={`about-wwd-card ${hovered ? "hovered" : ""}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      >
        <div ref={glowRef} className="about-wwd-glow" />
        <div className="about-wwd-icon-shell">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="about-wwd-title">{item.title}</h3>
        <p className="about-wwd-desc">{item.description}</p>
      </div>
    </Reveal>
  );
}

/* ─────────────────────────────────────────────────────────
   ABOUT SECTION
   ───────────────────────────────────────────────────────── */

export default function About() {
  return (
    <section id="about" className="about-section">
      <div className="about-ambient-glow" aria-hidden="true" />

      <div className="about-inner">

        {/* ══════════════════════════════════════════════════════
            1. WHO WE ARE — HERO BLOCK
        ══════════════════════════════════════════════════════ */}
        <div className="about-header-block">
          <Reveal>
            <div className="section-pill">
              <Sparkles className="h-3 w-3" />
              <span>WHO WE ARE</span>
            </div>

            <h2 className="section-title">
              The official <span className="highlight">Social Media</span>{" "}
              Club of <span className="highlight">TIIPS</span>
            </h2>
          </Reveal>

          <div className="about-story-grid">
            <Reveal delay={1} className="about-story-card">
              <div className="about-story-card-tag">01 / IDENTITY</div>
              <h3 className="about-story-heading">
                We Create. We Capture. We Connect.
              </h3>
              <p className="about-story-p">
                Trivents is the official social media club of Trinity Institute
                of Innovation in Professional Studies (TIIPS), Greater Noida.
                We are a student-run creative community covering photography,
                cinematography, reels, graphic design, social media, event
                coverage, and brand collaborations.
              </p>
              <div className="about-story-badges">
                <span className="about-mini-badge">TIIPS, Greater Noida</span>
                <span className="about-mini-badge">@trivent_s</span>
                <span className="about-mini-badge">Est. by Students</span>
              </div>
            </Reveal>

            <Reveal delay={2} className="about-story-card about-story-card--accent">
              <div className="about-story-card-tag">02 / FOUNDING STORY</div>
              <h3 className="about-story-heading">
                Built to fill the gap nobody else did.
              </h3>
              <p className="about-story-p">
                Before Trivents, Trinity had no dedicated creative team. Events
                went uncaptured, stories went untold, and promotions were
                scattered. Four students — {FOUNDERS.join(", ")} — changed
                that by building one skilled, passionate team to handle it all.
              </p>
              <div className="about-story-badges">
                <span className="about-mini-badge">Founded by 4 Students</span>
                <span className="about-mini-badge">President: K. Varshini</span>
                <span className="about-mini-badge">Weekly Meetings</span>
              </div>
            </Reveal>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            2. STATS BAR
        ══════════════════════════════════════════════════════ */}
        <Reveal className="about-stats-row">
          <AnimatedStat value="20+" label="Events Covered" />
          <div className="about-stats-divider" />
          <AnimatedStat value="500+" label="Content Pieces" />
          <div className="about-stats-divider" />
          <AnimatedStat value="10+" label="Brand Collabs" />
          <div className="about-stats-divider" />
          <AnimatedStat value="2000+" label="Instagram Followers" />
          <div className="about-stats-divider" />
          <AnimatedStat value="50+" label="Freshers Mentored" />
        </Reveal>

        {/* ══════════════════════════════════════════════════════
            3. WHAT WE DO — 6-CARD GRID
        ══════════════════════════════════════════════════════ */}
        <div className="about-sub-block">
          <Reveal>
            <div className="about-section-header">
              <div className="section-pill">
                <span>OUR WORK</span>
              </div>
              <h2 className="section-title">
                WHAT WE <span className="highlight">DO</span>
              </h2>
              <p className="about-section-subtitle">
                From the lens to the feed — every creative skill that keeps
                Trinity&apos;s story alive.
              </p>
            </div>
          </Reveal>

          <div className="about-wwd-grid">
            {WHAT_WE_DO.map((item, i) => (
              <WhatWeDoCard key={item.title} item={item} index={i} />
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            4. COLLABORATIONS TICKER
        ══════════════════════════════════════════════════════ */}
        <div className="about-sub-block">
          <Reveal>
            <div className="about-section-header">
              <div className="section-pill">
                <span>COLLABS &amp; PARTNERS</span>
              </div>
              <h2 className="section-title">
                BRANDS WE&apos;VE <span className="highlight">WORKED WITH</span>
              </h2>
            </div>
          </Reveal>
          <CollabTicker />
        </div>

      </div>
    </section>
  );
}
