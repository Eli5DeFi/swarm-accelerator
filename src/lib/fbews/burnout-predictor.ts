/**
 * Burnout Predictor
 * 
 * Predicts founder burnout risk using multi-signal behavioral analysis.
 * 
 * Model: Rule-based ML-lite (can upgrade to real ML with training data)
 * 
 * Risk factors (weighted):
 * - Sleep deprivation (25%)
 * - Work overload (20%)
 * - Social withdrawal (15%)
 * - Code quality decline (15%)
 * - Self-reported stress (15%)
 * - Response latency (10%)
 * 
 * Output:
 * - Risk score (0-100)
 * - Time to burnout (weeks)
 * - Primary risk factors
 * - Intervention recommendations
 */

import { logger } from '../logger';
import { Signal, SignalType, SignalCollectionResult } from './signal-collector';

// ============================================
// Types & Interfaces
// ============================================

export interface BurnoutPrediction {
  id?: string;
  founderId: string;
  riskScore: number; // 0-100 (100 = imminent burnout)
  riskLevel: RiskLevel;
  timeToBreakdownWeeks: number | null; // Null if low risk
  primaryRiskFactors: RiskFactor[];
  recommendations: string[];
  signals: SignalSummary;
  predictedAt: Date;
  confidence: number; // 0-100
}

export enum RiskLevel {
  LOW = "low",          // 0-30
  MEDIUM = "medium",    // 31-60
  HIGH = "high",        // 61-80
  CRITICAL = "critical" // 81-100
}

export interface RiskFactor {
  factor: string;
  severity: number; // 0-100
  contribution: number; // 0-100 (% of total risk)
  description: string;
}

export interface SignalSummary {
  sleep: number | null;
  workload: number | null;
  socialEngagement: number | null;
  codeQuality: number | null;
  selfReportedStress: number | null;
  responseLatency: number | null;
  totalSignals: number;
  averageConfidence: number;
}

// ============================================
// Prediction Algorithm
// ============================================

/**
 * Predict burnout risk from collected signals
 */
export async function predictBurnout(
  founderId: string,
  signalResult: SignalCollectionResult
): Promise<BurnoutPrediction> {
  logger.info('[FBEWS] Predicting burnout risk', { founderId, signalCount: signalResult.signals.length });

  // 1. Extract signal categories
  const signalSummary = extractSignalSummary(signalResult.signals);

  // 2. Calculate weighted risk score
  const riskFactors = calculateRiskFactors(signalSummary);
  const riskScore = calculateWeightedRiskScore(riskFactors);

  // 3. Determine risk level
  const riskLevel = determineRiskLevel(riskScore);

  // 4. Estimate time to breakdown
  const timeToBreakdownWeeks = estimateTimeToBreakdown(riskScore, riskFactors);

  // 5. Generate recommendations
  const recommendations = generateRecommendations(riskLevel, riskFactors);

  // 6. Calculate confidence
  const confidence = calculateConfidence(signalResult.summary.averageConfidence, signalResult.signals.length);

  return {
    founderId,
    riskScore: Math.round(riskScore),
    riskLevel,
    timeToBreakdownWeeks,
    primaryRiskFactors: riskFactors.slice(0, 3), // Top 3
    recommendations,
    signals: signalSummary,
    predictedAt: new Date(),
    confidence: Math.round(confidence),
  };
}

// ============================================
// Signal Extraction
// ============================================

/**
 * Extract and categorize signals
 */
function extractSignalSummary(signals: Signal[]): SignalSummary {
  const getSignalValue = (types: SignalType[]): number | null => {
    const relevantSignals = signals.filter(s => types.includes(s.type));
    if (relevantSignals.length === 0) return null;
    
    // Weighted average by confidence
    const totalWeight = relevantSignals.reduce((sum, s) => sum + s.confidence, 0);
    const weightedSum = relevantSignals.reduce((sum, s) => sum + (s.value * s.confidence), 0);
    
    return weightedSum / totalWeight;
  };

  return {
    sleep: getSignalValue([SignalType.SLEEP_HOURS, SignalType.SLEEP_QUALITY]),
    workload: getSignalValue([
      SignalType.CALENDAR_WORK_HOURS,
      SignalType.CALENDAR_MEETING_DENSITY,
      SignalType.CALENDAR_BREAKS
    ]),
    socialEngagement: getSignalValue([
      SignalType.SLACK_ACTIVITY,
      SignalType.SLACK_RESPONSE_TIME
    ]),
    codeQuality: getSignalValue([
      SignalType.GITHUB_CODE_QUALITY,
      SignalType.GITHUB_COMMITS,
      SignalType.GITHUB_PR_ACTIVITY
    ]),
    selfReportedStress: getSignalValue([
      SignalType.SELF_REPORT_STRESS,
      SignalType.SELF_REPORT_ENERGY
    ]),
    responseLatency: getSignalValue([
      SignalType.SLACK_RESPONSE_TIME,
      SignalType.DECISION_LATENCY
    ]),
    totalSignals: signals.length,
    averageConfidence: signals.length > 0
      ? signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length
      : 0,
  };
}

