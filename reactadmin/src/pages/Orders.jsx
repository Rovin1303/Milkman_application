import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Orders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [customerFilter, setCustomerFilter] = useState('');

    useEffect(() => {
        let isMounted = true;

        const fetchOrders = async () => {
            try {
                const params = {};
                if (customerFilter) params.customer = customerFilter;
                const response = await api.get('/orders/', { params });
                if (isMounted) setOrders(response.data || []);
            } catch (err) {
                console.error('Error loading orders:', err);
                if (isMounted) setOrders([]);
            }
        };

        fetchOrders();
        return () => {
            isMounted = false;
        };
    }, [customerFilter]);

    const grandTotal = orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);

    return (
        <div className="admin-page mt-4">
            <button className="btn btn-outline-secondary btn-sm mb-3" onClick={() => navigate(-1)}>Back</button>
            <h2 className="admin-page-title">Orders Management</h2>
            <p className="admin-page-subtitle">Track all one-time orders in table format.</p>

            <div className="mb-3 row admin-form">
                <div className="col-md-3">
                    <label className="form-label admin-form-label">FILTER BY CUSTOMER ID</label>
                    <input
                        type="text"
                        className="form-control"
                        value={customerFilter}
                        onChange={(e) => setCustomerFilter(e.target.value)}
                        placeholder="(leave blank for all)"
                    />
                </div>
            </div>

            <div className="admin-card mb-4 mt-3 admin-panel">
                {orders.length === 0 ? (
                    <p className="mb-0">No orders found.</p>
                ) : (
                    <>
                        <div className="admin-table-wrap">
                            <table className="table table-striped table-hover align-middle admin-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>ORDER ID</th>
                                        <th>CUSTOMER ID</th>
                                        <th>DATE</th>
                                        <th>DELIVERY ADDRESS</th>
                                        <th>ITEMS</th>
                                        <th>TOTAL</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order, index) => (
                                        <tr key={order.id}>
                                            <td>{index + 1}</td>
                                            <td>{order.order_code}</td>
                                            <td>{order.customer}</td>
                                            <td>{new Date(order.created_at).toLocaleDateString('en-IN')}</td>
                                            <td>{order.delivery_address || '-'}</td>
                                            <td>
                                                {(order.items || []).map((item) => (
                                                    <div key={item.id}>
                                                        {item.product_name} x {item.quantity} (Rs. {Number(item.line_total || 0).toFixed(2)})
                                                    </div>
                                                ))}
                                            </td>
                                            <td>Rs. {Number(order.total_amount || 0).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-2"><strong>Grand total: Rs. {grandTotal.toFixed(2)}</strong></div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Orders;
