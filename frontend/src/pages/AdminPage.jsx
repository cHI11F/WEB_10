import React, { useState, useEffect } from 'react';
import api from '../api/axios';

export default function AdminPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Статистика для адміна
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Форма створення співробітника
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('trainer');

  // Режим редагування
  const [editingUser, setEditingUser] = useState(null); // Якщо не null, то об'єкт користувача, якого редагуємо
  const [editFullName, setEditFullName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState('trainer');

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const response = await api.get('/staff');
      setStaff(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Помилка завантаження персоналу');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Помилка завантаження статистики:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStaff();
    fetchStats();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('/staff', {
        full_name: fullName,
        username,
        password,
        role
      });
      setSuccess('Співробітника успішно додано!');
      // Очищення форми
      setFullName('');
      setUsername('');
      setPassword('');
      setRole('trainer');
      fetchStaff();
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.error || 'Помилка додавання співробітника');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цього співробітника?')) return;
    setError('');
    setSuccess('');

    try {
      await api.delete('/staff', {
        data: { user_id: id }
      });
      setSuccess('Співробітника видалено!');
      fetchStaff();
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.error || 'Помилка видалення співробітника');
    }
  };

  const startEdit = (user) => {
    setEditingUser(user);
    setEditFullName(user.full_name || '');
    setEditUsername(user.username || '');
    setEditPassword('');
    setEditRole(user.role || 'trainer');
    // Scroll to edit section
    setTimeout(() => {
      document.getElementById('edit-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.put('/staff', {
        user_id: editingUser.user_id,
        full_name: editFullName,
        username: editUsername,
        password: editPassword || undefined, // Якщо порожній, не оновлювати
        role: editRole
      });
      setSuccess('Дані співробітника успішно оновлено!');
      setEditingUser(null);
      fetchStaff();
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.error || 'Помилка оновлення співробітника');
    }
  };

  return (
    <div className="container">
      <h1>Адмінка персоналу та Аналітика</h1>

      {error && <div className="errors">{error}</div>}
      {success && <div className="success">{success}</div>}

      {/* Панель аналітики для адміна */}
      {!loadingStats && stats && (
        <>
          <div className="admin-stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.total_revenue?.toLocaleString() || 0} грн</div>
              <div className="stat-label">Загальний дохід</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.active_memberships || 0}</div>
              <div className="stat-label">Активні абонементи</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.total_clients || 0}</div>
              <div className="stat-label">Клієнтів у базі</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.total_staff || 0}</div>
              <div className="stat-label">Співробітники</div>
            </div>
          </div>

          {stats.types_distribution && stats.types_distribution.length > 0 && (
            <div className="section" style={{ marginBottom: '25px' }}>
              <h2 style={{ fontSize: '18px', margin: '0 0 10px 0' }}>Розподіл абонементів за типами</h2>
              <div className="distribution-list">
                {stats.types_distribution.map((item, idx) => (
                  <div key={idx} className="distribution-item">
                    <span className="badge badge-blue">{item.type}</span>
                    <span>{item.count} шт.</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div className="section">
        <h2>Співробітники</h2>
        {loading ? (
          <div>Завантаження...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Логін</th>
                <th>ПІБ</th>
                <th>Роль</th>
                <th>Дії</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.user_id}>
                  <td>{s.user_id}</td>
                  <td>{s.username}</td>
                  <td>{s.full_name}</td>
                  <td>{s.role}</td>
                  <td>
                    <button 
                      onClick={() => startEdit(s)} 
                      className="action-btn details-btn"
                      style={{ border: 'none' }}
                    >
                      Редагувати
                    </button>
                    <button 
                      onClick={() => handleDelete(s.user_id)} 
                      className="action-btn delete-btn"
                    >
                      Видалити
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editingUser ? (
        <div className="section" id="edit-section" style={{ border: '2px solid #1877f2' }}>
          <h2>Редагування співробітника (ID: {editingUser.user_id})</h2>
          <form onSubmit={handleUpdate}>
            <input 
              type="text" 
              placeholder="Повне ім'я" 
              value={editFullName}
              onChange={(e) => setEditFullName(e.target.value)}
              required
            />
            <input 
              type="text" 
              placeholder="Логін" 
              value={editUsername}
              onChange={(e) => setEditUsername(e.target.value)}
              required
            />
            <input 
              type="password" 
              placeholder="Новий пароль (залиште порожнім, щоб не змінювати)" 
              value={editPassword}
              onChange={(e) => setEditPassword(e.target.value)}
            />
            <select 
              value={editRole} 
              onChange={(e) => setEditRole(e.target.value)} 
              required
            >
              <option value="trainer">Тренер</option>
              <option value="admin">Адмін</option>
            </select>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="submit" style={{ flex: 1, padding: '10px', background: '#1877f2', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
                Зберегти зміни
              </button>
              <button 
                type="button" 
                onClick={() => setEditingUser(null)} 
                style={{ flex: 1, padding: '10px', background: '#ccc', color: '#333', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Скасувати
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="section">
          <h2>Додати нового співробітника</h2>
          <form onSubmit={handleCreate}>
            <input 
              type="text" 
              placeholder="Повне ім'я" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <input 
              type="text" 
              placeholder="Логін" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input 
              type="password" 
              placeholder="Пароль" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)} 
              required
            >
              <option value="trainer">Тренер</option>
              <option value="admin">Адмін</option>
            </select>
            <button 
              type="submit" 
              style={{ padding: '10px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}
            >
              Додати співробітника
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