// ============================================
// Risk Factor Calculation
// ============================================

/**
 * Calculate individual risk factors with weights
 */
function calculateRiskFactors(summary: SignalSummary): RiskFactor[] {
  const factors: RiskFactor[] = [];

  // Sleep (25% weight)
  if (summary.sleep !== null) {
    factors.push({
      factor: 'sleep_deprivation',
      severity: summary.sleep,
      contribution: 0.25,
      description: summary.sleep > 70
        ? 'Severe sleep deprivation detected'
        : summary.sleep > 50
        ? 'Moderate sleep issues'
        : 'Sleep patterns healthy',
    });
  }

  // Workload (20% weight)
  if (summary.workload !== null) {
    factors.push({
      factor: 'work_overload',
      severity: summary.workload,
      contribution: 0.20,
      description: summary.workload > 70
        ? 'Unsustainable work hours without breaks'
        : summary.workload > 50
        ? 'Heavy workload, limited recovery time'
        : 'Work-life balance maintained',
    });
  }

  // Social engagement (15% weight)
  if (summary.socialEngagement !== null) {
    factors.push({
      factor: 'social_withdrawal',
      severity: summary.socialEngagement,
      contribution: 0.15,
      description: summary.socialEngagement > 70
        ? 'Significant social withdrawal from team'
        : summary.socialEngagement > 50
        ? 'Reduced team interaction'
        : 'Active team engagement',
    });
  }

  // Code quality (15% weight)
  if (summary.codeQuality !== null) {
    factors.push({
      factor: 'code_quality_decline',
      severity: summary.codeQuality,
      contribution: 0.15,
      description: summary.codeQuality > 70
        ? 'Sharp decline in code quality and output'
        : summary.codeQuality > 50
        ? 'Some decline in coding patterns'
        : 'Code quality stable',
    });
  }

  // Self-reported stress (15% weight)
  if (summary.selfReportedStress !== null) {
    factors.push({
      factor: 'self_reported_stress',
      severity: summary.selfReportedStress,
      contribution: 0.15,
      description: summary.selfReportedStress > 70
        ? 'Self-reporting extreme stress and low energy'
        : summary.selfReportedStress > 50
        ? 'Moderate stress levels reported'
        : 'Stress levels manageable',
    });
  }

  // Response latency (10% weight)
  if (summary.responseLatency !== null) {
    factors.push({
      factor: 'response_latency',
      severity: summary.responseLatency,
      contribution: 0.10,
      description: summary.responseLatency > 70
        ? 'Severe delays in responses and decisions'
        : summary.responseLatency > 50
        ? 'Slower response times than baseline'
        : 'Response times normal',
    });
  }

  // Sort by severity (descending)
  factors.sort((a, b) => b.severity - a.severity);

  return factors;
}

/**
 * Calculate weighted risk score
 */
function calculateWeightedRiskScore(factors: RiskFactor[]): number {
  if (factors.length === 0) return 0;

  // Normalize contributions to sum to 1.0
  const totalContribution = factors.reduce((sum, f) => sum + f.contribution, 0);
  
  // Calculate weighted sum
  const weightedScore = factors.reduce((sum, f) => {
    const normalizedWeight = f.contribution / totalContribution;
    return sum + (f.severity * normalizedWeight);
  }, 0);

  // Apply amplification for multiple high-risk factors (burnout compounds)
  const highRiskFactors = factors.filter(f => f.severity > 70).length;
  const amplification = highRiskFactors > 2 ? 1.15 : 1.0; // +15% if 3+ critical factors

  return Math.min(100, weightedScore * amplification);
}

// ============================================
// Risk Level & Timeline
// ============================================

/**
 * Determine risk level from score
 */
function determineRiskLevel(score: number): RiskLevel {
  if (score >= 81) return RiskLevel.CRITICAL;
  if (score >= 61) return RiskLevel.HIGH;
  if (score >= 31) return RiskLevel.MEDIUM;
  return RiskLevel.LOW;
}

/**
 * Estimate time until breakdown
 */
function estimateTimeToBreakdown(score: number, factors: RiskFactor[]): number | null {
  if (score < 40) return null; // Low risk, no immediate concern

  // Base timeline (weeks until breakdown)
  // Critical (81-100): 2-4 weeks
  // High (61-80): 6-10 weeks
  // Medium (31-60): 12-20 weeks

  let baseWeeks: number;
  if (score >= 81) baseWeeks = 3;
  else if (score >= 61) baseWeeks = 8;
  else baseWeeks = 16;

  // Adjust based on specific factors
  const sleepFactor = factors.find(f => f.factor === 'sleep_deprivation');
  const stressFactor = factors.find(f => f.factor === 'self_reported_stress');

  // Severe sleep deprivation accelerates breakdown
  if (sleepFactor && sleepFactor.severity > 80) {
    baseWeeks *= 0.7; // 30% faster
  }

  // High self-reported stress is a strong leading indicator
  if (stressFactor && stressFactor.severity > 80) {
    baseWeeks *= 0.8; // 20% faster
  }

  return Math.round(baseWeeks);
}

