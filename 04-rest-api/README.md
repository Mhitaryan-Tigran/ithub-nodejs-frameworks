# Проектирование REST API

Ресурс `/api/v1/users` в отдельном Router-модуле: пагинация `page`/`limit` с `meta`, фильтры `minAge`/`maxAge`, сортировка `sortBy`/`order`, вложенный ресурс `/users/:id/orders`.

| Ситуация | Код |
|---|---|
| Создан пользователь, заголовок `Location` | 201 |
| Ошибка в данных | 400 со списком |
| Нет пользователя | 404 |
| Email уже занят | 409 |
| Удалён | 204 без тела |

```
npm install
npm start
npm run demo
```

Сценарии из задания — [demo.txt](demo.txt).
