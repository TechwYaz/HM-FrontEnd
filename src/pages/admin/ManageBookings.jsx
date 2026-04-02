import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { AuthContext } from "../../context/auth-context";
import "./AdminPanel.css";

const isLikelyAdmin = (user) => {
  if (!user) return false;
  if (user.is_admin === true || user.isAdmin === true) return true;
  const role = String(user.role || user.type || "").toLowerCase();
  if (!role) return true;
  return role === "admin" || role === "super_admin" || role === "superadmin";
};

const normalizeBookings = (payload) => {
  const raw = Array.isArray(payload?.bookings)
    ? payload.bookings
    : Array.isArray(payload?.data?.bookings)
      ? payload.data.bookings
      : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
          ? payload
          : [];

  return raw.map((booking, index) => ({
    id: booking?.id ?? `booking-${index + 1}`,
    name: booking?.name || booking?.full_name || "Guest",
    phone: booking?.phone || "-",
    guests: Number(booking?.guests ?? booking?.number_of_guests ?? 0) || 0,
    date: booking?.date || "",
    time: booking?.time || "",
    status: String(booking?.status || "pending"),
  }));
};

const fetchBookings = async () => {
  const res = await api.get("/bookings");
  return res.data;
};

export default function ManageBookings() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    const hasToken = Boolean(localStorage.getItem("token"));
    if (!user && !hasToken) {
      navigate("/login");
      return;
    }
    if (user && !isLikelyAdmin(user)) {
      setError("This area is restricted to admins.");
      setIsLoading(false);
      return;
    }

    const load = async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await fetchBookings();
        setBookings(normalizeBookings(data));
      } catch (err) {
        const message =
          err?.response?.data?.message || "Unable to load bookings.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [navigate, user]);

  const updateStatus = async (bookingId, status) => {
    setBusyId(bookingId);
    setError("");
    try {
      await api.put(`/bookings/${bookingId}/status`, { status });
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status } : b)),
      );
    } catch {
      setError("Could not update booking status.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <main className="admin-page">
      <div className="admin-shell">
        <div className="admin-top">
          <div>
            <p className="admin-kicker">Admin</p>
            <h1 className="admin-title">Manage Bookings</h1>
          </div>
          <div className="admin-tabs">
            <Link className="admin-tab" to="/admin">
              Overview
            </Link>
            <Link className="admin-tab" to="/admin/orders">
              Orders
            </Link>
            <Link className="admin-tab active" to="/admin/bookings">
              Bookings
            </Link>
            <Link className="admin-tab" to="/admin/menu">
              Menu
            </Link>
            <Link className="admin-tab" to="/admin/categories">
              Categories
            </Link>
            <Link className="admin-tab" to="/admin/users">
              Users
            </Link>
          </div>
        </div>

        {isLoading && <p className="admin-notice">Loading bookings...</p>}
        {error && <p className="admin-notice error">{error}</p>}

        {!isLoading && !error && (
          <section className="admin-card">
            {bookings.length === 0 ? (
              <div className="admin-empty">No bookings found.</div>
            ) : (
              <div className="admin-list">
                {bookings.map((booking) => (
                  <article key={booking.id} className="admin-item">
                    <div>
                      <h3>{booking.name}</h3>
                      <p>
                        {booking.phone} • {booking.guests} guests
                        {booking.date ? ` • ${booking.date}` : ""}
                        {booking.time ? ` ${booking.time}` : ""}
                      </p>
                    </div>
                    <div className="admin-actions">
                      <select
                        className="admin-select"
                        value={booking.status}
                        onChange={(e) =>
                          updateStatus(booking.id, e.target.value)
                        }
                        disabled={busyId === booking.id}>
                        <option value="pending">pending</option>
                        <option value="confirmed">confirmed</option>
                        <option value="rejected">rejected</option>
                      </select>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
