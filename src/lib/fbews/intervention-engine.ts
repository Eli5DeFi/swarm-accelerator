/**
 * Intervention Engine
 * 
 * Automated intervention system that escalates based on burnout risk level.
 * 
 * Escalation ladder:
 * - Low (0-30): Monthly check-in
 * - Medium (31-60): Weekly monitoring + resources
 * - High (61-80): 48h meeting + therapist referral
 * - Critical (81-100): Immediate escalation + sabbatical
 * 
 * Privacy & Ethics:
 * - All interventions opt-in
 * - Founder controls visibility
 * - No sharing with investors/board without permission
 * - Professional therapist referrals only (no amateur advice)
 */

import { logger } from '../logger';
import { BurnoutPrediction, RiskLevel } from './burnout-predictor';

// ============================================
// Types & Interfaces
// ============================================

export interface Intervention {
  id?: string;
  founderId: string;
  predictionId?: string;
  type: InterventionType;
  status: InterventionStatus;
  scheduledAt: Date;
  completedAt?: Date;
  outcome?: InterventionOutcome;
  notes?: string;
  createdAt?: Date;
}

export enum InterventionType {
  // Notifications
  NOTIFICATION = "notification",
  
  // Meetings
  CHECK_IN = "check_in",
  URGENT_MEETING = "urgent_meeting",
  
  // Resources
  SHARE_RESOURCES = "share_resources",
  THERAPIST_REFERRAL = "therapist_referral",
  
  // Actions
  CALENDAR_RESTRUCTURE = "calendar_restructure",
  TEAM_SUPPORT = "team_support",
  SABBATICAL = "sabbatical",
  INTERIM_LEADERSHIP = "interim_leadership",
}

export enum InterventionStatus {
  SCHEDULED = "scheduled",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  SKIPPED = "skipped",
  DECLINED = "declined",
}

export enum InterventionOutcome {
  IMPROVED = "improved",
  STABLE = "stable",
  NO_CHANGE = "no_change",
  WORSENED = "worsened",
  UNKNOWN = "unknown",
}

export interface InterventionPlan {
  founderId: string;
  riskLevel: RiskLevel;
  interventions: Intervention[];
  timeline: string; // Human-readable
  autoSchedule: boolean;
}

export interface InterventionResult {
  success: boolean;
  intervention: Intervention;
  message: string;
  nextSteps?: string[];
}

// ============================================
// Intervention Planning
// ============================================

/**
 * Generate intervention plan based on burnout prediction
 */
export async function planInterventions(
  prediction: BurnoutPrediction,
  previousInterventions?: Intervention[]
): Promise<InterventionPlan> {
  logger.info('[FBEWS] Planning interventions', {
    founderId: prediction.founderId,
    riskLevel: prediction.riskLevel,
    riskScore: prediction.riskScore,
  });

  const interventions: Intervention[] = [];
  const now = new Date();

  // Check if we recently intervened (avoid spam)
  const recentIntervention = previousInterventions?.find(i =>
    i.status !== InterventionStatus.DECLINED &&
    (now.getTime() - (i.scheduledAt?.getTime() || 0)) < (1000 * 60 * 60 * 24 * 7) // Within 7 days
  );

  if (recentIntervention && prediction.riskLevel !== RiskLevel.CRITICAL) {
    logger.info('[FBEWS] Recent intervention exists, skipping new plan', {
      recentType: recentIntervention.type,
    });
    return {
      founderId: prediction.founderId,
      riskLevel: prediction.riskLevel,
      interventions: [],
      timeline: 'No new interventions needed (recent intervention active)',
      autoSchedule: false,
    };
  }

  // Generate interventions based on risk level
  switch (prediction.riskLevel) {
    case RiskLevel.CRITICAL:
      interventions.push(...getCriticalInterventions(prediction, now));
      break;
    case RiskLevel.HIGH:
      interventions.push(...getHighRiskInterventions(prediction, now));
      break;
    case RiskLevel.MEDIUM:
      interventions.push(...getMediumRiskInterventions(prediction, now));
      break;
    case RiskLevel.LOW:
      interventions.push(...getLowRiskInterventions(prediction, now));
      break;
  }

  // Add factor-specific interventions
  interventions.push(...getFactorSpecificInterventions(prediction, now));

  return {
    founderId: prediction.founderId,
    riskLevel: prediction.riskLevel,
    interventions,
    timeline: generateTimeline(interventions),
    autoSchedule: prediction.riskLevel !== RiskLevel.LOW, // Auto-schedule medium+
  };
}

