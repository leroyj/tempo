import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import './Layout.css';

const Layout: React.FC = () => {
  const { user, logout, isManager, isAdmin } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="layout-header-content">
          <h1 className="layout-title">Tempo</h1>
          <nav className="layout-nav">
            <Link to="/timesheet">Saisie</Link>
            {isManager() && <Link to="/dashboard">Tableau de bord</Link>}
            {isAdmin() && <Link to="/admin">Configuration</Link>}
            {isManager() && <Link to="/export">Export</Link>}
          </nav>
          <div className="layout-user">
            <span>{user?.firstName} {user?.lastName}</span>
            <button onClick={handleLogout} className="btn-logout">
              Déconnexion
            </button>
          </div>
        </div>
      </header>
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

