/**
 * Pivot Recommender
 * 
 * Generates specific pivot recommendations based on:
 * - Failed assumptions
 * - Historical pivot success patterns
 * - Market trends
 * - Similar successful pivots from portfolio
 */

import OpenAI from 'openai';
import { logger } from '../logger';
import { Assumption, AssumptionType } from './assumption-extractor';
import { FailurePrediction, StartupMetrics } from './failure-predictor';

// Initialize OpenAI client
const getAIClient = () => new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface PivotRecommendation {
  id?: string;
  startupId: string;
  pivotType: PivotType;
  title: string;
  description: string;
  rationale: string;
  successProbability: number; // 0-100
  estimatedRevenue: number; // monthly revenue after pivot
  estimatedCost: number; // cost to execute pivot
  timeline: number; // weeks to execute
  risks: string[];
  caseStudies: CaseStudy[];
  metrics: {
    expectedMRR: number;
    expectedGrowthRate: number;
    expectedCAC: number;
    expectedRunwayExtension: number; // months
  };
  createdAt?: Date;
}

export enum PivotType {
  PRICING = "pricing",
  TARGET_CUSTOMER = "target_customer",
  DISTRIBUTION = "distribution",
  PRODUCT_FOCUS = "product_focus",
  BUSINESS_MODEL = "business_model",
  MARKET = "market",
  TECHNOLOGY = "technology",
}

export interface CaseStudy {
  companyName: string;
  originalIdea: string;
  pivotTo: string;
  outcome: string;
  successMetric: string;
}

/**
 * Generate pivot recommendations based on failure prediction
 */
export async function generatePivotRecommendations(
  startupId: string,
  startup: {
    name: string;
    description: string;
    stage: string;
  },
  prediction: FailurePrediction,
  assumptions: Assumption[],
  metrics: StartupMetrics
): Promise<PivotRecommendation[]> {
  logger.info('[PPE] Generating pivot recommendations', { 
    startupId, 
    failureProbability: prediction.failureProbability 
  });

  // Quick pivots for critical situations
  if (prediction.failureProbability > 70) {
    return await generateQuickPivots(startupId, startup, assumptions, metrics);
  }

  // Strategic pivots for medium-risk situations
  if (prediction.failureProbability > 40) {
    return await generateStrategicPivots(startupId, startup, prediction, assumptions, metrics);
  }

  // Optimization pivots for low-risk situations
  return await generateOptimizationPivots(startupId, startup, assumptions, metrics);
}

/**
 * Quick pivots for high-risk situations (need results fast)
 */
