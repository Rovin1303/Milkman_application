import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Staff = () => {
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState({
        email: '',
        password: '',
        name: '',
        phone: '',
        address: ''
    });

    const loadItems = async () => {
        try {
            const response = await api.get('/staff/staff/');
            console.log('staff response', response.data);
            setItems(response.data);
        } catch (err) {
            console.error('Error loading staff:', err);
        }
    };

    useEffect(() => {
        loadItems();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewItem(prev => ({ ...prev, [name]: value }));
    };

    const addItem = async (e) => {
        e.preventDefault();
        try {
            await api.post('/staff/staff/', newItem);
            setNewItem({ email: '', password: '', name: '', phone: '', address: '' });
            loadItems();
        } catch (err) {
            console.error('Error adding staff:', err);
        }
    };

    const deleteItem = async (id) => {
        try {
            await api.delete(`/staff/staff/${id}/`);
            loadItems();
        } catch (err) {
            console.error('Error deleting staff:', err);
        }
    };

    return (
        <div className="admin-page mt-4">
            <h2 className="admin-page-title">Staff Management</h2>
            <p className="admin-page-subtitle">Manage staff access and contact details.</p>
            <div className="card mb-4 mt-3 admin-panel">
                <div className="card-body">
                    <h5 className="card-title">Add New Staff</h5>
                    <form onSubmit={addItem} className="row g-3 admin-form">
                        <div className="col-md-3">
                            <label className="form-label admin-form-label">EMAIL</label>
                            <input
                                type="email"
                                className="form-control"
                                name="email"
                                value={newItem.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label admin-form-label">PASSWORD</label>
                            <input
                                type="password"
                                className="form-control"
                                name="password"
                                value={newItem.password}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label admin-form-label">NAME</label>
                            <input
                                type="text"
                                className="form-control"
                                name="name"
                                value={newItem.name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label admin-form-label">PHONE</label>
                            <input
                                type="text"
                                className="form-control"
                                name="phone"
                                value={newItem.phone}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label admin-form-label">ADDRESS</label>
                            <input
                                type="text"
                                className="form-control"
                                name="address"
                                value={newItem.address}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col-12">
                            <button type="submit" className="btn btn-success admin-action-btn">Add Staff</button>
                        </div>
                    </form>
                </div>
            </div>
            <div className="admin-table-wrap">
                <table className="table table-striped table-hover align-middle admin-table">
                    <thead>
                        <tr>
                            <th>EMAIL</th>
                            <th>NAME</th>
                            <th>PHONE</th>
                            <th>ADDRESS</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => (
                            <tr key={item.id}>
                                <td>{item.email}</td>
                                <td>{item.name}</td>
                                <td>{item.phone}</td>
                                <td>{item.address}</td>
                                <td>
                                    <button className="btn btn-danger btn-sm admin-action-btn" onClick={() => deleteItem(item.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Staff;
