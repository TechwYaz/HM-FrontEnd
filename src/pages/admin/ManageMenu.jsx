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

const normalizeMenu = (payload) => {
  const raw = Array.isArray(payload?.menu_items)
    ? payload.menu_items
    : Array.isArray(payload?.data?.menu_items)
      ? payload.data.menu_items
      : Array.isArray(payload?.items)
        ? payload.items
        : Array.isArray(payload?.data?.items)
          ? payload.data.items
          : Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload)
              ? payload
              : [];

  return raw.map((item, index) => ({
    id: item?.id ?? `menu-${index + 1}`,
    name: item?.name || item?.title || "Menu Item",
    price: Number(item?.price ?? 0) || 0,
    category_id: item?.category_id || item?.categoryId || "",
    description: item?.description || "",
    image: item?.image || item?.image_url || item?.imageUrl || null,
    isAvailable: item?.is_available ?? item?.available ?? true,
  }));
};

const fetchMenu = async () => {
  const res = await api.get("/menu");
  return res.data;
};

const normalizeCategories = (payload) => {
  const raw = Array.isArray(payload?.categories)
    ? payload.categories
    : Array.isArray(payload?.data?.categories)
      ? payload.data.categories
      : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
          ? payload
          : [];

  return raw.map((cat) => ({
    id: cat?.id,
    name: cat?.name || "Category",
    slug: cat?.slug || "",
  }));
};

const fetchCategories = async () => {
  const res = await api.get("/categories");
  return res.data;
};

const buildApiErrorMessage = (err, fallback) => {
  const message = err?.response?.data?.message;
  const errors = err?.response?.data?.errors;
  if (errors && typeof errors === "object") {
    const first = Object.values(errors)?.[0];
    if (Array.isArray(first) && first[0]) return first[0];
  }
  return message || fallback;
};

function MenuFormModal({ item, onClose, onSave, categories = [] }) {
  const [formData, setFormData] = useState(
    item || {
      name: "",
      price: "",
      description: "",
      category_id: "",
    },
  );
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(item?.image || null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) || "" : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name.trim()) {
      setFormError("Menu item name is required");
      return;
    }
    if (!formData.category_id) {
      setFormError("Category is required");
      return;
    }
    if (!formData.price || formData.price < 0) {
      setFormError("Valid price is required");
      return;
    }

    if (!item && !imageFile) {
      setFormError("Image is required for new menu items");
      return;
    }

    if (imageFile && !imageFile.type.startsWith("image/")) {
      setFormError("Selected file must be an image");
      return;
    }

    setIsSaving(true);
    try {
      const requestData = new FormData();
      requestData.append("name", formData.name);
      requestData.append("price", formData.price);
      requestData.append("category_id", formData.category_id);
      requestData.append("description", formData.description);

      if (imageFile) {
        requestData.append("image", imageFile);
      }

      if (item?.id) {
        await api.put(`/menu/${item.id}`, requestData);
      } else {
        await api.post("/menu", requestData);
      }

      onSave();
    } catch (err) {
      setFormError(buildApiErrorMessage(err, "Failed to save menu item."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal">
        <h2>{item ? "Edit Menu Item" : "Add Menu Item"}</h2>
        {formError && <p className="admin-notice error">{formError}</p>}
        <form onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Menu item name"
              required
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="price">Price</label>
            <input
              id="price"
              type="number"
              name="price"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={handleChange}
              placeholder="0.00"
              required
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="category_id">Category</label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              required>
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-form-group">
            <label htmlFor="image">
              Image {!item && <span style={{ color: "red" }}>*</span>}
            </label>
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isSaving}
              required={!item && !imageFile}
            />
            {imagePreview && (
              <div style={{ marginTop: "0.8rem" }}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "200px",
                    borderRadius: "0.65rem",
                    border: "1px solid #b89f8b",
                  }}
                />
              </div>
            )}
          </div>

          <div className="admin-form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Item description"
              rows="3"
            />
          </div>

          <div className="admin-modal-actions">
            <button
              type="button"
              className="admin-button secondary"
              onClick={onClose}
              disabled={isSaving}>
              Cancel
            </button>
            <button type="submit" className="admin-button" disabled={isSaving}>
              {isSaving ? "Saving..." : item ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ManageMenu() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

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

    loadData();
  }, [navigate, user]);

  const loadData = async () => {
    setIsLoading(true);
    setError("");
    try {
      const [menuData, categoriesData] = await Promise.all([
        fetchMenu(),
        fetchCategories(),
      ]);
      setItems(normalizeMenu(menuData));
      setCategories(normalizeCategories(categoriesData));
    } catch (err) {
      const message =
        err?.response?.data?.message || "Unable to load menu items.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setSelectedItem(null);
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const handleSaveMenuItem = async () => {
    closeModal();
    await loadData();
  };

  const removeItem = async (item) => {
    if (!window.confirm(`Delete "${item.name}"? This action cannot be undone.`))
      return;

    setBusyId(item.id);
    setError("");
    try {
      await api.delete(`/menu/${item.id}`);
      setItems((prev) => prev.filter((entry) => entry.id !== item.id));
    } catch (err) {
      setError(buildApiErrorMessage(err, "Could not delete menu item."));
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
            <h1 className="admin-title">Manage Menu</h1>
          </div>
          <div className="admin-tabs">
            <Link className="admin-tab" to="/admin">
              Overview
            </Link>
            <Link className="admin-tab" to="/admin/orders">
              Orders
            </Link>
            <Link className="admin-tab" to="/admin/bookings">
              Bookings
            </Link>
            <Link className="admin-tab active" to="/admin/menu">
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

        {isLoading && <p className="admin-notice">Loading menu...</p>}
        {error && <p className="admin-notice error">{error}</p>}

        {!isLoading && !error && (
          <>
            <div style={{ marginBottom: "1.5rem" }}>
              <button className="admin-button" onClick={openAddModal}>
                + Add Menu Item
              </button>
            </div>

            <section className="admin-card">
              {items.length === 0 ? (
                <div className="admin-empty">No menu items found.</div>
              ) : (
                <div className="admin-list">
                  {items.map((item) => {
                    const categoryName =
                      categories.find((cat) => cat.id == item.category_id)
                        ?.name || "Uncategorized";
                    return (
                      <article key={item.id} className="admin-item">
                        <div>
                          <h3>{item.name}</h3>
                          <p>
                            ${item.price.toFixed(2)} • {categoryName}
                            {item.description && ` • ${item.description}`}
                          </p>
                        </div>
                        <div className="admin-actions">
                          <button
                            type="button"
                            className="admin-button secondary"
                            disabled={busyId === item.id}
                            onClick={() => openEditModal(item)}>
                            Edit
                          </button>
                          <button
                            type="button"
                            className="admin-button danger"
                            disabled={busyId === item.id}
                            onClick={() => removeItem(item)}>
                            Delete
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {showModal && (
        <MenuFormModal
          item={selectedItem}
          onClose={closeModal}
          onSave={handleSaveMenuItem}
          categories={categories}
        />
      )}
    </main>
  );
}
