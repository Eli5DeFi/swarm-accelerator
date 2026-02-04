# Database Migration Guide: SQLite → PostgreSQL

**Required for production deployment**

---

## Why PostgreSQL?

- ✅ **5-10x faster** for complex queries
- ✅ **Concurrent connections** (SQLite locks on writes)
- ✅ **Production-ready** (used by all major platforms)
- ✅ **Better indexing** and query optimization
- ✅ **Full-text search** built-in
- ✅ **JSON support** for flexible schemas

---

## Local Development Setup

### 1. Install PostgreSQL

**macOS (Homebrew):**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download from https://www.postgresql.org/download/windows/

### 2. Create Database

```bash
# Create database
createdb ventureclaw_dev

# Or using psql
psql postgres
CREATE DATABASE ventureclaw_dev;
\q
```

### 3. Update Environment Variables

Copy `.env.example` to `.env` and update:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/ventureclaw_dev"
```

**Connection string format:**
```
postgresql://[user[:password]@][host][:port]/database[?options]
```

### 4. Run Migrations

```bash
# Generate Prisma client
npm run db:generate

# Run migrations (creates tables)
npm run db:migrate

# Seed initial data (optional)
npm run db:seed
```

### 5. Verify Setup

```bash
# Open Prisma Studio
npm run db:studio

# Check tables
psql ventureclaw_dev
\dt
```

---

## Production Deployment

### Vercel + Supabase (Recommended)

**1. Create Supabase Project**
- Go to https://supabase.com
- Create new project
- Copy connection string

**2. Add to Vercel**
```bash
# Install Vercel CLI
npm i -g vercel

# Add environment variable
vercel env add DATABASE_URL production
# Paste Supabase connection string
```

**3. Deploy**
```bash
# Deploy to Vercel
vercel --prod

# Run migrations on production
vercel env pull .env.production.local
npm run db:migrate
```

### Alternative: Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Create PostgreSQL database
railway add postgresql

# Link project
railway link

# Deploy
railway up
```

---

## Migration Checklist

- [ ] Install PostgreSQL locally
- [ ] Create development database
- [ ] Update `.env` with DATABASE_URL
- [ ] Update `prisma/schema.prisma` (provider = "postgresql")
- [ ] Run `npm run db:migrate`
- [ ] Test locally (create startup, run analysis)
- [ ] Set up production database (Supabase/Railway)
- [ ] Add DATABASE_URL to Vercel
- [ ] Run production migrations
- [ ] Verify production deployment

---

## Common Issues

### "Connection refused"
PostgreSQL not running. Start it:
```bash
# macOS
brew services start postgresql@16

# Linux
sudo systemctl start postgresql
```

### "Authentication failed"
Update password in connection string or:
```bash
psql postgres
ALTER USER postgres PASSWORD 'newpassword';
```

### "Database does not exist"
Create it:
```bash
createdb ventureclaw_dev
```

### "Migration failed"
Reset and try again:
```bash
npm run db:reset
```

---

## Performance Tips

### 1. Connection Pooling

For production, use PgBouncer or Supabase pooling:

```env
# Supabase connection pooling
DATABASE_URL="postgresql://user:pass@host:6543/db?pgbouncer=true"
```

### 2. Indexes

Already optimized in schema.prisma:
```prisma
@@index([status])
@@index([createdAt])
@@index([email])
```

### 3. Query Optimization

Use `select` to fetch only needed fields:
```typescript
const startup = await prisma.startup.findUnique({
  where: { id },
  select: {
    id: true,
    name: true,
    status: true,
    // Only what you need
  },
});
```

### 4. Batch Queries

Use `Promise.all` for parallel queries:
```typescript
const [startups, analyses, activities] = await Promise.all([
  prisma.startup.findMany(),
  prisma.analysis.findMany(),
  prisma.agentActivity.findMany(),
]);
```

---

## Backup & Recovery

### Backup

```bash
# Local backup
pg_dump ventureclaw_dev > backup.sql

# Production (Supabase has automatic backups)
```

### Restore

```bash
# Drop and recreate
dropdb ventureclaw_dev
createdb ventureclaw_dev

# Restore from backup
psql ventureclaw_dev < backup.sql
```

---

## Next Steps

After successful migration:

1. ✅ Test all API endpoints
2. ✅ Run agent analysis end-to-end
3. ✅ Check Prisma Studio for data
4. ✅ Monitor query performance
5. ✅ Set up automatic backups

**Questions?** Check:
- Prisma docs: https://www.prisma.io/docs
- PostgreSQL docs: https://www.postgresql.org/docs/
- Supabase docs: https://supabase.com/docs

---

**Status:** Ready for migration  
**Estimated time:** 15-30 minutes  
**Risk:** Low (can revert to SQLite if needed)

🦾 **VentureClaw: Production-ready infrastructure.**
