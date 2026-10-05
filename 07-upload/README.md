# Загрузка файлов: Multer

| Маршрут | Поле | Ограничения |
|---|---|---|
| `POST /upload/avatar` | `avatar`, один файл | только JPEG и PNG (тип и расширение), до 2 МБ |
| `POST /upload/documents` | `documents`, до 5 файлов | txt, pdf, jpg, png, до 5 МБ каждый |
| `POST /upload/profile` | текстовые поля `name`, `bio` + `avatar` | как у аватара |

Файлы сохраняются в `uploads/` под случайными именами и отдаются через `/uploads`. Ошибки Multer превращаются в 400 (неверный тип) и 413 (слишком большой файл).

```
npm install
npm start
npm run demo
```

Сценарии из задания, включая неверный тип и файл 3 МБ — [demo.txt](demo.txt).
