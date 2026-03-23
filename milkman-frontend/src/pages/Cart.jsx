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
  const [feedback, setFeedback] = useState({ type: "", text: "" });
  const [registeredAddress, setRegisteredAddress] = useState("");
  const [useRegisteredAddress, setUseRegisteredAddress] = useState(false);
  const [loadingRegisteredAddress, setLoadingRegisteredAddress] = useState(false);

  const isMilkProduct = (item) => {
    const name = String(item.product_name || "").toLowerCase();
    return /(^|\s)milk(\s|$)/.test(name);
  };

  const getDefaultPlan = (item) => {
    return isMilkProduct(item) ? "1m" : "once";
  };

  const fetchCart = async () => {
    const customerId = localStorage.getItem("customer_id");
    if (!customerId) {
      window.dispatchEvent(new CustomEvent("cart:sync", { detail: { count: 0 } }));
      return;
    }
    try {
      const res = await api.get("cart/", { params: { customer: customerId } });
      const cartItems = res.data || [];
      setItems(cartItems);
      const totalItems = cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
      window.dispatchEvent(new CustomEvent("cart:sync", { detail: { count: totalItems } }));
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

  const fetchRegisteredAddress = async () => {
    const customerId = localStorage.getItem("customer_id");
    if (!customerId) return "";

    setLoadingRegisteredAddress(true);
    try {
      const res = await api.get(`customer/${customerId}/`);
      const savedAddress = (res?.data?.address || "").trim();
      setRegisteredAddress(savedAddress);
      if (savedAddress) {
        setUseRegisteredAddress(true);
        setAddressInput(savedAddress);
      }
      return savedAddress;
    } catch (err) {
      console.error("Registered address fetch error", err);
      return "";
    } finally {
      setLoadingRegisteredAddress(false);
    }
  };

  const subscribe = async () => {
    const customerId = localStorage.getItem("customer_id");
    if (!customerId) return;
    if (items.length === 0) {
      setFeedback({ type: "error", text: "Your cart is empty. Add products before placing an order." });
      return;
    }
    await fetchRegisteredAddress();
    setShowAddressModal(true);
  };

  const handleAddressSubmit = async () => {
    const customerId = localStorage.getItem("customer_id");
    if (!customerId) return;
    const finalAddress = (useRegisteredAddress ? registeredAddress : addressInput || "").trim();
    if (!finalAddress || finalAddress.length < 5) {
      setFeedback({ type: "error", text: "Please enter a valid delivery address." });
      return;
    }
    setSubscribing(true);
    try {
      const res = await api.post("cart/subscribe/", {
        customer: customerId,
        delivery_address: finalAddress,
        item_plans: itemPlans,
      });
      console.log("subscribe response", res.data);
      const subscriptionCount = res?.data?.subscriptions?.length || 0;
      const orderCount = res?.data?.orders?.length || 0;

      if (subscriptionCount > 0 || orderCount > 0) {
        if (subscriptionCount > 0 && orderCount > 0) {
          navigate("/orders", { state: { flashMessage: "Successfully placed your one-time order and subscription." } });
          return;
        }
        if (subscriptionCount > 0) {
          navigate("/subscriptions", { state: { flashMessage: "Subscription created successfully." } });
          return;
        }
        navigate("/orders", { state: { flashMessage: "Successfully order placed." } });
        return;
      } else {
        setFeedback({ type: "error", text: "No order was created. Please check your cart and try again." });
      }
      setShowAddressModal(false);
      setAddressInput("");
    } catch (err) {
      console.error("Subscription error", err);
      setFeedback({ type: "error", text: err?.response?.data?.error || "Failed to place order. Please try again." });
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
        {feedback.text ? (
          <div className={`cart-feedback ${feedback.type === "error" ? "error" : "success"}`}>{feedback.text}</div>
        ) : null}
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

                <div className="address-source-box">
                  <label className="address-source-label">
                    <input
                      type="checkbox"
                      checked={useRegisteredAddress}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setUseRegisteredAddress(checked);
                        if (checked && registeredAddress) {
                          setAddressInput(registeredAddress);
                        }
                      }}
                      disabled={!registeredAddress}
                    />
                    Use my registered address
                  </label>
                  {loadingRegisteredAddress ? (
                    <div className="address-hint">Fetching your registered address...</div>
                  ) : registeredAddress ? (
                    <div className="address-hint">Saved address: {registeredAddress}</div>
                  ) : (
                    <div className="address-hint">No registered address found. Please enter delivery address below.</div>
                  )}
                </div>

              <textarea
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                placeholder="Enter full delivery address, including house/flat no, street, city, pincode"
                rows={5}
                  disabled={useRegisteredAddress && !!registeredAddress}
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
