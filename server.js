import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dynamic API route loader
const loadRoute = async (routePath) => {
  try {
    const module = await import(`./api/${routePath}.js`);
    return module.default;
  } catch (err) {
    if (err.code === 'ERR_MODULE_NOT_FOUND' || err.message.includes('Cannot find module')) {
      const module = await import(`./api/${routePath}/index.js`);
      return module.default;
    }
    throw err;
  }
};

// Map routes
app.all('/api/*', async (req, res) => {
  try {
    let routePath = req.params[0];
    if (routePath.endsWith('.php')) {
      routePath = routePath.slice(0, -4);
    }
    const handler = await loadRoute(routePath);
    if (typeof handler === 'function') {
      await handler(req, res);
    } else {
      res.status(404).json({ error: "Ендпоінт не знайдено (немає обробника)" });
    }
  } catch (error) {
    console.error("Помилка маршрутизації:", error.message);
    if (!res.headersSent) {
      res.status(404).json({ error: "Ендпоінт не знайдено або файл відсутній" });
    }
  }
});

app.listen(PORT, () => {
  console.log(`✅ Бекенд сервер запущено на http://localhost:${PORT}`);
});