// ============================================
// Recommendations
// ============================================

/**
 * Generate intervention recommendations
 */
function generateRecommendations(level: RiskLevel, factors: RiskFactor[]): string[] {
  const recommendations: string[] = [];

  switch (level) {
    case RiskLevel.CRITICAL:
      recommendations.push('🚨 URGENT: Schedule immediate meeting with founder');
      recommendations.push('🏥 Recommend professional mental health support (therapist/counselor)');
      recommendations.push('⏸️ Consider temporary sabbatical (1-2 weeks minimum)');
      recommendations.push('👥 Arrange interim leadership if needed');
      break;

    case RiskLevel.HIGH:
      recommendations.push('⚠️ Schedule check-in within 48 hours');
      recommendations.push('🧘 Recommend stress management resources (meditation, therapy)');
      recommendations.push('📅 Help restructure calendar (reduce meetings, add breaks)');
      recommendations.push('👥 Consider bringing in additional team support');
      break;

    case RiskLevel.MEDIUM:
      recommendations.push('📞 Weekly check-ins to monitor trends');
      recommendations.push('💡 Share wellness resources (sleep hygiene, work-life balance)');
      recommendations.push('📊 Track metrics weekly for early intervention');
      break;

    case RiskLevel.LOW:
      recommendations.push('✅ Continue current support level');
      recommendations.push('📈 Monitor monthly for changes');
      break;
  }

  // Add factor-specific recommendations
  factors.slice(0, 2).forEach(factor => {
    if (factor.severity > 60) {
      recommendations.push(...getFactorRecommendations(factor));
    }
  });

  return recommendations;
}

/**
 * Get recommendations for specific risk factors
 */
function getFactorRecommendations(factor: RiskFactor): string[] {
  const recommendations: string[] = [];

  switch (factor.factor) {
    case 'sleep_deprivation':
      recommendations.push('😴 Sleep intervention: Enforce 8-hour sleep minimum, share sleep hygiene tips');
      break;
    case 'work_overload':
      recommendations.push('⏰ Calendar intervention: Block focus time, limit meetings to 4 hours/day');
      break;
    case 'social_withdrawal':
      recommendations.push('🤝 Social intervention: 1-on-1 coffee chats, team bonding activities');
      break;
    case 'code_quality_decline':
      recommendations.push('💻 Technical intervention: Code review support, pair programming, reduce pressure');
      break;
    case 'self_reported_stress':
      recommendations.push('🧠 Mental health intervention: Therapy resources, stress management workshops');
      break;
    case 'response_latency':
      recommendations.push('📱 Communication intervention: Reduce notification load, async-first culture');
      break;
  }

  return recommendations;
}

// ============================================
// Confidence Calculation
// ============================================

/**
 * Calculate prediction confidence based on data quality
 */
function calculateConfidence(averageSignalConfidence: number, signalCount: number): number {
  // Base confidence from signal quality
  let confidence = averageSignalConfidence;

  // Penalize for insufficient signals
  const minSignals = 6; // Ideally 6+ signal types
  if (signalCount < minSignals) {
    const signalPenalty = ((minSignals - signalCount) / minSignals) * 20;
    confidence -= signalPenalty;
  }

  // Bonus for comprehensive data
  if (signalCount >= 10) {
    confidence = Math.min(100, confidence + 5);
  }

  return Math.max(0, Math.min(100, confidence));
}

// ============================================
// Historical Analysis
// ============================================

/**
 * Analyze burnout trends over time
 */
export async function analyzeBurnoutTrends(
  founderId: string,
  predictions: BurnoutPrediction[]
): Promise<{
  trend: 'improving' | 'stable' | 'worsening';
  changeRate: number; // Points per week
  projectedRiskIn4Weeks: number;
}> {
  if (predictions.length < 2) {
    return {
      trend: 'stable',
      changeRate: 0,
      projectedRiskIn4Weeks: predictions[0]?.riskScore || 0,
    };
  }

  // Sort by date (oldest first)
  const sorted = [...predictions].sort((a, b) =>
    a.predictedAt.getTime() - b.predictedAt.getTime()
  );

  // Calculate linear regression slope
  const n = sorted.length;
  const xValues = sorted.map((_, i) => i); // Time index
  const yValues = sorted.map(p => p.riskScore);

  const sumX = xValues.reduce((sum, x) => sum + x, 0);
  const sumY = yValues.reduce((sum, y) => sum + y, 0);
  const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
  const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  // Determine trend
  let trend: 'improving' | 'stable' | 'worsening';
  if (slope < -5) trend = 'improving';
  else if (slope > 5) trend = 'worsening';
  else trend = 'stable';

  // Project 4 weeks ahead
  const weeksPerPrediction = 1; // Assume weekly predictions
  const predictionsAhead = 4 / weeksPerPrediction;
  const projectedRiskIn4Weeks = Math.max(0, Math.min(100,
    sorted[sorted.length - 1].riskScore + (slope * predictionsAhead)
  ));

  return {
    trend,
    changeRate: slope,
    projectedRiskIn4Weeks: Math.round(projectedRiskIn4Weeks),
  };
}
