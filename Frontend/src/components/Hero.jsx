import DynamicText from "@/components/DynamicText";
import HeroOrbit from "@/components/HeroOrbit";

export default function Hero() {
  return (
    <section id="home" className="hero-section">

      {/* Orbital visual — decorative, behind main content */}
      <HeroOrbit />

      <div className="hero-inner">

        {/* Dynamic greeting — loops forever */}
        <DynamicText />

        {/* Main statement — accent-colored headline */}
        <h1 className="hero-title">
          <span className="hero-title-line hero-title-line--warm">WE CREATE</span>
          <span className="hero-title-line hero-title-line--plain">WE CAPTURE</span>
          <span className="hero-title-line hero-title-line--accent">WE CONNECT</span>
        </h1>

        {/* Sub-rule */}
        <div className="hero-rule" aria-hidden="true">
          <span className="hero-rule-line" />
          <span className="hero-rule-mark" />
          <span className="hero-rule-line" />
        </div>

        {/* Supporting copy */}
        <div className="hero-bottom">
          <p className="hero-description">
            Stories, moments and digital experiences
            created for the people who make Trivents what it is.
          </p>

          <div className="hero-index">
            <span>01</span>
            <span className="hero-index-line" />
            <span>TRIVENTS</span>
          </div>
        </div>

      </div>

      {/* Bottom edge scroll cue */}
      <div className="hero-scroll">
        <span>SCROLL TO EXPLORE</span>
        <span className="hero-scroll-arrow">↓</span>
      </div>

    </section>
  );
}