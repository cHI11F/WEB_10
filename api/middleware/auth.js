import { JWTHelper } from '../config/jwt_helper.js';

export const Middleware = {
  // 1. Помічник для встановлення CORS (щоб не писати це щоразу вручну)
  setCors: (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return true;
    }
    return false;
  },

  // 2. Помічник для перевірки авторизації та ролей
  checkAuth: (req, res, allowedRoles = []) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: "Неавторизований доступ або токен застарів" });
      return null;
    }

    const token = authHeader.split(' ')[1];
    const userData = JWTHelper.validate(token);

    if (!userData) {
      res.status(401).json({ error: "Неавторизований доступ або токен застарів" });
      return null;
    }

    // Перевірка ролей (якщо ролі вказані, наприклад ['admin'])
    if (allowedRoles.length > 0 && !allowedRoles.includes(userData.role)) {
      res.status(403).json({ error: "Доступ заборонено. Недостатньо прав." });
      return null;
    }

    return userData;
  }
};