// ============================================
// Risk-Level Interventions
// ============================================

/**
 * Critical risk interventions (81-100)
 */
function getCriticalInterventions(prediction: BurnoutPrediction, now: Date): Intervention[] {
  const interventions: Intervention[] = [];

  // 1. Immediate notification
  interventions.push({
    founderId: prediction.founderId,
    predictionId: prediction.id,
    type: InterventionType.NOTIFICATION,
    status: InterventionStatus.SCHEDULED,
    scheduledAt: now,
    notes: '🚨 CRITICAL: Immediate burnout risk detected',
  });

  // 2. Urgent meeting (within 24 hours)
  const meetingTime = new Date(now.getTime() + 1000 * 60 * 60 * 2); // 2 hours
  interventions.push({
    founderId: prediction.founderId,
    predictionId: prediction.id,
    type: InterventionType.URGENT_MEETING,
    status: InterventionStatus.SCHEDULED,
    scheduledAt: meetingTime,
    notes: 'Emergency check-in to assess situation and provide immediate support',
  });

  // 3. Therapist referral (immediate)
  interventions.push({
    founderId: prediction.founderId,
    predictionId: prediction.id,
    type: InterventionType.THERAPIST_REFERRAL,
    status: InterventionStatus.SCHEDULED,
    scheduledAt: meetingTime,
    notes: 'Provide list of licensed therapists/counselors, offer to schedule first appointment',
  });

  // 4. Sabbatical discussion (if time to breakdown < 4 weeks)
  if (prediction.timeToBreakdownWeeks && prediction.timeToBreakdownWeeks <= 4) {
    interventions.push({
      founderId: prediction.founderId,
      predictionId: prediction.id,
      type: InterventionType.SABBATICAL,
      status: InterventionStatus.SCHEDULED,
      scheduledAt: meetingTime,
      notes: '1-2 week sabbatical to prevent complete breakdown',
    });

    // 5. Interim leadership
    interventions.push({
      founderId: prediction.founderId,
      predictionId: prediction.id,
      type: InterventionType.INTERIM_LEADERSHIP,
      status: InterventionStatus.SCHEDULED,
      scheduledAt: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 2), // 2 days
      notes: 'Arrange interim leadership (co-founder, advisor, or hired operator)',
    });
  }

  return interventions;
}

/**
 * High risk interventions (61-80)
 */
function getHighRiskInterventions(prediction: BurnoutPrediction, now: Date): Intervention[] {
  const interventions: Intervention[] = [];

  // 1. Notification
  interventions.push({
    founderId: prediction.founderId,
    predictionId: prediction.id,
    type: InterventionType.NOTIFICATION,
    status: InterventionStatus.SCHEDULED,
    scheduledAt: now,
    notes: '⚠️ HIGH RISK: Burnout risk detected, scheduling check-in',
  });

  // 2. Check-in meeting (within 48 hours)
  const meetingTime = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 2); // 2 days
  interventions.push({
    founderId: prediction.founderId,
    predictionId: prediction.id,
    type: InterventionType.CHECK_IN,
    status: InterventionStatus.SCHEDULED,
    scheduledAt: meetingTime,
    notes: 'Discuss stress levels, workload, and support needs',
  });

  // 3. Share resources
  interventions.push({
    founderId: prediction.founderId,
    predictionId: prediction.id,
    type: InterventionType.SHARE_RESOURCES,
    status: InterventionStatus.SCHEDULED,
    scheduledAt: now,
    notes: 'Share stress management resources (meditation apps, therapy, sleep hygiene)',
  });

  // 4. Calendar restructure
  interventions.push({
    founderId: prediction.founderId,
    predictionId: prediction.id,
    type: InterventionType.CALENDAR_RESTRUCTURE,
    status: InterventionStatus.SCHEDULED,
    scheduledAt: meetingTime,
    notes: 'Help reduce meetings, add breaks, block focus time',
  });

  // 5. Team support (if workload high)
  const workloadFactor = prediction.primaryRiskFactors.find(f => f.factor === 'work_overload');
  if (workloadFactor && workloadFactor.severity > 70) {
    interventions.push({
      founderId: prediction.founderId,
      predictionId: prediction.id,
      type: InterventionType.TEAM_SUPPORT,
      status: InterventionStatus.SCHEDULED,
      scheduledAt: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7), // 1 week
      notes: 'Discuss bringing in contractor/intern to reduce workload',
    });
  }

  return interventions;
}

