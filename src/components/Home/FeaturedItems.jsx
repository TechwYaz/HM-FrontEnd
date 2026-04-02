import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faEnvelope,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import "./FeaturedItems.css";

export default function FeaturedItems() {
  return (
    <section className="featured-items-section">
      <div className="featured-items-container">
        <div className="featured-items-image-wrapper">
          <img
            src="/HMMM.jpg"
            alt="Half Million Cafe"
            className="featured-items-image"
          />

          <div className="featured-items-contact-card">
            <h3 className="featured-items-contact-title">Come and visit us</h3>
            <div className="featured-items-contact-list">
              <div className="featured-items-contact-item">
                <FontAwesomeIcon
                  icon={faPhone}
                  className="featured-items-contact-icon"
                />
                <span>(+966) 9200 - 14022</span>
              </div>
              <div className="featured-items-contact-item">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="featured-items-contact-icon"
                />
                <span>info@halfm.sa</span>
              </div>
              <div className="featured-items-contact-item">
                <FontAwesomeIcon
                  icon={faLocationDot}
                  className="featured-items-contact-icon"
                />
                <span>
                  3421 Anas Ibn Malik Rd, Al Malqa, Riyadh 13522, Saudi Arabia
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="featured-items-content">
          <h2 className="featured-items-title">
            We brew the perfect <br></br> experience for you.
          </h2>
          <p className="featured-items-description">
            Our story began with a vision to create a unique cafe experience
            that merges specialty coffee, exceptional service, and a warm
            ambiance. Rooted in city's rich coffee culture, we aim to honor our
            local roots while infusing a global palate.
          </p>
          <p className="featured-items-description featured-items-description-last">
            At Half Million Cafe, we believe that a great cup is not just about
            the coffee, but also about the overall experience. Our staff,
            renowned for their warmth and dedication, strives to make every
            visit an unforgettable moment.
          </p>
          <Link to="/about" className="featured-items-cta">
            More About Us
          </Link>
        </div>
      </div>
    </section>
  );
}
