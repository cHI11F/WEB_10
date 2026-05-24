import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import useDebounce from '../hooks/useDebounce';
import Loader from '../components/Loader';

export default function DashboardPage() {
  const { user } = useAuth();
  const [memberships, setMemberships] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Фільтри
  const [type, setType] = useState('all');
  const [clientId, setClientId] = useState('all');
  const [startFrom, setStartFrom] = useState('');
  const [endTo, setEndTo] = useState('');

  // Дебаунс для дат, щоб не спамити API під час вибору в календарі
  const debouncedStartFrom = useDebounce(startFrom, 300);
  const debouncedEndTo = useDebounce(endTo, 300);

  // Отримання клієнтів для фільтру
  const fetchClients = async () => {
    try {
      const response = await api.get('/clients/index');
      setClients(response.data);
    } catch (err) {
      console.error('Помилка завантаження списку клієнтів', err);
    }
  };

  // Отримання абонементів
  const fetchMemberships = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/memberships', {
        params: {
          type,
          client_id: clientId,
          start_from: debouncedStartFrom,
          end_to: debouncedEndTo
        }
      });
      setMemberships(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Помилка завантаження абонементів');
    } finally {
      setLoading(false);
    }
  }, [type, clientId, debouncedStartFrom, debouncedEndTo]);

  // Завантажити клієнтів один раз при старті
  useEffect(() => {
    fetchClients();
  }, []);

  // Перевантажувати абонементи при зміні фільтрів
  useEffect(() => {
    fetchMemberships();
  }, [fetchMemberships]);

  const handleDelete = async (id) => {
    if (!window.confirm('Видалити абонемент?')) return;

    try {
      await api.delete('/memberships', {
        data: { membership_id: id }
      });
      // Оновити список
      fetchMemberships();
    } catch (err) {
      alert(err.response?.data?.error || 'Помилка при видаленні абонемента');
    }
  };

  return (
    <div className="container">
      <h1>Абонементи</h1>

      {error && <div className="errors">{error}</div>}

      <div className="filter">
        <label>Тип:
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="all">Всі</option>
            <option value="Стандарт">Стандарт</option>
            <option value="Преміум">Преміум 👑</option>
            <option value="Базовий">Базовий</option>
          </select>
        </label>

        <label>Клієнт:
          <select value={clientId} onChange={(e) => setClientId(e.target.value)}>
            <option value="all">Всі</option>
            {clients.map(c => (
              <option key={c.client_id} value={c.client_id}>
                {c.full_name}
              </option>
            ))}
          </select>
        </label>

        <label>Початок з:
          <input 
            type="date" 
            value={startFrom} 
            onChange={(e) => setStartFrom(e.target.value)} 
          />
        </label>

        <label>Кінець до:
          <input 
            type="date" 
            value={endTo} 
            onChange={(e) => setEndTo(e.target.value)} 
          />
        </label>

        <button onClick={fetchMemberships}>Оновити</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '30px' }}>Завантаження абонементів...</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Клієнт</th>
              <th>Тип</th>
              <th>Початок</th>
              <th>Кінець</th>
              <th>Сума</th>
              {user?.role === 'admin' && <th>Дії</th>}
            </tr>
          </thead>
          <tbody>
            {memberships.map((m) => {
              let badgeCls = 'badge-blue';
              let typeDisplay = m.type;
              if (m.type === 'Преміум') {
                badgeCls = 'badge-green';
                typeDisplay = 'Преміум 👑';
              } else if (m.type === 'Базовий') {
                badgeCls = 'badge-yellow';
              }

              return (
                <tr key={m.membership_id}>
                  <td>{m.membership_id}</td>
                  <td>{m.client_name}</td>
                  <td>
                    <span className={`badge ${badgeCls}`}>{typeDisplay}</span>
                  </td>
                  <td>{m.start_date}</td>
                  <td>{m.end_date}</td>
                  <td>{m.price} грн</td>
                  {user?.role === 'admin' && (
                    <td>
                      <Link 
                        to={`/memberships/edit/${m.membership_id}`} 
                        className="action-btn details-btn"
                      >
                        Редагувати
                      </Link>
                      <button 
                        onClick={() => handleDelete(m.membership_id)} 
                        className="action-btn delete-btn"
                      >
                        ✖
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
            {memberships.length === 0 && (
              <tr>
                <td colSpan={user?.role === 'admin' ? 7 : 6} style={{ textAlign: 'center' }}>
                  Абонементів не знайдено за вказаними фільтрами.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
