# Middleware: встроенные, сторонние, кастомные

| Middleware | Вид | Что делает |
|---|---|---|
| `express.json` | встроенный | Разбор JSON, лимит 10kb |
| `cors`, `morgan` | сторонние | CORS-заголовки, журнал запросов |
| `requestId` | свой | Заголовок `X-Request-Id` для каждого запроса |
| `logger` | свой | Метод, URL, статус и время ответа |
| `auth` | свой | Проверка `Authorization: Bearer valid-token`, иначе 401 |
| `validateUser` | свой | Проверка тела `POST /users`, иначе 400 со списком ошибок |
| `notFound`, `errorHandler` | свои | 404 для неизвестных маршрутов и единый формат ошибок |

```
npm install
npm start
npm run demo
```

Все curl-сценарии из задания с ответами и журналом сервера — [demo.txt](demo.txt).
