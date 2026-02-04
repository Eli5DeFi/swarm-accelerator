# 🚀 Quick Start Guide

Get VentureClaw running locally in 5 minutes.

## Prerequisites

- **Node.js 20+** - [Download](https://nodejs.org/)
- **PostgreSQL 15+** - [Install](https://www.postgresql.org/download/) or use [Supabase](https://supabase.com) (free)
- **OpenAI API Key** - [Get one](https://platform.openai.com/api-keys) ($5-10 credits enough for testing)

## Setup

### Option 1: Automated Setup (Recommended)

```bash
# Clone the repo
git clone https://github.com/Eli5DeFi/ventureclaw.git
cd ventureclaw

# Run setup script
./scripts/setup-dev.sh
```

The script will:
1. Install dependencies
2. Create `.env.local` from template
3. Set up the database
4. Generate Prisma client

### Option 2: Manual Setup

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.example .env.local

# 3. Edit .env.local and add your OpenAI API key
# DATABASE_URL="postgresql://..." (update if needed)
# OPENAI_API_KEY="sk-proj-..."

# 4. Create database (if using local PostgreSQL)
createdb swarm_accelerator

# 5. Run migrations
npx prisma migrate dev

# 6. Generate Prisma client
npx prisma generate
```

## Running the App

```bash
# Start development server
npm run dev

# Visit in browser
open http://localhost:3000
```

## Testing the AI Agents

### 1. Submit a Test Pitch

Visit http://localhost:3000/pitch and fill out the form:

**Example Startup:**
- Name: "AI Task Manager"
- Tagline: "Smart todo lists that understand context"
- Industry: "AI / Machine Learning"
- Stage: "MVP"
- Description: "We built an AI-powered task management app that automatically prioritizes your todos based on context, deadlines, and your work patterns. Uses GPT-4 to understand natural language input and suggest optimal scheduling."
- Funding Ask: $500,000
- Team Size: 3
- Founder Email: test@example.com

### 2. Watch the Analysis

After submission, you'll be redirected to `/pitch/[id]` where you can watch:
- ✅ All 4 AI agents running in parallel
- ✅ Real-time status updates
- ✅ Final analysis with scores and recommendations

### 3. View the Results

The analysis includes:
- **Financial Score** - Revenue model, burn rate, valuation
- **Technical Score** - Tech stack, scalability, security
- **Market Score** - TAM, competition, GTM strategy
- **Legal Score** - Regulatory, IP, corporate structure
- **Overall Score** - Weighted average (Financial 30%, Market 30%, Technical 25%, Legal 15%)
- **Recommendation** - APPROVED (75+), CONDITIONAL (55-74), or REJECTED (<55)

## Database Management

```bash
# View database in Prisma Studio (GUI)
npx prisma studio

# Create a new migration
npx prisma migrate dev --name description_of_changes

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

## Troubleshooting

### "Can't connect to database"
- Make sure PostgreSQL is running: `brew services start postgresql@15`
- Check DATABASE_URL in `.env.local`
- Try: `psql -U postgres -c "CREATE DATABASE swarm_accelerator;"`

### "OpenAI API error"
- Verify your API key in `.env.local`
- Check you have credits: https://platform.openai.com/usage
- Make sure it starts with `sk-proj-` or `sk-`

### "Module not found" errors
- Run: `npm install`
- Delete `node_modules` and `package-lock.json`, then `npm install` again

### Agents are slow (>30 seconds)
- This is normal for first run (cold start)
- Subsequent runs should be ~4-8 seconds
- GPT-4 Turbo is faster than base GPT-4

## Next Steps

- 📖 Read the [Architecture docs](./ARCHITECTURE.md)
- 💰 Check out the [Monetization strategy](./MONETIZATION.md)
- 🤝 Contribute! See [CONTRIBUTING.md](../CONTRIBUTING.md)
- 🐛 Found a bug? [Open an issue](https://github.com/Eli5DeFi/ventureclaw/issues)

## Local Development Tips

### Hot Reload
Next.js supports hot reload - just save your files and see changes instantly.

### Type Safety
We use TypeScript + Prisma for full type safety. Run:
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

### Testing API Endpoints

Use `curl` or Postman:

```bash
# Submit a pitch
curl -X POST http://localhost:3000/api/pitches \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Startup",
    "tagline": "Testing the API",
    "description": "This is a test pitch to verify the API is working correctly. We are building something innovative in the tech space.",
    "stage": "MVP",
    "industry": "SaaS",
    "fundingAsk": 500000,
    "teamSize": 2,
    "founderName": "Test Founder",
    "founderEmail": "test@example.com"
  }'

# Get all pitches
curl http://localhost:3000/api/pitches

# Get agent activity
curl http://localhost:3000/api/agent-activity
```

---

**Need help?** Open an issue or ask in Discord (coming soon).
