"use client";

import Loader from "@/components/Loader";
import Navigation from "@/components/Navigation";
import ScrollProgress from "@/components/ScrollProgress";
import Hero from "@/components/Hero";
import RIVENSection from "@/components/RIVENSection";
import WhyUs from "@/components/WhyUs";
import Gallery from "@/components/Gallery";
import About from "@/components/About";
import Footer from "@/components/Footer";
import SpectralGhost from "@/components/SpectralGhost";
import ClosingParticleImage from "@/components/ClosingParticleImage";
import Contact from "@/components/Contact";
import HeaderVisibility from "@/components/HeaderVisibility";

const particles = [
  { left: "12%", top: "18%", size: 4, opacity: 0.9 },
  { left: "18%", top: "62%", size: 5, opacity: 0.7 },
  { left: "26%", top: "28%", size: 3, opacity: 0.8 },
  { left: "38%", top: "72%", size: 5, opacity: 0.7 },
  { left: "47%", top: "22%", size: 4, opacity: 0.75 },
  { left: "60%", top: "48%", size: 3, opacity: 0.8 },
  { left: "66%", top: "76%", size: 4, opacity: 0.7 },
  { left: "74%", top: "18%", size: 5, opacity: 0.8 },
  { left: "82%", top: "60%", size: 3, opacity: 0.7 },
  { left: "88%", top: "34%", size: 4, opacity: 0.75 },
  { left: "10%", top: "82%", size: 4, opacity: 0.8 },
  { left: "52%", top: "84%", size: 3, opacity: 0.65 },
];

export default function Home() {
  return (
    <main className="site-shell">
      {/* Loading */}
      <Loader />

      {/* Scroll Progress */}
      <ScrollProgress />

      {/* Global Atmosphere */}
      <div className="noise-layer" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />

      <div className="particle-field" aria-hidden="true">
        {particles.map((particle, index) => (
          <span
            key={`${particle.left}-${particle.top}-${index}`}
            className="particle"
            style={{
              left: particle.left,
              top: particle.top,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
            }}
          />
        ))}
      </div>

      <HeaderVisibility />

      {/* Navigation */}
      <Navigation />

      {/* Global Spectral Ghost */}
      <SpectralGhost />

      {/* Hero */}
      <Hero />

      {/* Transition line */}
      <div className="section-separator" aria-hidden="true" />

      {/* RIVEN */}
      <RIVENSection />

      {/* Transition line */}
      <div className="section-separator" aria-hidden="true" />

      {/* Why Us */}
      <WhyUs />

      {/* Transition line */}
      <div className="section-separator" aria-hidden="true" />

      {/* Gallery */}
      <Gallery />

      {/* Transition line */}
      <div className="section-separator" aria-hidden="true" />

      {/* About */}
      <About />

      {/* Transition line */}
      <div className="section-separator" aria-hidden="true" />

      {/* Contact */}
      <Contact />

      {/* ONE Closing Particle Image Effect */}
      <ClosingParticleImage />

      {/* Footer */}
      <Footer />
    </main>
  );
}