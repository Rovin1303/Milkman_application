import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Subscriptions.css";

function Subscriptions() {
  const navigate = useNavigate();
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [customerName, setCustomerName] = useState("");

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
      setSubs(res.data || []);
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
      fetchSubs();
    } catch (err) {
      console.error("Pause/resume error", err);
    }
  };

  const isMilkSubscription = (sub) => /\bmilk\b/i.test(sub.product_name || "");

  useEffect(() => {
    const token = localStorage.getItem("customer_token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchSubs();
  }, []);

  const total = subs.reduce((sum, s) => sum + Number(s.total_price || 0), 0);

  const custId = localStorage.getItem("customer_id");
  return (
    <div className="subscriptions-page">
      <div className="container">
        <h2>Subscriptions of {customerName || "Customer"}</h2>
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
                      <td>Rs. {s.total_price || s.product_price || 0}</td>
                      <td>{new Date(s.start_date).toLocaleDateString("en-IN")}</td>
                      <td>{s.delivery_address || "-"}</td>
                      <td>{s.is_paused ? "Paused" : s.is_active ? "Active" : "Inactive"}</td>
                      <td className="action-cell">
                        {isMilkSubscription(s) ? (
                          <button
                            className="delete-btn"
                            onClick={() => togglePause(s)}
                            title={s.is_paused ? "Resume this subscription" : "Pause this subscription"}
                          >
                            {s.is_paused ? "Resume" : "Pause"}
                          </button>
                        ) : (
                          <button className="delete-btn" disabled title="Pause/Resume is for milk products only">
                            N/A
                          </button>
                        )}
                        <button
                          className="delete-btn"
                          onClick={() => deleteSub(s)}
                          title="Delete this subscription"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
