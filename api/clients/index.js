import db from '../config/db.js';

// Підключаємося до бази даних Turso

export default async function handler(req, res) {
  // 1. Налаштування CORS (щоб React міг без проблем звертатися до API)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Якщо браузер робить попередній запит (OPTIONS), відповідаємо 'ОК'
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 2. Перевірка методу (тільки GET)
  if (req.method !== 'GET') {
    return res.status(405).json({ error: "Метод не підтримується. Використовуйте GET." });
  }

  try {
    // 3. Робимо запит до бази даних (отримуємо всіх клієнтів за алфавітом)
    const result = await db.execute("SELECT client_id, full_name FROM clients ORDER BY full_name ASC");

    // 4. Відправляємо успішну відповідь (масив клієнтів)
    return res.status(200).json(result.rows);

  } catch (error) {
    console.error("Помилка бази даних:", error);
    return res.status(500).json({ error: "Помилка бази даних: " + error.message });
  }
}