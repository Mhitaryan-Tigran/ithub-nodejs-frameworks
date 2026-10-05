# КТ 6. Итоговый проект — Blog Platform API

Backend блог-платформы: пользователи с ролями, посты с тегами, комментарии, realtime-чат, очередь писем. Express 4, Prisma ORM, PostgreSQL, Redis + BullMQ, Socket.io, JWT, Swagger, Jest + Supertest, Docker Compose.

**Публичный URL:** https://ithub-blog-platform.onrender.com · **Документация:** `/api/docs` · **Чат:** `/chat.html` · **Очереди:** `/admin/queues`

## Возможности

| Требование | Как сделано |
|---|---|
| ≥ 3 связанные модели | `User`, `Post`, `Tag` (M:N), `Comment`, `Message` — см. `prisma/schema.prisma`, 4 миграции |
| CRUD минимум для двух ресурсов | Посты, комментарии, пользователи |
| Фильтрация и пагинация | `GET /api/posts?search=&published=&authorId=&page=&limit=`, пагинация у пользователей, комментариев, ответ `{ data, meta: { total, page, limit, pages } }` |
| Аутентификация | Регистрация (bcrypt), логин, access-токен 15 мин, refresh-токен 7 дней в httpOnly cookie с ротацией и отзывом при logout |
| Роли и владелец | `USER`, `MODERATOR`, `ADMIN`; матрица прав в `src/config/permissions.js`, middleware `requirePermission` и `requireOwnership` |
| Валидация | Joi-схемы на body, query и params, ответ 400 с `details` |
| Единые ответы и ошибки | Успех `{ data, meta? }`, ошибка `{ error: { code, message, details? } }`, error handler ловит всё, в production скрывает stack |
| Безопасность | helmet, CORS по списку из `.env`, rate limit 10 неудачных входов за 15 минут, лимит тела 10kb, hpp |
| Фоновые задачи | BullMQ: при регистрации письмо `welcome` сразу и `reminder` через 24 часа; worker отдельным процессом; Bull Board с паролем |
| Realtime | Socket.io с JWT: общий чат, комнаты, онлайн-статусы, история в БД |
| Docker | `Dockerfile` (multi-stage, non-root, healthcheck) и `docker-compose.yml`: app, worker, db (PostgreSQL 18), redis, тома для данных |
| Тесты | 38 тестов Jest + Supertest, отчёт с покрытием в [test-report.txt](test-report.txt) |
| Документация | Swagger UI на `/api/docs`, описание в `src/docs/*.yaml`, схемы в `components/schemas` |

## Запуск

Всё окружение одной командой:

```
cp .env.example .env
docker compose up --build
```

API на http://localhost:3000, миграции применяются при старте контейнера. Проверка: `curl http://localhost:3000/health` → `{"status":"ok","db":"ok","redis":"ok"}`. Тестовые данные: `docker compose exec app node prisma/seed.js`, пароль у всех `Password123` (admin@, moderator@, alice@, bob@example.com).

Без Docker для разработки: `npm install`, `docker compose up -d db redis`, `npx prisma migrate deploy`, `npm run seed`, `npm start` и `npm run worker`.

Тесты поднимают собственный PostgreSQL (embedded-postgres) и не трогают рабочую базу:

```
npm test
npm run test:coverage
```

## Эндпоинты

| Метод | URL | Доступ | Описание |
|---|---|---|---|
| GET | /health | все | Состояние API, БД и Redis |
| POST | /auth/register | все | Регистрация, ставит письма в очередь |
| POST | /auth/login | все | Логин, access-токен + refresh cookie |
| POST | /auth/refresh | cookie | Новый access-токен |
| POST | /auth/logout | cookie | Отзыв refresh-токенов |
| GET | /auth/me | токен | Текущий пользователь |
| GET | /api/posts | все | Список с поиском, фильтрами, пагинацией |
| GET | /api/posts/:id | все | Пост с автором и тегами |
| POST | /api/posts | токен | Создать пост, теги через connectOrCreate |
| PATCH | /api/posts/:id | владелец, MODERATOR, ADMIN | Изменить пост |
| DELETE | /api/posts/:id | владелец, MODERATOR, ADMIN | Удалить пост с комментариями |
| GET | /api/posts/:id/comments | все | Комментарии поста |
| POST | /api/posts/:id/comments | токен | Написать комментарий |
| GET | /api/comments/:id | все | Один комментарий |
| PATCH | /api/comments/:id | автор, MODERATOR, ADMIN | Изменить комментарий |
| DELETE | /api/comments/:id | автор, MODERATOR, ADMIN | Удалить комментарий |
| GET | /api/users | MODERATOR, ADMIN | Пользователи с пагинацией |
| GET | /api/users/:id | сам, MODERATOR, ADMIN | Пользователь с постами |
| PATCH | /api/users/:id | сам, ADMIN | Имя, email, пароль |
| DELETE | /api/users/:id | ADMIN | Удалить пользователя |
| PATCH | /admin/users/:id/role | ADMIN | Сменить роль |
| GET | /api/messages | токен | История чата |
| WS | /socket.io | токен | `message:send`, `message:new`, `room:join`, `room:leave`, `room:message`, `users:online`, `user:online`, `user:offline` |
| GET | /admin/queues | пароль Bull Board | Мониторинг очереди писем |

## Структура

```
prisma/            schema.prisma, migrations/, seed.js
src/app.js         Express-приложение без listen — его используют тесты
src/server.js      HTTP-сервер, Socket.io, worker внутри процесса при RUN_WORKER=true
src/config/        index.js (env), permissions.js (RBAC), swagger.js
src/middleware/    auth, rbac, validate, security, errorHandler
src/routes/        auth, posts, comments, users, admin, messages, queues
src/queues/        подключение к Redis и очередь email
src/workers/       email worker и отдельный процесс worker'а
src/realtime/      Socket.io
src/docs/          OpenAPI в YAML
__tests__/         38 тестов
```

## Деплой

Render: web service из этого репозитория (Docker, `kt06/`), PostgreSQL и Key Value (Redis) от Render. На бесплатном плане фоновых воркеров нет, поэтому worker запускается внутри веб-процесса (`RUN_WORKER=true`). Бесплатный сервис засыпает без запросов — первый запрос будит его примерно за минуту.

Адрес: https://ithub-blog-platform.onrender.com — `/health`, `/api/docs`, `/chat.html`. Демо-данные загружаются при первом старте, если в базе нет постов (`SEED_DEMO=true`). Проверка задеплоенного API — в [render-demo.txt](render-demo.txt), проверки Docker Compose — в [docker-demo.txt](docker-demo.txt), скриншоты — в `screenshots/`.
