# Введение в NestJS

NestJS-проект, созданный `nest new`; модуль, контроллер и сервис сгенерированы командами `nest generate module|controller|service users`. Prisma с SQLite, модель `User`.

| Что | Где |
|---|---|
| `CreateUserDto` с валидацией class-validator (email, имя 2–50, пароль с буквами и цифрами, роль) и `UpdateUserDto` через `PartialType` | `src/users/dto/` |
| `UsersService`: create, findAll, findOne, update, remove; пароль хешируется bcrypt, дубликат email → 409, нет пользователя → 404 | `src/users/users.service.ts` |
| `UsersController` с Swagger-аннотациями | `src/users/users.controller.ts` |
| `ValidationPipe` (whitelist, transform) и Swagger UI на `/api/docs` | `src/main.ts` |
| Тесты: unit для сервиса и e2e полного CRUD, валидации, 409 и Swagger (7 тестов) | `src/**/*.spec.ts`, `test/` |

```
npm install
cp .env.example .env
npx prisma migrate dev
npm run start:dev
npm test && npm run test:e2e
```

Запуск с запросами — [demo.txt](demo.txt), Swagger — [swagger.png](swagger.png).
