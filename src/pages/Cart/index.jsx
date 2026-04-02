import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { STORAGE_URL } from "../../api/axios";
import { AuthContext } from "../../context/auth-context";
import "./Cart.css";

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
      subtotal: asNumber(item.subtotal, unitPrice * quantity),
      title: menuItem.name || menuItem.title || "Menu Item",
      description: menuItem.description || "No description available.",
      image: menuItem.image ? `${STORAGE_URL}/${menuItem.image}` : "/logo.jpg",
    };
  });
};

const requestCartEndpoint = async (method, paths, data) => {
  let lastError;

  for (const path of paths) {
    try {
      await api.request({ method, url: path, data });
      return;
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

export default function Cart() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [flashMessage, setFlashMessage] = useState("");
  const [busyItemId, setBusyItemId] = useState(null);

  const fetchCart = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await api.get("/cart");
      setItems(normalizeCartItems(res.data));
    } catch {
      setItems([]);
      setError("Unable to load your cart right now.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const hasToken = Boolean(localStorage.getItem("token"));
    if (!user && !hasToken) {
      navigate("/login");
      return;
    }

    fetchCart();
  }, [fetchCart, navigate, user]);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [items],
  );
  const deliveryFee = items.length > 0 ? 2.5 : 0;
  const total = subtotal + deliveryFee;

  const updateQuantity = async (item, nextQuantity) => {
    if (nextQuantity < 1) return;

    setBusyItemId(item.id);
    try {
      await requestCartEndpoint(
        "put",
        [`/cart/${item.id}`, `/cart/item/${item.id}`, `/cart/items/${item.id}`],
        { quantity: nextQuantity },
      );
      setItems((prev) =>
        prev.map((entry) =>
          entry.id === item.id
            ? {
                ...entry,
                quantity: nextQuantity,
                subtotal: nextQuantity * entry.unitPrice,
              }
            : entry,
        ),
      );
    } catch {
      setFlashMessage("Could not update item quantity.");
      setTimeout(() => setFlashMessage(""), 2500);
    } finally {
      setBusyItemId(null);
    }
  };

  const removeItem = async (item) => {
    setBusyItemId(item.id);
    try {
      await requestCartEndpoint("delete", [
        `/cart/${item.id}`,
        `/cart/item/${item.id}`,
        `/cart/items/${item.id}`,
      ]);
      setItems((prev) => prev.filter((entry) => entry.id !== item.id));
    } catch {
      setFlashMessage("Could not remove item from cart.");
      setTimeout(() => setFlashMessage(""), 2500);
    } finally {
      setBusyItemId(null);
    }
  };

  return (
    <main className="cart-page">
      <header className="cart-header">
        <p className="cart-kicker">Your Cart</p>
        <h1>Ready to checkout?</h1>
      </header>

      {flashMessage && <p className="cart-flash">{flashMessage}</p>}

      {isLoading && <p className="cart-status">Loading your cart...</p>}

      {!isLoading && error && (
        <div className="cart-error-wrap">
          <p className="cart-status cart-status-error">{error}</p>
          <button type="button" className="cart-action-btn" onClick={fetchCart}>
            Retry
          </button>
        </div>
      )}

      {!isLoading && !error && items.length === 0 && (
        <div className="cart-empty">
          <h2>Your cart is empty</h2>
          <p>Add something from the menu to get started.</p>
          <Link to="/menu" className="cart-link-btn">
            Browse Menu
          </Link>
        </div>
      )}

      {!isLoading && !error && items.length > 0 && (
        <section className="cart-layout">
          <div className="cart-items">
            {items.map((item) => (
              <article key={item.id} className="cart-item-card">
                <img
                  src={item.image}
                  alt={item.title}
                  className="cart-item-image"
                />

                <div className="cart-item-content">
                  <h2>{item.title}</h2>
                  <p>{item.description}</p>

                  <div className="cart-item-meta">
                    <span>${item.unitPrice.toFixed(2)}</span>
                    <strong>
                      ${(item.unitPrice * item.quantity).toFixed(2)}
                    </strong>
                  </div>

                  <div className="cart-controls">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item, item.quantity - 1)}
                      disabled={busyItemId === item.id || item.quantity <= 1}>
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item, item.quantity + 1)}
                      disabled={busyItemId === item.id}>
                      +
                    </button>
                    <button
                      type="button"
                      className="cart-remove-btn"
                      onClick={() => removeItem(item)}
                      disabled={busyItemId === item.id}>
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="cart-summary">
            <h3>Order Summary</h3>
            <p>
              <span>Subtotal</span>
              <strong>${subtotal.toFixed(2)}</strong>
            </p>
            <p>
              <span>Delivery</span>
              <strong>${deliveryFee.toFixed(2)}</strong>
            </p>
            <p className="cart-total-row">
              <span>Total</span>
              <strong>${total.toFixed(2)}</strong>
            </p>

            <Link to="/checkout" className="cart-checkout-btn">
              Proceed to Checkout
            </Link>
            <Link to="/menu" className="cart-continue-link">
              Continue Shopping
            </Link>
          </aside>
        </section>
      )}
    </main>
  );
}
