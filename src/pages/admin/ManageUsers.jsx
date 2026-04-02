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

const normalizeUsers = (payload) => {
  const raw = Array.isArray(payload?.users)
    ? payload.users
    : Array.isArray(payload?.data?.users)
      ? payload.data.users
      : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
          ? payload
          : [];

  return raw.map((user, index) => ({
    id: user?.id ?? `user-${index + 1}`,
    name: user?.name || user?.fullName || "User",
    email: user?.email || "",
    phone: user?.phone || "",
    role: String(user?.role || user?.type || "user"),
    isAdmin: String(user?.role || user?.type || "user") === "admin",
  }));
};

const fetchUsers = async () => {
  const res = await api.get("/users");
  return res.data;
};

function UserRoleModal({ user, onClose, onSave }) {
  const [isAdmin, setIsAdmin] = useState(user?.isAdmin || false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      await api.put(`/users/${user.id}/role`, {
        role: isAdmin ? "admin" : "user",
      });
      onSave();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update user.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal">
        <h2>Manage User: {user.name}</h2>
        {error && <p className="admin-notice error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label>
              <input
                type="checkbox"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
              />{" "}
              Admin Access
            </label>
            <p
              style={{
                margin: "0.5rem 0 0 1.5rem",
                fontSize: "0.85rem",
                color: "#666",
              }}>
              Grant admin privileges to this user
            </p>
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
              {isSaving ? "Saving..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ManageUsers() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
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

    loadUsers();
  }, [navigate, user]);

  const loadUsers = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await fetchUsers();
      setUsers(normalizeUsers(data));
    } catch (err) {
      const message = err?.response?.data?.message || "Unable to load users.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const openRoleModal = (userItem) => {
    setSelectedUser(userItem);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const handleSaveUser = async () => {
    closeModal();
    await loadUsers();
  };

  return (
    <main className="admin-page">
      <div className="admin-shell">
        <div className="admin-top">
          <div>
            <p className="admin-kicker">Admin</p>
            <h1 className="admin-title">Manage Users</h1>
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
            <Link className="admin-tab" to="/admin/categories">
              Categories
            </Link>
            <Link className="admin-tab active" to="/admin/users">
              Users
            </Link>
          </div>
        </div>

        {isLoading && <p className="admin-notice">Loading users...</p>}
        {error && <p className="admin-notice error">{error}</p>}

        {!isLoading && !error && (
          <section className="admin-card">
            {users.length === 0 ? (
              <div className="admin-empty">No users found.</div>
            ) : (
              <div className="admin-list">
                {users.map((userItem) => (
                  <article key={userItem.id} className="admin-item">
                    <div>
                      <h3>{userItem.name}</h3>
                      <p>
                        {userItem.email}{" "}
                        {userItem.phone && `• ${userItem.phone}`} •{" "}
                        {userItem.isAdmin ? "Admin" : "Customer"}
                      </p>
                    </div>
                    <div className="admin-actions">
                      <button
                        type="button"
                        className="admin-button secondary"
                        onClick={() => openRoleModal(userItem)}>
                        {userItem.isAdmin ? "Remove Admin" : "Make Admin"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {showModal && selectedUser && (
        <UserRoleModal
          user={selectedUser}
          onClose={closeModal}
          onSave={handleSaveUser}
        />
      )}
    </main>
  );
}
