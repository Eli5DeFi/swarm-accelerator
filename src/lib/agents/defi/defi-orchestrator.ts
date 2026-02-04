// DeFi Orchestrator: Coordinates all DeFi agents for comprehensive protocol analysis

import { designTokenomics, type TokenomicsDesign } from './tokenomics-designer';
import { auditSmartContract, type SecurityAuditResult } from './security-auditor';
import { planLiquidityStrategy, type LiquidityStrategy } from './liquidity-strategist';

export interface DeFiProtocolInput {
  // Basic info
  name: string;
  type: 'DEX' | 'Lending' | 'Yield Aggregator' | 'Derivatives' | 'Stablecoin' | 'Other';
  description: string;
  
  // Tokenomics inputs
  targetLaunchDate: string;
  expectedTVL: number;
  competitorTokenomics: string[];
  revenueModel: string;
  communitySize: number;
  
  // Smart contract inputs
  contractLanguage: 'Solidity' | 'Vyper';
  contractComplexity: 'simple' | 'medium' | 'complex';
  hasUpgradeability: boolean;
  hasOracles: boolean;
  hasMultisig: boolean;
  codeSnippet?: string;
  dependencies: string[];
  solidityVersion?: string;
  hasTests?: boolean;
  testCoverage?: number;
  
  // Liquidity inputs
  liquidityBudget: number;
  targetTVL: number;
  hasRevenue: boolean;
  monthlyRevenue: number;
  competitors: string[];
}

export interface DeFiAcceleratorReport {
  executiveSummary: {
    recommendation: string;
    overallScore: number; // 0-100
    readyForLaunch: boolean;
    estimatedTimeline: string;
    estimatedCost: string;
  };
  
  tokenomics: TokenomicsDesign;
  security: SecurityAuditResult;
  liquidity: LiquidityStrategy;
  
  launchRoadmap: {
    phase: string;
    week: string;
    tasks: string[];
    cost: string;
    blockers: string[];
  }[];
  
  budgetBreakdown: {
    category: string;
    amount: number;
    timing: string;
  }[];
  
  keyRisks: {
    risk: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    mitigation: string;
    probability: string;
  }[];
  
  nextSteps: string[];
}

export async function orchestrateDeFiAccelerator(
  input: DeFiProtocolInput
): Promise<DeFiAcceleratorReport> {
  console.log('[DeFi Orchestrator] Starting comprehensive analysis...');

  // Run all agents in parallel
  const [tokenomics, security, liquidity] = await Promise.all([
    // Agent 1: Tokenomics Designer
    designTokenomics({
      name: input.name,
      type: input.type,
      targetLaunchDate: input.targetLaunchDate,
      expectedTVL: input.expectedTVL,
      competitorTokenomics: input.competitorTokenomics,
      revenueModel: input.revenueModel,
      communitySize: input.communitySize,
    }),

    // Agent 2: Security Auditor
    auditSmartContract({
      contractType: input.type,
      language: input.contractLanguage,
      complexity: input.contractComplexity,
      hasUpgradeability: input.hasUpgradeability,
      hasOracles: input.hasOracles,
      hasMultisig: input.hasMultisig,
      tvlExpected: input.expectedTVL,
      codeSnippet: input.codeSnippet,
      dependencies: input.dependencies,
    }),

    // Agent 3: Liquidity Strategist
    planLiquidityStrategy({
      tokenSymbol: input.name.substring(0, 4).toUpperCase(),
      totalSupply: 1_000_000_000, // Will be updated after tokenomics
      liquidityBudget: input.liquidityBudget,
      targetTVL: input.targetTVL,
      launchDate: input.targetLaunchDate,
      hasRevenue: input.hasRevenue,
      monthlyRevenue: input.monthlyRevenue,
      competitors: input.competitors,
    }),
  ]);

  console.log('[DeFi Orchestrator] All agents complete');

  // Generate executive summary
  const securityScore = security.score;
  const tokenomicsScore = calculateTokenomicsScore(tokenomics);
  const liquidityScore = calculateLiquidityScore(liquidity, input.liquidityBudget);
  
  const overallScore = Math.round((securityScore + tokenomicsScore + liquidityScore) / 3);
  
  const readyForLaunch =
    overallScore >= 70 &&
    security.overallRisk !== 'critical' &&
    security.auditReadiness.ready;

  const recommendation = generateRecommendation(overallScore, security, readyForLaunch);

  // Build launch roadmap
  const launchRoadmap = buildLaunchRoadmap(tokenomics, security, liquidity);

  // Calculate budget breakdown
  const budgetBreakdown = calculateBudget(security, liquidity);

  // Identify key risks
  const keyRisks = [
    ...security.vulnerabilities.map((v) => ({
      risk: v.description,
      severity: v.severity,
      mitigation: v.recommendation,
      probability: v.severity === 'critical' ? 'High' : 'Medium',
    })),
    ...tokenomics.risks.map((r) => ({
      risk: r,
      severity: 'medium' as const,
      mitigation: 'Address tokenomics concerns before launch',
      probability: 'Medium',
    })),
    ...liquidity.risks.map((r) => ({
      risk: r,
      severity: 'medium' as const,
      mitigation: 'Implement liquidity safeguards',
      probability: 'Medium',
    })),
  ].slice(0, 10); // Top 10 risks

  // Next steps
  const nextSteps = generateNextSteps(security, tokenomics, liquidity, readyForLaunch);

  return {
    executiveSummary: {
      recommendation,
      overallScore,
      readyForLaunch,
      estimatedTimeline: calculateTimeline(security.auditReadiness.ready),
      estimatedCost: calculateTotalCost(budgetBreakdown),
    },
    tokenomics,
    security,
    liquidity,
    launchRoadmap,
    budgetBreakdown,
    keyRisks,
    nextSteps,
  };
}

