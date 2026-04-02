import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { AuthContext } from "../../context/auth-context";
import "../auth/AuthForm.css";
import { Link } from "react-router-dom";

const isLikelyAdmin = (user) => {
  if (!user) return false;
  if (user.is_admin === true || user.isAdmin === true) return true;
  const role = String(user.role || user.type || "").toLowerCase();
  return role === "admin" || role === "super_admin" || role === "superadmin";
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await api.post("/login", {
        email: email,
        password: password,
      });
      const loggedInUser = res?.data?.user;
      login(loggedInUser, res.data.token);
      navigate(isLikelyAdmin(loggedInUser) ? "/admin" : "/");
    } catch (err) {
      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Invalid credentials";
      setError(backendMessage);
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
        <h1 className="brand-title">HalfMillion</h1>
        <p className="subtitle">Your usual is waiting.</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              autoComplete="off"
              placeholder="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              placeholder="Password"
              className="inputfield"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <button className="brew-btn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Login"}
          </button>
          {error && (
            <p className="form-message error-message" aria-live="polite">
              {error}
            </p>
          )}
        </form>

        <div className="footer-links">
          <span>
            New guest? <Link to="/register">Register here</Link>
          </span>
        </div>

        <div className="coffee-stain"></div>
      </div>
    </div>
  );
}
