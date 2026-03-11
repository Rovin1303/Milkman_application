import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import CustomerNavbar from "../components/CustomerNavbar";
import "./Cart.css";

function Cart() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressInput, setAddressInput] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [itemPlans, setItemPlans] = useState({});

  const isMilkProduct = (item) => {
    const name = String(item.product_name || "").toLowerCase();
    return /(^|\s)milk(\s|$)/.test(name);
  };

  const getDefaultPlan = (item) => {
    return isMilkProduct(item) ? "1m" : "once";
  };

  const fetchCart = async () => {
    const customerId = localStorage.getItem("customer_id");
    if (!customerId) return;
    try {
      const res = await api.get("cart/", { params: { customer: customerId } });
      const cartItems = res.data || [];
      setItems(cartItems);
      setItemPlans((prev) => {
        const next = { ...prev };
        cartItems.forEach((item) => {
          if (!next[item.id]) next[item.id] = getDefaultPlan(item);
          if (!isMilkProduct(item)) {
            next[item.id] = "once";
          }
        });
        return next;
      });
    } catch (err) {
      console.error("Cart fetch error", err);
    }
  };

  const updateQuantity = async (item, qty) => {
    try {
      await api.put(`cart/${item.id}/`, { ...item, quantity: qty });
      fetchCart();
    } catch (err) {
      console.error("Quantity update error", err);
    }
  };

  const removeItem = async (item) => {
    try {
      await api.delete(`cart/${item.id}/`);
      fetchCart();
    } catch (err) {
      console.error("Remove item error", err);
    }
  };

  const subscribe = async () => {
    const customerId = localStorage.getItem("customer_id");
    if (!customerId) return;
    if (items.length === 0) {
      alert("Your cart is empty. Add some products before subscribing.");
      return;
    }
    setShowAddressModal(true);
  };

  const handleAddressSubmit = async () => {
    const customerId = localStorage.getItem("customer_id");
    if (!customerId) return;
    if (!addressInput || addressInput.trim().length < 5) {
      alert("Please enter a valid delivery address.");
      return;
    }
    setSubscribing(true);
    try {
      const res = await api.post("cart/subscribe/", {
        customer: customerId,
        delivery_address: addressInput,
        item_plans: itemPlans,
      });
      console.log("subscribe response", res.data);
      const subscriptionCount = res?.data?.subscriptions?.length || 0;
      const orderCount = res?.data?.orders?.length || 0;

      if (subscriptionCount > 0 || orderCount > 0) {
        if (subscriptionCount > 0 && orderCount > 0) {
          alert("Milk monthly subscription created and one-time orders placed.");
          navigate("/orders");
          return;
        }
        if (subscriptionCount > 0) {
          alert("Milk subscription created successfully.");
          navigate("/subscriptions");
          return;
        }
        alert("One-time orders placed successfully.");
        navigate("/orders");
        return;
      } else {
        alert("No subscriptions were created. Please check your cart.");
      }
      setShowAddressModal(false);
      setAddressInput("");
    } catch (err) {
      console.error("Subscription error", err);
      alert(err?.response?.data?.error || "Failed to create subscription. Please try again.");
    } finally {
      setSubscribing(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("customer_token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchCart();
  }, []);

  const total = items.reduce((sum, it) => sum + (it.product_price || 0) * it.quantity, 0);

  return (
    <div className="cart-page">
      <CustomerNavbar />
      <div className="container">
        <h2>Your Cart</h2>
        {items.length === 0 ? (
          <p>Your cart is empty. Add some products to get started!</p>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.id}>
                      <td><strong>{it.product_name || it.product}</strong></td>
                      <td>
                        <div className="quantity-controls">
                          <button className="quantity-btn" onClick={() => updateQuantity(it, Math.max(1, it.quantity - 1))}>-</button>
                          <span style={{ fontWeight: 600, minWidth: "30px", textAlign: "center" }}>{it.quantity}</span>
                          <button className="quantity-btn" onClick={() => updateQuantity(it, it.quantity + 1)}>+</button>
                        </div>
                      </td>
                      <td><strong>Rs. {it.product_price || "-"}</strong></td>
                      <td>
                        <button className="remove-btn" onClick={() => removeItem(it)}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="total-section">
              Total: Rs. {total.toFixed(2)}
            </div>
          </>
        )}

        {items.length > 0 && (
          <div className="subscribe-section">
            <h3>Subscribe and Deliver</h3>
            <p className="subscribe-note">Only milk products can use monthly plans. All other products are one-time only.</p>
            <button className="subscribe-btn" onClick={subscribe}>
              Continue to Address and Plans
            </button>
          </div>
        )}
        {showAddressModal && (
          <div className="modal-backdrop">
            <div className="address-modal">
              <h3>Delivery Address and Product Plans</h3>
              <div className="plan-section">
                {items.map((item) => {
                  const canChooseDuration = isMilkProduct(item);
                  return (
                    <div className="plan-item-row" key={item.id}>
                      <div className="plan-item-name">{item.product_name || `Product ${item.product}`}</div>
                      <select
                        value={itemPlans[item.id] || getDefaultPlan(item)}
                        onChange={(e) => setItemPlans((prev) => ({ ...prev, [item.id]: e.target.value }))}
                        disabled={!canChooseDuration}
                      >
                        <option value="once">Once</option>
                        {canChooseDuration && (
                          <>
                            <option value="1m">1 month</option>
                            <option value="2m">2 months</option>
                            <option value="3m">3 months</option>
                          </>
                        )}
                      </select>
                    </div>
                  );
                })}
                <p className="plan-note">Only milk products can be subscribed monthly. All other products are one-time delivery.</p>
              </div>
              <textarea
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                placeholder="Enter full delivery address, including house/flat no, street, city, pincode"
                rows={5}
              />
              <div className="modal-actions">
                <button className="modal-cancel" onClick={() => setShowAddressModal(false)}>Cancel</button>
                <button className="modal-submit" onClick={handleAddressSubmit} disabled={subscribing}>{subscribing ? "Saving..." : "Confirm and Subscribe"}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
