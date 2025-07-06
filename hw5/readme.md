# Homework 5

> «Tea‑Tracker API» — NestJS + TypeScript + Zod

---

## 📁 Структура

```
hw5/
├── src/
│   ├── tea /
│   │   ├── tea.module.ts        # використання іnternal залежностей 
│   │   ├── tea.controller.ts    # фукнції обробки запитів від роутів 
│   │   └── tea.services.ts      # сервіси для роботи з моделями
│   ├── shared /             
│   │   ├── decorators           # декоратори
│   │   ├── dto                  # структура даних з zod валідацією
│   │   ├── guards               # визначає дозволено доступ до певного маршруту.
│   │   ├── interceptors         # дозволяє перехоплювати до та після обробки запиту.
│   │   ├── models               # інтерфейси
│   │   └── modules              # модулі для перевикористання
│   ├── app.module.ts            # ентрі поінт додатку
│   └── main.ts                  # ентрі поінт Nest.js
├── .env.example            # приклад змін оточення
├── .eslintrc.js            # файл конфіг лінту
├── build.mjs               # ентрі поінт для збірки через esbuild
└── multi.Dockerfile        # файл конфіг докеру

````

---

## 🚀 Швидкий старт

```bash
git clone <repo> && cd r_d-nodejs

# 🚀 1 - для запуску в режимі development
cd hw5 && npm install     # ставимо залежності
npm run dev               # запуск в dev режимі (в .env поставити NODE_ENV=development)

# 🚀 2 - для запуску в режимі production
cd hw5 && npm install     # ставимо залежності
npm run build             # збірка проекту
npm run start:prod        # запуск в prod режимі (в .env поставити NODE_ENV=production)

# 🚀 3 - для запуску в docker
npm run docker:build
npm run docker:run

# 🚀 4 - для очистки контейнеру і імеджу в docker
npm run docker:clean
````
---

## 🔑 Змінні середовища вказані в multi.Dockerfile

| Ключ       | Приклад                        | Опис                                |
|------------|--------------------------------|-------------------------------------|
| `NODE_ENV` | `development` or `production`  | відповідає за режим запуску серверу |
| `PORT`     | `3000`                         | порт для brew-api                   |                               

> **Для локального запуску потрібно створити `.env`!** Файл вже у `.gitignore`.
---