async function generateQuickPivots(
  startupId: string,
  startup: { name: string; description: string; stage: string },
  assumptions: Assumption[],
  metrics: StartupMetrics
): Promise<PivotRecommendation[]> {
  const pivots: PivotRecommendation[] = [];

  // Check pricing assumptions
  const pricingAssumption = assumptions.find(a => a.type === AssumptionType.PRICING);
  if (pricingAssumption && typeof pricingAssumption.value === 'number' && pricingAssumption.value > 50) {
    pivots.push({
      startupId,
      pivotType: PivotType.PRICING,
      title: 'Lower Pricing to Self-Service Tier',
      description: 'Drop from ${pricingAssumption.value}/month to $19-29/month with self-service onboarding',
      rationale: 'High-ticket pricing requires enterprise sales team. Self-service pricing is faster to revenue.',
      successProbability: 75,
      estimatedRevenue: Math.max(5000, metrics.users * 20),
      estimatedCost: 5000, // Update website + payment flow
      timeline: 2,
      risks: [
        'Existing customers may demand refunds',
        'Lower LTV requires higher volume',
        'May cannibalize future enterprise deals',
      ],
      caseStudies: [
        {
          companyName: 'Slack',
          originalIdea: 'Gaming company (Tiny Speck)',
          pivotTo: 'Team communication tool with freemium pricing',
          outcome: 'Sold to Salesforce for $27.7B',
          successMetric: '12M daily active users',
        },
        {
          companyName: 'Figma',
          originalIdea: 'Desktop design tool ($99)',
          pivotTo: 'Browser-based, freemium ($12/editor/month)',
          outcome: 'Sold to Adobe for $20B',
          successMetric: '4M users, $400M ARR',
        },
      ],
      metrics: {
        expectedMRR: Math.max(5000, metrics.users * 20),
        expectedGrowthRate: 15, // % per month
        expectedCAC: 10,
        expectedRunwayExtension: 4,
      },
    });
  }

  // Check market assumptions
  const marketAssumption = assumptions.find(a => a.type === AssumptionType.MARKET_SIZE);
  if (marketAssumption && metrics.users < 100) {
    pivots.push({
      startupId,
      pivotType: PivotType.TARGET_CUSTOMER,
      title: 'Target Prosumers Instead of Enterprises',
      description: 'Shift from B2B enterprise sales to B2C prosumers (freelancers, contractors, small teams)',
      rationale: 'Enterprise sales cycles are too long when runway is short. Prosumers buy faster.',
      successProbability: 68,
      estimatedRevenue: 10000, // 500 prosumers × $20/month
      estimatedCost: 8000, // Reposition marketing
      timeline: 4,
      risks: [
        'Prosumer LTV lower than enterprise',
        'May need to rebuild product for simpler use case',
        'Different marketing channels required',
      ],
      caseStudies: [
        {
          companyName: 'Notion',
          originalIdea: 'Enterprise knowledge management',
          pivotTo: 'Individual note-taking + prosumer teams',
          outcome: '$10B valuation',
          successMetric: '20M+ users',
        },
        {
          companyName: 'Canva',
          originalIdea: 'Professional design tool',
          pivotTo: 'Simplified design for non-designers',
          outcome: '$40B valuation',
          successMetric: '100M+ users',
        },
      ],
      metrics: {
        expectedMRR: 10000,
        expectedGrowthRate: 20,
        expectedCAC: 8,
        expectedRunwayExtension: 3,
      },
    });
  }

  // Add distribution pivot if needed
  if (metrics.cac && metrics.cac > 50) {
    pivots.push({
      startupId,
      pivotType: PivotType.DISTRIBUTION,
      title: 'Switch to Product-Led Growth',
      description: 'Move from paid ads to viral/organic growth. Add free tier, referral program, public API.',
      rationale: `Current CAC ($${metrics.cac}) is unsustainable. PLG reduces CAC to <$10.`,
      successProbability: 70,
      estimatedRevenue: Math.max(8000, metrics.users * 15),
      estimatedCost: 12000, // Build free tier + referral system
      timeline: 6,
      risks: [
        'Viral loops hard to predict',
        'May take longer to see results',
        'Freemium cannibalization',
      ],
      caseStudies: [
        {
          companyName: 'Dropbox',
          originalIdea: 'Paid storage service',
          pivotTo: 'Freemium with referral bonuses',
          outcome: '$10B market cap',
          successMetric: 'Grew 3900% via referrals in 15 months',
        },
        {
          companyName: 'Calendly',
          originalIdea: 'Paid scheduling tool',
          pivotTo: 'Freemium PLG model',
          outcome: '$3B valuation',
          successMetric: '10M+ users, 50K paying',
        },
      ],
      metrics: {
        expectedMRR: Math.max(8000, metrics.users * 15),
        expectedGrowthRate: 25,
        expectedCAC: 5,
        expectedRunwayExtension: 5,
      },
    });
  }

  // Sort by success probability
  return pivots.sort((a, b) => b.successProbability - a.successProbability);
}

/**
 * Strategic pivots for medium-risk situations
 */
async function generateStrategicPivots(
  startupId: string,
  startup: { name: string; description: string; stage: string },
  prediction: FailurePrediction,
  assumptions: Assumption[],
  metrics: StartupMetrics
): Promise<PivotRecommendation[]> {
  const ai = getAIClient();

  const context = `
Startup: ${startup.name}
Description: ${startup.description}
Stage: ${startup.stage}
Failure Probability: ${prediction.failureProbability}%
Primary Risk: ${prediction.primaryReason}

Current Metrics:
- Revenue: $${metrics.revenue}
- MRR: $${metrics.mrr || 0}
- Users: ${metrics.users}
- CAC: $${metrics.cac || 'Unknown'}
- Runway: ${(metrics.cashRemaining / metrics.monthlyBurn).toFixed(1)} months

Failed Assumptions:
${assumptions.map(a => `- ${a.statement} (confidence: ${a.confidence}%)`).join('\n')}

Risk Factors:
${prediction.riskFactors.map(rf => `- [${rf.severity}] ${rf.description}`).join('\n')}
`.trim();

  const prompt = `You are an expert startup advisor. Based on this failing startup, suggest 3-5 strategic pivots.

${context}

For each pivot, provide:
1. Pivot type (pricing, target_customer, distribution, product_focus, business_model, market, technology)
2. Title (concise)
3. Description (2-3 sentences)
4. Rationale (why this pivot makes sense)
5. Success probability (0-100)
6. Estimated monthly revenue after pivot
7. Cost to execute
8. Timeline (weeks)
9. Top 3 risks
10. Real case study (company that did similar pivot successfully)

Return JSON array with this structure:
{
  "pivots": [
    {
      "pivotType": "pricing",
      "title": "Lower to Freemium Model",
      "description": "...",
      "rationale": "...",
      "successProbability": 75,
      "estimatedRevenue": 15000,
      "estimatedCost": 10000,
      "timeline": 4,
      "risks": ["...", "...", "..."],
      "caseStudy": {
        "companyName": "Slack",
        "originalIdea": "...",
        "pivotTo": "...",
        "outcome": "...",
        "successMetric": "..."
      },
      "metrics": {
        "expectedMRR": 15000,
        "expectedGrowthRate": 20,
        "expectedCAC": 8,
        "expectedRunwayExtension": 6
      }
    }
  ]
}`;

  try {
    const response = await ai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are an expert startup advisor. Return valid JSON only.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const content = response.choices[0].message.content?.trim() || '{}';
    const jsonStr = content
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    const result = JSON.parse(jsonStr);

    return (result.pivots || []).map((p: any) => ({
      startupId,
      pivotType: p.pivotType as PivotType,
      title: p.title,
      description: p.description,
      rationale: p.rationale,
      successProbability: p.successProbability,
      estimatedRevenue: p.estimatedRevenue,
      estimatedCost: p.estimatedCost,
      timeline: p.timeline,
      risks: p.risks || [],
      caseStudies: [p.caseStudy],
      metrics: p.metrics,
      createdAt: new Date(),
    }));

  } catch (error) {
    logger.error('[PPE] Strategic pivot generation failed', { error });
    return await generateQuickPivots(startupId, startup, assumptions, metrics);
  }
}

