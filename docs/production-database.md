# Production Database

Recommended provider: Neon Postgres.

## Neon Setup

1. Create a Neon project for `bingd`.
2. Create separate branches or projects for production and staging.
3. Copy the pooled connection string for app runtime.
4. Copy the direct, non-pooled connection string for Prisma CLI migrations.
4. Set `DATABASE_URL` in your deployment provider to the pooled connection string.
5. Set `DIRECT_URL` in your deployment provider or migration environment to the direct connection string.
6. Run production migrations from a trusted local shell or CI environment:

```bash
npx prisma migrate deploy
npx prisma generate
```

## Environment Variables

Required for production:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST-pooler.neon.tech/DB?sslmode=require"
DIRECT_URL="postgresql://USER:PASSWORD@HOST.neon.tech/DB?sslmode=require"
BASE_ADDRESS="https://your-production-domain.com"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."
CRON_SECRET="replace-with-a-long-random-secret"
```

## Notes

- Use the pooled Neon URL for the deployed Next.js app.
- Use the direct Neon URL for Prisma CLI commands like `migrate deploy`, `migrate status`, and `db pull`.
- Do not commit real credentials.
- Keep development, staging, and production databases separate.
- Backups and restore windows should be configured before launch.

## Smoke Test

After deploying production environment variables and migrations, run:

```bash
npm run smoke:production
```

If your local `BASE_ADDRESS` points at localhost, set `SMOKE_BASE_ADDRESS` first:

```bash
SMOKE_BASE_ADDRESS="https://your-production-domain.com" npm run smoke:production
```

This checks public metadata, protected cron authorization, and the notification dry-run endpoint without sending push notifications.
