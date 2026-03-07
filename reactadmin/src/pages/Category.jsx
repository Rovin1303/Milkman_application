import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Category = () => {
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState({
        name: '',
        description: ''
    });

    const loadItems = async () => {
        try {
            const response = await api.get('/category/');
            console.log('category response', response.data);
            setItems(response.data);
        } catch (err) {
            console.error('Error loading categories:', err);
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
            await api.post('/category/', newItem);
            setNewItem({ name: '', description: '' });
            loadItems();
        } catch (err) {
            console.error('Error adding category:', err);
        }
    };

    const deleteItem = async (id) => {
        try {
            await api.delete(`/category/${id}/`);
            loadItems();
        } catch (err) {
            console.error('Error deleting category:', err);
        }
    };

    return (
        <div className="admin-page mt-4">
            <h2 className="admin-page-title">Category Management</h2>
            <p className="admin-page-subtitle">Organize your catalog with clear product categories.</p>
            <div className="card mb-4 mt-3 admin-panel">
                <div className="card-body">
                    <h5 className="card-title">Add New Category</h5>
                    <form onSubmit={addItem} className="row g-3 admin-form">
                        <div className="col-md-6">
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
                        <div className="col-md-6">
                            <label className="form-label admin-form-label">DESCRIPTION</label>
                            <input
                                type="text"
                                className="form-control"
                                name="description"
                                value={newItem.description}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col-12">
                            <button type="submit" className="btn btn-success admin-action-btn">Add Category</button>
                        </div>
                    </form>
                </div>
            </div>
            <div className="admin-table-wrap">
                <table className="table table-striped table-hover align-middle admin-table">
                    <thead>
                        <tr>
                            <th>NAME</th>
                            <th>DESCRIPTION</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => (
                            <tr key={item.id}>
                                <td>{item.name}</td>
                                <td>{item.description}</td>
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

export default Category;
