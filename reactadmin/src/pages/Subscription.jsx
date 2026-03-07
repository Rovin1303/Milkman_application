import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Subscription = () => {
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState({
        customer: '',
        product: '',
        quantity: ''
    });
    const [customerFilter, setCustomerFilter] = useState('');
    const [onlyActive, setOnlyActive] = useState(true);

    const loadItems = async () => {
        try {
            // backend now responds at /subscription/ (routing fix applied earlier)
            let url = '/subscription/';
            const params = {};
            if (customerFilter) params.customer = customerFilter;
            const response = await api.get(url, { params });
            let data = response.data;
            console.log('subscriptions response', data);
            if (onlyActive) {
                data = data.filter((s) => s.is_active);
            }
            setItems(data);
        } catch (err) {
            console.error('Error loading subscriptions:', err);
        }
    };

    useEffect(() => {
        loadItems();
    }, [customerFilter, onlyActive]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewItem((prev) => ({ ...prev, [name]: value }));
    };

    const addItem = async (e) => {
        e.preventDefault();
        try {
            await api.post('/subscription/subscription/', newItem);
            setNewItem({ customer: '', product: '', quantity: '' });
            loadItems();
        } catch (err) {
            console.error('Error adding subscription:', err);
        }
    };

    const deleteItem = async (id) => {
        try {
            await api.delete(`/subscription/subscription/${id}/`);
            loadItems();
        } catch (err) {
            console.error('Error deleting subscription:', err);
        }
    };

    const total = items.reduce((sum, s) => sum + Number(s.total_price || 0), 0);

    return (
        <div className="admin-page mt-4">
            <h2 className="admin-page-title">Subscription Management</h2>
            <p className="admin-page-subtitle">Track recurring orders and monitor active subscriptions.</p>

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
                <div className="col-md-2 align-self-end">
                    <div className="form-check">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            checked={onlyActive}
                            onChange={(e) => setOnlyActive(e.target.checked)}
                            id="activeOnly"
                        />
                        <label className="form-check-label" htmlFor="activeOnly">
                            Active only
                        </label>
                    </div>
                </div>
            </div>

            <div className="card mb-4 mt-3 admin-panel">
                <div className="card-body">
                    <h5 className="card-title">Add New Subscription</h5>
                    <form onSubmit={addItem} className="row g-3 admin-form">
                        <div className="col-md-3">
                            <label className="form-label admin-form-label">CUSTOMER ID</label>
                            <input
                                type="number"
                                className="form-control"
                                name="customer"
                                value={newItem.customer}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label admin-form-label">PRODUCT ID</label>
                            <input
                                type="number"
                                className="form-control"
                                name="product"
                                value={newItem.product}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label admin-form-label">QUANTITY</label>
                            <input
                                type="number"
                                className="form-control"
                                name="quantity"
                                value={newItem.quantity}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col-12">
                            <button type="submit" className="btn btn-success admin-action-btn">Add Subscription</button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="admin-table-wrap">
                <table className="table table-striped table-hover align-middle admin-table">
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
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => (
                            <tr key={item.id}>
                                <td>{item.customer}</td>
                                <td>{item.product_name || item.product}</td>
                                <td>{item.quantity}</td>
                                <td>{item.interval}</td>
                                <td>{item.duration_months || 1}</td>
                                <td>Rs. {item.total_price || 0}</td>
                                <td>{new Date(item.start_date).toLocaleDateString()}</td>
                                <td>{item.delivery_address || '-'}</td>
                                <td>
                                    <button className="btn btn-danger btn-sm admin-action-btn" onClick={() => deleteItem(item.id)}>Delete</button>
                                </td>
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
