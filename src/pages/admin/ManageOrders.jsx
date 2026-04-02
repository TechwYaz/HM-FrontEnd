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

const DEFAULT_DELIVERY_FEE = 2.5;

const normalizeOrders = (payload) => {
  const raw = Array.isArray(payload?.orders)
    ? payload.orders
    : Array.isArray(payload?.data?.orders)
      ? payload.data.orders
      : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
          ? payload
          : [];

  return raw.map((order, index) => {
    const rawItems = Array.isArray(order?.items)
      ? order.items
      : Array.isArray(order?.order_items)
        ? order.order_items
        : Array.isArray(order?.orderItems)
          ? order.orderItems
          : [];

    const subtotal = Number(order?.total_amount ?? order?.total ?? 0) || 0;
    const deliveryFee =
      Number(order?.delivery_fee) || (subtotal > 0 ? DEFAULT_DELIVERY_FEE : 0);

    return {
      id: order?.id ?? `order-${index + 1}`,
      number:
        order?.order_number || order?.reference || `#${order?.id ?? index + 1}`,
      customer:
        order?.full_name ||
        order?.customer_name ||
        order?.user?.name ||
        "Unknown",
      status: String(order?.status || "pending"),
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      createdAt: order?.created_at || order?.date || "",
      address: order?.address || order?.delivery_address || "",
      phone: order?.phone || order?.customer_phone || order?.user?.phone || "",
      items: rawItems.map((item, itemIndex) => {
        const menuItem = item?.menu_item ?? item?.menuItem ?? {};
        const quantity = Number(item?.quantity ?? 1) || 1;
        const unitPrice =
          Number(item?.unit_price ?? item?.unitPrice ?? menuItem?.price ?? 0) ||
          0;
        return {
          id: item?.id ?? `${order?.id ?? index}-item-${itemIndex}`,
          name: menuItem?.name || item?.name || "Item",
          quantity,
          unitPrice,
          lineTotal: unitPrice * quantity,
        };
      }),
    };
  });
};

const fetchOrders = async () => {
  const res = await api.get("/orders");
  return res.data;
};

export default function ManageOrders() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
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
        const data = await fetchOrders();
        setOrders(normalizeOrders(data));
      } catch (err) {
        const message =
          err?.response?.data?.message || "Unable to load orders.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [navigate, user]);

  const updateStatus = async (orderId, status) => {
    setBusyId(orderId);
    setError("");
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o)),
      );
    } catch {
      setError("Could not update order status.");
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
            <h1 className="admin-title">Manage Orders</h1>
          </div>
          <div className="admin-tabs">
            <Link className="admin-tab" to="/admin">
              Overview
            </Link>
            <Link className="admin-tab active" to="/admin/orders">
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

        {isLoading && <p className="admin-notice">Loading orders...</p>}
        {error && <p className="admin-notice error">{error}</p>}

        {!isLoading && !error && (
          <section className="admin-card">
            {orders.length === 0 ? (
              <div className="admin-empty">No orders found.</div>
            ) : (
              <div className="admin-list">
                {orders.map((order) => (
                  <article key={order.id} className="admin-item">
                    <div className="admin-order-main">
                      <h3>{order.number}</h3>
                      <p>
                        {order.customer} • ${order.total.toFixed(2)}
                        {order.createdAt
                          ? ` • ${new Date(order.createdAt).toLocaleString()}`
                          : ""}
                      </p>
                      <div className="admin-order-items">
                        {order.items.length > 0 ? (
                          order.items.map((item) => (
                            <span key={item.id} className="admin-order-chip">
                              {item.name}
                              {item.quantity > 1 ? ` x${item.quantity}` : ""}
                            </span>
                          ))
                        ) : (
                          <span className="admin-order-empty">
                            No item details
                          </span>
                        )}
                      </div>
                      <div className="admin-receipt">
                        <div className="admin-receipt-head">Receipt</div>
                        <div className="admin-receipt-body">
                          {order.items.length > 0 ? (
                            order.items.map((item) => (
                              <div
                                key={`receipt-${item.id}`}
                                className="admin-receipt-row">
                                <span className="admin-receipt-item-name">
                                  {item.name} x{item.quantity}
                                </span>
                                <strong>${item.lineTotal.toFixed(2)}</strong>
                              </div>
                            ))
                          ) : (
                            <div className="admin-receipt-row">
                              <span className="admin-order-empty">
                                No item details
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="admin-receipt-total">
                          <span>Subtotal</span>
                          <strong>${order.subtotal.toFixed(2)}</strong>
                        </div>
                        <div className="admin-receipt-total">
                          <span>Delivery</span>
                          <strong>${order.deliveryFee.toFixed(2)}</strong>
                        </div>
                        <div className="admin-receipt-total">
                          <span>Total</span>
                          <strong>${order.total.toFixed(2)}</strong>
                        </div>
                      </div>
                      <div className="admin-order-meta">
                        {order.address && (
                          <p>
                            <strong>Address:</strong> {order.address}
                          </p>
                        )}
                        {order.phone && (
                          <p>
                            <strong>Phone:</strong> {order.phone}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="admin-actions">
                      <select
                        className="admin-select"
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        disabled={busyId === order.id}>
                        <option value="pending">pending</option>
                        <option value="accepted">accepted</option>
                        <option value="in_progress">in progress</option>
                        <option value="delivered">delivered</option>
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
