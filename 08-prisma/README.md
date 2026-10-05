# Реляционные БД в Node.js: Prisma ORM

`npx prisma init --datasource-provider sqlite`, схема с моделями `User`, `Post`, `Tag` (1:N и M:N), миграция `init`, пример `src/examples/basic-crud.js`: вложенное создание, выборки с `include`/`select`, фильтры по связям, обновление, `updateMany`, каскадное удаление.

```
npm install
cp .env.example .env
npx prisma migrate dev --name init
npx prisma studio
node src/examples/basic-crud.js
```

Вывод примера — [output.txt](output.txt).
