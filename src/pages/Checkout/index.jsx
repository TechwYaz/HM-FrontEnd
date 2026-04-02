import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { STORAGE_URL } from "../../api/axios";
import { AuthContext } from "../../context/auth-context";
import "./Checkout.css";

const asNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeCartItems = (payload) => {
  const rawItems = Array.isArray(payload?.cart_items)
    ? payload.cart_items
    : Array.isArray(payload?.data?.cart_items)
      ? payload.data.cart_items
      : [];

  return rawItems.map((item) => {
    const menuItem = item.menu_item || {};
    const quantity = asNumber(item.quantity, 1);
    const unitPrice = asNumber(menuItem.price, 0);

    return {
      id: item.id,
      quantity,
      unitPrice,
      title: menuItem.name || "Menu Item",
      image: menuItem.image ? `${STORAGE_URL}/${menuItem.image}` : "/logo.jpg",
    };
  });
};

const postCheckoutWithFallback = async (payload) => {
  const paths = ["/checkout", "/orders", "/place-order"];
  let lastError;

  for (const path of paths) {
    try {
      return await api.post(path, payload);
    } catch (err) {
      const status = err?.response?.status;
      if (status && status !== 404 && status !== 405) {
        throw err;
      }
      lastError = err;
    }
  }

  throw lastError;
};

export default function Checkout() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const hasToken = Boolean(localStorage.getItem("token"));
    if (!user && !hasToken) {
      navigate("/login");
      return;
    }

    const fetchCart = async () => {
      setIsLoading(true);
      setError("");
      try {
        const res = await api.get("/cart");
        setItems(normalizeCartItems(res.data));
      } catch {
        setItems([]);
        setError("Unable to load checkout details right now.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCart();
  }, [navigate, user]);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [items],
  );
  const deliveryFee = items.length > 0 ? 2.5 : 0;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setError("");
    setSuccessMessage("");
    setIsPlacingOrder(true);

    try {
      await postCheckoutWithFallback({
        full_name: fullName,
        phone,
        address,
        payment_method: paymentMethod,
        notes,
      });

      setSuccessMessage("Order placed successfully!");
      setTimeout(() => navigate("/"), 1200);
    } catch (err) {
      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Unable to place order right now.";
      setError(backendMessage);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <main className="checkout-page">
      <header className="checkout-header">
        <p className="checkout-kicker">Checkout</p>
        <h1>One more step to your order</h1>
      </header>

      {successMessage && <p className="checkout-success">{successMessage}</p>}
      {error && <p className="checkout-error">{error}</p>}
      {isLoading && <p className="checkout-loading">Loading checkout...</p>}

      {!isLoading && items.length === 0 && !error && (
        <div className="checkout-empty">
          <h2>Your cart is empty</h2>
          <p>Add items before checkout.</p>
          <Link to="/menu" className="checkout-link-btn">
            Browse Menu
          </Link>
        </div>
      )}

      {!isLoading && items.length > 0 && (
        <section className="checkout-layout">
          <form className="checkout-form" onSubmit={handlePlaceOrder}>
            <h2>Delivery Details</h2>

            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />

            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />

            <label htmlFor="paymentMethod">Payment Method</label>
            <select
              id="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="cash">Cash on Delivery</option>
              <option value="card">Card</option>
            </select>

            <label htmlFor="notes">Notes (Optional)</label>
            <textarea
              id="notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <button
              type="submit"
              className="checkout-submit"
              disabled={isPlacingOrder}>
              {isPlacingOrder ? "Placing order..." : "Place Order"}
            </button>
          </form>

          <aside className="checkout-summary">
            <h3>Order Summary</h3>

            <div className="checkout-items">
              {items.map((item) => (
                <article key={item.id} className="checkout-item">
                  <img src={item.image} alt={item.title} />
                  <div>
                    <h4>{item.title}</h4>
                    <p>
                      {item.quantity} x ${item.unitPrice.toFixed(2)}
                    </p>
                  </div>
                  <strong>
                    ${(item.quantity * item.unitPrice).toFixed(2)}
                  </strong>
                </article>
              ))}
            </div>

            <p>
              <span>Subtotal</span>
              <strong>${subtotal.toFixed(2)}</strong>
            </p>
            <p>
              <span>Delivery</span>
              <strong>${deliveryFee.toFixed(2)}</strong>
            </p>
            <p className="checkout-total">
              <span>Total</span>
              <strong>${total.toFixed(2)}</strong>
            </p>
          </aside>
        </section>
      )}
    </main>
  );
}
