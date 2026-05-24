import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>
          <img 
            src="https://static.vecteezy.com/system/resources/thumbnails/013/146/831/small/body-builder-lifting-a-dumbbell-png.png" 
            className="logo" 
            alt="PulseFit Logo" 
          />
          PulseFit
        </h2>

        {error && <div className="errors">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Логін" 
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
          <button type="submit" disabled={loading}>
            {loading ? 'Вхід...' : 'Увійти'}
          </button>
        </form>

        <Link to="/register">Створити акаунт</Link>
      </div>
    </div>
  );
}