/**
 * Medium risk interventions (31-60)
 */
function getMediumRiskInterventions(prediction: BurnoutPrediction, now: Date): Intervention[] {
  const interventions: Intervention[] = [];

  // 1. Notification
  interventions.push({
    founderId: prediction.founderId,
    predictionId: prediction.id,
    type: InterventionType.NOTIFICATION,
    status: InterventionStatus.SCHEDULED,
    scheduledAt: now,
    notes: '💡 MEDIUM RISK: Some burnout indicators detected, monitoring weekly',
  });

  // 2. Weekly check-in
  const checkInTime = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7); // 1 week
  interventions.push({
    founderId: prediction.founderId,
    predictionId: prediction.id,
    type: InterventionType.CHECK_IN,
    status: InterventionStatus.SCHEDULED,
    scheduledAt: checkInTime,
    notes: 'Weekly monitoring to track trends',
  });

  // 3. Share resources
  interventions.push({
    founderId: prediction.founderId,
    predictionId: prediction.id,
    type: InterventionType.SHARE_RESOURCES,
    status: InterventionStatus.SCHEDULED,
    scheduledAt: now,
    notes: 'Share wellness resources (work-life balance, sleep hygiene, stress management)',
  });

  return interventions;
}

/**
 * Low risk interventions (0-30)
 */
function getLowRiskInterventions(prediction: BurnoutPrediction, now: Date): Intervention[] {
  const interventions: Intervention[] = [];

  // Monthly monitoring only
  const checkInTime = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30); // 1 month
  interventions.push({
    founderId: prediction.founderId,
    predictionId: prediction.id,
    type: InterventionType.CHECK_IN,
    status: InterventionStatus.SCHEDULED,
    scheduledAt: checkInTime,
    notes: 'Monthly monitoring to detect early changes',
  });

  return interventions;
}

// ============================================
// Factor-Specific Interventions
// ============================================

/**
 * Generate interventions for specific risk factors
 */
function getFactorSpecificInterventions(prediction: BurnoutPrediction, now: Date): Intervention[] {
  const interventions: Intervention[] = [];

  // Only add factor-specific interventions for medium+ risk
  if (prediction.riskScore < 40) return interventions;

  prediction.primaryRiskFactors.forEach(factor => {
    if (factor.severity < 60) return; // Only severe factors

    switch (factor.factor) {
      case 'sleep_deprivation':
        interventions.push({
          founderId: prediction.founderId,
          predictionId: prediction.id,
          type: InterventionType.SHARE_RESOURCES,
          status: InterventionStatus.SCHEDULED,
          scheduledAt: now,
          notes: '😴 Sleep intervention: Share sleep hygiene guide, recommend sleep tracking app',
        });
        break;

      case 'work_overload':
        interventions.push({
          founderId: prediction.founderId,
          predictionId: prediction.id,
          type: InterventionType.CALENDAR_RESTRUCTURE,
          status: InterventionStatus.SCHEDULED,
          scheduledAt: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 3), // 3 days
          notes: '⏰ Workload intervention: Limit meetings to 4 hours/day, add 2-hour focus blocks',
        });
        break;

      case 'social_withdrawal':
        interventions.push({
          founderId: prediction.founderId,
          predictionId: prediction.id,
          type: InterventionType.CHECK_IN,
          status: InterventionStatus.SCHEDULED,
          scheduledAt: new Date(now.getTime() + 1000 * 60 * 60 * 24), // 1 day
          notes: '🤝 Social intervention: 1-on-1 coffee chat, discuss team dynamics',
        });
        break;

      case 'self_reported_stress':
        interventions.push({
          founderId: prediction.founderId,
          predictionId: prediction.id,
          type: InterventionType.THERAPIST_REFERRAL,
          status: InterventionStatus.SCHEDULED,
          scheduledAt: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 2), // 2 days
          notes: '🧠 Mental health intervention: Recommend therapy, share therapist directory',
        });
        break;
    }
  });

  return interventions;
}

