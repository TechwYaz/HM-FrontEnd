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

  return raw.map((cat, index) => ({
    id: cat?.id ?? `cat-${index + 1}`,
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

function CategoryFormModal({ item, onClose, onSave }) {
  const [formData, setFormData] = useState(
    item || {
      name: "",
      slug: "",
    },
  );
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "name") {
      const autoSlug = value
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "");

      setFormData((prev) => ({
        ...prev,
        [name]: value,
        slug:
          prev.slug === "" ||
          prev.slug ===
            prev.name
              ?.toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^\w-]/g, "")
            ? autoSlug
            : prev.slug,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name.trim()) {
      setFormError("Category name is required");
      return;
    }
    if (!formData.slug.trim()) {
      setFormError("Category slug is required");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: formData.name,
        slug: formData.slug,
      };

      if (item?.id) {
        await api.put(`/categories/${item.id}`, payload);
      } else {
        await api.post("/categories", payload);
      }

      onSave();
    } catch (err) {
      setFormError(buildApiErrorMessage(err, "Failed to save category."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal">
        <h2>{item ? "Edit Category" : "Add Category"}</h2>
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
              placeholder="Category name"
              required
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="slug">Slug</label>
            <input
              id="slug"
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="url-friendly-name"
              required
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

export default function ManageCategories() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
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

    loadCategories();
  }, [navigate, user]);

  const loadCategories = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await fetchCategories();
      setCategories(normalizeCategories(data));
    } catch (err) {
      const message =
        err?.response?.data?.message || "Unable to load categories.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setSelectedCategory(null);
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setSelectedCategory(category);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCategory(null);
  };

  const handleSaveCategory = async () => {
    closeModal();
    await loadCategories();
  };

  const removeCategory = async (category) => {
    if (
      !window.confirm(
        `Delete "${category.name}"? This action cannot be undone.`,
      )
    )
      return;

    setBusyId(category.id);
    setError("");
    try {
      await api.delete(`/categories/${category.id}`);
      setCategories((prev) => prev.filter((entry) => entry.id !== category.id));
    } catch (err) {
      setError(buildApiErrorMessage(err, "Could not delete category."));
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
            <h1 className="admin-title">Manage Categories</h1>
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
            <Link className="admin-tab" to="/admin/menu">
              Menu
            </Link>
            <Link className="admin-tab active" to="/admin/categories">
              Categories
            </Link>
            <Link className="admin-tab" to="/admin/users">
              Users
            </Link>
          </div>
        </div>

        {isLoading && <p className="admin-notice">Loading categories...</p>}
        {error && <p className="admin-notice error">{error}</p>}

        {!isLoading && !error && (
          <>
            <div style={{ marginBottom: "1.5rem" }}>
              <button className="admin-button" onClick={openAddModal}>
                + Add Category
              </button>
            </div>

            <section className="admin-card">
              {categories.length === 0 ? (
                <div className="admin-empty">No categories found.</div>
              ) : (
                <div className="admin-list">
                  {categories.map((category) => (
                    <article key={category.id} className="admin-item">
                      <div>
                        <h3>{category.name}</h3>
                        <p>{category.slug}</p>
                      </div>
                      <div className="admin-actions">
                        <button
                          type="button"
                          className="admin-button secondary"
                          disabled={busyId === category.id}
                          onClick={() => openEditModal(category)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="admin-button danger"
                          disabled={busyId === category.id}
                          onClick={() => removeCategory(category)}>
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {showModal && (
        <CategoryFormModal
          item={selectedCategory}
          onClose={closeModal}
          onSave={handleSaveCategory}
        />
      )}
    </main>
  );
}
