/**
 * Pivot Simulator
 * 
 * Monte Carlo simulation to test pivot outcomes in parallel universes.
 * Simulates 1,000+ scenarios with different market conditions, execution quality, timing.
 */

import { logger } from '../logger';
import { PivotRecommendation } from './pivot-recommender';
import { StartupMetrics } from './failure-predictor';

export interface SimulationResult {
  pivotId: string;
  startupId: string;
  scenariosRun: number;
  outcomes: {
    success: number; // % scenarios where startup survived
    failure: number; // % scenarios where startup failed
    breakeven: number; // % scenarios where startup broke even
  };
  projections: {
    month1: MonthlyProjection;
    month3: MonthlyProjection;
    month6: MonthlyProjection;
    month12: MonthlyProjection;
  };
  riskAnalysis: {
    bestCase: MonthlyProjection;
    worstCase: MonthlyProjection;
    mostLikely: MonthlyProjection;
    variance: number;
  };
  confidence: number; // 0-100
  recommendation: 'proceed' | 'caution' | 'avoid';
  simulatedAt: Date;
}

export interface MonthlyProjection {
  month: number;
  revenue: number;
  users: number;
  cac: number;
  churnRate: number;
  cashRemaining: number;
  probability: number; // likelihood of this outcome
}

/**
 * Run Monte Carlo simulation for a pivot
 */
export async function simulatePivot(
  pivot: PivotRecommendation,
  currentMetrics: StartupMetrics,
  scenarios: number = 1000
): Promise<SimulationResult> {
  logger.info('[PPE] Starting pivot simulation', {
    pivotId: pivot.id,
    scenarios,
  });

  const results: MonthlyProjection[] = [];
  let successCount = 0;
  let failureCount = 0;
  let breakevenCount = 0;

  // Run simulations
  for (let i = 0; i < scenarios; i++) {
    const outcome = await runSingleScenario(pivot, currentMetrics, i);
    results.push(outcome);

    if (outcome.cashRemaining > currentMetrics.monthlyBurn * 6) {
      successCount++;
    } else if (outcome.cashRemaining <= 0) {
      failureCount++;
    } else {
      breakevenCount++;
    }
  }

  // Calculate projections at different time points
  const month1Projections = results.map(r => ({ ...r, month: 1 }));
  const month3Projections = results.map(r => projectForward(r, 3, pivot));
  const month6Projections = results.map(r => projectForward(r, 6, pivot));
  const month12Projections = results.map(r => projectForward(r, 12, pivot));

  // Calculate percentiles
  const sortedFinalCash = [...month12Projections].sort((a, b) => b.cashRemaining - a.cashRemaining);
  const bestCase = sortedFinalCash[Math.floor(scenarios * 0.1)]; // 90th percentile
  const worstCase = sortedFinalCash[Math.floor(scenarios * 0.9)]; // 10th percentile
  const mostLikely = sortedFinalCash[Math.floor(scenarios * 0.5)]; // median

  // Calculate variance (risk measure)
  const avgCash = sortedFinalCash.reduce((sum, p) => sum + p.cashRemaining, 0) / scenarios;
  const variance = Math.sqrt(
    sortedFinalCash.reduce((sum, p) => sum + Math.pow(p.cashRemaining - avgCash, 2), 0) / scenarios
  );

  // Determine recommendation
  const successRate = successCount / scenarios;
  let recommendation: 'proceed' | 'caution' | 'avoid';
  if (successRate > 0.6) {
    recommendation = 'proceed';
  } else if (successRate > 0.3) {
    recommendation = 'caution';
  } else {
    recommendation = 'avoid';
  }

  const simulation: SimulationResult = {
    pivotId: pivot.id || 'unknown',
    startupId: pivot.startupId,
    scenariosRun: scenarios,
    outcomes: {
      success: (successCount / scenarios) * 100,
      failure: (failureCount / scenarios) * 100,
      breakeven: (breakevenCount / scenarios) * 100,
    },
    projections: {
      month1: averageProjections(month1Projections),
      month3: averageProjections(month3Projections),
      month6: averageProjections(month6Projections),
      month12: averageProjections(month12Projections),
    },
    riskAnalysis: {
      bestCase: { ...bestCase, probability: 10 },
      worstCase: { ...worstCase, probability: 10 },
      mostLikely: { ...mostLikely, probability: 50 },
      variance,
    },
    confidence: calculateConfidence(scenarios, variance, pivot.successProbability),
    recommendation,
    simulatedAt: new Date(),
  };

  logger.info('[PPE] Simulation complete', {
    pivotId: pivot.id,
    successRate: simulation.outcomes.success,
    recommendation: simulation.recommendation,
  });

  return simulation;
}

