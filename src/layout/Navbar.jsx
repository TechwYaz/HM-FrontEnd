import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { BellIcon } from "@heroicons/react/24/outline";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { XMarkIcon } from "@heroicons/react/24/outline";
import "./Navbar.css";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth-context";
import api from "../api/axios";

const navigation = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Menu", href: "/menu" },
];

const mobileNavigation = [
  ...navigation,
  { name: "Cart", href: "/cart" },
  { name: "Profile", href: "/profile" },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const hasToken = Boolean(localStorage.getItem("token"));
  const showSignUp = !user && !hasToken;
  const showLogout = Boolean(user || hasToken);
  const isRegisterActive = location.pathname === "/register";
  const isCartActive = location.pathname === "/cart";
  const isProfileActive = location.pathname === "/profile";

  const [notifications, setNotifications] = useState([]);
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const fetchNotifications = useCallback(async () => {
    if (!hasToken && !user) return;
    try {
      const res = await api.get("/notifications");
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch {
      return;
    }
  }, [hasToken, user]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setBellOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, read_at: new Date().toISOString() } : n,
        ),
      );
    } catch {
      return;
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          read_at: n.read_at ?? new Date().toISOString(),
        })),
      );
    } catch {
      return;
    }
  };

  const handleLogout = async () => {
    try {
      if (hasToken) {
        await api.post("/logout");
      }
    } catch {
      return;
    } finally {
      logout();
      navigate("/");
    }
  };

  return (
    <Disclosure as="nav" className="navbar">
      {({ open }) => (
        <>
          <div className="navbar-max-width">
            <div className="navbar-container">
              <div className="navbar-mobile-btn">
                <DisclosureButton className="navbar-mobile-btn">
                  {open ? (
                    <XMarkIcon
                      className="navbar-mobile-icon"
                      aria-hidden="true"
                    />
                  ) : (
                    <Bars3Icon
                      className="navbar-mobile-icon"
                      aria-hidden="true"
                    />
                  )}
                </DisclosureButton>
              </div>

              <div className="navbar-content">
                <div className="navbar-logo">
                  <Link to="/" aria-label="Go to home page">
                    <img
                      className="navbar-logo-img"
                      src="/logo.jpg"
                      alt="Half Million"
                    />
                  </Link>
                </div>
                <div className="navbar-desktop-nav">
                  <div className="navbar-links">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        aria-current={
                          location.pathname === item.href ? "page" : undefined
                        }
                        className={classNames(
                          "navbar-link",
                          location.pathname === item.href ? "active" : "",
                        )}>
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {showSignUp && (
                <div className="navbar-signup">
                  <Link
                    className={classNames(
                      "navbar-signup-link",
                      isRegisterActive ? "active" : "",
                    )}
                    to="/register">
                    SIGN UP
                  </Link>
                </div>
              )}
              {showLogout && (
                <div className="navbar-signup">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="navbar-signup-link">
                    LOG OUT
                  </button>
                </div>
              )}
              {showLogout && (
                <div className="navbar-cart">
                  <Link
                    to="/cart"
                    aria-label="Go to cart"
                    className={classNames(
                      "navbar-cart-btn",
                      isCartActive ? "active" : "",
                    )}>
                    <ShoppingCartIcon
                      className="navbar-cart-icon"
                      aria-hidden="true"
                    />
                  </Link>
                </div>
              )}

              {showLogout && (
                <div className="navbar-bell-wrapper" ref={bellRef}>
                  <button
                    type="button"
                    aria-label="Notifications"
                    className="navbar-bell-btn"
                    onClick={() => setBellOpen((o) => !o)}>
                    <BellIcon className="navbar-bell-icon" aria-hidden="true" />
                    {unreadCount > 0 && (
                      <span className="navbar-bell-badge">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {bellOpen && (
                    <div className="navbar-bell-dropdown">
                      <div className="navbar-bell-dropdown-header">
                        <span>Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            type="button"
                            className="navbar-mark-all-btn"
                            onClick={handleMarkAllRead}>
                            Mark all read
                          </button>
                        )}
                      </div>
                      {notifications.length === 0 ? (
                        <p className="navbar-bell-empty">
                          No notifications yet.
                        </p>
                      ) : (
                        <ul className="navbar-bell-list">
                          {notifications.map((n) => (
                            <li
                              key={n.id}
                              className={classNames(
                                "navbar-bell-item",
                                !n.read_at ? "navbar-bell-item-unread" : "",
                              )}
                              onClick={() =>
                                !n.read_at && handleMarkRead(n.id)
                              }>
                              <p className="navbar-bell-msg">
                                {n.data?.message}
                              </p>
                              <time className="navbar-bell-time">
                                {n.created_at
                                  ? new Date(n.created_at).toLocaleString([], {
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : ""}
                              </time>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="navbar-profile">
                <Link
                  to="/profile"
                  aria-label="Go to profile"
                  className={classNames(
                    "navbar-profile-btn",
                    isProfileActive ? "active" : "",
                  )}>
                  <UserCircleIcon
                    className="navbar-profile-icon"
                    aria-hidden="true"
                  />
                </Link>
              </div>
              <DisclosurePanel className="navbar-mobile-menu">
                <div className="navbar-mobile-menu-content">
                  {mobileNavigation.map((item) => (
                    <DisclosureButton
                      key={item.name}
                      as={Link}
                      to={item.href}
                      aria-current={
                        location.pathname === item.href ? "page" : undefined
                      }
                      className={classNames(
                        "navbar-mobile-link",
                        location.pathname === item.href ? "active" : "",
                      )}>
                      {item.name}
                    </DisclosureButton>
                  ))}
                </div>
              </DisclosurePanel>
            </div>
          </div>
        </>
      )}
    </Disclosure>
  );
};

export default Navbar;
