import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./CustomerNavbar.css";

function CustomerNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = Boolean(localStorage.getItem("customer_token"));
  const customerName = localStorage.getItem("customer_name") || "Guest";
  const [cartCount, setCartCount] = useState(0);

  const isActive = (path) => {
    if (path === "/dashboard") {
      return location.pathname === "/" || location.pathname === "/dashboard";
    }
    return location.pathname === path;
  };

  const btnClass = (path) => `customer-nav-btn ${isActive(path) ? "active" : ""}`;
  const goBack = () => navigate(-1);
  const onDashboard = location.pathname === "/" || location.pathname === "/dashboard";

  const logout = () => {
    localStorage.removeItem("customer_token");
    localStorage.removeItem("customer_name");
    localStorage.removeItem("customer_id");
    setCartCount(0);
    navigate("/login");
  };

  useEffect(() => {
    const fetchCartCount = async () => {
      const customerId = localStorage.getItem("customer_id");
      if (!customerId) {
        setCartCount(0);
        return;
      }
      try {
        const response = await api.get("cart/", { params: { customer: customerId } });
        const totalItems = (response.data || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
        setCartCount(totalItems);
      } catch (err) {
        console.error("Cart count fetch error", err);
      }
    };

    fetchCartCount();
  }, [location.pathname, isLoggedIn]);

  useEffect(() => {
    const onCartIncrement = (event) => {
      const delta = Number(event?.detail?.delta || 1);
      setCartCount((prev) => Math.max(0, prev + delta));
    };

    const onCartSync = (event) => {
      const count = Number(event?.detail?.count || 0);
      setCartCount(Math.max(0, count));
    };

    window.addEventListener("cart:increment", onCartIncrement);
    window.addEventListener("cart:sync", onCartSync);

    return () => {
      window.removeEventListener("cart:increment", onCartIncrement);
      window.removeEventListener("cart:sync", onCartSync);
    };
  }, []);

  return (
    <nav className="customer-navbar">
      <div className="customer-nav-inner">
        <div className="customer-nav-brand-wrap">
          {!onDashboard ? (
            <button className="customer-nav-btn customer-nav-back" onClick={goBack}>Back</button>
          ) : null}
          <h2 className="customer-brand" onClick={() => navigate("/dashboard")}>Milkman</h2>
        </div>
        <div className="customer-nav-links">
          <button className={btnClass("/dashboard")} onClick={() => navigate("/dashboard")}>Home</button>
          {isLoggedIn ? (
            <>
              <button className={btnClass("/cart")} onClick={() => navigate("/cart")}>Cart ({cartCount})</button>
              <button className={btnClass("/subscriptions")} onClick={() => navigate("/subscriptions")}>My Subscriptions</button>
              <button className={btnClass("/orders")} onClick={() => navigate("/orders")}>Your Orders</button>
              <button className="customer-nav-btn customer-nav-logout" onClick={logout}>Logout</button>
              <span className="customer-nav-user">{customerName}</span>
            </>
          ) : (
            <>
              <button className={btnClass("/login")} onClick={() => navigate("/login")}>Sign In</button>
              <button className={btnClass("/signup")} onClick={() => navigate("/signup")}>Sign Up</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default CustomerNavbar;
