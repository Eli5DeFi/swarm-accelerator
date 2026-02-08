/**
 * Failure Predictor
 * 
 * Predicts startup failure probability based on:
 * - Assumption validation status
 * - Deviation from expected metrics
 * - Historical failure patterns
 * - Runway analysis
 */

import { logger } from '../logger';
import { Assumption, AssumptionType } from './assumption-extractor';

export interface FailurePrediction {
  failureProbability: number; // 0-100
  timeToFailure?: number; // months (if failure likely)
  primaryReason: string;
  riskFactors: RiskFactor[];
  confidence: number; // 0-100
  predictedAt: Date;
}

export interface RiskFactor {
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  impact: number; // 0-100
}

export interface StartupMetrics {
  monthsActive: number;
  revenue: number; // total revenue
  mrr?: number; // monthly recurring revenue
  users: number;
  cac?: number;
  churnRate?: number;
  cashRemaining: number;
  monthlyBurn: number;
  teamSize: number;
  fundingRaised: number;
}

/**
 * Predict failure probability using rule-based + ML-lite approach
 */
export async function predictFailure(
  startupId: string,
  assumptions: Assumption[],
  metrics: StartupMetrics,
  validationResults?: Array<{
    assumption: Assumption;
    isValid: boolean;
    deviation: number;
  }>
): Promise<FailurePrediction> {
  logger.info('[PPE] Predicting failure', { startupId, metricsAge: metrics.monthsActive });

  const riskFactors: RiskFactor[] = [];
  let failureScore = 0;

  // Factor 1: Runway Analysis (30% weight)
  const runway = metrics.cashRemaining / metrics.monthlyBurn;
  if (runway < 3) {
    riskFactors.push({
      category: 'runway',
      severity: 'critical',
      description: `Only ${runway.toFixed(1)} months of runway remaining`,
      impact: 30,
    });
    failureScore += 30;
  } else if (runway < 6) {
    riskFactors.push({
      category: 'runway',
      severity: 'high',
      description: `${runway.toFixed(1)} months of runway - need funding soon`,
      impact: 20,
    });
    failureScore += 20;
  } else if (runway < 12) {
    riskFactors.push({
      category: 'runway',
      severity: 'medium',
      description: `${runway.toFixed(1)} months of runway`,
      impact: 10,
    });
    failureScore += 10;
  }

  // Factor 2: Revenue/Traction (25% weight)
  const revenuePerMonth = metrics.mrr || (metrics.revenue / Math.max(1, metrics.monthsActive));
  const burnMultiple = metrics.monthlyBurn / Math.max(1, revenuePerMonth);

  if (metrics.monthsActive >= 6 && revenuePerMonth === 0) {
    riskFactors.push({
      category: 'revenue',
      severity: 'critical',
      description: 'No revenue after 6 months',
      impact: 25,
    });
    failureScore += 25;
  } else if (metrics.monthsActive >= 3 && revenuePerMonth < metrics.monthlyBurn * 0.1) {
    riskFactors.push({
      category: 'revenue',
      severity: 'high',
      description: 'Revenue < 10% of burn rate',
      impact: 20,
    });
    failureScore += 20;
  } else if (burnMultiple > 5) {
    riskFactors.push({
      category: 'revenue',
      severity: 'medium',
      description: `High burn multiple (${burnMultiple.toFixed(1)}x)`,
      impact: 15,
    });
    failureScore += 15;
  }

  // Factor 3: Assumption Failures (25% weight)
  if (validationResults && validationResults.length > 0) {
    const failedAssumptions = validationResults.filter(v => !v.isValid);
    const criticalFailures = failedAssumptions.filter(
      v => v.assumption.type === AssumptionType.PRICING || 
           v.assumption.type === AssumptionType.CAC ||
           v.assumption.type === AssumptionType.MARKET_SIZE
    );

    if (criticalFailures.length >= 2) {
      riskFactors.push({
        category: 'assumptions',
        severity: 'critical',
        description: `${criticalFailures.length} critical assumptions failing`,
        impact: 25,
      });
      failureScore += 25;
    } else if (failedAssumptions.length >= 3) {
      riskFactors.push({
        category: 'assumptions',
        severity: 'high',
        description: `${failedAssumptions.length} assumptions failing`,
        impact: 20,
      });
      failureScore += 20;
    } else if (failedAssumptions.length > 0) {
      riskFactors.push({
        category: 'assumptions',
        severity: 'medium',
        description: `${failedAssumptions.length} assumption(s) failing`,
        impact: 10,
      });
      failureScore += 10;
    }
  }

  // Factor 4: Growth Rate (10% weight)
  if (metrics.users > 0 && metrics.monthsActive >= 3) {
    const usersPerMonth = metrics.users / metrics.monthsActive;
    if (usersPerMonth < 10) {
      riskFactors.push({
        category: 'growth',
        severity: 'high',
        description: 'Very low user growth rate',
        impact: 10,
      });
      failureScore += 10;
    }
  }

  // Factor 5: CAC/Churn Economics (10% weight)
  if (metrics.cac && metrics.churnRate && revenuePerMonth > 0) {
    const avgRevenuePerUser = revenuePerMonth / Math.max(1, metrics.users);
    const ltv = avgRevenuePerUser / Math.max(0.01, metrics.churnRate);
    const ltvCacRatio = ltv / metrics.cac;

    if (ltvCacRatio < 1) {
      riskFactors.push({
        category: 'unit_economics',
        severity: 'critical',
        description: 'LTV < CAC (losing money on every customer)',
        impact: 10,
      });
      failureScore += 10;
    } else if (ltvCacRatio < 3) {
      riskFactors.push({
        category: 'unit_economics',
        severity: 'medium',
        description: `LTV/CAC ratio is ${ltvCacRatio.toFixed(1)} (need 3+)`,
        impact: 5,
      });
      failureScore += 5;
    }
  }

  // Determine primary reason
  const primaryRisk = riskFactors.reduce((max, rf) => 
    rf.impact > max.impact ? rf : max, 
    riskFactors[0] || { category: 'unknown', severity: 'low' as const, description: 'No major risks', impact: 0 }
  );

  // Calculate time to failure
  let timeToFailure: number | undefined;
  if (failureScore >= 50) {
    timeToFailure = Math.max(1, Math.min(runway, 6)); // 1-6 months
  } else if (failureScore >= 30) {
    timeToFailure = Math.max(3, Math.min(runway, 12)); // 3-12 months
  }

  // Confidence based on data quality
  const hasRevenue = metrics.revenue > 0;
  const hasUsers = metrics.users > 0;
  const hasValidations = (validationResults?.length || 0) > 0;
  const confidence = 40 + 
    (hasRevenue ? 20 : 0) + 
    (hasUsers ? 20 : 0) + 
    (hasValidations ? 20 : 0);

  const prediction: FailurePrediction = {
    failureProbability: Math.min(100, Math.max(0, failureScore)),
    timeToFailure,
    primaryReason: primaryRisk.description,
    riskFactors: riskFactors.sort((a, b) => b.impact - a.impact),
    confidence,
    predictedAt: new Date(),
  };

  logger.info('[PPE] Failure prediction complete', {
    startupId,
    probability: prediction.failureProbability,
    primaryReason: prediction.primaryReason,
    confidence: prediction.confidence,
  });

  return prediction;
}

