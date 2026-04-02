import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import "../auth/AuthForm.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post("/register", {
        name,
        email,
        phone,
        password,
        password_confirmation: confirmPassword,
      });
      navigate("/login");
    } catch (err) {
      const validationErrors = err?.response?.data?.errors;
      if (validationErrors && typeof validationErrors === "object") {
        const firstField = Object.keys(validationErrors)[0];
        const firstError = validationErrors[firstField]?.[0];
        setError(firstError || "Registration failed. Please try again.");
      } else {
        const backendMessage =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Registration failed. Please try again.";
        setError(backendMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="login-card">
        <div className="auth-top-actions">
          <Link to="/" className="home-link-button">
            Home
          </Link>
        </div>
        <img src="/logo2.jpeg" className="steam-icon" alt="HalfMillion logo" />
        <h1 className="brand-title">Join HalfMillion</h1>
        <p className="subtitle">Create an account and start brewing.</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              type="tel"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <button className="brew-btn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Register"}
          </button>
          {error && (
            <p className="form-message error-message" aria-live="polite">
              {error}
            </p>
          )}
        </form>

        <div className="footer-links">
          <span>
            Already have an account? <Link to="/login">Login here</Link>
          </span>
        </div>

        <div className="coffee-stain"></div>
      </div>
    </div>
  );
}
