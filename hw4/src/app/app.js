import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import pinoHttp from "pino-http";
import swaggerUi from "swagger-ui-express";

import { scopePerRequest } from "awilix-express";

import brewRouter from "./routes/brew.routes.js";

import { config } from "../config/index.js";
import { brewContainer } from "./containers/brew.container.js";
import { generateSpecs } from "./docs/index.js";
import { notFound } from "./middlewares/not-found.middleware.js";
import { errorHandler } from "./middlewares/error-handler.middleware.js";
import { attachStaticHandler } from "./static/attach-static-handler.js";
import rateLimit from "express-rate-limit";

export const createApp = () => {
  const app = express();

  //  helmet()  ➜  HTTP-заголовки безпеки
  //  • Strict-Transport-Security, X-Frame-Options, X-Content-Type-Options …
  //  • Мінімізує XSS, click-jacking, MIME-sniffing та інші базові атаки.
  app.use(helmet());

  // cors()  ➜  Cross-Origin Resource Sharing
  //• Додає заголовки Access-Control-* , щоб браузер дозволив
  //  ваш API викликати з інших доменів / портів.
  //• За замовчуванням відкриває *усі* origins; в проді краще:
  //  app.use(cors({ origin: ['https://my.app'], credentials: true }));
  app.use(cors());

  // compression()  ➜  Gzip / Brotli стиснення Response
  // • Автоматично стискає текстові типи (json/html/css/js/svg) -->
  //   в рази менший об’єм, швидше завантаження.
  // • Зчитує Accept-Encoding клієнта, тому прозоро для коду.
  app.use(compression());

  // express-rate-limit  ➜  Захист від brute/DDoS
  // • Лічильник запитів по IP (memory-store або Redis).
  // • Тут: 100 запитів за хвилину → далі 429 Too Many Requests.
  //   windowMs: 60_000   (1 хв)   │  max: 100
  app.use(rateLimit({
    windowMs: 60_000,
    max: 100,
    standardHeaders: true,     // RateLimit-* для клієнта
    legacyHeaders: false
  }));

  // morgan('dev')  ➜  Людські access-логи під час розробки
  // • GET /brew 200 12.3 ms – 1.2 kB
  // • Формат 'dev' без кольорів → видно у терміналі nodemon.
  if (config.env === "development") {
    app.use(morgan("dev"));
  }

  // pino-http  ➜  Структуровані JSON-логи для продакшн
  // • req/res/latency записуються JSON-рядком → легко грепати/ELK.
  // • Log-рівні: info (2xx/3xx), warn (4xx), error (5xx).
  // • Доступний через   req.log.info({ custom })   усередині роуту.
  if (config.env === "production") {
    app.use(pinoHttp());
  }

  // Body-парсери (вбудовані в Express 4.17+)
  // •  application/json   →  req.body = JS-object
  // •  application/x-www-form-urlencoded (HTML-form) → req.body = object
  // •  `extended:false`  =  qs-парсер без підтримки вкладених об’єктів.
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // DI scope-per-request (Awilix)
  // • Створює дочірній контейнер на кожен HTTP-запит.
  // • У нього резолвляться BrewModel → BrewService → BrewController,
  //   тому стейт не “тече” між паралельними запитами.
  app.use(scopePerRequest(brewContainer));

  // Статична React SPA
  // •  build/      ← результат `npm run build` фронтенд-репозиторію.
  // •  GET /index.html, /static/js/main.….js  повертаються без Node-логіки.
  // •  `maxAge` (за замовч.) = 0 для dev; у продакшн варто `maxAge:'7d'`.
  attachStaticHandler(app);

  // Swagger /docs  (лише у development)
  // •  `generateSpecs()`  об’єднує Zod-DTO і JSDoc єдину OpenAPI.
  // •  `/docs` дає Swagger-UI, щоб швидко тестувати запити.
  // •  baseUrl читаємо з конфігу, в консоль — корисний hint для розробника.
  if (config.env === "development") {
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(generateSpecs()));
    console.log(`Swagger docs → ${config.baseUrl}/docs`);
  }

  // API-маршрути (REST + валідація + DI)
  // •  /api/brew      CRUD через BrewController
  // •  Всі роути всередині вже мають validate(BrewDTO) і asyncHandler.
  app.use("/api", brewRouter);

  // 404 «Маршрут не знайдено»
  // • Спрацьовує лише, якщо жоден попередній middleware не надіслав
  //   response. Повертає JSON { error: 'Route not found' }.
  app.use(notFound);

  // Глобальний error-handler
  // • Перехоплює throw new Error() або next(err).
  // • Логи —  req.log.error({ err })  (pino),  відповідь — status 400/500.
  // • Завжди останній у ланцюжку.
  app.use(errorHandler);

  return app;
};
