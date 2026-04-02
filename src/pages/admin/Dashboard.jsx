import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { AuthContext } from "../../context/auth-context";
import "./AdminPanel.css";

const getCollection = (payload, keys) => {
  for (const key of keys) {
    const value = payload?.[key] ?? payload?.data?.[key];
    if (Array.isArray(value)) return value;
  }
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
};

const isLikelyAdmin = (user) => {
  if (!user) return false;
  if (user.is_admin === true || user.isAdmin === true) return true;
  const role = String(user.role || user.type || "").toLowerCase();
  if (!role) return true;
  return role === "admin" || role === "super_admin" || role === "superadmin";
};

const readCount = (payload, keys) => {
  for (const key of keys) {
    const value = payload?.[key] ?? payload?.data?.[key];
    if (typeof value === "number") return value;
  }
  return null;
};

const DEFAULT_DELIVERY_FEE = 2.5;

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [ordersCount, setOrdersCount] = useState(0);
  const [bookingsCount, setBookingsCount] = useState(0);
  const [menuCount, setMenuCount] = useState(0);
  const [ordersRevenue, setOrdersRevenue] = useState(0);

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

    const fetchStats = async () => {
      setIsLoading(true);
      setError("");
      try {
        const [ordersRes, bookingsRes, menuRes] = await Promise.all([
          api.get("/orders"),
          api.get("/bookings"),
          api.get("/menu"),
        ]);

        const orders = getCollection(ordersRes?.data, ["orders"]);
        const bookings = getCollection(bookingsRes?.data, ["bookings"]);
        const menuItems = getCollection(menuRes?.data, [
          "menu_items",
          "items",
          "menu",
        ]);

        setOrdersCount(
          readCount(ordersRes?.data, ["count", "total", "orders_count"]) ??
            orders.length,
        );
        const computedRevenue = orders.reduce((sum, order) => {
          const subtotal =
            Number(order?.total_amount ?? order?.total ?? 0) || 0;
          const delivery =
            Number(order?.delivery_fee) ||
            (subtotal > 0 ? DEFAULT_DELIVERY_FEE : 0);
          return sum + subtotal + delivery;
        }, 0);
        setOrdersRevenue(computedRevenue);
        setBookingsCount(
          readCount(bookingsRes?.data, ["count", "total", "bookings_count"]) ??
            bookings.length,
        );
        setMenuCount(
          readCount(menuRes?.data, ["count", "total", "items_count"]) ??
            menuItems.length,
        );
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Unable to load admin dashboard right now.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [navigate, user]);

  const totalManaged = useMemo(
    () => ordersCount + bookingsCount + menuCount,
    [bookingsCount, menuCount, ordersCount],
  );

  return (
    <main className="admin-page">
      <div className="admin-shell">
        <div className="admin-top">
          <div>
            <p className="admin-kicker">Admin</p>
            <h1 className="admin-title">Dashboard</h1>
          </div>
          <div className="admin-tabs">
            <Link className="admin-tab active" to="/admin">
              Overview
            </Link>
            <Link className="admin-tab" to="/admin/orders">
              Orders
            </Link>
            <Link className="admin-tab" to="/admin/bookings">
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

        {isLoading && <p className="admin-notice">Loading dashboard...</p>}
        {error && <p className="admin-notice error">{error}</p>}

        {!isLoading && !error && (
          <section className="admin-card">
            <h2>At a Glance</h2>
            <div className="admin-grid">
              <article className="metric">
                <p>Total Orders</p>
                <strong>{ordersCount}</strong>
              </article>
              <article className="metric">
                <p>Total Bookings</p>
                <strong>{bookingsCount}</strong>
              </article>
              <article className="metric">
                <p>Menu Items</p>
                <strong>{menuCount}</strong>
              </article>
              <article className="metric">
                <p>Order Revenue</p>
                <strong>${ordersRevenue.toFixed(2)}</strong>
              </article>
            </div>

            <div className="admin-empty">
              <strong>Managed entities: {totalManaged}</strong>
              <p>
                Use the tabs above to update statuses and keep operations in
                sync.
              </p>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
