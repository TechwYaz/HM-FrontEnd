import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { STORAGE_URL } from "../../api/axios";
import { AuthContext } from "../../context/auth-context";
import "./Profile.css";

const asNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const DEFAULT_DELIVERY_FEE = 2.5;

const normalizeOrders = (payload) => {
  const rawOrders = Array.isArray(payload?.orders)
    ? payload.orders
    : Array.isArray(payload?.data?.orders)
      ? payload.data.orders
      : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
          ? payload
          : [];

  return rawOrders.map((order, index) => {
    const rawItems = Array.isArray(order?.items)
      ? order.items
      : Array.isArray(order?.order_items)
        ? order.order_items
        : [];

    const items = rawItems.map((item) => {
      const menu = item?.menu_item ?? item?.menuItem ?? {};
      return {
        name: menu?.name || item?.name || "Item",
        image: menu?.image || item?.image || null,
        quantity: asNumber(item?.quantity, 1),
        unitPrice: asNumber(
          item?.unit_price ?? item?.unitPrice ?? menu?.price,
          0,
        ),
      };
    });

    const subtotal = asNumber(
      order?.total_amount ?? order?.total ?? order?.amount,
      0,
    );
    const deliveryFee = asNumber(
      order?.delivery_fee,
      subtotal > 0 ? DEFAULT_DELIVERY_FEE : 0,
    );

    return {
      id: order?.id ?? `order-${index + 1}`,
      status: order?.status || "Pending",
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      paymentMethod: order?.payment_method || "-",
      createdAt: order?.created_at || order?.date || "",
      items,
    };
  });
};

const getOrdersWithFallback = async () => {
  const paths = ["/orders", "/my-orders", "/profile/orders"];
  let lastError;

  for (const path of paths) {
    try {
      return await api.get(path);
    } catch (err) {
      const status = err?.response?.status;
      if (
        status &&
        status !== 401 &&
        status !== 403 &&
        status !== 404 &&
        status !== 405
      ) {
        throw err;
      }
      lastError = err;
    }
  }

  throw lastError;
};

