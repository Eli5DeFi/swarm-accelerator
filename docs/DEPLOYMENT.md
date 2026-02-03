# 🚀 Deployment Guide

Complete guide to deploying Swarm Accelerator to production.

## Prerequisites

- Vercel account (free tier works)
- Database (Supabase, Railway, or Neon - all have free tiers)
- OpenAI API key with credits
- Stripe account (optional for payments)

---

## Option 1: Quick Deploy (Recommended)

### 1. Deploy to Vercel

Click the button below or follow manual steps:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### 2. Set Up Database

**Using Supabase (Recommended - Free):**

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings → Database
4. Format: `postgresql://postgres:[password]@[host]:5432/postgres`

**Using Railway (Alternative):**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Create PostgreSQL database
railway add postgresql

# Get connection string
railway variables
```

**Using Neon (Alternative):**

1. Go to [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string

### 3. Run Database Migrations

```bash
# Set DATABASE_URL
export DATABASE_URL="postgresql://..."

# Run migrations
npx prisma migrate deploy

# Seed database (optional)
npm run db:seed
```

### 4. Configure Environment Variables

In Vercel dashboard, add these environment variables:

```env
# Required
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-proj-...
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app

# Optional (for payments)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### 5. Redeploy

```bash
vercel --prod
```

✅ **Done!** Your app is live at `https://your-project.vercel.app`

---

## Option 2: Manual Production Setup

### Step 1: Database Setup

#### Supabase Setup

```bash
# 1. Create project at supabase.com
# 2. Get connection string (Settings → Database → Connection string)
# 3. Format for Prisma:
DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"

# 4. Run migrations
npx prisma migrate deploy

# 5. Generate Prisma client
npx prisma generate
```

#### Enable Connection Pooling (Important!)

Supabase connection string with pooling:
```
DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:6543/postgres?pgbouncer=true"
```

### Step 2: OpenAI API Setup

1. Get API key: https://platform.openai.com/api-keys
2. Add $10+ credits to your account
3. Save key for environment variables

**Cost estimation:**
- Per analysis: ~$0.50-0.80 (4 agents × GPT-4 Turbo)
- 100 analyses: ~$50-80
- 1000 analyses: ~$500-800

### Step 3: Stripe Setup (Optional)

1. Create Stripe account
2. Get API keys (Dashboard → Developers → API keys)
3. Create products in Stripe:

```bash
# Create products via Stripe CLI or Dashboard
# You need 4 price IDs:
# - Starter Monthly
# - Starter Yearly
# - Growth Monthly
# - Growth Yearly
```

4. Set up webhook endpoint:
   - URL: `https://your-domain.vercel.app/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_*`
   - Copy webhook secret

### Step 4: Vercel Deployment

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Link project
vercel link

# 4. Add environment variables (see below)
vercel env add DATABASE_URL
vercel env add OPENAI_API_KEY
# ... add all required variables

# 5. Deploy
vercel --prod
```

#### Environment Variables (Vercel)

**Required:**
```
DATABASE_URL
OPENAI_API_KEY
NEXT_PUBLIC_APP_URL
```

**Optional (Payments):**
```
STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_PRICE_STARTER_MONTHLY
STRIPE_PRICE_STARTER_YEARLY
STRIPE_PRICE_GROWTH_MONTHLY
STRIPE_PRICE_GROWTH_YEARLY
```

**Optional (Advanced):**
```
REDIS_URL
PINECONE_API_KEY
LANGCHAIN_TRACING_V2
SENTRY_DSN
POSTHOG_API_KEY
```

### Step 5: DNS & Custom Domain

1. In Vercel dashboard, go to Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for SSL certificate (automatic)

### Step 6: Post-Deployment Checklist

- [ ] Test pitch submission
- [ ] Verify AI analysis works
- [ ] Check Stripe checkout (if enabled)
- [ ] Monitor error logs (Vercel → Logs)
- [ ] Set up monitoring (Sentry, PostHog)

---

## Production Best Practices

### 1. Database Connection Pooling

**Problem:** Serverless functions create many connections  
**Solution:** Use Supabase pooler or PgBouncer

```env
# Use pooling connection string
DATABASE_URL="postgresql://...?pgbouncer=true&connection_limit=1"
```

### 2. Error Monitoring

**Sentry Setup:**

```bash
npm install @sentry/nextjs

