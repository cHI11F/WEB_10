import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function MembershipForm() {
  const { id } = useParams(); // Отримуємо ID, якщо ми редагуємо
  const isEdit = !!id;
  const navigate = useNavigate();

  // Стейт форми
  const [clientId, setClientId] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [isNewClient, setIsNewClient] = useState(false);
  const [type, setType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [price, setPrice] = useState('');

  const [clients, setClients] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Завантаження клієнтів для списку
  const loadClients = async () => {
    try {
      const response = await api.get('/clients/index');
      setClients(response.data);
    } catch (err) {
      console.error('Помилка завантаження клієнтів', err);
    }
  };

  // Завантаження даних абонемента для редагування
  useEffect(() => {
    loadClients();

    if (isEdit) {
      const loadMembership = async () => {
        try {
          // Отримуємо звичайний список і знаходимо наш абонемент (або можна розробити окремий GET view, але оскільки у нас є загальний GET фільтр, ми можемо завантажити його звідти або зробити запит)
          // Завантажуємо список абонементів і шукаємо за ID
          const response = await api.get('/memberships');
          const found = response.data.find(m => m.membership_id === parseInt(id));
          if (found) {
            setClientId(found.client_id || '');
            setType(found.type || '');
            setStartDate(found.start_date || '');
            setEndDate(found.end_date || '');
            setPrice(found.price || '');
          } else {
            setError('Абонемент не знайдено.');
          }
        } catch (err) {
          setError('Помилка при завантаженні даних абонемента.');
        }
      };
      loadMembership();
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const payload = {
      membership_id: id ? parseInt(id) : undefined,
      client_id: isNewClient ? '' : clientId,
      new_client: isNewClient ? newClientName : '',
      type,
      start_date: startDate,
      end_date: endDate,
      price: parseInt(price)
    };

    try {
      if (isEdit) {
        await api.put('/memberships', payload);
        setSuccess('Абонемент успішно оновлено!');
      } else {
        await api.post('/memberships', payload);
        setSuccess('Абонемент успішно додано!');
      }

      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Помилка при збереженні абонемента.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>{isEdit ? 'Редагувати абонемент' : 'Додати абонемент'}</h2>

      {error && <div className="errors">{error}</div>}
      {success && <div className="success">{success}</div>}

      <form onSubmit={handleSubmit}>
        {!isEdit && (
          <div style={{ marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={isNewClient} 
                onChange={(e) => setIsNewClient(e.target.checked)} 
                style={{ width: 'auto', marginTop: 0 }}
              />
              Новий клієнт (створити в базі)
            </label>
          </div>
        )}

        {isNewClient ? (
          <label>Ім'я нового клієнта:
            <input 
              type="text" 
              placeholder="Введіть повне ім'я" 
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              required
              disabled={loading}
            />
          </label>
        ) : (
          <label>Оберіть клієнта:
            <select 
              value={clientId} 
              onChange={(e) => setClientId(e.target.value)} 
              required
              disabled={loading}
            >
              <option value="">-- оберіть клієнта --</option>
              {clients.map(c => (
                <option key={c.client_id} value={c.client_id}>
                  {c.full_name}
                </option>
              ))}
            </select>
          </label>
        )}

        <label>Тип абонемента:
          <select 
            value={type} 
            onChange={(e) => setType(e.target.value)} 
            required
            disabled={loading}
          >
            <option value="">-- оберіть тип --</option>
            <option value="Стандарт">Стандарт</option>
            <option value="Преміум">Преміум</option>
            <option value="Базовий">Базовий</option>
          </select>
        </label>

        <label>Дата початку:
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)} 
            required
            disabled={loading}
          />
        </label>

        <label>Дата закінчення:
          <input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)} 
            required
            disabled={loading}
          />
        </label>

        <label>Ціна (грн):
          <input 
            type="number" 
            value={price} 
            onChange={(e) => setPrice(e.target.value)} 
            required
            disabled={loading}
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Збереження...' : (isEdit ? 'Оновити абонемент' : 'Додати абонемент')}
        </button>
      </form>

      <Link to="/dashboard" className="back" style={{ display: 'block', textAlign: 'center', marginTop: '15px' }}>
        ← Повернутись на головну
      </Link>
    </div>
  );
}
