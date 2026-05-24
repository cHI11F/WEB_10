import db from '../config/db.js';
import { Middleware } from '../middleware/auth.js';

export default async function handler(req, res) {
  if (Middleware.setCors(req, res)) return;

  const user = Middleware.checkAuth(req, res);
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
  const typeFilter = req.query.type || 'all';
  const clientFilter = req.query.client_id || 'all';
  const startFrom = req.query.start_from || '';
  const endTo = req.query.end_to || '';

  const where = [];
  const args = {};

  if (typeFilter !== 'all') {
    where.push("m.type = :type");
    args.type = typeFilter;
  }
  if (clientFilter !== 'all') {
    where.push("m.client_id = :client_id");
    args.client_id = Number(clientFilter);
  }

  if (startFrom && endTo) {
    where.push("m.start_date <= :end_to AND m.end_date >= :start_from");
    args.start_from = startFrom;
    args.end_to = endTo;
  } else if (startFrom) {
    where.push("m.end_date >= :start_from");
    args.start_from = startFrom;
  } else if (endTo) {
    where.push("m.start_date <= :end_to");
    args.end_to = endTo;
  }

  const whereSQL = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

  try {
    const sql = `
      SELECT m.membership_id, m.client_id, m.type, m.start_date, m.end_date, m.price, c.full_name as client_name
      FROM memberships m
      JOIN clients c ON m.client_id = c.client_id
      ${whereSQL}
      ORDER BY m.membership_id DESC
    `;

    const result = await db.execute({ sql, args });
    return res.status(200).json(result.rows);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Помилка бази даних: " + error.message });
  }
}

async function handlePost(req, res, user) {
  if (!['admin'].includes(user.role)) {
    return res.status(403).json({ error: "Доступ заборонено. Недостатньо прав." });
  }

  try {
    const { client_id, new_client, type, start_date, end_date, price } = req.body || {};
    const new_client_name = (new_client || '').trim();

    if (!type || !start_date || !end_date || price === undefined) {
      return res.status(400).json({ error: "Заповніть всі обов'язкові поля." });
    }

    let final_client_id = client_id;

    const tx = await db.transaction("write");

    if (new_client_name) {
      const checkClient = await tx.execute({
        sql: "SELECT client_id FROM clients WHERE full_name = ?",
        args: [new_client_name]
      });

      if (checkClient.rows.length > 0) {
        final_client_id = checkClient.rows[0].client_id;
      } else {
        const insertClient = await tx.execute({
          sql: "INSERT INTO clients (full_name) VALUES (?) RETURNING client_id",
          args: [new_client_name]
        });
        final_client_id = insertClient.rows[0].client_id;
      }
    } else if (final_client_id) {
      final_client_id = Number(final_client_id);
    } else {
      await tx.rollback();
      return res.status(400).json({ error: "Оберіть існуючого клієнта або введіть нового." });
    }

    await tx.execute({
      sql: "INSERT INTO memberships (client_id, type, start_date, end_date, price) VALUES (?, ?, ?, ?, ?)",
      args: [final_client_id, type, start_date, end_date, Number(price)]
    });

    await tx.commit();

    return res.status(200).json({
      success: true,
      message: "Абонемент успішно додано!"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Помилка сервера: " + error.message });
  }
}

async function handlePut(req, res, user) {
  if (!['admin'].includes(user.role)) {
    return res.status(403).json({ error: "Доступ заборонено. Недостатньо прав." });
  }

  try {
    const { membership_id, client_id, new_client, type, start_date, end_date, price } = req.body || {};
    const new_client_name = (new_client || '').trim();

    if (!membership_id || !type || !start_date || !end_date || price === undefined) {
      return res.status(400).json({ error: "Необхідно заповнити всі поля." });
    }

    let final_client_id = client_id;

    const tx = await db.transaction("write");

    if (new_client_name) {
      const checkClient = await tx.execute({
        sql: "SELECT client_id FROM clients WHERE full_name = ?",
        args: [new_client_name]
      });

      if (checkClient.rows.length > 0) {
        final_client_id = checkClient.rows[0].client_id;
      } else {
        const insertClient = await tx.execute({
          sql: "INSERT INTO clients (full_name) VALUES (?) RETURNING client_id",
          args: [new_client_name]
        });
        final_client_id = insertClient.rows[0].client_id;
      }
    }

    if (!final_client_id) {
      await tx.rollback();
      return res.status(400).json({ error: "Необхідно обрати клієнта." });
    }

    await tx.execute({
      sql: "UPDATE memberships SET client_id = ?, type = ?, start_date = ?, end_date = ?, price = ? WHERE membership_id = ?",
      args: [Number(final_client_id), type, start_date, end_date, Number(price), Number(membership_id)]
    });

    await tx.commit();

    return res.status(200).json({
      success: true,
      message: "Абонемент успішно оновлено!"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Помилка сервера: " + error.message });
  }
}

async function handleDelete(req, res, user) {
  if (!['admin'].includes(user.role)) {
    return res.status(403).json({ error: "Доступ заборонено. Недостатньо прав." });
  }

  const queryId = req.query?.id;
  const bodyId = req.body?.membership_id;
  const deleteId = queryId || bodyId;

  if (!deleteId) {
    return res.status(400).json({ error: "Не вказано ID абонемента для видалення." });
  }

  try {
    const result = await db.execute({
      sql: "DELETE FROM memberships WHERE membership_id = ?",
      args: [Number(deleteId)]
    });

    if (result.rowsAffected > 0) {
      return res.status(200).json({
        success: true,
        message: "Абонемент успішно видалено!"
      });
    } else {
      return res.status(404).json({ error: "Абонемент не знайдено або вже видалено." });
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Помилка бази даних: " + error.message });
  }
}