import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import {
  faTwitter,
  faFacebook,
  faInstagram,
  faGithub,
} from "@fortawesome/free-brands-svg-icons";
import "./Topbar.css";

const Topbar = () => {
  return (
    <div className="topbar">
      <div className="topbar-container">
        <div className="topbar-contact-info">
          <a href="tel:09005666" className="topbar-contact-link">
            <FontAwesomeIcon icon={faPhone} className="topbar-icon" />
            <span>(+966) 9200 - 14022</span>
          </a>
          <a href="mailto:info@halfm.sa" className="topbar-contact-link">
            <FontAwesomeIcon icon={faEnvelope} className="topbar-icon" />
            <span>info@halfm.sa</span>
          </a>
        </div>

        <div className="topbar-social-links">
          <a
            href="https://x.com/halfmillion_sa"
            target="_blank"
            rel="noreferrer"
            aria-label="Twitter"
            className="topbar-social-link">
            <FontAwesomeIcon icon={faTwitter} className="topbar-icon" />
          </a>
          <a
            href="https://facebook.com/HalfMillionSA"
            target="_blank"
            rel="noreferrer"
            aria-label="Facebook"
            className="topbar-social-link">
            <FontAwesomeIcon icon={faFacebook} className="topbar-icon" />
          </a>
          <a
            href="https://instagram.com/halfmillion_sa"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="topbar-social-link">
            <FontAwesomeIcon icon={faInstagram} className="topbar-icon" />
          </a>
          <a
            href="https://github.com/TechwYaz/HM-FrontEnd"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="topbar-social-link">
            <FontAwesomeIcon icon={faGithub} className="topbar-icon" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
