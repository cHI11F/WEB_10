import jwt from 'jsonwebtoken';

// Використовуємо секретний ключ із Vercel, або запасний (як у твоєму PHP)
const JWT_SECRET = process.env.JWT_SECRET || 'PULSEFIT_SUPER_SECRET_KEY_2026_CHANGE_ME';

export const JWTHelper = {
  // Генерація токена (за замовчуванням на 24 години)
  generate: (payload, expiresIn = '24h') => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
  },

  // Валідація токена (перевірка підпису і терміну дії)
  validate: (token) => {
    try {
      // jwt.verify сам перевіряє підпис і чи не закінчився час дії (exp)
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded;
    } catch (error) {
      // Якщо токен підроблений або протермінований — повертаємо null (як у твоєму PHP)
      return null; 
    }
  }
};