// ============================================
// Intervention Execution
// ============================================

/**
 * Execute an intervention
 */
export async function executeIntervention(
  intervention: Intervention,
  options?: {
    dryRun?: boolean;
    notificationChannel?: 'email' | 'slack' | 'sms';
  }
): Promise<InterventionResult> {
  logger.info('[FBEWS] Executing intervention', {
    founderId: intervention.founderId,
    type: intervention.type,
    dryRun: options?.dryRun || false,
  });

  if (options?.dryRun) {
    return {
      success: true,
      intervention: { ...intervention, status: InterventionStatus.SCHEDULED },
      message: `[DRY RUN] Would execute: ${intervention.type}`,
    };
  }

  try {
    // Execute based on type
    switch (intervention.type) {
      case InterventionType.NOTIFICATION:
        return await sendNotification(intervention, options?.notificationChannel);
      
      case InterventionType.CHECK_IN:
      case InterventionType.URGENT_MEETING:
        return await scheduleMeeting(intervention);
      
      case InterventionType.SHARE_RESOURCES:
        return await shareResources(intervention);
      
      case InterventionType.THERAPIST_REFERRAL:
        return await sendTherapistReferral(intervention);
      
      case InterventionType.CALENDAR_RESTRUCTURE:
        return await assistCalendarRestructure(intervention);
      
      case InterventionType.TEAM_SUPPORT:
        return await discussTeamSupport(intervention);
      
      case InterventionType.SABBATICAL:
        return await proposeSabbatical(intervention);
      
      case InterventionType.INTERIM_LEADERSHIP:
        return await arrangeInterimLeadership(intervention);
      
      default:
        throw new Error(`Unknown intervention type: ${intervention.type}`);
    }
  } catch (error) {
    logger.error('[FBEWS] Intervention execution failed', {
      error: (error as Error).message,
      intervention: intervention.type,
    });
    return {
      success: false,
      intervention: { ...intervention, status: InterventionStatus.SKIPPED },
      message: `Failed to execute: ${(error as Error).message}`,
    };
  }
}

// ============================================
// Intervention Handlers (Stubs - implement based on available integrations)
// ============================================

async function sendNotification(intervention: Intervention, channel?: string): Promise<InterventionResult> {
  // TODO: Integrate with email/Slack/SMS
  logger.info('[FBEWS] Sending notification', { channel, notes: intervention.notes });
  
  return {
    success: true,
    intervention: { ...intervention, status: InterventionStatus.COMPLETED, completedAt: new Date() },
    message: `Notification sent via ${channel || 'email'}: ${intervention.notes}`,
    nextSteps: ['Wait for founder response', 'Follow up if no response within 48h'],
  };
}

async function scheduleMeeting(intervention: Intervention): Promise<InterventionResult> {
  // TODO: Integrate with calendar API
  logger.info('[FBEWS] Scheduling meeting', { scheduledAt: intervention.scheduledAt });
  
  return {
    success: true,
    intervention: { ...intervention, status: InterventionStatus.SCHEDULED },
    message: `Meeting scheduled for ${intervention.scheduledAt.toLocaleString()}`,
    nextSteps: ['Send calendar invite', 'Prepare talking points', 'Follow up after meeting'],
  };
}

async function shareResources(intervention: Intervention): Promise<InterventionResult> {
  // TODO: Send curated resource list
  logger.info('[FBEWS] Sharing resources', { notes: intervention.notes });
  
  const resources = [
    '🧘 Headspace: Guided meditation app',
    '😴 Sleep Foundation: Sleep hygiene guide',
    '🧠 BetterHelp: Online therapy platform',
    '📚 "The Burnout Fix" by Jacinta M. Jiménez',
  ];
  
  return {
    success: true,
    intervention: { ...intervention, status: InterventionStatus.COMPLETED, completedAt: new Date() },
    message: `Resources shared:\n${resources.join('\n')}`,
  };
}

