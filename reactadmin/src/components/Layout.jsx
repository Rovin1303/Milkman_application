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
            <nav className="navbar navbar-expand-lg admin-navbar fixed-top">
                <div className="container">
                    <Link className="navbar-brand admin-brand" to="/">Milkman Admin</Link>
                    <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center w-100 gap-2">
                        <ul className="navbar-nav me-auto">
                            <li className="nav-item"><NavLink className="nav-link admin-nav-item" to="/staff">Staff</NavLink></li>
                            <li className="nav-item"><NavLink className="nav-link admin-nav-item" to="/customer">Customers</NavLink></li>
                            <li className="nav-item"><NavLink className="nav-link admin-nav-item" to="/category">Categories</NavLink></li>
                            <li className="nav-item"><NavLink className="nav-link admin-nav-item" to="/product">Products</NavLink></li>
                            <li className="nav-item"><NavLink className="nav-link admin-nav-item" to="/subscription">Subscriptions</NavLink></li>
                        </ul>
                        <ul className="navbar-nav ms-auto">
                            <li className="nav-item">
                                <span className="admin-user-chip">Welcome, {user.email}</span>
                            </li>
                            <li className="nav-item">
                                <button className="btn btn-link nav-link admin-logout-btn" onClick={handleLogout}>Logout</button>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
            <div className="container admin-content">
                {children}
            </div>
        </div>
    );
};

export default Layout;
