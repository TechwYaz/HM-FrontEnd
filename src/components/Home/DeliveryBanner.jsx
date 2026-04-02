import { Link } from "react-router-dom";
import "./DeliveryBanner.css";

function DeliveryBanner() {
  return (
    <div>
      <div className="delivery-banner-section">
        <div className="delivery-banner-container">
          <img
            src="/HMM.jpg"
            alt="Delivery"
            className="delivery-banner-image"
          />
          <h2 className="delivery-banner-title">
            Experience the Ultimate Convenience with Our Delivery Service
          </h2>
          <p className="delivery-banner-description">
            Craving your favorite Halfmillion Cafe dishes? Get them delivered
            straight to your door with our fast and reliable delivery service.
            Whether you're at home, work, or anywhere in between, we bring the
            Halfmillion Cafe experience to you.
          </p>
          <Link to="/menu" className="delivery-banner-cta">
            Order Online
          </Link>
        </div>
      </div>
    </div>
  );
}

export default DeliveryBanner;