/**
 * Run a single scenario with randomized parameters
 */
async function runSingleScenario(
  pivot: PivotRecommendation,
  currentMetrics: StartupMetrics,
  seed: number
): Promise<MonthlyProjection> {
  // Randomize key variables based on normal distribution
  const random = seededRandom(seed);

  // Execution quality (0.7 - 1.3, avg 1.0)
  const executionQuality = 0.7 + random() * 0.6;

  // Market conditions (-20% to +20%)
  const marketMultiplier = 0.8 + random() * 0.4;

  // Timing factor (launches sometimes just... work)
  const timingLuck = random() > 0.9 ? 1.5 : 1.0; // 10% chance of lucky timing

  // Competition factor (new competitors can hurt)
  const competitionFactor = random() > 0.7 ? 0.8 : 1.0; // 30% chance of new competitor

  // Calculate adjusted metrics
  const baseRevenue = pivot.metrics.expectedMRR;
  const adjustedRevenue = baseRevenue * executionQuality * marketMultiplier * timingLuck * competitionFactor;

  const baseGrowthRate = pivot.metrics.expectedGrowthRate / 100;
  const adjustedGrowthRate = baseGrowthRate * executionQuality * marketMultiplier;

  const baseCac = pivot.metrics.expectedCAC;
  const adjustedCac = baseCac / (executionQuality * 0.8 + 0.2);

  // Simulate first month after pivot
  const newUsers = Math.floor(adjustedRevenue / (baseCac * 2)); // Rough estimate
  const revenue = adjustedRevenue;
  const cashSpent = pivot.estimatedCost + currentMetrics.monthlyBurn;
  const cashRemaining = currentMetrics.cashRemaining - cashSpent + revenue;

  return {
    month: 1,
    revenue,
    users: currentMetrics.users + newUsers,
    cac: adjustedCac,
    churnRate: 0.05 + random() * 0.05, // 5-10% churn
    cashRemaining,
    probability: pivot.successProbability / 100,
  };
}

/**
 * Project forward from initial state
 */
function projectForward(
  initial: MonthlyProjection,
  months: number,
  pivot: PivotRecommendation
): MonthlyProjection {
  let state = { ...initial };

  for (let m = 1; m < months; m++) {
    // Compound growth
    const growthRate = pivot.metrics.expectedGrowthRate / 100;
    const newRevenue = state.revenue * (1 + growthRate);
    const newUsers = state.users * (1 + growthRate * 0.8); // User growth slightly slower

    // Cash dynamics
    const cashIn = newRevenue;
    const cashOut = pivot.estimatedCost / pivot.timeline + (newRevenue * 0.6); // 60% cost of revenue
    const netCash = cashIn - cashOut;

    state = {
      ...state,
      month: m + 1,
      revenue: newRevenue,
      users: newUsers,
      cashRemaining: state.cashRemaining + netCash,
    };
  }

  return state;
}

/**
 * Average multiple projections
 */
function averageProjections(projections: MonthlyProjection[]): MonthlyProjection {
  const count = projections.length;
  return {
    month: projections[0]?.month || 1,
    revenue: projections.reduce((sum, p) => sum + p.revenue, 0) / count,
    users: projections.reduce((sum, p) => sum + p.users, 0) / count,
    cac: projections.reduce((sum, p) => sum + p.cac, 0) / count,
    churnRate: projections.reduce((sum, p) => sum + p.churnRate, 0) / count,
    cashRemaining: projections.reduce((sum, p) => sum + p.cashRemaining, 0) / count,
    probability: projections.reduce((sum, p) => sum + p.probability, 0) / count,
  };
}

/**
 * Calculate confidence in simulation results
 */
function calculateConfidence(
  scenarios: number,
  variance: number,
  baseProbability: number
): number {
  // More scenarios = higher confidence
  const scenarioFactor = Math.min(100, (scenarios / 1000) * 50);

  // Lower variance = higher confidence
  const varianceFactor = Math.max(0, 30 - variance / 10000);

  // Higher base probability = higher confidence
  const probabilityFactor = baseProbability * 0.2;

  return Math.min(100, scenarioFactor + varianceFactor + probabilityFactor);
}

/**
 * Seeded random number generator for reproducible simulations
 */
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
}

/**
 * Compare multiple pivots side-by-side
 */
