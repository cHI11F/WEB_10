import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="logo-container">
        <Link to="/dashboard">
          <img src="https://static.vecteezy.com/system/resources/thumbnails/013/146/831/small/body-builder-lifting-a-dumbbell-png.png" alt="Logo" />
          PulseFit
        </Link>
      </div>
      <div className="user-info">
        <div className="user-card">
          {user.username}
          <span className="role">{user.role}</span>
        </div>
        <div className="user-actions">
          {user.role === 'admin' && (
            <>
              <Link to="/memberships/new" className="add-btn">Новий Абонемент</Link>
              <Link to="/admin" className="admin-btn">Адмінка</Link>
            </>
          )}
          <button onClick={handleLogout} className="logout-btn">Вихід</button>
        </div>
      </div>
    </nav>
  );
}
