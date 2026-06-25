# Restaurant

Monorepo layout:

- `backend/` — NestJS API (PostgreSQL + Prisma)
- `frontend/` — (planned) separate app folder

## Backend quick start

```bash
cd backend
cp .env.example .env
docker compose up -d
npm install
npx prisma migrate dev
npm run start:dev
```

API: http://localhost:3101
