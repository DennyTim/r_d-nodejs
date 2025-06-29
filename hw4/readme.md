# Homework 4

> Coffee Brew Log API — production‑ready мінімум

---

## 📁 Структура

```
hw4/
├── src/
│   ├── app/
│   │   ├── containers/     # IoC контейнери
│   │   ├── controllers/    # фукнції обробки запитів від роутів 
│   │   ├── docs/           # генерація спекі існуючого функціоналу
│   │   ├── dto/            # це структура яка описує форму даних з zod валідацією
│   │   ├── middlewares/    # функції, які виконуються між запитом та роутингом
│   │   ├── models/         # моделі для управліня даними
│   │   ├── open-api/       # реєстрація схем з DTO і path, як опиняться в одному глобальному registry
│   │   ├── routes/         # роутінг
│   │   ├── services/       # сервіси для роботи з моделями
│   │   ├── static/         # функції управління статикою
│   │   └── app.js          # ентрі поінт Express
│   ├── config/             
│   │   └── index.js        # централізований об’єкт cfg
│   ├── utils/              # утильні функції
│   ├── build.mjs           # ентрі поінт для збірки через esbuild 
│   └── server.js           # ентрі поінт Node.js
├── src
├── .dockerignore           # ігнор файлів і директорій які потраплять в кінечний image
├── .env.example            # приклад змін оточення
├── .eslintrc.js            # файл конфіг лінту
└── multi.Dockerfile        # файл конфіг докеру

````

---

## 🚀 Швидкий старт

```bash
git clone <repo> && cd r_d-nodejs

# 🚀 1 - для запуску в режимі development

cd hw4 && npm install     # ставимо залежності
npm run dev               # запуск в dev режимі (в .env поставити NODE_ENV=development)

# 🚀 2 - для запуску в режимі production

cd hw4 && npm install     # ставимо залежності
npm run build             # збірка проекту
npm run start             # запуск в prod режимі (в .env поставити NODE_ENV=production)

# 🚀 3 - для запуску в docker

npm run docker:build
npm run docker:run

# 🚀 4 - для очистки контейнеру і імеджу в docker
docker rm -f $(docker ps -aq --filter "ancestor=brew-api") && docker rmi brew-api
````
---

## 🔑 Змінні середовища вказані в multi.Dockerfile

| Ключ       | Приклад                        | Опис                                |
|------------|--------------------------------|-------------------------------------|
| `NODE_ENV` | `development` or `production`  | відповідає за режим запуску серверу |
| `PORT`     | `3000`                         | порт для brew-api                   |                               

> **Для локального запуску потрібно створити `.env`!** Файл вже у `.gitignore`.
---
