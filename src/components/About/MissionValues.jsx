import "./MissionValues.css";

export default function MissionValues() {
  return (
    <section className="mission-values-section">
      <div className="mission-values-image-wrapper">
        <video
          src="./V60.mp4"
          width="460"
          height="10"
          controls
          autoPlay
          muted
          loop>
          Your browser does not support the video tag.
        </video>
      </div>

      <div className="mission-values-content">
        <h1 className="mission-values-heading">
          Sip. Stay. Belong. Show Up. Worth Every Sip.
        </h1>
        <div className="mission-values-divider" />

        <p className="mission-values-paragraph">
          A space where every cup holds a story worth a million.
        </p>
        <p className="mission-values-paragraph-spaced">
          Building Saudi's most beloved gathering place — one coffee at a time.
        </p>
        <p className="mission-values-paragraph-spaced">
          We're not just selling coffee — we're making memories.
        </p>
      </div>
    </section>
  );
}