export default function Profile() {
  const { user, logout, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(user || null);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  useEffect(() => {
    const hasToken = Boolean(localStorage.getItem("token"));
    if (!user && !hasToken) {
      navigate("/login");
      return;
    }

    const fetchProfileAndOrders = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [meRes, ordersRes] = await Promise.all([
          api.get("/me"),
          getOrdersWithFallback(),
        ]);

        const data = meRes?.data || user || null;
        setProfileData(data);
        setEditForm((prev) => ({
          ...prev,
          name: data?.name || "",
          phone: data?.phone || "",
        }));
        setOrders(normalizeOrders(ordersRes?.data));
      } catch (err) {
        const status = err?.response?.status;
        if (status === 401) {
          logout();
          navigate("/login");
          return;
        }

        const message =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Unable to load profile details right now.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileAndOrders();
  }, [logout, navigate, user]);

  const joinedDate = useMemo(() => {
    if (!profileData?.created_at) return "-";
    const date = new Date(profileData.created_at);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString();
  }, [profileData]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError("");
    setEditSuccess("");

    const payload = {};
    if (editForm.name.trim()) payload.name = editForm.name.trim();
    if (editForm.phone.trim() !== (profileData?.phone || ""))
      payload.phone = editForm.phone.trim() || null;
    if (editForm.password) {
      payload.current_password = editForm.current_password;
      payload.password = editForm.password;
      payload.password_confirmation = editForm.password_confirmation;
    }

    if (Object.keys(payload).length === 0) {
      setEditError("No changes to save.");
      return;
    }

    setEditLoading(true);
    try {
      const res = await api.put("/profile", payload);
      setProfileData(res.data);
      setUser(res.data);
      setEditForm({
        name: res.data.name || "",
        phone: res.data.phone || "",
        current_password: "",
        password: "",
        password_confirmation: "",
      });
      setEditSuccess("Profile updated successfully.");
      setEditOpen(false);
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.response?.data?.errors
          ? Object.values(err?.response?.data?.errors || {})
              .flat()
              .join(" ")
          : "Could not update profile.";
      setEditError(msg || "Could not update profile.");
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <main className="profile-page">
      <header className="profile-header">
        <p className="profile-kicker">My Account</p>
        <h1>Profile / My Orders</h1>
      </header>

      {isLoading && <p className="profile-status">Loading profile...</p>}
      {error && <p className="profile-status profile-status-error">{error}</p>}

      {!isLoading && !error && (
        <section className="profile-layout">
          <aside className="profile-card">
            <h2>{profileData?.name || "Guest"}</h2>
            <p className="profile-email">{profileData?.email || "No email"}</p>
            <dl className="profile-meta">
              <div>
                <dt>Phone</dt>
                <dd>{profileData?.phone || "-"}</dd>
              </div>
              <div>
                <dt>Joined</dt>
                <dd>{joinedDate}</dd>
              </div>
            </dl>

            {editSuccess && (
              <p className="profile-edit-success">{editSuccess}</p>
            )}

            <button
              className="profile-edit-toggle"
              onClick={() => {
                setEditOpen((o) => !o);
                setEditError("");
                setEditSuccess("");
              }}>
              {editOpen ? "Cancel" : "Edit Profile"}
            </button>

            {editOpen && (
              <form className="profile-edit-form" onSubmit={handleEditSubmit}>
                <div className="profile-edit-field">
                  <label htmlFor="edit-name">Name</label>
                  <input
                    id="edit-name"
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="Your name"
                  />
                </div>
                <div className="profile-edit-field">
                  <label htmlFor="edit-phone">Phone</label>
                  <input
                    id="edit-phone"
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, phone: e.target.value }))
                    }
                    placeholder="Your phone number"
                  />
                </div>
                <p className="profile-edit-section-label">
                  Change Password <span>(leave blank to keep current)</span>
                </p>
                <div className="profile-edit-field">
                  <label htmlFor="edit-current-pw">Current Password</label>
                  <input
                    id="edit-current-pw"
                    type="password"
                    value={editForm.current_password}
                    onChange={(e) =>
                      setEditForm((f) => ({
                        ...f,
                        current_password: e.target.value,
                      }))
                    }
                    placeholder="Current password"
                    autoComplete="current-password"
                  />
                </div>
                <div className="profile-edit-field">
                  <label htmlFor="edit-new-pw">New Password</label>
                  <input
                    id="edit-new-pw"
                    type="password"
                    value={editForm.password}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, password: e.target.value }))
                    }
                    placeholder="New password (min 8 chars)"
                    autoComplete="new-password"
                  />
                </div>
                <div className="profile-edit-field">
                  <label htmlFor="edit-confirm-pw">Confirm Password</label>
                  <input
                    id="edit-confirm-pw"
                    type="password"
                    value={editForm.password_confirmation}
                    onChange={(e) =>
                      setEditForm((f) => ({
                        ...f,
                        password_confirmation: e.target.value,
                      }))
                    }
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                  />
                </div>
                {editError && <p className="profile-edit-error">{editError}</p>}
                <button
                  type="submit"
                  className="profile-edit-submit"
                  disabled={editLoading}>
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </form>
            )}

            <div className="profile-actions">
              <Link to="/menu" className="profile-link-btn">
                Browse Menu
              </Link>
              <Link to="/book-table" className="profile-link-btn outline">
                Book a Table
              </Link>
            </div>
          </aside>

          <section className="orders-card">
            <h3>My Orders</h3>

            {orders.length === 0 ? (
              <div className="orders-empty">
                <p>You have no orders yet.</p>
                <Link to="/menu" className="profile-link-btn">
                  Order Something
                </Link>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map((order) => (
                  <article key={order.id} className="order-item">
                    <div className="order-items-strip">
                      {order.items.slice(0, 4).map((item, i) => (
                        <div key={i} className="order-item-thumb">
                          <img
                            src={
                              item.image
                                ? `${STORAGE_URL}/${item.image}`
                                : "/logo.jpg"
                            }
                            alt={item.name}
                          />
                          <span className="order-item-thumb-name">
                            {item.name}
                          </span>
                          {item.quantity > 1 && (
                            <span className="order-item-thumb-qty">
                              ×{item.quantity}
                            </span>
                          )}
                        </div>
                      ))}
                      {order.items.length > 4 && (
                        <div className="order-item-thumb order-item-more">
                          +{order.items.length - 4}
                        </div>
                      )}
                    </div>
                    <div className="order-footer">
                      <div className="order-footer-left">
                        <span className="order-status">{order.status}</span>
                        <span className="order-date">
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString()
                            : "Date unavailable"}
                        </span>
                        <span className="order-date">
                          Delivery ${order.deliveryFee.toFixed(2)}
                        </span>
                      </div>
                      <strong className="order-total">
                        ${order.total.toFixed(2)}
                      </strong>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      )}
    </main>
  );
}
