# Restaurant Backend

NestJS + PostgreSQL + Prisma (empty starter, same layout as `quest-nest`).

## Setup

```bash
cp .env.example .env
docker compose up -d
npm install
npx prisma generate
npm run start:dev
```

- API: http://localhost:3101
- Health: http://localhost:3101/health/db

Postgres **18** runs on port **5432** (`postgres:18-alpine` in `docker-compose.yml`).

## Add domain modules

```bash
nest g module orders
nest g controller orders
nest g service orders
```

Then add models to `prisma/schema.prisma` and run `npx prisma migrate dev`.
