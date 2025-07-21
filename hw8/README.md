# Homework 8. Асинхронність

> «Zip API» — NestJS + TypeScript + Mutex

---

## 📁 Структура

```
hw8/
├── src/
│ ├── models/
│ │ └── shared-state.model.ts       # інтерфейс для міжпотокової синхронізації
│ ├── services/
│ │ ├── archive.service.ts          # логіка розпакування архівів та очищення тимчасових файлів
│ │ └── img.service.ts              # логіка обробки зображень (thumbnails) через воркери
│ ├── utils/
│ │ └── exec-async.ts               # утиліта для exec з async/await
│ ├── worker/
│ │ ├── mutex.ts                    # реалізація SharedMutex через SharedArrayBuffer
│ │ └── worker.js                   # файл воркера для обробки картинок (sharp)
│ ├── zip.controller.ts             # контролер для прийому архівів і запуску обробки
│ ├── zip.module.ts                 # NestJS модуль Zip
│ ├── zip.service.ts                # координує сервіси archive + img
│ └── main.ts                       # ентрі поінт NestJS
├── public/                         # публічні файли, зокрема тимчасовий каталог /tmp
├── dist/                           # згенеровані файли після білду
└── package.json

````

---

## 🚀 Швидкий старт

```bash
## 🚀 Швидкий старт

```bash
git clone <repo> && cd r_d-nodejs

# 🚀 1 - Режим розробки
cd hw8 && npm install
npm run start:dev

# 🚀 2 - Режим продакшену
npm run build
npm run start:prod
````
---
> ⚠️⚠️⚠️ В проєкті присутні `hw3.postman_collection.json` колекція для перевірки запитів.
---

