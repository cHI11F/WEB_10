import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  
  // Якщо фронтенд запущено через Vite dev/preview (наприклад, порт 4173 або 5173)
  if (window.location.port === '4173' || window.location.port === '5173') {
    return 'http://localhost:8000/api';
  }
  
  // Якщо запущено разом на Apache/OpenServer
  const path = window.location.pathname;
  const folder = path.substring(0, path.indexOf('/frontend')) || '/LAB7';
  return `${window.location.origin}${folder}/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Додавання JWT токена до кожного запиту
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Обробка помилок авторизації (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Перенаправляємо на вхід лише якщо ми не на сторінці входу
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
