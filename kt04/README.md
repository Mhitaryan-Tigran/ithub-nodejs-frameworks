# КТ 4. Безопасность и тесты

Проект КТ 3, дополненный аутентификацией, ролями, мерами безопасности и тестами.

| Требование | Реализация |
|---|---|
| `POST /auth/register`, `/login`, `/refresh`, `/logout`, `GET /auth/me` | `src/routes/auth.js`: bcrypt, access-токен 15 мин, refresh 7 дней в httpOnly cookie, ротация и отзыв через `tokenVersion` |
| Роли USER, MODERATOR, ADMIN | миграция `add_password_and_moderator`, матрица прав `src/config/permissions.js` |
| Владелец ресурса | `requireOwnership` в `src/middleware/rbac.js`: свои посты — USER, любые — MODERATOR и ADMIN |
| `GET /api/users` — MODERATOR, ADMIN; `PATCH /admin/users/:id/role` — ADMIN | `src/routes/users.js`, `src/routes/admin.js` |
| helmet, CORS из `.env`, rate limit 10 неудачных входов за 15 минут, тело до 10kb, hpp | `src/middleware/security.js`, `src/app.js` |
| Stack trace скрыт в production | `src/middleware/errorHandler.js` |
| `app.js` и `server.js` раздельно | тесты импортируют `app` без запуска сервера |
| Тесты Jest + Supertest | 26 тестов в `__tests__/`: регистрация, логин, refresh/logout, защищённые маршруты, RBAC, helmet, CORS, 413, 429, unit для Joi, JWT и матрицы прав |

```
npm install
cp .env.example .env
npm run db
npx prisma migrate deploy
npm run seed
npm start
npm test
```

Тесты поднимают отдельный PostgreSQL на порту 5434. Отчёт с покрытием — [test-report.txt](test-report.txt), сценарии curl — [demo.txt](demo.txt).
