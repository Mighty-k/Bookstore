import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Layout from "./components/layout/Layout";
import AdminLayout from "./pages/Admin/AdminLayout";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import BookDetailsPage from "./pages/BookDetailsPage";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import Wishlist from "./pages/Wishlist";
import OrderSuccess from "./pages/OrderSuccess";
import AdminDashboard from "./pages/Admin/Dashboard";
import AdminOrders from "./pages/Admin/OrdersManagement";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="*" element={<NotFound />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="catalog" element={<Catalog />} />
          <Route path="book/:id" element={<BookDetailsPage />} />
          <Route path="cart" element={<Cart />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />

          {/* Protected User Routes */}
          <Route
            element={<ProtectedRoute allowedRoles={["customer", "admin"]} />}
          >
            <Route path="profile" element={<Profile />} />
            <Route path="orders" element={<Orders />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="orders/:orderNumber" element={<OrderSuccess />} />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={<ProtectedRoute allowedRoles={["admin"]} />}
        >
          <Route element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="admin/dashboard" element={<AdminDashboard />} />
            <Route path="admin/orders" element={<AdminOrders />} />
            <Route
              path="books"
              element={<div>Books Management (Coming Soon)</div>}
            />
            <Route
              path="users"
              element={<div>Users Management (Coming Soon)</div>}
            />
            <Route
              path="categories"
              element={<div>Categories Management (Coming Soon)</div>}
            />
            <Route
              path="reviews"
              element={<div>Reviews Management (Coming Soon)</div>}
            />
            <Route
              path="analytics"
              element={<div>Analytics (Coming Soon)</div>}
            />
            <Route
              path="settings"
              element={<div>Settings (Coming Soon)</div>}
            />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
