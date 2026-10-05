# Шаблонизаторы и отдача статики

Express + EJS: общие части `views/partials/head.ejs` и `foot.ejs`, страницы главная, список пользователей с фильтром по роли, профиль, 404, HTML-письмо `views/emails/welcome.ejs` (табличная вёрстка с inline-стилями для почтовых клиентов). Стили в `public/css/style.css` отдаются `express.static` с `Cache-Control`, есть светлая и тёмная тема.

```
npm install
npm start
npm run demo
```

Ответы на запросы из задания — [demo.txt](demo.txt), страницы — в `screenshots/`.