// Helper: Calculate tokenomics score
function calculateTokenomicsScore(tokenomics: TokenomicsDesign): number {
  let score = 50; // Base

  // Good allocation
  const teamAlloc = tokenomics.allocation.find((a) => a.category.includes('Team'));
  if (teamAlloc && teamAlloc.percentage <= 25) score += 10;

  // Has ve-model
  if (tokenomics.veModel?.enabled) score += 15;

  // Has emission schedule
  if (tokenomics.emissionSchedule.length > 0) score += 10;

  // Has governance
  if (tokenomics.governance.votingPower) score += 10;

  // Utility count
  score += Math.min(tokenomics.utilities.length * 3, 15);

  return Math.min(score, 100);
}

// Helper: Calculate liquidity score
function calculateLiquidityScore(liquidity: LiquidityStrategy, budget: number): number {
  let score = 50; // Base

  // Adequate budget
  if (budget >= 500000) score += 15;
  else if (budget >= 100000) score += 10;

  // POL enabled
  if (liquidity.pol.enabled) score += 15;

  // Has liquidity mining
  if (liquidity.liquidityMining.pools.length > 0) score += 10;

  // LBP chosen (best practice)
  if (liquidity.launchMethod.type === 'LBP') score += 10;

  return Math.min(score, 100);
}

// Helper: Generate recommendation
function generateRecommendation(
  overallScore: number,
  security: SecurityAuditResult,
  ready: boolean
): string {
  if (overallScore >= 85 && ready) {
    return 'READY TO LAUNCH: Protocol is well-designed and secure. Proceed with professional audit, then mainnet deployment.';
  } else if (overallScore >= 70 && !ready) {
    return 'ALMOST READY: Good design but needs security improvements. Address audit blockers (2-4 weeks), then proceed.';
  } else if (overallScore >= 50) {
    return 'NEEDS WORK: Moderate issues in tokenomics, security, or liquidity. Budget 4-8 weeks for improvements.';
  } else {
    return 'NOT READY: Significant issues detected. Recommend redesign before proceeding. Estimated 8-12 weeks.';
  }
}

