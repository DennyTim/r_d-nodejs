«ACID у PostgreSQL + NestJS/TypeORM»

## 🚀 Швидкий старт

```bash
git clone <repo> && cd r_d-nodejs

# 🚀 1 - Режим розробки
cd acid-lab && npm install

# Запустити PostgreSQL через Docker
docker-compose up -d

# Запустити Nest.js додаток
npm run start:dev
```

# 🚀 2 - Режим продакшену

```
$ npm run build
$ npm run start:prod
```

📁 Структура

```
acid-lab/
├── src/
│   ├── entities/               # TypeORM ентіті з ACID constraint'ами         
│   ├── services/               # Сервіси з атомарними транзакціями
│   ├── controllers/            # REST API контролери для ACID демонстрацій               
│   ├── app.module.ts           # NestJS модуль з PostgreSQL конфігурацією          
│   └── main.ts                 # ентрі поінт NestJS  
├── scripts/                    # CLI скрипти для isolation демонстрацій
│   ├── writer.js               # Writer процес для READ UNCOMMITTED тестів
│   ├── reader.js               # Reader процес для isolation демонстрацій
│   └── demo.sh                 # Bash скрипт для паралельного запуску
├── test/                       # E2E тести для ACID властивостей
│   ├── transfer.e2e-spec.ts    # Тести атомарності та консистентності
│   └── race.e2e-spec.ts        # Тести SERIALIZABLE та race conditions
├── docker-compose.yml          # Docker конфігурація для PostgreSQL
├── .env                        # змінні середовища
└── package.json
```

## 🔧 API Endpoints

### ACID Transfer Operations:

`POST /transfer` - Атомарний переказ коштів

`GET /transfer` - Тест підключення до бази

### Discount CRUD з SERIALIZABLE:

`POST /discounts/:code` - Створити знижку з retry логікою

`POST /discounts/race/:code` - Race condition тест з 5 паралельними запитами
