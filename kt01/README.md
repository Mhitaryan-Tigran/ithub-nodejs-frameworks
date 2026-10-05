# КТ 1. Ядро Node.js — CSV-фильтр

CLI-утилита на чистом Node.js: читает `data/users.csv` потоком (`fs.createReadStream` + `readline`, без `readFileSync`), оставляет строки с возрастом не меньше `MIN_AGE` и городом `CITY_FILTER`, записывает результат с заголовком через `fs.createWriteStream` и печатает статистику.

```
npm install
cp .env.example .env
npm start
```

| Файл | Что делает |
|---|---|
| `src/config/index.js` | Загружает `.env` через dotenv, проверяет, что все параметры заданы и `MIN_AGE` — число, превращает пути в абсолютные |
| `src/utils/csv.js` | `readRows` — асинхронный генератор поверх Readable stream, отдаёт заголовок и строки; `writeLines` — запись с учётом backpressure (`drain`) |
| `src/index.js` | `async main()`: проверка входного файла, фильтрация, запись, статистика; любая ошибка → сообщение и `process.exitCode = 1` |

Параметры можно переопределить без правки `.env`: `MIN_AGE=20 CITY_FILTER="Saint Petersburg" npm start`.

## Запуск

Полный лог — [run.txt](run.txt):

```
Фильтр: возраст >= 18, город = Moscow
Обработано строк: 7
Прошли фильтр: 3
Отброшено: 4
```

`data/result.csv`: заголовок и Alice, Charlie, Eve. При отсутствии входного файла выводится `Ошибка: Входной файл не найден: …`, код завершения 1.
