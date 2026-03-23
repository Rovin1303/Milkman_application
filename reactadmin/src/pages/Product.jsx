import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Product = () => {
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState({
        name: '',
        price: '',
        category: '',
        description: ''
    });
    const [editingId, setEditingId] = useState(null);
    const [editItem, setEditItem] = useState({
        name: '',
        price: '',
        category: '',
        description: ''
    });

    const loadItems = async () => {
        try {
            const response = await api.get('/product/');
            console.log('product response', response.data);
            setItems(response.data);
        } catch (err) {
            console.error('Error loading products:', err);
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
            await api.post('/product/', newItem);
            setNewItem({ name: '', price: '', category: '', description: '' });
            loadItems();
        } catch (err) {
            console.error('Error adding product:', err);
        }
    };

    const deleteItem = async (id) => {
        try {
            await api.delete(`/product/${id}/`);
            loadItems();
        } catch (err) {
            console.error('Error deleting product:', err);
        }
    };

    const startEdit = (item) => {
        setEditingId(item.id);
        setEditItem({
            name: item.name || '',
            price: item.price || '',
            category: item.category || '',
            description: item.description || ''
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditItem({ name: '', price: '', category: '', description: '' });
    };

    const saveEdit = async (id) => {
        try {
            await api.put(`/product/${id}/`, {
                ...editItem,
                category: Number(editItem.category),
                price: Number(editItem.price)
            });
            cancelEdit();
            loadItems();
        } catch (err) {
            console.error('Error updating product:', err);
        }
    };

    return (
        <div className="admin-page mt-4">
            <h2 className="admin-page-title">Product Management</h2>
            <p className="admin-page-subtitle">Maintain pricing, categories, and product metadata.</p>
            <div className="card mb-4 mt-3 admin-panel">
                <div className="card-body">
                    <h5 className="card-title">Add New Product</h5>
                    <form onSubmit={addItem} className="row g-3 admin-form">
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
                            <label className="form-label admin-form-label">PRICE</label>
                            <input
                                type="number"
                                step="0.01"
                                className="form-control"
                                name="price"
                                value={newItem.price}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label admin-form-label">CATEGORY ID</label>
                            <input
                                type="number"
                                className="form-control"
                                name="category"
                                value={newItem.category}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label admin-form-label">DESCRIPTION</label>
                            <input
                                type="text"
                                className="form-control"
                                name="description"
                                value={newItem.description}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="col-12">
                            <button type="submit" className="btn btn-success admin-action-btn">Add Product</button>
                        </div>
                    </form>
                </div>
            </div>
            <div className="admin-table-wrap">
                <table className="table table-striped table-hover align-middle admin-table">
                    <thead>
                        <tr>
                            <th>NAME</th>
                            <th>PRICE</th>
                            <th>CATEGORY</th>
                            <th>DESCRIPTION</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => (
                            <tr key={item.id}>
                                <td>
                                    {editingId === item.id ? (
                                        <input
                                            type="text"
                                            className="form-control form-control-sm"
                                            value={editItem.name}
                                            onChange={(e) => setEditItem((prev) => ({ ...prev, name: e.target.value }))}
                                        />
                                    ) : (
                                        item.name
                                    )}
                                </td>
                                <td>
                                    {editingId === item.id ? (
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="form-control form-control-sm"
                                            value={editItem.price}
                                            onChange={(e) => setEditItem((prev) => ({ ...prev, price: e.target.value }))}
                                        />
                                    ) : (
                                        `$${parseFloat(item.price).toFixed(2)}`
                                    )}
                                </td>
                                <td>
                                    {editingId === item.id ? (
                                        <input
                                            type="number"
                                            className="form-control form-control-sm"
                                            value={editItem.category}
                                            onChange={(e) => setEditItem((prev) => ({ ...prev, category: e.target.value }))}
                                        />
                                    ) : (
                                        item.category
                                    )}
                                </td>
                                <td>
                                    {editingId === item.id ? (
                                        <input
                                            type="text"
                                            className="form-control form-control-sm"
                                            value={editItem.description}
                                            onChange={(e) => setEditItem((prev) => ({ ...prev, description: e.target.value }))}
                                        />
                                    ) : (
                                        item.description
                                    )}
                                </td>
                                <td className="d-flex gap-2">
                                    {editingId === item.id ? (
                                        <>
                                            <button className="btn btn-primary btn-sm admin-action-btn" onClick={() => saveEdit(item.id)}>Save</button>
                                            <button className="btn btn-secondary btn-sm admin-action-btn" onClick={cancelEdit}>Cancel</button>
                                        </>
                                    ) : (
                                        <>
                                            <button className="btn btn-warning btn-sm admin-action-btn" onClick={() => startEdit(item)}>Edit</button>
                                            <button className="btn btn-danger btn-sm admin-action-btn" onClick={() => deleteItem(item.id)}>Delete</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Product;
