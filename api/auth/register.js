import db from '../config/db.js';
import bcrypt from 'bcryptjs';


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
    const { username, password, role = 'client' } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ error: "Заповніть всі обов'язкові поля." });
    }

    const trimmedUsername = username.trim();

    const allowedRoles = ['client', 'trainer', 'admin'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: "Недійсна роль." });
    }

    const checkUser = await db.execute({
      sql: "SELECT * FROM users WHERE username = ?",
      args: [trimmedUsername]
    });

    if (checkUser.rows.length > 0) {
      return res.status(400).json({ error: "Користувач з таким ім'ям вже існує." });
    }

    // Хешуємо за допомогою bcryptjs
    const passwordHash = await bcrypt.hash(password, 10);

    await db.execute({
      sql: "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
      args: [trimmedUsername, passwordHash, role]
    });

    return res.status(200).json({
      success: true,
      message: "Користувача успішно зареєстровано!"
    });

  } catch (error) {
    console.error("Помилка сервера:", error);
    return res.status(500).json({ error: "Помилка сервера: " + error.message });
  }
}