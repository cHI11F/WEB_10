import db from '../config/db.js';
import { Middleware } from '../middleware/auth.js';

export default async function handler(req, res) {
  // Налаштування CORS
  if (Middleware.setCors(req, res)) return;

  // Перевірка методу (тільки GET)
  if (req.method !== 'GET') {
    return res.status(405).json({ error: "Метод не підтримується. Використовуйте GET." });
  }

  // Перевірка авторизації (тільки для адміна)
  const user = Middleware.checkAuth(req, res, ['admin']);
  if (!user) return;

  try {
    // Отримуємо сьогоднішню дату у форматі YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];

    // Загальна виручка
    const revenueResult = await db.execute("SELECT SUM(price) as total FROM memberships");
    const totalRevenue = revenueResult.rows[0].total || 0;

    // Кількість активних абонементів сьогодні
    const activeResult = await db.execute({
      sql: "SELECT COUNT(*) as count FROM memberships WHERE start_date <= ? AND end_date >= ?",
      args: [today, today]
    });
    const activeCount = activeResult.rows[0].count || 0;

    // Загальна кількість клієнтів
    const clientsResult = await db.execute("SELECT COUNT(*) as count FROM clients");
    const clientsCount = clientsResult.rows[0].count || 0;

    // Кількість персоналу (адміни + тренери)
    const staffResult = await db.execute("SELECT COUNT(*) as count FROM users WHERE role IN ('trainer','admin')");
    const staffCount = staffResult.rows[0].count || 0;

    // Розподіл абонементів по типах
    const typesResult = await db.execute("SELECT type, COUNT(*) as count FROM memberships GROUP BY type");
    const typesDistribution = typesResult.rows; 

    // Відправляємо успішну відповідь у форматі JSON
    return res.status(200).json({
      total_revenue: totalRevenue,
      active_memberships: activeCount,
      total_clients: clientsCount,
      total_staff: staffCount,
      types_distribution: typesDistribution
    });

  } catch (error) {
    console.error("Помилка бази даних:", error);
    return res.status(500).json({ error: "Помилка бази даних: " + error.message });
  }
}