# КТ 3. API с базой данных

REST API блог-платформы: Express, Prisma ORM, PostgreSQL, Joi. Схема из задания (`User`, `Post`, `Tag`, enum `Role`) — `prisma/schema.prisma`, миграция в `prisma/migrations`. Удаление пользователя каскадно удаляет его посты (`onDelete: Cascade`).

| Требование | Реализация |
|---|---|
| CRUD users и posts, корректные статусы | 200, 201 + `Location`, 204, 400, 404, 409 (`src/routes/`) |
| `GET /api/posts`: `search` (contains, insensitive), `published`, `authorId`, `page`, `limit` | ответ `{ data, meta: { total, page, limit, pages } }` |
| `POST /api/posts`: теги через `connectOrCreate`, Joi: `title` и числовой `authorId` обязательны | `src/routes/posts.js`, `src/schemas/index.js` |
| `GET /api/users/:id` с постами по убыванию даты | `include` + `orderBy` |
| Ошибки Prisma → HTTP | P2002 → 409, P2025 → 404, P2003 → 400 (`src/middleware/errorHandler.js`) |

```
npm install
cp .env.example .env
npm run db
npx prisma migrate deploy
npm run seed
npm start
```

`npm run db` поднимает PostgreSQL из npm-пакета embedded-postgres, без установки в систему. Проверка всех маршрутов — [demo.txt](demo.txt).
