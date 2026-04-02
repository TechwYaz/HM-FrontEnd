import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faEnvelope,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import "./AboutHero.css";

export default function AboutHero() {
  return (
    <section className="about-hero-section">
      <div className="about-hero-container">
        <div className="about-hero-image-wrapper">
          <img
            src="/HMMM.jpg"
            alt="Half Million Cafe"
            className="about-hero-image"
          />

          <div className="about-hero-contact-card">
            <h3 className="about-hero-contact-title">Come and visit us</h3>
            <div className="about-hero-contact-list">
              <div className="about-hero-contact-item">
                <FontAwesomeIcon
                  icon={faPhone}
                  className="about-hero-contact-icon"
                />
                <span>(+966) 9200 - 14022</span>
              </div>
              <div className="about-hero-contact-item">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="about-hero-contact-icon"
                />
                <span>info@halfm.sa</span>
              </div>
              <div className="about-hero-contact-item">
                <FontAwesomeIcon
                  icon={faLocationDot}
                  className="about-hero-contact-icon"
                />
                <span>
                  3421 Anas Ibn Malik Rd, Al Malqa, Riyadh 13522, Saudi Arabia
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="about-hero-content">
          <h2 className="about-hero-title">
            We brew the perfect <br></br> experience for you.
          </h2>
          <p className="about-hero-description">
            Our story began with a vision to create a unique cafe experience
            that merges specialty coffee, exceptional service, and a warm
            ambiance. Rooted in city's rich coffee culture, we aim to honor our
            local roots while infusing a global palate.
          </p>
          <p className="about-hero-description about-hero-description-last">
            At Half Million Cafe, we believe that a great cup is not just about
            the coffee, but also about the overall experience. Our staff,
            renowned for their warmth and dedication, strives to make every
            visit an unforgettable moment.
          </p>
        </div>
      </div>
    </section>
  );
}
