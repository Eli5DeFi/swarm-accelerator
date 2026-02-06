// M&A Agent: Valuation Modeler
// Creates comprehensive valuation analysis (comps, DCF, precedent transactions)

import { createOptimizedClient } from '../../ai-client';


export interface ValuationModel {
  method: string;
  lowCase: number;
  baseCase: number;
  highCase: number;
  assumptions: string[];
  sensitivity: {
    parameter: string;
    impact: string;
  }[];
}

export interface ValuationResult {
  recommendedRange: {
    low: number;
    base: number;
    high: number;
  };
  models: ValuationModel[];
  comparables: {
    company: string;
    metric: string;
    multiple: number;
    impliedValue: number;
  }[];
  precedentTransactions: {
    target: string;
    acquirer: string;
    date: string;
    multiple: string;
    dealValue: string;
    relevance: string;
  }[];
  dealStructure: {
    cashComponent: number;
    stockComponent: number;
    earnoutComponent: number;
    reasoning: string;
  };
  negotiationStrategy: string;
}

export async function modelValuation(financials: {
  revenue: number;
  revenueGrowth: number;
  ebitda: number;
  ebitdaMargin: number;
  arr: number; // Annual Recurring Revenue
  customerCount: number;
  ltv: number; // Lifetime Value
  cac: number; // Customer Acquisition Cost
  churnRate: number;
  industry: string;
  stage: string;
  profitability: boolean;
  cashPosition: number;
  burnRate: number;
}): Promise<ValuationResult> {
  const prompt = `You are a senior valuation analyst at a top investment bank.

Company Financials:
- Revenue: $${financials.revenue.toLocaleString()}
- Revenue Growth: ${financials.revenueGrowth}%
- EBITDA: $${financials.ebitda.toLocaleString()}
- EBITDA Margin: ${financials.ebitdaMargin}%
- ARR: $${financials.arr.toLocaleString()}
- Customers: ${financials.customerCount}
- LTV: $${financials.ltv}
- CAC: $${financials.cac}
- Churn Rate: ${financials.churnRate}%
- Industry: ${financials.industry}
- Stage: ${financials.stage}
- Profitable: ${financials.profitability ? 'Yes' : 'No'}
- Cash Position: $${financials.cashPosition.toLocaleString()}
- Burn Rate: $${financials.burnRate.toLocaleString()}/month

Task: Create comprehensive valuation analysis using multiple methods:

1. **Revenue Multiple Method**
   - Find comparable public companies in ${financials.industry}
   - Calculate median/mean revenue multiples
   - Apply growth premium/discount
   - Calculate low/base/high case

2. **EBITDA Multiple Method** (if profitable)
   - Industry-standard EBITDA multiples
   - Adjust for growth, margins, scale
   - Calculate low/base/high case

3. **DCF (Discounted Cash Flow)** (if >$5M revenue)
   - 5-year revenue projection
   - EBITDA margin expansion
   - Terminal value
   - WACC calculation
   - Calculate low/base/high case

4. **Precedent Transactions**
   - Recent M&A deals in ${financials.industry}
   - Revenue/EBITDA multiples paid
   - Deal premiums
   - Synergy assumptions

5. **SaaS-Specific Metrics** (if applicable)
   - ARR multiple (current market: 5-15x)
   - LTV/CAC ratio impact on valuation
   - Rule of 40 adjustment
   - Net Dollar Retention premium

Provide:
- Recommended valuation range (low/base/high)
- Top 5 comparable companies with multiples
- Top 5 precedent transactions
- Deal structure recommendation (cash/stock/earnout %)
- Negotiation strategy (BATNA, walk-away price)
- Sensitivity analysis (what drives valuation up/down)

Format as JSON with detailed reasoning.`;

  // Use Gemini for analysis (50% cheaper than OpenAI)
  const client = createOptimizedClient('analysis');
  const response = await client.chat([
    {
      role: 'system',
      content:
        'You are a valuation expert. Provide conservative, defensible valuations based on market data.',
    },
    { role: 'user', content: prompt },
  ], {
    temperature: 0.2,
    jsonMode: true,
  });

  const result = JSON.parse(response.content);

  return {
    recommendedRange: result.recommendedRange || { low: 0, base: 0, high: 0 },
    models: result.models || [],
    comparables: result.comparables || [],
    precedentTransactions: result.precedentTransactions || [],
    dealStructure: result.dealStructure || {
      cashComponent: 0,
      stockComponent: 0,
      earnoutComponent: 0,
      reasoning: '',
    },
    negotiationStrategy: result.negotiationStrategy || '',
  };
}

// Calculate Rule of 40 score (growth + profit margin)
export function calculateRuleOf40(growth: number, margin: number): number {
  return growth + margin;
}

// Calculate LTV/CAC ratio
export function calculateLtvCacRatio(ltv: number, cac: number): number {
  return cac > 0 ? ltv / cac : 0;
}

// Quick valuation estimate (lightweight, no AI)
export function quickValuation(
  arr: number,
  growth: number,
  churn: number
): { low: number; base: number; high: number } {
  let baseMultiple = 8; // Default ARR multiple

  // Adjust for growth
  if (growth > 100) baseMultiple += 3;
  else if (growth > 50) baseMultiple += 2;
  else if (growth > 30) baseMultiple += 1;
  else if (growth < 20) baseMultiple -= 2;

  // Adjust for churn
  if (churn < 3) baseMultiple += 1;
  else if (churn > 10) baseMultiple -= 2;

  return {
    low: arr * (baseMultiple - 2),
    base: arr * baseMultiple,
    high: arr * (baseMultiple + 3),
  };
}
