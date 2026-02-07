# 🚀 AGS Quick Start Guide

Get AI-Generated Startups running in 5 minutes.

---

## 1. Verify Setup (30 seconds)

```bash
cd /Users/eli5defi/.gemini/antigravity/scratch/swarm-accelerator

# Check environment
echo $ANTHROPIC_API_KEY  # Should output: sk-ant-...

# Run tests
npm test  # Should see: 51 passed

# Check database
npx prisma studio  # Should see GeneratedIdea table
```

✅ If all green, proceed to step 2.

---

## 2. Generate First Ideas (2 minutes)

### Option A: Via API (Recommended)

```bash
# Start dev server (if not running)
npm run dev

# In another terminal, generate ideas
curl -X POST http://localhost:3000/api/ags/generate \
  -H "x-api-key: $(npx prisma db execute --stdin <<< 'SELECT apiKey FROM User WHERE tier = "enterprise" LIMIT 1' | tail -1)" \
  -H "Content-Type: application/json" \
  -d '{"count": 5}'
```

### Option B: Via Node Script

```bash
node << 'EOF'
const { IdeaGenerator } = require('./src/lib/ags/idea-generator');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const generator = new IdeaGenerator();

async function main() {
  console.log('🧬 Generating 5 startup ideas...\n');
  
  const ideas = await generator.generateBatch(5);
  
  for (const idea of ideas) {
    const score = await generator.scoreIdea(idea);
    
    await prisma.generatedIdea.create({
      data: {
        name: idea.name,
        tagline: idea.tagline,
        problem: idea.problem,
        solution: idea.solution,
        marketTam: idea.market.tam,
        marketGrowth: idea.market.growthRate,
        marketSegment: idea.market.segment,
        moat: idea.moat,
        revenueModel: idea.revenueModel,
        targetCustomer: idea.targetCustomer,
        metrics: JSON.stringify(idea.metrics),
        timeline: JSON.stringify(idea.timeline),
        techStack: JSON.stringify(idea.techStack),
        competitiveAdvantage: idea.competitiveAdvantage,
        score,
        status: score >= 85 ? 'PUBLISHED' : 'DRAFT'
      }
    });
    
    console.log(`✓ ${idea.name} (${score}/100) ${score >= 85 ? '⭐ VALIDATED' : ''}`);
  }
  
  console.log('\n✅ Done!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
EOF
```

**Expected output:**
```
🧬 Generating 5 startup ideas...

✓ VectorFlow (88/100) ⭐ VALIDATED
✓ ClimateLens (86/100) ⭐ VALIDATED
✓ DevSecOps AI (82/100)
✓ NeuralDB (79/100)
✓ CodeReview AI (91/100) ⭐ VALIDATED

✅ Done!
```

---

## 3. Browse Ideas (1 minute)

Open browser:
```bash
open http://localhost:3000/ags/ideas
```

**You should see:**
- Grid of validated ideas (score ≥ 85)
- Idea cards with name, tagline, score
- Market info (TAM, growth)
- Tech stack tags

**Click an idea** to see full details.

---

## 4. Test Application Flow (1 minute)

1. Click any idea card
2. Scroll to "Apply Now" section
3. Click "Apply Now" button
4. Fill form:
   - Name: "Test Founder"
   - Email: "test@example.com"
   - Bio: "I'm testing the AGS system and this is my bio that needs to be at least 50 characters long."
   - Experience: "I have 10 years of experience building startups. I've founded 3 companies, raised $5M in funding, and have deep expertise in AI/ML. I'm passionate about solving real problems and believe this idea has massive potential. My technical background includes building scalable systems at Google for 5 years."
   - Commitment: "Full-time"
5. Click "Submit Application"
6. See success screen ✅

**Verify in database:**
```bash
npx prisma studio
# FounderApplication table → Should see your test application
```

---

## 5. Production Deployment (30 seconds)

```bash
# Build for production
npm run build

# Start production server
npm start

# Or deploy to Vercel
vercel deploy --prod
```

**Set environment variables in production:**
```
ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL=postgresql://...  (for PostgreSQL, optional)
```

---

## 🎯 Next Steps

### Set Up Daily Generation (5 min)

Add cron job to OpenClaw (or use your preferred scheduler):

```typescript
{
  name: "AGS Daily Generation",
  schedule: {
    kind: "cron",
    expr: "0 9 * * *",  // 9am UTC daily
    tz: "UTC"
  },
  payload: {
    kind: "systemEvent",
    text: "Generate daily AGS batch"
  },
  sessionTarget: "main",
  enabled: true
}
```

### Announce Launch

**Twitter:**
```
🧬 We just launched AI-Generated Startups!

VentureClaw now generates 100 validated startup ideas/day.

✅ Pre-validated by 7 AI sharks
💰 $500K funding
🤖 AI co-founder included

Browse ideas: https://ventureclaw.net/ags/ideas

The future of startup creation is here 🚀
```

**LinkedIn:**
```
Excited to announce: VentureClaw AI-Generated Startups (AGS) is live!

What if instead of waiting for founders to come to us, we generated startup ideas and recruited the best founders?

That's exactly what AGS does:
- AI generates 100 validated startup ideas per day
- Each idea pre-scored by 7 AI agents (score ≥85)
- Founders apply to build the idea they love
- Selected founder gets $500K + AI co-founder

Browse validated ideas at https://ventureclaw.net/ags/ideas

This is just the beginning. The future of venture capital is autonomous.
```

---

## 📊 KPIs to Track

**Daily:**
- Ideas generated
- Validated ideas (score ≥85)
- Applications submitted
- Avg idea score

**Weekly:**
- Top 5 ideas by score
- Application quality (review manually)
- Founder interviews scheduled

**Monthly:**
- Founders accepted
- Startups launched
- Portfolio value
- Revenue (licensing + SaaS)

---

## 🐛 Common Issues

**"Missing API key"**
→ Set `ANTHROPIC_API_KEY` in `.env`

**"No ideas showing"**
→ Generate ideas first (step 2)

**"All ideas are DRAFT"**
→ Normal if scores < 85. Generate more or lower threshold.

**"Build failed"**
→ Run `npm install` and `npx prisma generate`

**"Tests failing"**
→ Check Anthropic client isn't initializing in test env

---

## 🏁 Success Checklist

- [x] Environment set up
- [x] Ideas generated
- [x] Browse page working
- [x] Application flow tested
- [x] Database verified
- [x] Production build successful
- [ ] Daily cron set up
- [ ] Public announcement

---

**Status:** ✅ Ready to Ship  
**Time to Deploy:** 5 minutes  
**Difficulty:** Easy

---

*Let's generate the future! 🧬* 🚀
