// DeFi Agent: Tokenomics Designer
// Designs token economics (ve-model, emissions, liquidity mining, governance)

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface TokenomicsDesign {
  // Token basics
  tokenSymbol: string;
  tokenName: string;
  totalSupply: number;
  
  // Distribution
  allocation: {
    category: string;
    percentage: number;
    amount: number;
    vesting: string;
    lockup: string;
  }[];
  
  // Utility
  utilities: string[];
  
  // Emissions
  emissionSchedule: {
    phase: string;
    duration: string;
    emissionRate: string;
    reduction: string;
  }[];
  
  // Ve-model (vote-escrowed)
  veModel?: {
    enabled: boolean;
    lockDurations: string[];
    maxLockMultiplier: number;
    benefits: string[];
  };
  
  // Liquidity mining
  liquidityMining: {
    pools: string[];
    rewardsPerDay: number;
    duration: string;
    allocation: number;
  };
  
  // Governance
  governance: {
    votingPower: string; // "1 token = 1 vote" or "veToken based"
    proposalThreshold: number;
    quorum: number;
    timeLock: string;
  };
  
  // Economics
  economics: {
    supplyModel: 'fixed' | 'inflationary' | 'deflationary';
    burnMechanism?: string;
    buybackProgram?: string;
    staking: {
      apr: string;
      source: string; // "emissions" or "revenue share"
    };
  };
  
  // Risks
  risks: string[];
  
  // Recommendations
  recommendations: string[];
}

