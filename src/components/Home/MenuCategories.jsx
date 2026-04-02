import { Link } from "react-router-dom";
import "./MenuCategories.css";

const MenuCategories = () => {
  return (
    <div className="menu-categories-section">
      <div className="menu-categories-container">
        <h2 className="menu-categories-title">Browse Our Menu</h2>

        <div className="menu-categories-grid">
          <div className="menu-categories-card">
            <img
              src="/IceDripCoffee.webp"
              alt="Coffee"
              className="menu-categories-card-image"
            />
            <h3 className="menu-categories-card-title">Coffee</h3>
            <Link to="/menu" className="menu-categories-card-link">
              Explore Coffees
            </Link>
          </div>

          <div className="menu-categories-card">
            <img
              src="/Croissant.webp"
              alt="Croissant"
              className="menu-categories-card-image"
            />
            <h3 className="menu-categories-card-title">Croissants</h3>
            <Link to="/menu" className="menu-categories-card-link">
              Explore Croissants
            </Link>
          </div>

          <div className="menu-categories-card">
            <img
              src="/IceCream.webp"
              alt="Desserts"
              className="menu-categories-card-image"
            />
            <h3 className="menu-categories-card-title">Desserts</h3>
            <Link to="/menu" className="menu-categories-card-link">
              Explore Desserts
            </Link>
          </div>

          <div className="menu-categories-card">
            <img
              src="/Sandwich.webp"
              alt="Sandwiches"
              className="menu-categories-card-image"
            />
            <h3 className="menu-categories-card-title">Sandwiches</h3>
            <Link to="/menu" className="menu-categories-card-link">
              Explore Sandwiches
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuCategories;
