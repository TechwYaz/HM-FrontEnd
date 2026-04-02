import "./Hero.css";
import { Link } from "react-router-dom";

const links = [
  { name: "Book A Table", href: "/book-table", variant: "primary" },
  { name: "Explore Menu", href: "/menu", variant: "secondary" },
];

export default function Hero() {
  return (
    <div className="hero">
      <img alt="" src="/HM.jpg" className="hero-bg" />
      <div aria-hidden="true" className="hero-gradient-1">
        <div className="hero-gradient-1-shape" />
      </div>
      <div className="hero-gradient-2">
        <div className="hero-gradient-2-shape" />
      </div>
      <div className="hero-container">
        <div className="hero-content">
          <h2 className="hero-title">Worth every sip</h2>
          <p className="hero-description">
            Every cup tells a story. HalfMillion Coffee is built on moments —
            quiet ones, loud ones, shared ones. Pull up a chair.
          </p>
        </div>
        <div className="hero-links">
          <div className="hero-links-grid">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`hero-link ${link.variant === "primary" ? "hero-link-primary" : "hero-link-secondary"}`}>
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
