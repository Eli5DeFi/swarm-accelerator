/**
 * Assumption Extractor
 * 
 * Extracts explicit and implicit assumptions from startup pitch decks.
 * Uses LLM + NLP to identify key assumptions about:
 * - Pricing (willingness to pay)
 * - Customer acquisition cost (CAC)
 * - Market size
 * - Sales cycle
 * - Technical feasibility
 * - Competitive advantage
 */

import OpenAI from 'openai';
import { logger } from '../logger';

// Initialize OpenAI client
const getAIClient = () => new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface Assumption {
  id?: string;
  startupId: string;
  type: AssumptionType;
  statement: string;
  value: string | number;
  unit?: string;
  confidence: number; // 0-100
  source: string; // "pitch_deck", "founder_interview", "metrics"
  isValidated: boolean;
  validatedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum AssumptionType {
  PRICING = "pricing",
  CAC = "cac",
  MARKET_SIZE = "market_size",
  SALES_CYCLE = "sales_cycle",
  GROWTH_RATE = "growth_rate",
  TECHNICAL = "technical",
  COMPETITIVE = "competitive",
  REGULATORY = "regulatory",
  TEAM = "team",
  TIMING = "timing",
}

export interface AssumptionExtractionResult {
  assumptions: Assumption[];
  summary: string;
  riskScore: number; // 0-100 (higher = more risky assumptions)
}

/**
 * Extract assumptions from pitch text using LLM
 */
export async function extractAssumptions(
  startupId: string,
  pitchText: string,
  pitchData?: {
    name?: string;
    tagline?: string;
    description?: string;
    fundingAsk?: number;
    teamSize?: number;
    stage?: string;
  }
): Promise<AssumptionExtractionResult> {
  logger.info('[PPE] Extracting assumptions', { startupId });

  const ai = getAIClient();

  // Build comprehensive context
  const context = `
Startup: ${pitchData?.name || 'Unknown'}
Tagline: ${pitchData?.tagline || 'N/A'}
Stage: ${pitchData?.stage || 'Unknown'}
Team Size: ${pitchData?.teamSize || 'Unknown'}
Funding Ask: $${pitchData?.fundingAsk ? (pitchData.fundingAsk / 100).toLocaleString() : 'Unknown'}

Pitch:
${pitchText}

${pitchData?.description ? `\nDescription:\n${pitchData.description}` : ''}
`.trim();

  const prompt = `You are an expert startup analyst. Extract ALL assumptions from this pitch deck.

For each assumption, identify:
1. Type (pricing, cac, market_size, sales_cycle, growth_rate, technical, competitive, regulatory, team, timing)
2. The specific statement/claim
3. The numerical value (if quantifiable)
4. Unit (if applicable: dollars, months, users, etc.)
5. Confidence level (0-100, how confident is the founder about this?)

${context}

IMPORTANT: Look for both EXPLICIT assumptions (stated directly) and IMPLICIT assumptions (implied but not stated).

Examples of assumptions:
- "Developers will pay $50/month" → pricing assumption
- "We can acquire users for $5 CPA via Google Ads" → CAC assumption
- "Market size is $10B" → market_size assumption
- "Sales cycle is 2 weeks" → sales_cycle assumption
- "We'll grow 20% MoM" → growth_rate assumption
- "Our AI model is 95% accurate" → technical assumption
- "No competitors have real-time analysis" → competitive assumption
- "GDPR compliance not required for MVP" → regulatory assumption
- "We can hire 5 engineers in 3 months" → team assumption
- "Market is ready now" → timing assumption

Return JSON array with this exact structure:
{
  "assumptions": [
    {
      "type": "pricing",
      "statement": "Developers will pay $50/month for code review",
      "value": 50,
      "unit": "dollars/month",
      "confidence": 70,
      "source": "pitch_deck"
    }
  ],
  "summary": "Brief 2-3 sentence summary of key risky assumptions",
  "riskScore": 65
}

Be thorough. Extract 8-15 assumptions minimum.`;

  try {
    const response = await ai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert startup analyst. Return valid JSON only, no markdown.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content?.trim() || '{}';
    
    // Clean up markdown code blocks if present
    const jsonStr = content
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    const result = JSON.parse(jsonStr);

    // Validate and transform
    const assumptions: Assumption[] = (result.assumptions || []).map((a: any) => ({
      startupId,
      type: a.type as AssumptionType,
      statement: a.statement,
      value: a.value,
      unit: a.unit || '',
      confidence: a.confidence,
      source: a.source || 'pitch_deck',
      isValidated: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    logger.info('[PPE] Extracted assumptions', {
      startupId,
      count: assumptions.length,
      riskScore: result.riskScore
    });

    return {
      assumptions,
      summary: result.summary || 'No summary available',
      riskScore: result.riskScore || 50,
    };

  } catch (error) {
    logger.error('[PPE] Assumption extraction failed', { error, startupId });
    
    // Return fallback assumptions
    return {
      assumptions: [
        {
          startupId,
          type: AssumptionType.MARKET_SIZE,
          statement: 'Market exists for this product',
          value: 'unknown',
          confidence: 50,
          source: 'pitch_deck',
          isValidated: false,
        },
        {
          startupId,
          type: AssumptionType.PRICING,
          statement: 'Customers will pay for this product',
          value: 'unknown',
          confidence: 50,
          source: 'pitch_deck',
          isValidated: false,
        },
      ],
      summary: 'Insufficient data to extract detailed assumptions',
      riskScore: 80,
    };
  }
}

/**
 * Validate assumption against actual metrics
 */
export async function validateAssumption(
  assumption: Assumption,
  actualMetrics: {
    revenue?: number;
    users?: number;
    cac?: number;
    avgDealSize?: number;
    monthsActive?: number;
  }
): Promise<{
  isValid: boolean;
  deviation: number; // percentage
  confidence: number;
  notes: string;
}> {
  logger.info('[PPE] Validating assumption', { assumption: assumption.id });

  let deviation = 0;
  let isValid = true;
  let notes = '';

  switch (assumption.type) {
    case AssumptionType.PRICING:
      if (actualMetrics.avgDealSize && typeof assumption.value === 'number') {
        const expected = assumption.value;
        const actual = actualMetrics.avgDealSize;
        deviation = Math.abs((actual - expected) / expected) * 100;
        isValid = deviation < 30; // Within 30%
        notes = `Expected $${expected}, actual $${actual} (${deviation.toFixed(1)}% deviation)`;
      }
      break;

    case AssumptionType.CAC:
      if (actualMetrics.cac && typeof assumption.value === 'number') {
        const expected = assumption.value;
        const actual = actualMetrics.cac;
        deviation = Math.abs((actual - expected) / expected) * 100;
        isValid = deviation < 50; // CAC can vary more
        notes = `Expected $${expected} CAC, actual $${actual} (${deviation.toFixed(1)}% deviation)`;
      }
      break;

    case AssumptionType.GROWTH_RATE:
      if (actualMetrics.users && actualMetrics.monthsActive && typeof assumption.value === 'number') {
        // Calculate actual growth rate from user count
        const expectedMonthlyGrowth = assumption.value;
        // This is simplified - real implementation would track historical data
        notes = `Monitoring growth rate assumption`;
        isValid = true; // Placeholder
      }
      break;

    default:
      notes = `Validation not yet implemented for ${assumption.type}`;
  }

  return {
    isValid,
    deviation,
    confidence: isValid ? 80 : 40,
    notes,
  };
}

/**
 * Calculate assumption risk score
 */
export function calculateAssumptionRisk(assumptions: Assumption[]): {
  overallRisk: number;
  criticalAssumptions: Assumption[];
  riskFactors: string[];
} {
  const criticalTypes = [
    AssumptionType.PRICING,
    AssumptionType.CAC,
    AssumptionType.MARKET_SIZE,
  ];

  const criticalAssumptions = assumptions.filter(
    a => criticalTypes.includes(a.type) && a.confidence < 70
  );

  const riskFactors: string[] = [];

  // Check for high-risk patterns
  const pricingAssumptions = assumptions.filter(a => a.type === AssumptionType.PRICING);
  if (pricingAssumptions.some(a => a.confidence < 60)) {
    riskFactors.push('Uncertain pricing assumptions');
  }

  const marketAssumptions = assumptions.filter(a => a.type === AssumptionType.MARKET_SIZE);
  if (marketAssumptions.length === 0) {
    riskFactors.push('No market size assumptions identified');
  }

  const competitiveAssumptions = assumptions.filter(a => a.type === AssumptionType.COMPETITIVE);
  if (competitiveAssumptions.some(a => a.statement.toLowerCase().includes('no competitor'))) {
    riskFactors.push('Claims no competition (high risk)');
  }

  // Calculate overall risk
  const avgConfidence = assumptions.reduce((sum, a) => sum + a.confidence, 0) / assumptions.length;
  const overallRisk = 100 - avgConfidence;

  return {
    overallRisk: Math.min(100, overallRisk + criticalAssumptions.length * 10),
    criticalAssumptions,
    riskFactors,
  };
}
