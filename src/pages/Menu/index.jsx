import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { STORAGE_URL } from "../../api/axios";
import { AuthContext } from "../../context/auth-context";
import "./Menu.css";

const formatPrice = (value) => `$${value.toFixed(2)}`;
const getCategoryName = (item) =>
  typeof item?.category === "string"
    ? item.category
    : item?.category?.name || "Uncategorized";
const getItemName = (item) => item?.name || item?.title || "Untitled Item";
const getItemDescription = (item) =>
  item?.description || item?.details || "No description available.";
const getItemPrice = (item) => {
  const parsed = Number(item?.price);
  return Number.isFinite(parsed) ? parsed : 0;
};
const isItemAvailable = (item) => {
  const raw = item?.is_available;
  if (typeof raw === "boolean") return raw;
  if (typeof raw === "number") return raw === 1;
  if (typeof raw === "string")
    return raw === "1" || raw.toLowerCase() === "true";
  return false;
};

const postToCartWithFallback = async (payload) => {
  const paths = ["/cart", "/cart/add", "/cart/items"];
  let lastError;

  for (const path of paths) {
    try {
      await api.post(path, payload);
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

export default function Menu() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [cartMessage, setCartMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("featured");

  const fetchMenuItems = async () => {
    setIsLoading(true);
    setFetchError("");

    try {
      const res = await api.get("/menu");
      const items = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : [];
      setMenuItems(items);
    } catch {
      setMenuItems([]);
      setFetchError("Unable to load menu right now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const handleAddToCart = async (item) => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      await postToCartWithFallback({ menu_item_id: item.id, quantity: 1 });
      setCartMessage(`"${getItemName(item)}" added to cart!`);
      setTimeout(() => setCartMessage(""), 3000);
    } catch {
      setCartMessage("Failed to add item to cart. Please try again.");
      setTimeout(() => setCartMessage(""), 3000);
    }
  };

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(
        menuItems
          .map((item) => getCategoryName(item))
          .filter((categoryName) => Boolean(categoryName)),
      ),
    );
    return ["All", ...uniqueCategories];
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const matches = menuItems.filter((item) => {
      const categoryName = getCategoryName(item);
      const itemName = getItemName(item).toLowerCase();
      const itemDescription = getItemDescription(item).toLowerCase();
      const matchesCategory =
        selectedCategory === "All" || categoryName === selectedCategory;
      const matchesSearch =
        !normalizedSearch ||
        itemName.includes(normalizedSearch) ||
        itemDescription.includes(normalizedSearch);
      return matchesCategory && matchesSearch;
    });

    const sorted = [...matches];
    if (sortBy === "priceLow") {
      sorted.sort((a, b) => getItemPrice(a) - getItemPrice(b));
    }
    if (sortBy === "priceHigh") {
      sorted.sort((a, b) => getItemPrice(b) - getItemPrice(a));
    }
    if (sortBy === "name") {
      sorted.sort((a, b) => getItemName(a).localeCompare(getItemName(b)));
    }

    return sorted;
  }, [menuItems, searchTerm, selectedCategory, sortBy]);

  return (
    <main className="menu-page">
      <section className="menu-hero">
        <p className="menu-kicker">HalfMillion Menu</p>
        <h1>Crafted Drinks, Fresh Plates, Zero Guesswork</h1>
        <p className="menu-subtitle">
          Browse our current favorites and filter exactly what you are craving.
        </p>
      </section>

      <section className="menu-controls" aria-label="Menu filters">
        <div className="menu-search-wrap">
          <label htmlFor="menuSearch" className="menu-control-label">
            Search
          </label>
          <input
            id="menuSearch"
            className="menu-search"
            type="search"
            placeholder="Search coffee, meals, desserts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="menu-sort-wrap">
          <label htmlFor="menuSort" className="menu-control-label">
            Sort by
          </label>
          <select
            id="menuSort"
            className="menu-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}>
            <option value="featured">Featured</option>
            <option value="name">Name</option>
            <option value="priceLow">Price: Low to High</option>
            <option value="priceHigh">Price: High to Low</option>
          </select>
        </div>
      </section>

      {cartMessage && (
        <section className="menu-status" aria-live="polite">
          <div className="menu-cart-message">{cartMessage}</div>
        </section>
      )}

      {isLoading && (
        <section className="menu-status" aria-live="polite">
          <div className="menu-loading">Loading menu items...</div>
        </section>
      )}

      {!isLoading && fetchError && (
        <section className="menu-status" aria-live="polite">
          <div className="menu-error">
            <p>{fetchError}</p>
            <button
              type="button"
              className="menu-retry-btn"
              onClick={fetchMenuItems}
              disabled={isLoading}>
              Retry
            </button>
          </div>
        </section>
      )}

      <section className="category-row" aria-label="Menu categories">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={`category-pill ${
              selectedCategory === category ? "active" : ""
            }`}
            onClick={() => setSelectedCategory(category)}>
            {category}
          </button>
        ))}
      </section>

      <section className="menu-grid" aria-live="polite">
        {!isLoading && !fetchError && filteredItems.length === 0 && (
          <div className="menu-empty">
            <h2>No items found</h2>
            <p>Try a different category or keyword.</p>
          </div>
        )}

        {filteredItems.map((item) => (
          <article key={item.id} className="menu-card">
            <img
              src={item.image ? `${STORAGE_URL}/${item.image}` : "/logo.jpg"}
              alt={getItemName(item)}
              className="menu-card-image"
            />

            <div className="menu-card-content">
              <div className="menu-card-head">
                <span className="menu-card-category">
                  {item.category?.name}
                </span>
                <strong className="menu-card-price">
                  {formatPrice(getItemPrice(item))}
                </strong>
              </div>

              <h2>{getItemName(item)}</h2>
              <p>{getItemDescription(item)}</p>

              <button
                type="button"
                className="menu-add-btn"
                disabled={!isItemAvailable(item)}
                onClick={() => handleAddToCart(item)}>
                {isItemAvailable(item) ? "Add to cart" : "Sold out"}
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