export async function comparePivots(
  pivots: PivotRecommendation[],
  currentMetrics: StartupMetrics,
  scenarios: number = 500 // Fewer scenarios for comparison
): Promise<{
  rankings: Array<{
    pivot: PivotRecommendation;
    simulation: SimulationResult;
    rank: number;
    score: number;
  }>;
  recommendation: {
    topPivot: PivotRecommendation;
    rationale: string;
    alternatives: PivotRecommendation[];
  };
}> {
  logger.info('[PPE] Comparing pivots', { count: pivots.length });

  // Run simulations for all pivots
  const results = await Promise.all(
    pivots.map(async (pivot) => ({
      pivot,
      simulation: await simulatePivot(pivot, currentMetrics, scenarios),
    }))
  );

  // Calculate composite score for each pivot
  const rankings = results
    .map((r, index) => {
      const sim = r.simulation;
      
      // Weighted scoring:
      // - Success rate: 40%
      // - Expected revenue (month 12): 30%
      // - Risk (lower variance is better): 20%
      // - Confidence: 10%
      const score =
        sim.outcomes.success * 0.4 +
        (sim.projections.month12.revenue / 100000) * 30 + // Normalize to ~0-30 range
        (100 - Math.min(100, sim.riskAnalysis.variance / 1000)) * 0.2 +
        sim.confidence * 0.1;

      return {
        pivot: r.pivot,
        simulation: sim,
        rank: 0, // Will set after sorting
        score,
      };
    })
    .sort((a, b) => b.score - a.score)
    .map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

  // Generate recommendation
  const topPivot = rankings[0].pivot;
  const topSim = rankings[0].simulation;

  let rationale = `${topPivot.title} is recommended because:\n`;
  rationale += `- ${topSim.outcomes.success.toFixed(1)}% success rate in simulations\n`;
  rationale += `- Expected revenue: $${topSim.projections.month12.revenue.toFixed(0)}/month by month 12\n`;
  rationale += `- ${topSim.recommendation === 'proceed' ? 'Low' : 'Medium'} risk profile\n`;
  rationale += `- ${topPivot.timeline} weeks to execute`;

  const alternatives = rankings.slice(1, 3).map(r => r.pivot);

  logger.info('[PPE] Pivot comparison complete', {
    topPivot: topPivot.title,
    score: rankings[0].score,
  });

  return {
    rankings,
    recommendation: {
      topPivot,
      rationale,
      alternatives,
    },
  };
}

/**
 * Generate simulation report
 */
export function generateSimulationReport(simulation: SimulationResult): string {
  const { outcomes, projections, riskAnalysis, recommendation } = simulation;

  return `
# Pivot Simulation Report

**Scenarios Run:** ${simulation.scenariosRun.toLocaleString()}
**Confidence:** ${simulation.confidence}%
**Recommendation:** ${recommendation.toUpperCase()}

## Outcomes

- ✅ Success: ${outcomes.success.toFixed(1)}%
- ⚖️ Breakeven: ${outcomes.breakeven.toFixed(1)}%
- ❌ Failure: ${outcomes.failure.toFixed(1)}%

## Projections

| Month | Revenue | Users | Cash Remaining |
|-------|---------|-------|----------------|
| 1     | $${projections.month1.revenue.toFixed(0)} | ${Math.floor(projections.month1.users)} | $${projections.month1.cashRemaining.toFixed(0)} |
| 3     | $${projections.month3.revenue.toFixed(0)} | ${Math.floor(projections.month3.users)} | $${projections.month3.cashRemaining.toFixed(0)} |
| 6     | $${projections.month6.revenue.toFixed(0)} | ${Math.floor(projections.month6.users)} | $${projections.month6.cashRemaining.toFixed(0)} |
| 12    | $${projections.month12.revenue.toFixed(0)} | ${Math.floor(projections.month12.users)} | $${projections.month12.cashRemaining.toFixed(0)} |

## Risk Analysis

- **Best Case (90th percentile):** $${riskAnalysis.bestCase.cashRemaining.toFixed(0)} remaining
- **Most Likely (median):** $${riskAnalysis.mostLikely.cashRemaining.toFixed(0)} remaining
- **Worst Case (10th percentile):** $${riskAnalysis.worstCase.cashRemaining.toFixed(0)} remaining
- **Variance:** ${riskAnalysis.variance.toFixed(0)}

## Interpretation

${recommendation === 'proceed' 
  ? '✅ Strong recommendation to proceed. High success probability with acceptable risk.'
  : recommendation === 'caution'
  ? '⚠️ Proceed with caution. Success is possible but not guaranteed.'
  : '❌ High risk of failure. Consider alternative pivots or prepare for shutdown.'}
`.trim();
}
