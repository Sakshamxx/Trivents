"use client";

import { useEffect, useState } from "react";
import { useLenis } from "lenis/react";
import {
  Home,
  Sparkles,
  LayoutGrid,
  Users,
  Send,
  ArrowRight,
} from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: "#home", icon: Home },
  { label: "Why Us", href: "#why-us", icon: Sparkles },
  { label: "Gallery", href: "#gallery", icon: LayoutGrid },
  { label: "About", href: "#about", icon: Users },
  { label: "Contact", href: "#contact", icon: Send },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const lenis = useLenis();

  // ── Scroll detection & Active section tracking ────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      const nextScrolled = window.scrollY > 40;
      setScrolled((prev) => (prev === nextScrolled ? prev : nextScrolled));

      const triggerPoint = window.innerHeight * 0.4;
      let current = NAV_LINKS[0].href.slice(1);

      for (const link of NAV_LINKS) {
        const id = link.href.slice(1);
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= triggerPoint) {
            current = id;
          }
        }
      }
      setActiveSection((prev) => (prev === current ? prev : current));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Body scroll lock when mobile menu open ────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleNavClick = (e, href) => {
    e.preventDefault();
    if (lenis) {
      lenis.scrollTo(href);
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleMobileNavClick = (href) => {
    setMobileOpen(false);
    setTimeout(() => {
      if (lenis) {
        lenis.scrollTo(href);
      } else {
        document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
      }
    }, 280);
  };

  return (
    <>
      <header className={`nav-header ${scrolled ? "scrolled" : ""}`}>
        {/* Logo */}
        <a 
          href="#home" 
          className="nav-logo" 
          aria-label="Trivents home"
          onClick={(e) => handleNavClick(e, "#home")}
        >
          <div className="nav-logo-icon-wrap">
            <img src="/images/logo.png" alt="Trivents logo" width={40} height={40} decoding="async" />
          </div>
          <span className="nav-logo-text">Trivents</span>
        </a>

        {/* Center — Interactive Dock Navigation */}
        <nav className="nav-desktop nav-dock" aria-label="Main navigation dock">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = activeSection === link.href.slice(1);

            return (
              <a
                key={link.href}
                href={link.href}
                className={`nav-link nav-dock-item ${isActive ? "active" : ""}`}
                onClick={(e) => handleNavClick(e, link.href)}
              >
                <span className="nav-dock-icon-wrap">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="nav-dock-label">{link.label}</span>
                {isActive && <span className="nav-dock-active-dot" />}
              </a>
            );
          })}
        </nav>

        {/* Right — Quick Action & Mobile Toggle */}
        <div className="nav-actions">
          <a 
            href="#contact" 
            className="nav-quick-cta"
            onClick={(e) => handleNavClick(e, "#contact")}
          >
            <span>Get in Touch</span>
            <ArrowRight className="h-3 w-3" />
          </a>

          <button
            className={`nav-mobile-toggle ${mobileOpen ? "open" : ""}`}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`nav-mobile-overlay ${mobileOpen ? "open" : ""}`}
        aria-hidden={!mobileOpen}
      >
        <div className="nav-mobile-inner">
          <div className="nav-mobile-header">
            <span className="nav-mobile-tag">NAVIGATION</span>
          </div>

          <div className="nav-mobile-links">
            {NAV_LINKS.map((link, index) => {
              const Icon = link.icon;
              const isActive = activeSection === link.href.slice(1);

              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`nav-mobile-link ${isActive ? "active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleMobileNavClick(link.href);
                  }}
                  style={{
                    transitionDelay: mobileOpen ? `${index * 50}ms` : "0ms",
                    opacity: mobileOpen ? 1 : 0,
                    transform: mobileOpen ? "translateX(0)" : "translateX(16px)",
                    transition: "opacity 0.28s ease, transform 0.28s ease",
                  }}
                >
                  <span className="nav-mobile-link-left">
                    <Icon className="h-4 w-4 nav-mobile-link-icon" />
                    <span>{link.label}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 nav-mobile-link-arrow" />
                </a>
              );
            })}
          </div>

          <div className="nav-mobile-footer">
            <a
              href="mailto:creative.trivents@gmail.com"
              className="nav-mobile-footer-email"
            >
              creative.trivents@gmail.com
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
