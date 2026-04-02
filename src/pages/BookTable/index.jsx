import { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { AuthContext } from "../../context/auth-context";
import "./BookTable.css";

const getTodayString = () => new Date().toISOString().split("T")[0];

export default function BookTable() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const isAuthenticated = Boolean(user || localStorage.getItem("token"));

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState("2");
  const [requests, setRequests] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setEmail(user.email ?? "");
      setPhone(user.phone ?? "");
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (!isAuthenticated) {
      setErrorMsg("Please sign in first to reserve a table.");
      navigate("/login");
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post("/bookings", {
        name,
        email,
        phone,
        date,
        time,
        guests: Number(guests),
        special_requests: requests,
      });
      setSuccessMsg("Your table has been reserved! We'll see you soon ☕");
      setDate("");
      setTime("");
      setGuests("2");
      setRequests("");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Something went wrong. Please try again.";
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="booktable-page">
      <header className="booktable-header">
        <p className="booktable-kicker">Reservations</p>
        <h1>Book a Table</h1>
        <p>Reserve your spot and we'll have everything ready for you.</p>
      </header>

      <div className="booktable-card">
        <div className="booktable-top-actions">
          <Link to="/" className="booktable-home-link">
            ← Home
          </Link>
        </div>

        {!isAuthenticated && (
          <div
            className="booktable-auth-warning"
            role="status"
            aria-live="polite">
            <p>
              You are not signed in. Please log in to complete your reservation.
            </p>
            <Link to="/login" className="booktable-login-link">
              Go to Login
            </Link>
          </div>
        )}

        <form className="booktable-form" onSubmit={handleSubmit} noValidate>
          <p className="booktable-section-title">Your Details</p>

          <div className="form-row">
            <div className="booktable-group">
              <label htmlFor="bt-name">Full Name</label>
              <input
                id="bt-name"
                type="text"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting || !isAuthenticated}
                required
              />
            </div>
            <div className="booktable-group">
              <label htmlFor="bt-email">Email</label>
              <input
                id="bt-email"
                type="email"
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting || !isAuthenticated}
                required
              />
            </div>
          </div>

          <div className="form-row single">
            <div className="booktable-group">
              <label htmlFor="bt-phone">Phone Number</label>
              <input
                id="bt-phone"
                type="tel"
                placeholder="+1 555 000 0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isSubmitting || !isAuthenticated}
                required
              />
            </div>
          </div>

          <hr className="booktable-divider" />

          <p className="booktable-section-title">Reservation Details</p>

          <div className="form-row">
            <div className="booktable-group">
              <label htmlFor="bt-date">Date</label>
              <input
                id="bt-date"
                type="date"
                min={getTodayString()}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={isSubmitting || !isAuthenticated}
                required
              />
            </div>
            <div className="booktable-group">
              <label htmlFor="bt-time">Time</label>
              <input
                id="bt-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                disabled={isSubmitting || !isAuthenticated}
                required
              />
            </div>
          </div>

          <div className="form-row single">
            <div className="booktable-group">
              <label htmlFor="bt-guests">Number of Guests</label>
              <select
                id="bt-guests"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                disabled={isSubmitting || !isAuthenticated}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "Guest" : "Guests"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <hr className="booktable-divider" />

          <p className="booktable-section-title">Special Requests</p>

          <div className="form-row single">
            <div className="booktable-group">
              <label htmlFor="bt-requests">
                Any preferences or notes? (Optional)
              </label>
              <textarea
                id="bt-requests"
                placeholder="e.g. window seat, birthday celebration, dietary requirements…"
                value={requests}
                onChange={(e) => setRequests(e.target.value)}
                disabled={isSubmitting || !isAuthenticated}
              />
            </div>
          </div>

          <button
            className="booktable-btn"
            type="submit"
            disabled={isSubmitting || !isAuthenticated}>
            {isSubmitting ? "Reserving your table…" : "Reserve My Table"}
          </button>

          {successMsg && (
            <p className="booktable-msg success" aria-live="polite">
              {successMsg}
            </p>
          )}
          {errorMsg && (
            <p className="booktable-msg error" aria-live="polite">
              {errorMsg}
            </p>
          )}
        </form>

        <div className="booktable-stain" aria-hidden="true" />
      </div>
    </main>
  );
}
