import "./PromoBanner.css";

const PromoBanner = () => {
  return (
    <div className="promo-banner-section">
      <div className="promo-banner-container">
        <h2 className="promo-banner-title">
          We also offer unique <br></br> Services for your events
        </h2>

        <div className="promo-banner-grid">
          <div className="promo-banner-card">
            <img
              src="/Caterings.jpg"
              alt="Caterings"
              className="promo-banner-card-image"
            />
            <h3 className="promo-banner-card-title">Caterings</h3>
            <p className="promo-banner-card-text">
              Impress your team and clients with boardroom lunches, office
              events, and end-of-year celebrations done right.
            </p>
          </div>

          <div className="promo-banner-card">
            <img
              src="/Birthday.jpg"
              alt="Birthday"
              className="promo-banner-card-image"
            />
            <h3 className="promo-banner-card-title">Birthdays</h3>
            <p className="promo-banner-card-text">
              Whether it's 10 guests or 200, we bring the Halfmillion Cafe
              experience directly to your venue.
            </p>
          </div>

          <div className="promo-banner-card">
            <img
              src="/Engagement.jpg"
              alt="Engagement"
              className="promo-banner-card-image"
            />
            <h3 className="promo-banner-card-title">Engagement</h3>
            <p className="promo-banner-card-text">
              Celebrate your love story with a personalized menu, elegant setup,
              and impeccable service.
            </p>
          </div>

          <div className="promo-banner-card">
            <img
              src="/Events.jpg"
              alt="Events"
              className="promo-banner-card-image"
            />
            <h3 className="promo-banner-card-title">Events</h3>
            <p className="promo-banner-card-text">
              From corporate gatherings to private celebrations, we create
              unforgettable experiences for every occasion.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoBanner;
