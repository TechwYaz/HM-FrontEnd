import "./App.css";
import "./index.css";
import { useContext } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
  Outlet,
} from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Faq from "./pages/Faq";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import BookTable from "./pages/BookTable";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/admin/Dashboard";
import ManageMenu from "./pages/admin/ManageMenu";
import ManageOrders from "./pages/admin/ManageOrders";
import ManageBookings from "./pages/admin/ManageBookings";
import ManageCategories from "./pages/admin/ManageCategories";
import ManageUsers from "./pages/admin/ManageUsers";
import Navbar from "./layout/Navbar.jsx";
import Topbar from "./layout/Topbar.jsx";
import Footer from "./layout/Footer.jsx";
import { AuthContext } from "./context/auth-context";

const isLikelyAdmin = (user) => {
  if (!user) return false;
  if (user.is_admin === true || user.isAdmin === true) return true;
  const role = String(user.role || user.type || "").toLowerCase();
  if (!role) return true;
  return role === "admin" || role === "super_admin" || role === "superadmin";
};

function AdminRoute() {
  const { user } = useContext(AuthContext);
  const hasToken = Boolean(localStorage.getItem("token"));

  if (!hasToken) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return <Outlet />;
  }

  if (!isLikelyAdmin(user)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

function Layout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const hideLayout =
    ["/login", "/register"].includes(location.pathname) || isAdminRoute;

  return (
    <>
      {!hideLayout && <Topbar />}
      {!hideLayout && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/book-table" element={<BookTable />} />
        <Route path="/profile" element={<Profile />} />
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/menu" element={<ManageMenu />} />
          <Route path="/admin/orders" element={<ManageOrders />} />
          <Route path="/admin/bookings" element={<ManageBookings />} />
          <Route path="/admin/categories" element={<ManageCategories />} />
          <Route path="/admin/users" element={<ManageUsers />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!hideLayout && <Footer />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;
