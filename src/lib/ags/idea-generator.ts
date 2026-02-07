/**
 * AI-Powered Startup Idea Generator
 * Uses Claude Opus to generate validated startup ideas from market intelligence
 */

import Anthropic from '@anthropic-ai/sdk';
import { MarketIntelligence, type MarketGap, type TechTrend } from './market-intelligence';

export interface StartupIdea {
  name: string;
  tagline: string;
  problem: string;
  solution: string;
  market: {
    tam: string;
    growthRate: string;
    segment: string;
  };
  moat: string;
  revenueModel: string;
  targetCustomer: string;
  metrics: {
    key: string;
    target: string;
    timeline: string;
  }[];
  timeline: {
    month: number;
    milestone: string;
  }[];
  techStack: string[];
  competitiveAdvantage: string;
}

export class IdeaGenerator {
  private anthropic: Anthropic;
  private intelligence: MarketIntelligence;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    this.intelligence = new MarketIntelligence();
  }

  /**
   * Generate a single startup idea
   */
  async generateIdea(): Promise<StartupIdea> {
    // Gather market intelligence
    const intel = await this.intelligence.gatherIntelligence();

    // Build context-rich prompt
    const prompt = this.buildIdeaPrompt(intel);

    // Generate idea using Claude Opus (best model)
    const response = await this.anthropic.messages.create({
      model: 'claude-opus-4',
      max_tokens: 8192,
      temperature: 0.9, // High creativity
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const content = response.content[0];
    const text = content.type === 'text' ? content.text : '';

    // Parse idea from response
    return this.parseIdea(text);
  }

  /**
   * Generate batch of ideas
   */
  async generateBatch(count: number = 10): Promise<StartupIdea[]> {
    console.log(`Generating ${count} startup ideas...`);
    
    const ideas = await Promise.all(
      Array(count).fill(0).map(() => this.generateIdea())
    );

    return ideas;
  }

  /**
   * Build prompt for idea generation
   */
  private buildIdeaPrompt(intel: {
    trends: TechTrend[];
    gaps: MarketGap[];
    vcInterests: string[];
  }): string {
    return `You are a world-class startup strategist. Generate ONE breakthrough startup idea.

**MARKET INTELLIGENCE:**

Emerging Tech Trends:
${intel.trends.map(t => `- ${t.technology}: ${t.growthRate}% growth, ${t.githubStars} GitHub stars, ${t.maturity} maturity`).join('\n')}

Pain Points (from Reddit/HN):
${intel.gaps.map(g => `- ${g.problem} (mentioned ${g.frequency}x, sentiment: ${g.sentiment})`).join('\n')}

VC Interests:
${intel.vcInterests.map(i => `- ${i}`).join('\n')}

**REQUIREMENTS:**

1. **Real Problem:** Solve a validated pain point (from Reddit/HN data above)
2. **Emerging Tech:** Use 0-2 year old technology (not mainstream yet)
3. **Clear Monetization:** B2B SaaS preferred (>$50 ACV), path to $10M ARR in 3 years
4. **Unfair Advantage:** Tech moat, network effects, or proprietary data
5. **Timing:** Why now? (market conditions + tech availability)

**OUTPUT FORMAT (JSON):**

{
  "name": "Startup name (2-3 words, memorable)",
  "tagline": "One-line pitch (under 10 words)",
  "problem": "What problem does this solve? (2-3 sentences, be specific)",
  "solution": "How do you solve it? (3-4 sentences, technical depth)",
  "market": {
    "tam": "Total addressable market ($B)",
    "growthRate": "Annual growth rate (%)",
    "segment": "Target segment (be specific)"
  },
  "moat": "Why can't competitors copy this? (2-3 sentences)",
  "revenueModel": "How do you make money? (pricing, business model)",
  "targetCustomer": "Who is the ideal customer? (persona, size, industry)",
  "metrics": [
    {
      "key": "Most important metric (MRR, users, etc.)",
      "target": "12-month target",
      "timeline": "Path to get there"
    }
  ],
  "timeline": [
    { "month": 1, "milestone": "What to ship in month 1" },
    { "month": 3, "milestone": "What to ship in month 3" },
    { "month": 6, "milestone": "What to ship in month 6" },
    { "month": 12, "milestone": "What to achieve in month 12" }
  ],
  "techStack": ["Key technologies needed"],
  "competitiveAdvantage": "Why will you win vs. incumbents?"
}

**IMPORTANT:**
- Be specific (not "AI for X" - explain the exact AI technique)
- Use real numbers (market size, pricing, metrics)
- Focus on B2B (easier to monetize)
- Think 10x better, not 10% better

Generate the idea now:`;
  }

  /**
   * Parse JSON idea from Claude response
   */
  private parseIdea(text: string): StartupIdea {
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse idea from response');
    }

    const idea = JSON.parse(jsonMatch[0]);
    return idea as StartupIdea;
  }

  /**
   * Score idea quality (0-100)
   */
  async scoreIdea(idea: StartupIdea): Promise<number> {
    const scoringPrompt = `Evaluate this startup idea on a scale of 0-100:

${JSON.stringify(idea, null, 2)}

Score based on:
- Problem clarity (20 points)
- Solution feasibility (20 points)
- Market size + growth (20 points)
- Competitive moat (20 points)
- Revenue model clarity (20 points)

Output format:
{
  "score": <0-100>,
  "reasoning": "Brief explanation of score"
}`;

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: scoringPrompt
      }]
    });

    const content = response.content[0];
    const text = content.type === 'text' ? content.text : '';
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return result.score;
    }

    return 0;
  }
}