# Initialize
npx @sentry/wizard@latest -i nextjs
```

Add to `next.config.ts`:
```typescript
const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig(nextConfig, {
  silent: true,
});
```

### 3. Rate Limiting

Add rate limiting to prevent abuse:

```typescript
// middleware.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});
```

### 4. Caching Strategy

- Use Vercel Edge Caching for static content
- Redis for session data and rate limiting
- Prisma query caching for repeated queries

### 5. Environment-Specific Configs

**Staging Environment:**
```env
NEXT_PUBLIC_APP_URL=https://staging.yourapp.com
OPENAI_API_KEY=sk_test_... # Use test key
STRIPE_SECRET_KEY=sk_test_... # Use test mode
```

**Production Environment:**
```env
NEXT_PUBLIC_APP_URL=https://yourapp.com
OPENAI_API_KEY=sk_proj_... # Production key
STRIPE_SECRET_KEY=sk_live_... # Live mode
```

---

## Scaling & Performance

### When to Scale

**User Metrics:**
- 1,000 monthly active users → Current setup ✅
- 10,000 MAU → Add Redis caching
- 100,000 MAU → Dedicated database instance
- 1M+ MAU → Load balancing, CDN, microservices

### Database Scaling

**Vertical Scaling (Easier):**
- Supabase: Upgrade to Pro ($25/mo) → 8GB RAM
- Railway: Upgrade to higher tier
- Supports ~10,000 concurrent users

**Horizontal Scaling (Advanced):**
- Read replicas for heavy reads
- Connection pooling (PgBouncer)
- Sharding for multi-tenancy

### API Optimization

1. **Prisma Query Optimization:**
   ```typescript
   // Bad: N+1 query
   const startups = await prisma.startup.findMany();
   for (const startup of startups) {
     const analysis = await prisma.analysis.findUnique({ ... });
   }
   
   // Good: Single query with include
   const startups = await prisma.startup.findMany({
     include: { analysis: true },
   });
   ```

2. **Agent Parallelization:**
   Already implemented! All 4 agents run in parallel.

3. **Caching Results:**
   ```typescript
   // Cache analysis results for 24h
   const cached = await redis.get(`analysis:${startupId}`);
   if (cached) return JSON.parse(cached);
   
   const result = await analyzeStartup(startupId);
   await redis.set(`analysis:${startupId}`, JSON.stringify(result), {
     ex: 86400, // 24 hours
   });
   ```

---

## Monitoring & Alerts

### Health Checks

```bash
# Add health check endpoint
# /api/health/route.ts

export async function GET() {
  const checks = {
    database: await checkDatabase(),
    openai: await checkOpenAI(),
    redis: await checkRedis(),
  };
  
  const healthy = Object.values(checks).every(c => c);
  
  return Response.json(checks, {
    status: healthy ? 200 : 503,
  });
}
```

### Monitoring Checklist

- [ ] Set up uptime monitoring (UptimeRobot, Better Uptime)
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring (Vercel Analytics)
- [ ] Database monitoring (Supabase dashboard)
- [ ] Cost alerts (Vercel, OpenAI, Stripe)

---

## Troubleshooting

### Common Issues

**"Too many database connections"**
- Solution: Use connection pooling
- Check: `DATABASE_URL` includes `?pgbouncer=true`

**"OpenAI API rate limit"**
- Solution: Implement exponential backoff
- Upgrade: OpenAI tier (higher rate limits)

**"Serverless function timeout"**
- Issue: Analysis takes >10s
- Solution: Move to background job queue (Inngest, Trigger.dev)

**"Memory limit exceeded"**
- Issue: Large analysis payloads
- Solution: Stream results instead of buffering

### Debug Mode

```env
# Enable verbose logging
LOG_LEVEL=debug
LANGCHAIN_TRACING_V2=true
PRISMA_QUERY_LOG=true
```

---

## Cost Breakdown (Production)

**Monthly costs at 1,000 analyses:**

| Service | Cost | Notes |
|---------|------|-------|
| Vercel (Pro) | $20 | Needed for commercial use |
| Supabase (Pro) | $25 | 8GB database, daily backups |
| OpenAI API | $500-800 | ~$0.50-0.80 per analysis |
| Stripe | 2.9% + $0.30 | Per transaction |
| Redis (Upstash) | $10 | For caching |
| **Total** | **~$555-855** | Variable based on usage |

**Revenue at 1,000 analyses:**
- 100 paying users @ $199/mo = $19,900
- Gross margin: ~96% 💰

---

## Next Steps After Deployment

1. **Launch Checklist:**
   - [ ] Submit to Product Hunt
   - [ ] Post on X/Twitter
   - [ ] Share on LinkedIn
   - [ ] Post on Hacker News
   - [ ] Join startup communities

2. **Analytics:**
   - Set up Google Analytics / Plausible
   - Track conversion funnels
   - Monitor user behavior (PostHog)

3. **Feedback Loop:**
   - Add feedback widget (Canny, Typeform)
   - Weekly user interviews
   - Iterate based on data

---

**Questions?** Open an issue or check our [FAQ](./FAQ.md)
