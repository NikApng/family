# Pro Family Unity

Сайт на Next.js + Prisma + PostgreSQL с админкой, афишей, специалистами, отзывами и загрузкой изображений.

## 1. Что нужно для запуска

1. `Node.js 20+`
2. `npm 10+`
3. `PostgreSQL 14+`

Проверка:

```bash
node -v
npm -v
```

## 2. Локальный запуск (пошагово)

1. Установите зависимости:

```bash
npm ci
```

2. Создайте файл `.env` в корне проекта и заполните:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=public"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=public"

# Для NextAuth и хеширования IP (обязательно в проде, желательно локально тоже)
NEXTAUTH_SECRET="long-random-secret"
NEXTAUTH_URL="http://localhost:3000"

# Данные входа в админку
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="your-password-or-bcrypt-hash"

# Путь хранения загруженных файлов (локально можно не указывать)
# UPLOADS_DIR=""
```

3. Примените миграции:

```bash
npx prisma migrate deploy
```

4. Запустите проект:

```bash
npm run dev
```

5. Откройте:

- Сайт: `http://localhost:3000`
- Админка: `http://localhost:3000/admin/login`

## 3. Полезные команды

```bash
# Линтер
npm run lint

# Прод-сборка
npm run build

# Прод-запуск
npm run start
```

## 4. Деплой на Рег.ру (VPS, пошагово)

Если у вас обычный shared-хостинг без Node.js процесса, этот проект так не запустится. Нужен VPS/облачный сервер.

### Шаг 1. Подготовка сервера

```bash
sudo apt update
sudo apt install -y git curl nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm i -g pm2
```

Проверьте:

```bash
node -v
npm -v
```

### Шаг 2. Подготовка папок

```bash
sudo mkdir -p /var/www/pro-family-unity
sudo mkdir -p /var/www/pro-family-unity-data/uploads
```

### Шаг 3. Загрузка проекта

```bash
cd /var/www/pro-family-unity
git clone <URL_ВАШЕГО_РЕПО> .
npm ci
```

### Шаг 4. Настройка `.env` для продакшена

Создайте `/var/www/pro-family-unity/.env`:

```bash
NODE_ENV="production"

DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=public"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=public"

NEXTAUTH_URL="https://ваш-домен.ru"
NEXTAUTH_SECRET="long-random-secret"

ADMIN_EMAIL="admin@ваш-домен.ru"
# Можно plain-text, но лучше bcrypt-хеш:
ADMIN_PASSWORD="$2b$10$................................................."

# ВАЖНО: постоянная папка для загруженных файлов
UPLOADS_DIR="/var/www/pro-family-unity-data/uploads"
```

Сгенерировать `NEXTAUTH_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Сгенерировать bcrypt-хеш для `ADMIN_PASSWORD`:

```bash
node -e "require('bcrypt').hash('ВашСильныйПароль', 10).then(console.log)"
```

### Шаг 5. Права на папку загрузок

Замените `<app-user>` на пользователя, под которым будет работать приложение:

```bash
sudo chown -R <app-user>:<app-user> /var/www/pro-family-unity-data
sudo chmod -R 755 /var/www/pro-family-unity-data
```

### Шаг 6. Миграции и сборка

```bash
cd /var/www/pro-family-unity
npx prisma migrate deploy
npm run build
```

### Шаг 7. Запуск через PM2

```bash
cd /var/www/pro-family-unity
npx pm2 start npm --name pro-family-unity -- start
npx pm2 save
npx pm2 startup
```

Проверка:

```bash
npx pm2 status
```

### Шаг 8. Nginx reverse proxy

Создайте файл `/etc/nginx/sites-available/pro-family-unity`:

```nginx
server {
    listen 80;
    server_name ваш-домен.ru www.ваш-домен.ru;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Активируйте:

```bash
sudo ln -s /etc/nginx/sites-available/pro-family-unity /etc/nginx/sites-enabled/pro-family-unity
sudo nginx -t
sudo systemctl reload nginx
```

### Шаг 9. SSL (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d ваш-домен.ru -d www.ваш-домен.ru
```

## 5. Как работают загрузки изображений в проде

1. Файл загружается через `/api/upload`
2. Сохраняется в папку `UPLOADS_DIR`
3. Отдается по URL вида `/uploads/<filename>`

Если `UPLOADS_DIR` не задан, по умолчанию используется `public/uploads`.

## 6. Частые проблемы

1. Ошибка `STORAGE_WRITE_FAILED` при загрузке фото:
   Проверьте, что папка из `UPLOADS_DIR` существует и у пользователя приложения есть права на запись.
2. Не пускает в админку:
   Проверьте `ADMIN_EMAIL` и `ADMIN_PASSWORD` в `.env`.
3. Ошибки Prisma/БД:
   Проверьте `DATABASE_URL`, `DIRECT_URL`, доступ к базе и выполнены ли `npx prisma migrate deploy`.
4. После деплоя не обновился сайт:
   Выполните `git pull`, затем `npm ci`, `npx prisma migrate deploy`, `npm run build`, `npx pm2 restart pro-family-unity`.

## 7. Docker + Docker Compose (PostgreSQL + Next.js + Nginx)

В проект добавлены:

- `Dockerfile` для приложения
- `docker-compose.yml` с сервисами `db`, `app`, `nginx`
- `docker/nginx/default.conf` с доменом `xn----dtbfcbtymkvhm7jub.xn--p1ai`

### Быстрый запуск

1. При необходимости измените секреты и пароли в `docker-compose.yml`:

- `POSTGRES_PASSWORD`
- `DATABASE_URL`/`DIRECT_URL` (должны совпадать с Postgres-сервисом)
- `NEXTAUTH_SECRET`
- `ADMIN_EMAIL`/`ADMIN_PASSWORD`

2. Поднимите стек:

```bash
docker compose up -d --build
```

3. Проверьте логи:

```bash
docker compose logs -f app
docker compose logs -f nginx
```

4. Откройте сайт:

- `http://xn----dtbfcbtymkvhm7jub.xn--p1ai`

### Важно по домену

- Домен `xn----dtbfcbtymkvhm7jub.xn--p1ai` должен резолвиться на IP сервера с Docker.
- Для локальной проверки добавьте запись в `hosts`:

```text
127.0.0.1 xn----dtbfcbtymkvhm7jub.xn--p1ai
```

### Хранение данных

- База хранится в volume `postgres_data`
- Загруженные изображения хранятся в volume `uploads_data` (через `UPLOADS_DIR=/var/www/uploads`)

### Остановка

```bash
docker compose down
```

Если нужно удалить контейнеры вместе с томами данных:

```bash
docker compose down -v
```
