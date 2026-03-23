import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import CustomerNavbar from "../components/CustomerNavbar";
import "./Orders.css";

function Orders() {
  const navigate = useNavigate();
  const location = useLocation();
  const [subs, setSubs] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flashMessage, setFlashMessage] = useState(location.state?.flashMessage || "");

  const fetchOrdersData = async () => {
    const customerId = localStorage.getItem("customer_id");
    if (!customerId) {
      setLoading(false);
      return;
    }
    try {
      const [subsRes, ordersRes] = await Promise.all([
        api.get("subscription/", { params: { customer: customerId } }),
        api.get("orders/", { params: { customer: customerId } }),
      ]);
      setSubs(subsRes.data || []);
      setOrders(ordersRes.data || []);
    } catch (err) {
      console.error("Orders fetch error", err);
      setSubs([]);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("customer_token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchOrdersData();
  }, [navigate]);

  useEffect(() => {
    if (!flashMessage) return;
    const timer = setTimeout(() => setFlashMessage(""), 3500);
    return () => clearTimeout(timer);
  }, [flashMessage]);

  const isMilk = (sub) => /\bmilk\b/i.test(sub.product_name || "");

  const activeMilkSubs = useMemo(
    () => subs.filter((s) => isMilk(s) && s.interval === "monthly" && s.is_active && !s.is_paused),
    [subs]
  );

  const latestOrder = useMemo(() => (orders.length > 0 ? orders[0] : null), [orders]);

  const getNextDayMilkBill = (sub) => {
    const qty = Number(sub.quantity || 1);
    const days = (Number(sub.duration_months) || 1) * 30;
    const total = Number(sub.total_price || 0);
    const perPacketPerDay = qty > 0 && days > 0 ? total / (qty * days) : Number(sub.product_price || 0);
    return {
      qty,
      perPacketPerDay,
      nextDayPayable: perPacketPerDay * qty,
    };
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowLabel = tomorrow.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  const formatCurrency = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;
  const formatDate = (value) => new Date(value).toLocaleDateString("en-IN");

  const nextDayMilkTotal = activeMilkSubs.reduce((sum, sub) => sum + getNextDayMilkBill(sub).nextDayPayable, 0);
  const currentOrdersTotal = Number(latestOrder?.total_amount || 0);

  return (
    <div className="orders-page">
      <CustomerNavbar />
      <div className="container">
        <h2>Your Orders</h2>
        <p className="orders-note">Upcoming subscription delivery and your latest one-time order are shown separately.</p>

        {flashMessage ? <div className="order-success-box">{flashMessage}</div> : null}

        {loading ? <p>Loading orders...</p> : null}

        {!loading && activeMilkSubs.length > 0 ? (
          <section className="orders-section">
            <h3>Upcoming Subscription Delivery ({tomorrowLabel})</h3>
            <div className="table-wrapper">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>SUBSCRIPTION ID</th>
                    <th>PRODUCT</th>
                    <th>QTY</th>
                    <th>RATE / PACKET</th>
                    <th>NEXT DAY PAYABLE</th>
                  </tr>
                </thead>
                <tbody>
                  {activeMilkSubs.map((sub) => {
                    const bill = getNextDayMilkBill(sub);
                    return (
                      <tr key={sub.id}>
                        <td>SUB-{sub.id}</td>
                        <td>{sub.product_name}</td>
                        <td>{bill.qty}</td>
                        <td>{formatCurrency(bill.perPacketPerDay)}</td>
                        <td>{formatCurrency(bill.nextDayPayable)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="orange-total-box">
              <strong>Next day milk total: {formatCurrency(nextDayMilkTotal)}</strong>
            </div>
          </section>
        ) : null}

        {!loading ? (
          <section className="orders-section">
            <h3>Latest One-Time Order</h3>
            {!latestOrder ? (
              <p className="orders-note">No one-time order available.</p>
            ) : (
              <div className="current-orders-box order-highlight">
                <div className="order-meta">
                  <span><strong>Order ID:</strong> {latestOrder.order_code}</span>
                  <span><strong>Date:</strong> {formatDate(latestOrder.created_at)}</span>
                  <span><strong>Address:</strong> {latestOrder.delivery_address || "-"}</span>
                </div>
                <div className="table-wrapper">
                  <table className="orders-table">
                    <thead>
                      <tr>
                        <th>PRODUCT</th>
                        <th>QTY</th>
                        <th>LINE TOTAL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(latestOrder.items || []).map((item) => (
                        <tr key={item.id}>
                          <td>{item.product_name}</td>
                          <td>{item.quantity}</td>
                          <td>{formatCurrency(item.line_total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="orange-total-box">
                  <strong>Current order total: {formatCurrency(currentOrdersTotal)}</strong>
                </div>
              </div>
            )}

          </section>
        ) : null}
      </div>
    </div>
  );
}

export default Orders;
