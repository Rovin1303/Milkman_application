import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

const Layout = ({ children }) => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('staffUser') || '{}');
    const isLoggedIn = !!localStorage.getItem('staffToken');

    const handleLogout = () => {
        localStorage.removeItem('staffToken');
        localStorage.removeItem('staffUser');
        navigate('/login');
    };

    if (!isLoggedIn) return <>{children}</>;

    return (
        <div className="admin-shell">
            <nav className="admin-navbar fixed-top">
                <div className="container-fluid admin-topbar-inner px-4">
                    <div className="admin-brand-stack">
                        <Link className="admin-brand" to="/">Milkman Admin</Link>
                        <span className="admin-brand-sub">Operations Console</span>
                    </div>

                    <div className="admin-nav-zone">
                        <ul className="admin-menu">
                            <li><NavLink className="admin-nav-item" to="/staff">Staff</NavLink></li>
                            <li><NavLink className="admin-nav-item" to="/customer">Customers</NavLink></li>
                            <li><NavLink className="admin-nav-item" to="/category">Categories</NavLink></li>
                            <li><NavLink className="admin-nav-item" to="/product">Products</NavLink></li>
                            <li><NavLink className="admin-nav-item" to="/subscription">Subscriptions</NavLink></li>
                            <li><NavLink className="admin-nav-item" to="/orders">Orders</NavLink></li>
                        </ul>

                        <div className="admin-profile-zone">
                            <span className="admin-user-chip">{user.email}</span>
                            <button className="admin-logout-btn" onClick={handleLogout}>Logout</button>
                        </div>
                    </div>
                </div>
            </nav>
            <div className="container-fluid admin-content px-4">
                <div className="admin-content-frame">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Layout;
