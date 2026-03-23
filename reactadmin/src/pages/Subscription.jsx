import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Subscription = () => {
    const [items, setItems] = useState([]);

    const loadItems = async () => {
        try {
            const response = await api.get('/subscription/');
            let data = response.data;
            data = (data || []).filter((s) => s.is_active);
            setItems(data);
        } catch (err) {
            console.error('Error loading subscriptions:', err);
        }
    };

    useEffect(() => {
        loadItems();
    }, []);

    const total = items.reduce((sum, s) => sum + Number(s.total_price || 0), 0);

    return (
        <div className="admin-page mt-4">
            <h2 className="admin-page-title">Subscription Management</h2>
            <p className="admin-page-subtitle">Showing only active subscriptions.</p>

            <div className="admin-table-wrap">
                <table className="table table-striped table-hover align-middle admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>CUSTOMER ID</th>
                            <th>PRODUCT NAME</th>
                            <th>QUANTITY</th>
                            <th>INTERVAL</th>
                            <th>MONTHS</th>
                            <th>PRICE</th>
                            <th>START DATE</th>
                            <th>ADDRESS</th>
                            <th>ACTIVE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => (
                            <tr key={item.id}>
                                <td>{item.id}</td>
                                <td>{item.customer}</td>
                                <td>{item.product_name || item.product}</td>
                                <td>{item.quantity}</td>
                                <td>{item.interval}</td>
                                <td>{item.duration_months || 1}</td>
                                <td>Rs. {item.total_price || 0}</td>
                                <td>{new Date(item.start_date).toLocaleDateString()}</td>
                                <td>{item.delivery_address || '-'}</td>
                                <td>{item.is_active ? 'Yes' : 'No'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {items.length > 0 && <div className="mt-3"><strong>Total value: Rs. {total.toFixed(2)}</strong></div>}
        </div>
    );
};

export default Subscription;