export async function designTokenomics(protocolData: {
  name: string;
  type: string; // "DEX", "Lending", "Yield Aggregator", etc.
  targetLaunchDate: string;
  expectedTVL: number;
  competitorTokenomics: string[]; // e.g., ["Curve (veCRV)", "Uniswap (UNI)"]
  revenueModel: string; // "Trading fees", "Interest spread", etc.
  communitySize: number;
}): Promise<TokenomicsDesign> {
  const prompt = `You are a DeFi tokenomics expert (formerly at Curve, Uniswap, Aave).

Design tokenomics for a ${protocolData.type} protocol:
- Name: ${protocolData.name}
- Type: ${protocolData.type}
- Launch Date: ${protocolData.targetLaunchDate}
- Expected TVL: $${protocolData.expectedTVL.toLocaleString()}
- Revenue Model: ${protocolData.revenueModel}
- Community Size: ${protocolData.communitySize.toLocaleString()}

Competitors for reference: ${protocolData.competitorTokenomics.join(', ')}

Task: Design comprehensive tokenomics:

1. **Token Basics**
   - Symbol (3-4 chars, memorable)
   - Total supply (consider: 100M, 1B, or uncapped)

2. **Token Allocation** (must sum to 100%)
   - Team: 15-25% (4-year vest, 1-year cliff)
   - Investors: 10-20% (2-4 year vest)
   - Treasury: 20-40% (DAO controlled)
   - Community: 30-50% (emissions, airdrops)
   - Liquidity: 5-10% (initial DEX liquidity)

3. **Token Utility** (at least 3)
   - Governance (vote on proposals)
   - Staking (earn rewards)
   - Fee discounts (trading, borrowing)
   - Liquidity mining rewards
   - Revenue sharing
   - Boost multipliers

4. **Emission Schedule**
   - Phase 1: High emissions (bootstrap liquidity)
   - Phase 2: Tapering (reduce sell pressure)
   - Phase 3: Steady state (sustainable)
   - Total timeline: 4-10 years
   - Annual reduction: 20-50%

5. **Ve-Model (Vote-Escrowed)** - Recommended for ${protocolData.type}
   - Lock durations: 1 week - 4 years
   - Max multiplier: 2.5x (4-year lock)
   - Benefits: boosted rewards, governance, revenue share
   - Inspired by: Curve's veCRV (best in class)

6. **Liquidity Mining**
   - Which pools to incentivize (e.g., TOKEN/ETH, TOKEN/USDC)
   - Daily rewards (tokens/day)
   - Duration (6-12 months)
   - Allocation from total supply

7. **Governance**
   - Voting power (1 token = 1 vote OR veToken based)
   - Proposal threshold (% of supply to propose)
   - Quorum (% needed to pass)
   - TimeLock (delay before execution)

8. **Economic Model**
   - Supply type: fixed (deflationary over time) or inflationary
   - Burn mechanism (if any): e.g., burn 50% of fees
   - Buyback program (if any): e.g., use 30% revenue to buyback
   - Staking rewards: APR estimate + source (emissions vs revenue)

9. **Risks**
   - Inflation risk (too many emissions → sell pressure)
   - Centralization risk (team/investors dumping)
   - Governance attacks (whales control votes)
   - Ponzi dynamics (unsustainable rewards)

10. **Recommendations**
    - Best practices from successful DeFi protocols
    - What to avoid (failures like OHM, Wonderland)
    - Launch strategy (airdrop, LBP, fairlaunch)

Return JSON with complete tokenomics design.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content:
          'You are a DeFi tokenomics expert. Design sustainable, anti-ponzi token economics.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });

  const design = JSON.parse(completion.choices[0].message.content || '{}');

  return {
    tokenSymbol: design.tokenSymbol || 'TKN',
    tokenName: design.tokenName || 'Token',
    totalSupply: design.totalSupply || 1_000_000_000,
    allocation: design.allocation || [],
    utilities: design.utilities || [],
    emissionSchedule: design.emissionSchedule || [],
    veModel: design.veModel,
    liquidityMining: design.liquidityMining || {},
    governance: design.governance || {},
    economics: design.economics || {},
    risks: design.risks || [],
    recommendations: design.recommendations || [],
  };
}

// Helper: Calculate ve-token multiplier
export function calculateVeMultiplier(lockDuration: number, maxDuration: number = 4): number {
  // Linear scaling: 1x at 0 years, 2.5x at max years
  const maxMultiplier = 2.5;
  return 1 + ((lockDuration / maxDuration) * (maxMultiplier - 1));
}

// Helper: Calculate emissions for year
export function calculateYearlyEmissions(
  totalSupply: number,
  communityAllocation: number,
  year: number,
  reductionRate: number = 0.3 // 30% annual reduction
): number {
  const initialEmission = (totalSupply * communityAllocation) / 4; // 25% in year 1
  return initialEmission * Math.pow(1 - reductionRate, year - 1);
}

// Helper: Estimate token price (rough)
export function estimateTokenPrice(
  fdv: number, // Fully diluted valuation
  totalSupply: number
): number {
  return fdv / totalSupply;
}

// Helper: Common tokenomics templates
export const tokenomicsTemplates = {
  dex: {
    name: 'DEX (Curve-style)',
    allocation: [
      { category: 'Team', percentage: 20, vesting: '4 years', lockup: '1 year cliff' },
      { category: 'Investors', percentage: 15, vesting: '3 years', lockup: '6 months cliff' },
      { category: 'Treasury', percentage: 30, vesting: 'DAO controlled', lockup: 'None' },
      { category: 'Community', percentage: 30, vesting: 'Emissions', lockup: 'None' },
      { category: 'Liquidity', percentage: 5, vesting: 'Immediate', lockup: 'None' },
    ],
    veModel: true,
    governance: 'veToken weighted',
  },
  lending: {
    name: 'Lending (Aave-style)',
    allocation: [
      { category: 'Team', percentage: 23, vesting: '4 years', lockup: '1 year cliff' },
      { category: 'Investors', percentage: 20, vesting: '2 years', lockup: 'None' },
      { category: 'Reserve', percentage: 30, vesting: 'Protocol controlled', lockup: 'None' },
      { category: 'Ecosystem', percentage: 20, vesting: 'Incentives', lockup: 'None' },
      { category: 'Liquidity', percentage: 7, vesting: 'Immediate', lockup: 'None' },
    ],
    veModel: false,
    governance: 'Token weighted + safety module',
  },
  yieldAggregator: {
    name: 'Yield Aggregator (Yearn-style)',
    allocation: [
      { category: 'Team', percentage: 0, vesting: 'N/A', lockup: 'Fair launch' },
      { category: 'Treasury', percentage: 40, vesting: 'DAO controlled', lockup: 'None' },
      { category: 'Community', percentage: 50, vesting: 'Staking rewards', lockup: 'None' },
      { category: 'Operations', percentage: 10, vesting: 'Multisig', lockup: 'None' },
    ],
    veModel: true,
    governance: 'veToken weighted (Yearn v2)',
  },
};