// Helper: Build launch roadmap
function buildLaunchRoadmap(
  tokenomics: TokenomicsDesign,
  security: SecurityAuditResult,
  liquidity: LiquidityStrategy
): any[] {
  const roadmap = [
    {
      phase: 'Pre-Launch Prep',
      week: 'Week 1-2',
      tasks: [
        'Finalize tokenomics design',
        'Deploy test contracts',
        'Set up multisig',
        'Prepare documentation',
      ],
      cost: '$5K-10K',
      blockers: security.auditReadiness.blockers,
    },
    {
      phase: 'Security Audit',
      week: 'Week 3-6',
      tasks: [
        'Engage professional auditor',
        'Address audit findings',
        'Bug bounty program',
        'Final code freeze',
      ],
      cost: security.estimatedCost.professionalAudit,
      blockers: [],
    },
    {
      phase: 'Liquidity Bootstrap',
      week: 'Week 7-8',
      tasks: [
        liquidity.launchMethod.type === 'LBP' ? 'Launch LBP on Fjord' : 'Add Uniswap liquidity',
        'Start liquidity mining',
        'Deploy POL strategy',
        'Market making (if CEX)',
      ],
      cost: `$${liquidity.initialLiquidity.amount.toLocaleString()}`,
      blockers: [],
    },
    {
      phase: 'Mainnet Launch',
      week: 'Week 9',
      tasks: [
        'Deploy to mainnet',
        'Announce launch',
        'Community airdrop',
        'Monitor for issues',
      ],
      cost: '$10K-20K (marketing)',
      blockers: [],
    },
    {
      phase: 'Post-Launch',
      week: 'Week 10-12',
      tasks: [
        'Ramp up TVL',
        'CEX listings (if planned)',
        'Continue POL accumulation',
        'Community growth',
      ],
      cost: liquidity.cexListings.tier2?.[0]?.cost || 'Variable',
      blockers: [],
    },
  ];

  return roadmap;
}

// Helper: Calculate budget
function calculateBudget(security: SecurityAuditResult, liquidity: LiquidityStrategy): any[] {
  return [
    {
      category: 'Smart Contract Audit',
      amount: 40000, // Mid-range estimate
      timing: 'Week 3-6',
    },
    {
      category: 'Initial Liquidity',
      amount: liquidity.initialLiquidity.amount || 500000,
      timing: 'Week 7-8',
    },
    {
      category: 'Liquidity Mining Incentives',
      amount: liquidity.liquidityMining.totalAllocation || 100000,
      timing: 'Week 9-20 (3 months)',
    },
    {
      category: 'Market Making (if CEX)',
      amount: liquidity.marketMaking.needed ? 100000 : 0,
      timing: 'Week 9+ (ongoing)',
    },
    {
      category: 'Legal & Compliance',
      amount: 20000,
      timing: 'Week 1-4',
    },
    {
      category: 'Marketing & Community',
      amount: 50000,
      timing: 'Week 8-12',
    },
  ];
}

// Helper: Calculate total cost
function calculateTotalCost(budget: any[]): string {
  const total = budget.reduce((sum, item) => sum + item.amount, 0);
  if (total >= 1_000_000) return `$${(total / 1_000_000).toFixed(1)}M`;
  return `$${(total / 1_000).toFixed(0)}K`;
}

// Helper: Calculate timeline
function calculateTimeline(auditReady: boolean): string {
  if (auditReady) return '8-12 weeks (ready for audit)';
  return '12-16 weeks (needs prep before audit)';
}

// Helper: Generate next steps
function generateNextSteps(
  security: SecurityAuditResult,
  tokenomics: TokenomicsDesign,
  liquidity: LiquidityStrategy,
  ready: boolean
): string[] {
  const steps = [];

  if (!ready) {
    steps.push('Address security audit blockers (see Security section)');
  }

  steps.push('Review and finalize tokenomics design');
  steps.push('Deploy test contracts to testnet (Goerli or Sepolia)');
  steps.push('Set up multisig (recommended: Gnosis Safe with 3/5 signers)');
  steps.push('Engage professional auditor (see Security → Recommended Auditors)');
  steps.push(`Prepare ${liquidity.launchMethod.type} launch (see Liquidity section)`);
  steps.push('Build community pre-launch (Discord, Twitter, waitlist)');
  steps.push('Prepare legal opinion (if targeting US users)');
  steps.push('Set up monitoring & alerts (Tenderly, Defender)');
  steps.push('Launch on testnet → audit → mainnet');

  return steps;
}
