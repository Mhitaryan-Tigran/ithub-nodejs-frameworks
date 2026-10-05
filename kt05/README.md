# КТ 5. Продвинутые фичи — направление A: realtime-чат на Socket.io

Проект КТ 4, дополненный чатом и документацией.

| Требование | Реализация |
|---|---|
| Socket.io на том же HTTP-сервере, что и Express | `src/server.js` |
| JWT при подключении | middleware `io.use` в `src/realtime/socket.js`: токен из `auth.token` или заголовка, пользователь из БД |
| `message:send` → `message:new` | общий чат, сообщения сохраняются в таблицу `Message` |
| `user:online`, `user:offline`, список онлайн при подключении | событие `users:online` новому клиенту, учёт нескольких вкладок |
| `room:join`, `room:leave`, `room:message` | при входе приходит история комнаты, писать можно только участникам |
| Интеграция с проектом | те же пользователи и токены, миграция `add_chat_messages`, REST `GET /api/messages` |
| Без хардкода | лимиты в `.env` (`CHAT_MESSAGE_MAX`, `CHAT_HISTORY_LIMIT`) |

Документация Swagger на `/api/docs` (OpenAPI в `src/docs/*.yaml`), браузерный клиент — `/chat.html`.

```
npm install
cp .env.example .env
npm run db
npx prisma migrate deploy
npm run seed
npm start
npm run chat:demo
npm test
```

32 теста, в том числе 6 на сокеты — [test-report.txt](test-report.txt). Сценарий двух клиентов — [chat-demo.txt](chat-demo.txt), скриншоты — `screenshots/`.
