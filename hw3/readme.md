# Homework 3

> Docker Deep Dive: Build, Ship & Orchestrate Your Own Node Stack

---

## 📁 Структура

```

hw3 /
├─ docker                   # файли конфігурації Docker
├─ kv-server                # сервер адаптер для роботи з сервером redis-like
│   └─ src                     
│   └─ eslint.config.js         
│   └─ package.json           
├─ redis-like               # сервер redis-like для збереження даних у форматі key=value у віртуальній пам'яті
│   └─ src                     
│   └─ eslint.config.js         
│   └─ package.json   
````

---

## 🚀 Швидкий старт

```bash
git clone <repo> && cd r_d-nodejs

# 🚀 1 - для локального запуску

cd hw3/kv-server && npm install     # ставимо залежності
cd ../redis-like && npm install     # ставимо залежності

# * ⚠️ потрібно створити локальний .env в kv-server і redis-like перед запуском

cd hw3/kv-server && npm run start   # локальний запуск в різних вкладках терміналу
cd hw3/redis-like && npm run start  # локальний запуск в різних вкладках терміналу

# 🚀 2 - для запуску в docker

cd docker && docker-compose up --build

````

---

## 🔑 Змінні середовища вказані в .Dockerfile.kv і .Dockerfile.rds

| Ключ        | Приклад             | Опис                                                          |
|-------------|---------------------|---------------------------------------------------------------|
| `REDIS_URL` | `http://redis:4000` | відповідає за порт redis-like (в конфігурації .Dockerfile.kv) |
| `PORT`      | `3000`              | порт для kv-server (в конфігурації .Dockerfile.kv)            |
| `PORT`      | `4000`              | порт для redis-like (в конфігурації .Dockerfile.rds)          |

> **Для локального запуску потрібно створити `.env`!** Файл вже у `.gitignore`.

> ⚠️⚠️⚠️ В проєкті присутні `hw3.postman_collection.json` колекція для перевірки запитів.
---