/**
 * Analyze historical failure patterns (placeholder for ML model)
 */
export async function analyzeFailurePatterns(
  assumptions: Assumption[],
  metrics: StartupMetrics
): Promise<{
  similarFailures: number;
  commonPatterns: string[];
  recommendations: string[];
}> {
  // This would query a database of historical failures
  // For now, return mock data based on heuristics

  const patterns: string[] = [];
  const recommendations: string[] = [];

  // Pattern 1: No revenue after 6 months
  if (metrics.monthsActive >= 6 && metrics.revenue === 0) {
    patterns.push('No revenue after 6 months (common in 42% of failures)');
    recommendations.push('Pivot to lower-friction monetization model');
    recommendations.push('Consider freemium tier to build user base');
  }

  // Pattern 2: High burn, low revenue
  const revenuePerMonth = metrics.mrr || (metrics.revenue / Math.max(1, metrics.monthsActive));
  if (metrics.monthlyBurn > revenuePerMonth * 5) {
    patterns.push('Burn rate >5x revenue (common in 38% of failures)');
    recommendations.push('Reduce team size or salaries');
    recommendations.push('Focus on revenue-generating activities');
  }

  // Pattern 3: Pricing too high
  const pricingAssumptions = assumptions.filter(a => a.type === AssumptionType.PRICING);
  if (pricingAssumptions.some(a => typeof a.value === 'number' && a.value > 100)) {
    patterns.push('High-ticket pricing without enterprise sales team');
    recommendations.push('Lower pricing to <$50/month for self-service');
    recommendations.push('Or hire enterprise sales team');
  }

  return {
    similarFailures: patterns.length * 15, // Mock count
    commonPatterns: patterns,
    recommendations,
  };
}

/**
 * Generate early warning alerts
 */
export function generateWarnings(
  prediction: FailurePrediction,
  metrics: StartupMetrics
): Array<{
  level: 'info' | 'warning' | 'critical';
  message: string;
  action: string;
}> {
  const warnings: Array<{
    level: 'info' | 'warning' | 'critical';
    message: string;
    action: string;
  }> = [];

  // Critical: Less than 3 months runway
  const runway = metrics.cashRemaining / metrics.monthlyBurn;
  if (runway < 3) {
    warnings.push({
      level: 'critical',
      message: `Only ${runway.toFixed(1)} months of runway remaining`,
      action: 'Start fundraising immediately or pivot to extend runway',
    });
  }

  // Critical: Failure probability > 70%
  if (prediction.failureProbability > 70) {
    warnings.push({
      level: 'critical',
      message: `${prediction.failureProbability}% failure probability detected`,
      action: 'Consider major pivot or wind down gracefully',
    });
  }

  // Warning: Failure probability 40-70%
  if (prediction.failureProbability >= 40 && prediction.failureProbability <= 70) {
    warnings.push({
      level: 'warning',
      message: `${prediction.failureProbability}% failure probability - action needed`,
      action: 'Review assumptions and test pivots',
    });
  }

  // Warning: No revenue after 3 months
  if (metrics.monthsActive >= 3 && metrics.revenue === 0) {
    warnings.push({
      level: 'warning',
      message: 'No revenue after 3 months of operation',
      action: 'Validate pricing assumptions with real customers',
    });
  }

  return warnings;
}
