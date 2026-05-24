import db from '../config/db.js';
import bcrypt from 'bcryptjs';
import { Middleware } from '../middleware/auth.js';

export default async function handler(req, res) {
  if (Middleware.setCors(req, res)) return;

  const user = Middleware.checkAuth(req, res, ['admin']);
  if (!user) return;

  switch (req.method) {
    case 'GET':
      return await handleGet(req, res, user);
    case 'POST':
      return await handlePost(req, res, user);
    case 'PUT':
      return await handlePut(req, res, user);
    case 'DELETE':
      return await handleDelete(req, res, user);
    default:
      return res.status(405).json({ error: "Метод не підтримується." });
  }
}

async function handleGet(req, res, user) {
  try {
    const result = await db.execute(`
      SELECT user_id, username, full_name, role 
      FROM users 
      WHERE role IN ('trainer', 'admin') 
      ORDER BY user_id ASC
    `);

    const staff = result.rows.map(row => ({ ...row }));

    for (const member of staff) {
      if (!member.full_name || member.full_name.trim() === '') {
        const capitalizedUsername = member.username.charAt(0).toUpperCase() + member.username.slice(1);
        member.full_name = `Тренер ${capitalizedUsername}`;

        await db.execute({
          sql: "UPDATE users SET full_name = ? WHERE user_id = ?",
          args: [member.full_name, member.user_id]
        });
      }
    }

    return res.status(200).json(staff);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Помилка бази даних: " + error.message });
  }
}

async function handlePost(req, res, user) {
  const { full_name, username, password, role = 'trainer' } = req.body || {};
  const trimmedFullName = (full_name || '').trim();
  const trimmedUsername = (username || '').trim();

  if (!trimmedFullName || !trimmedUsername || !password) {
    return res.status(400).json({ error: "Заповніть всі обов'язкові поля." });
  }

  if (!['trainer', 'admin'].includes(role)) {
    return res.status(400).json({ error: "Роль повинна бути або 'trainer', або 'admin'." });
  }

  try {
    const checkUser = await db.execute({
      sql: "SELECT user_id FROM users WHERE username = ?",
      args: [trimmedUsername]
    });

    if (checkUser.rows.length > 0) {
      return res.status(400).json({ error: "Користувач з таким логіном вже існує." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await db.execute({
      sql: "INSERT INTO users (username, password, role, full_name) VALUES (?, ?, ?, ?)",
      args: [trimmedUsername, passwordHash, role, trimmedFullName]
    });

    return res.status(200).json({
      success: true,
      message: "Співробітника успішно додано!"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Помилка сервера: " + error.message });
  }
}

async function handlePut(req, res, user) {
  const { user_id, full_name, username, password, role } = req.body || {};
  const trimmedFullName = (full_name || '').trim();
  const trimmedUsername = (username || '').trim();

  if (!user_id || !trimmedFullName || !trimmedUsername || !role) {
    return res.status(400).json({ error: "Необхідно заповнити всі поля." });
  }

  if (!['trainer', 'admin'].includes(role)) {
    return res.status(400).json({ error: "Недійсна роль." });
  }

  try {
    const checkUserExist = await db.execute({
      sql: "SELECT user_id FROM users WHERE user_id = ?",
      args: [Number(user_id)]
    });

    if (checkUserExist.rows.length === 0) {
      return res.status(404).json({ error: "Користувача не знайдено." });
    }

    const checkUsernameUnique = await db.execute({
      sql: "SELECT user_id FROM users WHERE username = ? AND user_id != ?",
      args: [trimmedUsername, Number(user_id)]
    });

    if (checkUsernameUnique.rows.length > 0) {
      return res.status(400).json({ error: "Логін вже зайнятий іншим користувачем." });
    }

    if (password && password.trim() !== '') {
      const passwordHash = await bcrypt.hash(password, 10);

      await db.execute({
        sql: "UPDATE users SET username = ?, full_name = ?, role = ?, password = ? WHERE user_id = ?",
        args: [trimmedUsername, trimmedFullName, role, passwordHash, Number(user_id)]
      });
    } else {
      await db.execute({
        sql: "UPDATE users SET username = ?, full_name = ?, role = ? WHERE user_id = ?",
        args: [trimmedUsername, trimmedFullName, role, Number(user_id)]
      });
    }

    return res.status(200).json({
      success: true,
      message: "Дані співробітника успішно оновлено!"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Помилка сервера: " + error.message });
  }
}

async function handleDelete(req, res, user) {
  const queryId = req.query?.id;
  const bodyId = req.body?.user_id;
  const userId = queryId || bodyId;

  if (!userId) {
    return res.status(400).json({ error: "Не вказано ID користувача для видалення." });
  }

  if (Number(userId) === Number(user.id)) {
    return res.status(400).json({ error: "Ви не можете видалити власний обліковий запис." });
  }

  try {
    const result = await db.execute({
      sql: "DELETE FROM users WHERE user_id = ?",
      args: [Number(userId)]
    });

    if (result.rowsAffected > 0) {
      return res.status(200).json({
        success: true,
        message: "Співробітника успішно видалено!"
      });
    } else {
      return res.status(404).json({ error: "Користувача не знайдено або вже видалено." });
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Помилка бази даних: " + error.message });
  }
}