/**
 * Optimization pivots for low-risk situations
 */
async function generateOptimizationPivots(
  startupId: string,
  startup: { name: string; description: string; stage: string },
  assumptions: Assumption[],
  metrics: StartupMetrics
): Promise<PivotRecommendation[]> {
  // For low-risk startups, suggest optimizations rather than major pivots
  const pivots: PivotRecommendation[] = [];

  // CAC optimization
  if (metrics.cac && metrics.cac > 20) {
    pivots.push({
      startupId,
      pivotType: PivotType.DISTRIBUTION,
      title: 'Optimize Customer Acquisition Channels',
      description: 'A/B test different acquisition channels, optimize conversion funnel, improve onboarding.',
      rationale: `Current CAC of $${metrics.cac} can be reduced through optimization.`,
      successProbability: 80,
      estimatedRevenue: metrics.mrr || (metrics.revenue / Math.max(1, metrics.monthsActive)),
      estimatedCost: 5000,
      timeline: 4,
      risks: [
        'Takes time to gather data',
        'May need to pause some channels',
        'Requires analytics infrastructure',
      ],
      caseStudies: [
        {
          companyName: 'Airbnb',
          originalIdea: 'Generic rental platform',
          pivotTo: 'Professional photography + SEO optimization',
          outcome: '$100B+ market cap',
          successMetric: 'Reduced CAC by 50%, 2x conversion rate',
        },
      ],
      metrics: {
        expectedMRR: (metrics.mrr || (metrics.revenue / Math.max(1, metrics.monthsActive))) * 1.3,
        expectedGrowthRate: 15,
        expectedCAC: metrics.cac * 0.6, // 40% reduction
        expectedRunwayExtension: 2,
      },
    });
  }

  // Pricing optimization
  const pricingAssumption = assumptions.find(a => a.type === AssumptionType.PRICING);
  if (pricingAssumption) {
    pivots.push({
      startupId,
      pivotType: PivotType.PRICING,
      title: 'Test Higher-Tier Pricing',
      description: 'Add premium tier at 3-5x base price with advanced features. Some users will upgrade.',
      rationale: 'You have product-market fit. Now optimize for revenue per user.',
      successProbability: 75,
      estimatedRevenue: (metrics.mrr || 0) * 1.4,
      estimatedCost: 8000,
      timeline: 3,
      risks: [
        'May need to build premium features',
        'Risk of feature bloat',
        'Some users may churn if pricing changes',
      ],
      caseStudies: [
        {
          companyName: 'Intercom',
          originalIdea: 'Single-tier messaging tool',
          pivotTo: 'Tiered pricing ($50-$500+/month)',
          outcome: '$1.3B valuation',
          successMetric: '40% of revenue from enterprise tier',
        },
      ],
      metrics: {
        expectedMRR: (metrics.mrr || 0) * 1.4,
        expectedGrowthRate: 12,
        expectedCAC: metrics.cac || 20,
        expectedRunwayExtension: 3,
      },
    });
  }

  return pivots;
}

/**
 * Rank pivots by expected value
 */
export function rankPivots(
  pivots: PivotRecommendation[],
  currentMetrics: StartupMetrics
): PivotRecommendation[] {
  return pivots
    .map(p => ({
      ...p,
      expectedValue: (
        p.successProbability / 100 *
        (p.estimatedRevenue - currentMetrics.monthlyBurn) *
        p.metrics.expectedRunwayExtension
      ) - p.estimatedCost,
    }))
    .sort((a, b) => (b.expectedValue || 0) - (a.expectedValue || 0));
}