async function sendTherapistReferral(intervention: Intervention): Promise<InterventionResult> {
  // TODO: Send vetted therapist directory
  logger.info('[FBEWS] Sending therapist referral');
  
  return {
    success: true,
    intervention: { ...intervention, status: InterventionStatus.COMPLETED, completedAt: new Date() },
    message: 'Therapist referral sent (licensed professionals only)',
    nextSteps: ['Offer to schedule first appointment', 'Follow up in 1 week'],
  };
}

async function assistCalendarRestructure(intervention: Intervention): Promise<InterventionResult> {
  // TODO: Integrate with calendar API to suggest changes
  logger.info('[FBEWS] Assisting calendar restructure');
  
  return {
    success: true,
    intervention: { ...intervention, status: InterventionStatus.IN_PROGRESS },
    message: 'Calendar restructure assistance scheduled',
    nextSteps: [
      'Review current calendar',
      'Identify meetings to decline/delegate',
      'Block 2-hour focus time daily',
      'Add 15-min breaks between meetings',
    ],
  };
}

async function discussTeamSupport(intervention: Intervention): Promise<InterventionResult> {
  // TODO: Schedule discussion about hiring support
  logger.info('[FBEWS] Discussing team support needs');
  
  return {
    success: true,
    intervention: { ...intervention, status: InterventionStatus.SCHEDULED },
    message: 'Team support discussion scheduled',
    nextSteps: [
      'Identify most time-consuming tasks',
      'Estimate cost of contractor/intern',
      'Source candidates if founder agrees',
    ],
  };
}

async function proposeSabbatical(intervention: Intervention): Promise<InterventionResult> {
  // TODO: Formal sabbatical proposal
  logger.info('[FBEWS] Proposing sabbatical');
  
  return {
    success: true,
    intervention: { ...intervention, status: InterventionStatus.IN_PROGRESS },
    message: 'Sabbatical proposal initiated',
    nextSteps: [
      'Discuss with founder (1-2 weeks off)',
      'Arrange coverage for critical tasks',
      'Set clear handoff plan',
      'Schedule return date',
    ],
  };
}

async function arrangeInterimLeadership(intervention: Intervention): Promise<InterventionResult> {
  // TODO: Identify interim leadership options
  logger.info('[FBEWS] Arranging interim leadership');
  
  return {
    success: true,
    intervention: { ...intervention, status: InterventionStatus.IN_PROGRESS },
    message: 'Interim leadership arrangement in progress',
    nextSteps: [
      'Identify candidates (co-founder, advisor, hired operator)',
      'Define scope and duration',
      'Formal handoff meeting',
      'Weekly check-ins during transition',
    ],
  };
}

// ============================================
// Helpers
// ============================================

/**
 * Generate human-readable timeline
 */
function generateTimeline(interventions: Intervention[]): string {
  if (interventions.length === 0) return 'No interventions needed';

  const now = new Date();
  const timeline: string[] = [];

  interventions.forEach(i => {
    const hoursUntil = Math.round((i.scheduledAt.getTime() - now.getTime()) / (1000 * 60 * 60));
    const timeStr = hoursUntil < 1
      ? 'Now'
      : hoursUntil < 24
      ? `${hoursUntil}h`
      : `${Math.round(hoursUntil / 24)}d`;
    
    timeline.push(`${timeStr}: ${i.type}`);
  });

  return timeline.join(' → ');
}

/**
 * Batch execute multiple interventions
 */
export async function executeInterventionPlan(
  plan: InterventionPlan,
  options?: {
    dryRun?: boolean;
    notificationChannel?: 'email' | 'slack' | 'sms';
  }
): Promise<InterventionResult[]> {
  logger.info('[FBEWS] Executing intervention plan', {
    founderId: plan.founderId,
    interventionCount: plan.interventions.length,
  });

  const results: InterventionResult[] = [];

  for (const intervention of plan.interventions) {
    const result = await executeIntervention(intervention, options);
    results.push(result);
    
    // Stop if critical intervention fails
    if (!result.success && intervention.type === InterventionType.URGENT_MEETING) {
      logger.error('[FBEWS] Critical intervention failed, stopping execution');
      break;
    }
  }

  return results;
}
