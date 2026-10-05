# Валидация данных: Joi и express-validator

- `POST /users` — Joi-схема (`src/schemas/user.js`): все ошибки сразу (`abortEarly: false`), лишние поля удаляются (`stripUnknown`), значение `role` по умолчанию.
- `GET /users` — Joi-схема для query с значениями по умолчанию (`page`, `limit`, `sortBy`, `order`).
- `POST /v2/users` — те же правила на express-validator с санитизацией (`trim`, `normalizeEmail`, `toInt`).
- Ошибки в одном формате: 400 и массив `details`.

```
npm install
npm start
npm run demo
```

Результаты — [demo.txt](demo.txt).
