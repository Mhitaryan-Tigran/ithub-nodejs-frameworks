# NoSQL: MongoDB и Mongoose

MongoDB запускается локально без установки в систему: `npm run db` поднимает настоящий `mongod` через mongodb-memory-server с данными в `.mongo-data` на `mongodb://127.0.0.1:27017`. Можно указать и Atlas в `MONGODB_URI`.

| Модель | Что показано |
|---|---|
| `User` | валидация, уникальный индекс email, `pre('save')` с bcrypt, `select: false` для пароля, метод экземпляра `checkPassword`, статический `findByEmail`, виртуальное поле `posts` |
| `Post` | ссылка на автора, массив тегов, вложенные документы-комментарии, текстовый индекс |

`src/examples/crud.js`: создание, ошибки валидации и дубликата, выборки с фильтром и проекцией, `populate`, текстовый поиск, `$set`/`$inc`/`$push`, агрегация с `$lookup`, удаление.

```
npm install
cp .env.example .env
npm run db
npm run crud
```

Вывод — [output.txt](output.txt).
