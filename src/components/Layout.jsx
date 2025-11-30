import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaTasks, FaFolder } from 'react-icons/fa';
import ThemeToggle from './ThemeToggle';

const Layout = ({ children }) => {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <header className="layout-header">
                <nav className="main-nav">
                    <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <FaHome /> Dashboard
                    </NavLink>
                    <NavLink to="/tasks" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <FaTasks /> Tasks
                    </NavLink>
                    <NavLink to="/projects" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <FaFolder /> Projects
                    </NavLink>
                </nav>
                <div style={{ pointerEvents: 'auto' }}>
                    <ThemeToggle />
                </div>
            </header>
            <main style={{ flex: 1, paddingTop: '80px' }}>
                {children}
            </main>
        </div>
    );
};

export default Layout;
