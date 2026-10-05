"use client";

import { ArrowUpRight } from "lucide-react";
import Reveal from "./Reveal";
import TiltCard from "./TiltCard";

const CONTACT_CHANNELS = [
  {
    name: "Instagram",
    handle: "@trivent_s",
    href: "https://www.instagram.com/trivent_s/",
    logo: "/Logo/instagram.avif",
    badge: "Follow",
    external: true,
  },
  {
    name: "LinkedIn",
    handle: "Follow", 
    href: "https://www.linkedin.com/company/triventscreatives/", 
    logo: "/Logo/linkedIn.avif",
    badge: "Connect",
    external: true,
  },
  {
    name: "WhatsApp Community",
    handle: "Join the Conversation",
    href: "https://chat.whatsapp.com/Dw7lBTsE9RX5DPQDp7cRUz",
    logo: "/Logo/whatsapp.jpg",
    badge: "Active",
    external: true,
  },
  {
    name: "Email Us",
    handle: "creative.trivents@gmail.com",
    href: "mailto:creative.trivents@gmail.com",
    logo: "/Logo/Gmail.avif",
    badge: "Official",
    external: false,
  },
];

export default function Contact() {
  return (
    <section id="contact" className="contact-section">
      <div className="contact-ambient" aria-hidden="true" />

      <div className="contact-layout">
        {/* =========================================
            LEFT — CONTACT CONTENT & CHANNELS
        ========================================= */}
        <div className="contact-copy">
          <Reveal>
            <div className="section-pill">
              <span>CONTACT TRIVENTS</span>
            </div>

            <h2 className="section-title">
              LET&apos;S CREATE{" "}
              <span className="highlight">SOMETHING</span>{" "}
              MEMORABLE
            </h2>

            <p className="contact-subtext">
              Have an idea, want to collaborate for an upcoming event, or
              looking to join our creative crew? Reach out through any of our
              channels.
            </p>
          </Reveal>

          {/* Social / Direct Contact Cards */}
          <div className="contact-channels-grid">
            {CONTACT_CHANNELS.map((channel, idx) => {
              // A card with no link yet renders as a plain block, not a dead link
              const hasLink = Boolean(channel.href);
              const Card = hasLink ? "a" : "div";

              const linkProps = hasLink
                ? {
                  href: channel.href,
                  target: channel.external ? "_blank" : undefined,
                  rel: channel.external ? "noopener noreferrer" : undefined,
                }
                : { "aria-disabled": "true" };

              return (
                <Reveal key={channel.name} delay={idx + 1}>
                  <Card {...linkProps} className="contact-channel-card">
                    <div className="contact-channel-logo-wrap">
                      <img
                        src={channel.logo}
                        alt={`${channel.name} logo`}
                        className="contact-channel-logo"
                        loading="lazy"
                        decoding="async"
                        width={28}
                        height={28}
                      />
                    </div>

                    <div className="contact-channel-info">
                      <div className="contact-channel-top">
                        <span className="contact-channel-name">
                          {channel.name}
                        </span>
                        <span className="contact-channel-badge">
                          {channel.badge}
                        </span>
                      </div>
                      <span className="contact-channel-handle">
                        {channel.handle}
                      </span>
                    </div>

                    <div className="contact-channel-arrow">
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                  </Card>
                </Reveal>
              );
            })}
          </div>

          {/* Action Button */}
          <Reveal delay={4}>
            <div className="contact-action-wrap">
              <a
                href="mailto:creative.trivents@gmail.com"
                className="contact-button"
              >
                <span>Join Us Now</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </Reveal>
        </div>

        {/* =========================================
            RIGHT — CAMPUS VISUAL
        ========================================= */}
        <Reveal delay={2} className="contact-visual">
          <TiltCard className="contact-image-frame" intensity={5}>
            <div className="hud-corner hud-corner--tl" />
            <div className="hud-corner hud-corner--tr" />
            <div className="hud-corner hud-corner--bl" />
            <div className="hud-corner hud-corner--br" />

            <div className="contact-image-box">
              <img
                src="/closing/College.png"
                alt="Trinity Institute, Greater Noida"
                className="contact-campus-image"
                loading="eager"
                decoding="async"
              />
              <div className="contact-image-overlay" />
            </div>

            <div className="contact-image-footer">
              <div className="contact-location-dot" />
              <a
                href="https://chat.whatsapp.com/Dw7lBTsE9RX5DPQDp7cRUz"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-image-caption"
              >
                <p style={{ textAlign: "center" }}>
                  Join the Trivents Family • Greater Noida Campus
                </p>
              </a>
            </div>
          </TiltCard>
        </Reveal>
      </div>
    </section>
  );
}