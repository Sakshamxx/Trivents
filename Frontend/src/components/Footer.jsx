"use client";

/* ─────────────────────────────────────────────────────────
   CONSTANTS & PLACEHOLDERS (Edit these values as needed)
   ───────────────────────────────────────────────────────── */
export const INSTAGRAM_URL = "https://www.instagram.com/trivent_s/";
export const WHATSAPP_URL = "https://chat.whatsapp.com/Dw7lBTsE9RX5DPQDp7cRUz";
export const EMAIL_ADDRESS = "creative.trivents@gmail.com";
export const LINKEDIN_URL = "https://www.linkedin.com/company/triventscreatives/";
export const GITHUB_REPO_URL = "https://github.com/Sakshamxx/Trivents";

export const EXPLORE_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Who are we?", href: "#about" },
  { label: "Riven", href: "#RIVEN" },
  { label: "Events", href: "#gallery" },
  { label: "Contact", href: "#contact" },
];

export const TIMELINE_EVENTS = [
  {
    tag: "FEB 2026",
    title: "Aakriti 2.0 Annual Fest",
    description: "Official photography, multi-camera video coverage and cinematic recap reels.",
  },
  {
    tag: "MAR 2026",
    title: "Lens Craft Masterclass",
    description: "Hands-on student workshop exploring manual camera controls, lighting and editing.",
  },
  {
    tag: "APR 2026",
    title: "Brand Collabs & Hackathons",
    description: "Creative media partnerships with Beast Life, Untamed Living and Code Rangers.",
  },
];

/* ─────────────────────────────────────────────────────────
   INLINE GITHUB SVG (For open source contribution link)
   ───────────────────────────────────────────────────────── */
function GitHubIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="13"
      height="13"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}

export default function Footer() {
  const SOCIAL_BUTTONS = [
    {
      name: "Instagram",
      href: INSTAGRAM_URL,
      logo: "/Logo/instagram.avif",
      external: true,
      ariaLabel: "Follow Trivents on Instagram",
    },
    {
      name: "WhatsApp",
      href: WHATSAPP_URL,
      logo: "/Logo/whatsapp.jpg",
      external: true,
      ariaLabel: "Join the Trivents WhatsApp Community",
    },
    {
      name: "Gmail",
      href: `mailto:${EMAIL_ADDRESS}`,
      logo: "/Logo/Gmail.avif",
      external: false,
      ariaLabel: `Send email to ${EMAIL_ADDRESS}`,
    },
    {
      name: "LinkedIn",
      href: LINKEDIN_URL,
      logo: "/Logo/linkedIn.avif",
      external: true,
      ariaLabel: "Connect with Trivents on LinkedIn",
    },
  ];

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-inner">
        <div className="footer-grid">
          {/* =========================================
              1. BRAND & BLURB & LOGO SOCIALS
          ========================================= */}
          <div className="footer-brand">
            <a href="#home" className="footer-logo" aria-label="Trivents Home">
              <img src="/images/logo.png" alt="Trivents logo" width={34} height={34} />
              <span className="footer-logo-text">Trivents</span>
            </a>

            <p className="footer-tagline">
              The official social media and creative club of Trinity Institute of
              Innovation in Professional Studies (TIIPS). We capture campus life,
              craft cinematic stories, and elevate student creativity.
            </p>

            {/* Round Social Icon Buttons with Images */}
            <div className="footer-social" aria-label="Social media channels">
              {SOCIAL_BUTTONS.map((btn) => (
                <a
                  key={btn.name}
                  href={btn.href}
                  target={btn.external ? "_blank" : undefined}
                  rel={btn.external ? "noopener noreferrer" : undefined}
                  aria-label={btn.ariaLabel}
                  className="footer-social-round-btn"
                >
                  <img
                    src={btn.logo}
                    alt={`${btn.name} icon`}
                    className="footer-social-img"
                    width={18}
                    height={18}
                    loading="lazy"
                    decoding="async"
                  />
                </a>
              ))}
            </div>
          </div>

          {/* =========================================
              2. EXPLORE NAVIGATION
          ========================================= */}
          <div className="footer-column">
            <h4>Explore</h4>
            <ul aria-label="Footer navigation links">
              {EXPLORE_LINKS.map((link) => (
                <li key={link.label}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* =========================================
              3. TRIVENTS IN ACTION, 2025 (TIMELINE)
          ========================================= */}
          <div className="footer-column footer-timeline-column">
            <h4>Trivents in action, 2025</h4>
            <div className="footer-timeline" role="feed" aria-label="Trivents 2025 timeline">
              {TIMELINE_EVENTS.map((item, idx) => (
                <div key={idx} className="footer-timeline-item">
                  <div className="footer-timeline-marker" aria-hidden="true">
                    <span className="footer-timeline-dot" />
                    {idx < TIMELINE_EVENTS.length - 1 && (
                      <span className="footer-timeline-line" />
                    )}
                  </div>
                  <div className="footer-timeline-content">
                    <span className="footer-timeline-tag">{item.tag}</span>
                    <h5 className="footer-timeline-title">{item.title}</h5>
                    <p className="footer-timeline-desc">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* =========================================
            BOTTOM BAR
        ========================================= */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {new Date().getFullYear()} Trivents. All rights reserved.
          </p>

          {/* Open source text link */}
          <div className="footer-opensource-wrap">
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-opensource-link"
              aria-label="Open source Trivents repository on GitHub"
            >
              <GitHubIcon />
              <span>Open source · Contribute on GitHub</span>
            </a>
          </div>

          <div className="footer-bottom-right">
            <div className="footer-production-credit">
              <span>Taken into Production by </span>
              <a
                href="https://github.com/Sakshamxx"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-production-link"
              >
                Saksham
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
