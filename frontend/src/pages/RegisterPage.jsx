import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const result = await register(username, password, role);
    setLoading(false);

    if (result.success) {
      setSuccess('Реєстрація успішна! Перенаправлення на сторінку входу...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Реєстрація</h2>

        {error && <div className="errors">{error}</div>}
        {success && <div className="success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Ім'я користувача" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required 
            disabled={loading}
          />
          <input 
            type="password" 
            placeholder="Пароль" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
            disabled={loading}
          />
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            disabled={loading}
          >
            <option value="client">Клієнт</option>
            <option value="trainer">Тренер</option>
            <option value="admin">Адмін</option>
          </select>
          <button type="submit" disabled={loading}>
            {loading ? 'Реєстрація...' : 'Зареєструватися'}
          </button>
        </form>

        <Link to="/login">Увійти</Link>
      </div>
    </div>
  );
}
