// M&A Agent: Deal Structurer
// Designs optimal deal structure and negotiation strategy

import { createOptimizedClient } from '../../ai-client';


export interface DealStructure {
  totalValue: {
    low: number;
    target: number;
    high: number;
  };
  components: {
    upfrontCash: number;
    upfrontStock: number;
    earnout: {
      amount: number;
      conditions: string[];
      timeline: string;
    };
    retention: {
      amount: number;
      recipients: string;
      vestingSchedule: string;
    };
  };
  terms: {
    escrow: string;
    representationsWarranties: string[];
    indemnification: string;
    nonCompete: string;
    keyEmployeeRetention: string;
  };
  taxConsiderations: {
    structure: string; // asset vs stock purchase
    implications: string;
    optimization: string;
  };
}

export interface NegotiationStrategy {
  walkAwayPrice: number;
  batna: string; // Best Alternative To Negotiated Agreement
  anchorPrice: number;
  concessionStrategy: string[];
  dealBreakers: string[];
  flexibleTerms: string[];
  timingStrategy: string;
  leveragePoints: string[];
}

export interface DealResult {
  structure: DealStructure;
  negotiation: NegotiationStrategy;
  processMap: {
    stage: string;
    duration: string;
    keyActivities: string[];
    successMetrics: string[];
  }[];
  riskMitigation: {
    risk: string;
    mitigation: string;
    contingencyPlan: string;
  }[];
  recommendations: string[];
}

export async function structureDeal(dealParams: {
  valuation: { low: number; base: number; high: number };
  founderOwnership: number;
  investorOwnership: number;
  founderRetention: boolean; // Do founders want to stay?
  taxBasis: number; // Founder cost basis
  acquirerType: 'strategic' | 'pe' | 'public';
  competitiveBidders: number; // How many other bidders?
  timelinePressure: 'urgent' | 'moderate' | 'patient';
  companyStage: string;
  profitability: boolean;
}): Promise<DealResult> {
  const prompt = `You are an M&A structuring expert designing the optimal deal structure.

Deal Parameters:
- Valuation Range: $${dealParams.valuation.low.toLocaleString()} - $${dealParams.valuation.high.toLocaleString()}
- Target Valuation: $${dealParams.valuation.base.toLocaleString()}
- Founder Ownership: ${dealParams.founderOwnership}%
- Investor Ownership: ${dealParams.investorOwnership}%
- Founders Staying: ${dealParams.founderRetention ? 'Yes' : 'No'}
- Founder Tax Basis: $${dealParams.taxBasis.toLocaleString()}
- Acquirer Type: ${dealParams.acquirerType}
- Competitive Bidders: ${dealParams.competitiveBidders}
- Timeline Pressure: ${dealParams.timelinePressure}
- Company Stage: ${dealParams.companyStage}
- Profitable: ${dealParams.profitability ? 'Yes' : 'No'}

Task: Design optimal deal structure considering:

1. **Deal Components**
   
   Optimize mix of:
   - Upfront Cash (typically 60-90%)
   - Stock (if public acquirer, 0-40%)
   - Earnout (if risky, 10-30% over 1-3 years)
   - Retention Bonus (if founders staying, 5-20%)
   
   Consider:
   - Tax implications (cash = ordinary income, stock = capital gains if held)
   - Founder liquidity needs
   - Risk mitigation (earnout reduces risk for acquirer)
   - Alignment incentives (retention keeps team engaged)

2. **Key Terms**
   
   - Escrow (typically 10-20% held for 12-24 months)
   - Representations & Warranties (what seller guarantees)
   - Indemnification (cap, basket, survival period)
   - Non-Compete (typically 1-3 years)
   - Key Employee Retention (vesting, bonuses, roles)
   - Material Adverse Change (MAC) clause
   - Breakup Fee (if deal falls through)

3. **Negotiation Strategy**
   
   - Walk-Away Price (minimum acceptable)
   - BATNA (alternatives if deal fails)
   - Anchor Price (where to start negotiation)
   - Concession Strategy (what to give up in what order)
   - Deal Breakers (non-negotiables)
   - Flexible Terms (what you can negotiate)
   - Timing (when to create urgency)
   - Leverage Points (what gives you power)

4. **Tax Optimization**
   
   - Asset vs Stock Purchase
   - If founders have low basis → prefer stock (QSBS eligible?)
   - If high basis → prefer cash
   - Earnout structure (ordinary vs capital gains)
   - Installment sale (defer taxes)

5. **Process Map** (3-6 months)
   
   - Stage 1: NDA & Initial Talks (2-4 weeks)
   - Stage 2: LOI & Price Negotiation (2-3 weeks)
   - Stage 3: Due Diligence (4-8 weeks)
   - Stage 4: Definitive Agreement (2-4 weeks)
   - Stage 5: Closing & Integration (2-4 weeks)

6. **Risk Mitigation**
   
   - Earnout reduces payment risk
   - Escrow covers rep breaches
   - MAC clause protects if business deteriorates
   - Representation insurance (seller-side)
   - Walk rights if conditions not met

Provide detailed deal structure optimized for maximum value and minimum risk.`;

  // Use Gemini for analysis (50% cheaper than OpenAI)
  const client = createOptimizedClient('analysis');
  const response = await client.chat([
    {
      role: 'system',
      content:
        'You are an M&A structuring expert. Design deals that maximize value while protecting all parties.',
    },
    { role: 'user', content: prompt },
  ], {
    temperature: 0.3,
    jsonMode: true,
  });

  const result = JSON.parse(response.content);

  return {
    structure: result.structure || {},
    negotiation: result.negotiation || {},
    processMap: result.processMap || [],
    riskMitigation: result.riskMitigation || [],
    recommendations: result.recommendations || [],
  };
}

