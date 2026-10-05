# Миграции, связи и CRUD через Prisma с фильтрацией

Одна учебная база на SQLite и три миграции:

1. `init` — `User`, `Profile` (1:1), `Post` (1:N), `Tag` (M:N).
2. `add_view_count` — поле `viewCount Int @default(0)` в `Post`.
3. `add_catalog` — `Category` и `Product` для каталога.

`src/relations.js` показывает все виды связей: вложенные записи, `connect`/`disconnect`/`connectOrCreate`, фильтры `some`/`none`, `_count`, каскадное удаление — вывод в [relations-output.txt](relations-output.txt).

`src/catalog.js` — функция `getCatalog` с динамическими фильтрами (`search`, `category`, `minPrice`, `maxPrice`, `inStock`, `sortBy`, `sortOrder`, `page`, `limit`) и `getStats` с агрегатами `groupBy` по категориям; `src/server.js` подключает их к Express. Запросы из задания — [demo.txt](demo.txt).

```
npm install
cp .env.example .env
npx prisma migrate dev
npx prisma migrate status
npm run relations
npm run seed && npm start
```
