import db from '../config/db.js';
import bcrypt from 'bcryptjs';
import { JWTHelper } from '../config/jwt_helper.js';


export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Метод не підтримується. Використовуйте POST." });
  }

  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ error: "Заповніть усі поля." });
    }

    const trimmedUsername = username.trim();

    const result = await db.execute({
      sql: "SELECT * FROM users WHERE username = ?",
      args: [trimmedUsername]
    });

    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ error: "Невірний логін або пароль." });
    }

    // Використовуємо bcryptjs для порівняння
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const payload = {
        id: user.user_id,
        username: user.username,
        role: user.role
      };

      // Беремо єдиний і правильний генератор з jwt_helper.js
      const token = JWTHelper.generate(payload);

      return res.status(200).json({
        token: token,
        user: payload
      });
    } else {
      return res.status(400).json({ error: "Невірний логін або пароль." });
    }

  } catch (error) {
    console.error("Помилка сервера:", error);
    return res.status(500).json({ error: "Помилка сервера: " + error.message });
  }
}