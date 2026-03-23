import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import CustomerNavbar from "../components/CustomerNavbar";
import "./Subscriptions.css";

function Subscriptions() {
  const navigate = useNavigate();
  const location = useLocation();
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [feedback, setFeedback] = useState(location.state?.flashMessage || "");

  const fetchSubs = async () => {
    setLoading(true);
    setErrorMessage("");
    const customerId = localStorage.getItem("customer_id");
    const custName = localStorage.getItem("customer_name");
    setCustomerName(custName || "");
    console.log("fetchSubs customer id:", customerId);
    if (!customerId) {
      console.log("No customer ID found");
      setLoading(false);
      return;
    }
    try {
      console.log("Fetching subscriptions for customer:", customerId);
      const res = await api.get("subscription/", { params: { customer: customerId } });
      console.log("subs response:", res.data);
      console.log("Number of subscriptions:", res.data?.length);
      const monthlyMilkSubs = (res.data || []).filter(
        (sub) => /\bmilk\b/i.test(sub.product_name || "") && sub.interval === "monthly"
      );
      setSubs(monthlyMilkSubs);
    } catch (err) {
      console.error("Subscription fetch error:", err.message);
      console.error("Full error:", err);
      setErrorMessage("Could not load subscriptions. Please ensure backend server is running on port 8000 and try again.");
      if (err.response) {
        console.error("Response status:", err.response.status);
        console.error("Response data:", err.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteSub = async (sub) => {
    if (!window.confirm(`Are you sure you want to delete ${sub.product_name}?`)) {
      return;
    }
    try {
      await api.delete(`subscription/${sub.id}/`);
      fetchSubs();
    } catch (err) {
      console.error("Delete error", err);
    }
  };

  const togglePause = async (sub) => {
    try {
      await api.patch(`subscription/${sub.id}/`, {
        is_paused: !sub.is_paused,
        is_active: sub.is_paused,
      });
      setFeedback(sub.is_paused ? "Subscription resumed. Next delivery starts from tomorrow." : "Subscription paused.");
      fetchSubs();
    } catch (err) {
      console.error("Pause/resume error", err);
    }
  };

  const isMilkSubscription = (sub) => /\bmilk\b/i.test(sub.product_name || "");

  const getPayableAmount = (sub) => {
    return Number(sub.total_price || sub.product_price || 0);
  };

  const formatDate = (value) => {
    const d = new Date(value);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const toDateOnly = (value) => {
    const d = new Date(value);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  };

  const getDaysUntilEnd = (sub) => {
    const end = toDateOnly(sub.end_date);
    const today = toDateOnly(new Date());
    return Math.floor((end - today) / (1000 * 60 * 60 * 24));
  };

  const getRenewalMessage = (sub) => {
    const days = getDaysUntilEnd(sub);
    if (days < 0) return "Subscription ended. Renew now.";
    if (days === 0) return "Subscription ending today. Renew now.";
    if (days <= 2) return `Subscription ending in ${days} day(s).`;
    return "";
  };

  const getMilkBilling = (sub) => {
    const start = toDateOnly(sub.start_date);
    const end = toDateOnly(sub.end_date);
    const days = Math.max(Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1, 1);
    const qty = Number(sub.quantity || 1);
    const total = Number(sub.total_price || 0);
    const perPacketPerDay = qty > 0 && days > 0 ? total / (qty * days) : Number(sub.product_price || 0);
    return {
      qty,
      days,
      perPacketPerDay,
      total,
    };
  };

  useEffect(() => {
    const token = localStorage.getItem("customer_token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchSubs();
  }, [navigate]);

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(""), 3500);
    return () => clearTimeout(timer);
  }, [feedback]);

  const total = subs.reduce((sum, s) => sum + getPayableAmount(s), 0);

  const custId = localStorage.getItem("customer_id");
  return (
    <div className="subscriptions-page">
      <CustomerNavbar />
      <div className="container">
        <h2>Subscriptions of {customerName || "Customer"}</h2>
        {feedback ? <div className="sub-success-box">{feedback}</div> : null}
        {loading ? (
          <p>Loading...</p>
        ) : errorMessage ? (
          <p>{errorMessage}</p>
        ) : subs.length === 0 ? (
          <p>No active subscriptions</p>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="subscriptions-table">
                <thead>
                  <tr>
                    <th>CUSTOMER ID</th>
                    <th>PRODUCT NAME</th>
                    <th>QUANTITY</th>
                    <th>INTERVAL</th>
                    <th>MONTHS</th>
                    <th>PRICE</th>
                    <th>START DATE</th>
                    <th>END DATE</th>
                    <th>ADDRESS</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {subs.map((s) => (
                    <tr key={s.id}>
                      <td>{custId}</td>
                      <td>{s.product_name}</td>
                      <td>{s.quantity}</td>
                      <td>{s.interval}</td>
                      <td>{s.duration_months || 1}</td>
                      <td>Rs. {getPayableAmount(s)}</td>
                      <td>{formatDate(s.start_date)}</td>
                      <td>{formatDate(s.end_date)}</td>
                      <td>{s.delivery_address || "-"}</td>
                      <td>
                        {s.is_paused ? "Paused" : s.is_active ? "Active" : "Inactive"}
                        {getRenewalMessage(s) ? <div className="renew-warning">{getRenewalMessage(s)}</div> : null}
                      </td>
                      <td className="action-cell">
                        {isMilkSubscription(s) ? (
                          <button
                            className="delete-btn"
                            onClick={() => togglePause(s)}
                            title={s.is_paused ? "Resume this subscription" : "Pause this subscription"}
                          >
                            {s.is_paused ? "Resume" : "Pause"}
                          </button>
                        ) : null}
                        <button
                          className="delete-btn"
                          onClick={() => deleteSub(s)}
                          title="Delete this subscription"
                        >
                          Delete
                        </button>
                        {getDaysUntilEnd(s) <= 0 ? (
                          <button className="delete-btn" onClick={() => navigate("/cart")} title="Renew this subscription">
                            Renew
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {subs.filter((s) => isMilkSubscription(s)).map((s) => {
              const bill = getMilkBilling(s);
              return (
                <div className="milk-bill-card" key={`milk-bill-${s.id}`}>
                  <h3>{s.product_name} subscription bill</h3>
                  <p>
                    Subscribed from {formatDate(s.start_date)} to {formatDate(s.end_date)} ({bill.days} days)
                  </p>
                  <p>
                    Rs. {bill.perPacketPerDay.toFixed(2)} per packet x {bill.qty} packet(s) x {bill.days} days
                  </p>
                  <strong>Total amount: Rs. {bill.total.toFixed(2)}</strong>
                </div>
              );
            })}

            <div className="total-section">
              <strong>Total value: Rs. {total.toFixed(2)}</strong>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Subscriptions;
