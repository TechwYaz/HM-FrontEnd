import { Link } from "react-router-dom";
import "./NotFound.css";

export default function NotFound() {
  return (
    <main className="not-found-page">
      <section className="not-found-card">
        <p className="not-found-code">404</p>
        <h1>Page Not Found</h1>
        <p>
          The page you are looking for does not exist or may have been moved.
        </p>
        <div className="not-found-actions">
          <Link to="/" className="not-found-btn primary">
            Back Home
          </Link>
          <Link to="/menu" className="not-found-btn secondary">
            Browse Menu
          </Link>
        </div>
      </section>
    </main>
  );
}
