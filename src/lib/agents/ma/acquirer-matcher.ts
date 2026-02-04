// M&A Agent: Acquirer Matcher
// Identifies and ranks potential acquirers (strategic, PE, SPACs)

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AcquirerProfile {
  name: string;
  type: 'strategic' | 'private-equity' | 'spac' | 'public-company';
  industry: string;
  recentAcquisitions: string[];
  typicalValuation: string;
  dealSize: string;
  synergies: string[];
  fitScore: number; // 0-100
  contactInfo?: {
    bdContact?: string;
    corpDevContact?: string;
    email?: string;
  };
}

export interface AcquirerMatchResult {
  topAcquirers: AcquirerProfile[];
  reasoning: string;
  outreachStrategy: string;
  timeline: string;
  redFlags: string[];
}

export async function matchAcquirers(startupData: {
  name: string;
  industry: string;
  revenue: number;
  growth: number;
  technology: string;
  team: number;
  customers: number;
  geographic: string;
  moat: string;
}): Promise<AcquirerMatchResult> {
  const prompt = `You are an M&A advisor with 20 years experience in tech exits.

Startup Profile:
- Name: ${startupData.name}
- Industry: ${startupData.industry}
- Revenue: $${startupData.revenue.toLocaleString()}
- Growth: ${startupData.growth}%
- Technology: ${startupData.technology}
- Team Size: ${startupData.team}
- Customers: ${startupData.customers}
- Geography: ${startupData.geographic}
- Competitive Moat: ${startupData.moat}

Task: Identify 20-30 potential acquirers across these categories:

1. **Strategic Acquirers (10-15)**
   - Direct competitors seeking market share
   - Adjacent players seeking product expansion
   - Platform companies seeking vertical integration
   - Tech giants seeking talent/technology

2. **Private Equity (5-10)**
   - Growth equity funds (if revenue < $10M)
   - Buyout funds (if revenue > $10M)
   - Sector-focused PE firms

3. **Public Companies (3-5)**
   - Listed companies in adjacent markets
   - Conglomerates with relevant divisions

4. **SPACs (2-3)** (if applicable)
   - Industry-focused SPACs seeking targets

For each acquirer, provide:
- Name
- Type (strategic/PE/SPAC/public)
- Recent acquisitions (last 3 years)
- Typical valuation range (revenue multiple)
- Typical deal size range
- Strategic synergies (why they'd buy)
- Fit score (0-100)
- Key contacts (if public knowledge)

Then provide:
- Overall outreach strategy (sequencing, messaging)
- Expected timeline (3-12 months)
- Red flags to watch for

Format as JSON:
{
  "topAcquirers": [
    {
      "name": "Company Name",
      "type": "strategic",
      "industry": "SaaS",
      "recentAcquisitions": ["Company A (2024, $100M)", "Company B (2023, $50M)"],
      "typicalValuation": "8-12x revenue",
      "dealSize": "$50M-500M",
      "synergies": ["Expand product line", "Access new market", "Acquire talent"],
      "fitScore": 85,
      "contactInfo": {
        "corpDevContact": "Jane Smith, VP Corp Dev",
        "email": "corpdev@company.com"
      }
    }
  ],
  "reasoning": "Why these acquirers...",
  "outreachStrategy": "Start with top 5 strategic...",
  "timeline": "3-6 months for strategic, 6-12 for PE",
  "redFlags": ["Watch for lowball offers", "Avoid acquirers with poor integration track record"]
}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are an M&A advisor specializing in tech acquisitions. Provide detailed, actionable acquirer lists.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(completion.choices[0].message.content || '{}');

  return {
    topAcquirers: result.topAcquirers || [],
    reasoning: result.reasoning || '',
    outreachStrategy: result.outreachStrategy || '',
    timeline: result.timeline || '',
    redFlags: result.redFlags || [],
  };
}
