«Nest.js Generic ORM» — NestJS + TypeScript + PostgreSQL + Docker

---

## 🚀 Швидкий старт

```bash
git clone <repo> && cd r_d-nodejs

# 🚀 1 - Режим розробки
cd hw11 && npm install

# Запустити PostgreSQL через Docker
docker-compose up -d

# Запустити Nest.js додаток
npm run start:dev

# 🚀 2 - Режим продакшену  
npm run build
npm run start:prod
```

## 📁 Структура

```
hw11/
├── src/
│   ├── db/                     # конфігурація PostgreSQL pool з'єднань         
│   ├── dto/                    # DTO для валідації запитів
│   ├── orm/                    # Generic ORM клас з CRUD операціями               
│   ├── repositories/           # Репозиторій для продуктів з спеціальними методами          
│   ├── models /                # TypeScript інтерфейси продукту  
│   ├── demo.module.ts          # NestJS модуль
│   ├── demo.controller.ts      # REST API контролер для демонстрації ORM
│   ├── demo.service.ts         # Бізнес-логіка демонстрації ORM
│   └── main.ts                 # ентрі поінт NestJS
├── docker/
│   └── postgres/
│       └── init.sql            # SQL скрипти ініціалізації бази
├── docker-compose.yml          # Docker конфігурація для PostgreSQL
├── .env.example                # змінні середовища
└── package.json
```

---

## 🔧 API Endpoints

### Demo Endpoints:
- `GET /demo` - Запустити повну демонстрацію ORM
- `GET /demo/init` - Ініціалізувати базу даних
- `GET /demo/test-connection` - Тест підключення до бази

### Product CRUD:
- `GET /demo/products` - Отримати всі продукти
- `GET /demo/products/:id` - Отримати продукт за ID
- `GET /demo/products/category/:category` - Продукти за категорією
- `GET /demo/products/price-range?min=100&max=500` - Продукти за ціновим діапазоном
- `POST /demo/products` - Створити новий продукт
- `PUT /demo/products/:id` - Оновити продукт
- `DELETE /demo/products/:id` - Видалити продукт

### Приклади запитів:

```bash
# Ініціалізувати базу
curl http://localhost:3000/demo/init

# Запустити демонстрацію
curl http://localhost:3000/demo

# Створити продукт
curl -X POST http://localhost:3000/demo/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Gaming Laptop",
    "description": "High performance laptop",
    "price": 1299.99,
    "category": "Electronics"
  }'

# Отримати продукти за категорією
curl http://localhost:3000/demo/products/category/Electronics

# Отримати продукти за ціною
curl "http://localhost:3000/demo/products/price-range?min=500&max=1000"
```