// Common earnout structures
export const earnoutStructures = {
  revenue: {
    name: 'Revenue-Based Earnout',
    description: 'Payout tied to hitting revenue targets',
    example: 'If Year 1 revenue > $10M, pay $2M; if > $15M, pay $3M',
    pros: ['Easy to measure', 'Aligns growth incentives'],
    cons: ['Can be gamed (pull forward revenue)', 'Ignores profitability'],
  },
  ebitda: {
    name: 'EBITDA-Based Earnout',
    description: 'Payout tied to profitability targets',
    example: 'If Year 1 EBITDA > $2M, pay $2M',
    pros: ['Rewards profitability', 'Harder to game'],
    cons: ['Disputes over expense allocation', 'Acquirer can manipulate'],
  },
  milestone: {
    name: 'Milestone-Based Earnout',
    description: 'Payout tied to product/customer milestones',
    example: 'If FDA approval achieved, pay $5M',
    pros: ['Objective', 'Risk-sharing'],
    cons: ['Binary (all-or-nothing)', 'Long timelines'],
  },
  retention: {
    name: 'Time-Based Retention',
    description: 'Payout if key employees stay',
    example: 'If founder stays 2 years, pay $1M',
    pros: ['Simple', 'Retains talent'],
    cons: ['Not performance-based', 'Golden handcuffs'],
  },
};

// Tax structure comparison
export function compareTaxStructures(
  dealValue: number,
  founderBasis: number
): {
  assetSale: { tax: number; netProceeds: number };
  stockSale: { tax: number; netProceeds: number };
} {
  const capitalGainsRate = 0.2; // Federal long-term capital gains (+ state)
  const ordinaryRate = 0.37; // Top federal ordinary income rate

  // Stock sale: all capital gains (if held >1 year)
  const stockTax = (dealValue - founderBasis) * capitalGainsRate;
  const stockNet = dealValue - stockTax;

  // Asset sale: part ordinary, part capital gains (complex, simplified here)
  const assetTax = (dealValue - founderBasis) * ordinaryRate * 0.7; // Rough approximation
  const assetNet = dealValue - assetTax;

  return {
    stockSale: { tax: Math.round(stockTax), netProceeds: Math.round(stockNet) },
    assetSale: { tax: Math.round(assetTax), netProceeds: Math.round(assetNet) },
  };
}

// Calculate founder net proceeds after taxes and payouts
export function calculateFounderProceeds(
  dealValue: number,
  founderOwnership: number,
  taxRate: number,
  investorLiquidationPreference: number = 0
): number {
  // Step 1: Pay investors first (liquidation preference)
  const remainingAfterInvestors = dealValue - investorLiquidationPreference;

  // Step 2: Founder share
  const founderGross = remainingAfterInvestors * (founderOwnership / 100);

  // Step 3: Taxes
  const founderNet = founderGross * (1 - taxRate);

  return Math.round(founderNet);
}
