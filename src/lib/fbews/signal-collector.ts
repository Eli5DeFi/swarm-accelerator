/**
 * Signal Collector
 * 
 * Collects behavioral signals from multiple sources to detect founder burnout.
 * Integrates with:
 * - Slack API (sentiment, response times, activity patterns)
 * - GitHub API (commit frequency, code quality, PR patterns)
 * - Calendar API (meeting density, work hours, breaks)
 * - Sleep tracking (if available)
 * - Founder self-reports
 * 
 * Privacy-first: All data encrypted, opt-in only, anonymized for ML training.
 */

import { logger } from '../logger';

// ============================================
// Types & Interfaces
// ============================================

export interface Signal {
  type: SignalType;
  value: number; // Normalized 0-100 (100 = high risk)
  raw: any; // Original data (for debugging)
  timestamp: Date;
  confidence: number; // 0-100 (data quality)
}

export enum SignalType {
  SLACK_SENTIMENT = "slack_sentiment",
  SLACK_RESPONSE_TIME = "slack_response_time",
  SLACK_ACTIVITY = "slack_activity",
  GITHUB_COMMITS = "github_commits",
  GITHUB_CODE_QUALITY = "github_code_quality",
  GITHUB_PR_ACTIVITY = "github_pr_activity",
  CALENDAR_MEETING_DENSITY = "calendar_meeting_density",
  CALENDAR_WORK_HOURS = "calendar_work_hours",
  CALENDAR_BREAKS = "calendar_breaks",
  SLEEP_HOURS = "sleep_hours",
  SLEEP_QUALITY = "sleep_quality",
  SELF_REPORT_STRESS = "self_report_stress",
  SELF_REPORT_ENERGY = "self_report_energy",
  DECISION_LATENCY = "decision_latency",
}

export interface SignalCollectionResult {
  founderId: string;
  signals: Signal[];
  collectedAt: Date;
  summary: {
    totalSignals: number;
    highRiskSignals: number;
    averageConfidence: number;
    missingSignals: SignalType[];
  };
}

export interface SlackData {
  messages: Array<{
    text: string;
    timestamp: Date;
    responseTimeMs?: number;
  }>;
  channelActivity: Array<{
    channelId: string;
    messageCount: number;
    lastActive: Date;
  }>;
}

export interface GitHubData {
  commits: Array<{
    sha: string;
    message: string;
    timestamp: Date;
    additions: number;
    deletions: number;
    changedFiles: number;
  }>;
  pullRequests: Array<{
    number: number;
    title: string;
    createdAt: Date;
    mergedAt?: Date;
    comments: number;
  }>;
}

export interface CalendarData {
  events: Array<{
    title: string;
    start: Date;
    end: Date;
    attendees: number;
  }>;
}

export interface SleepData {
  entries: Array<{
    date: Date;
    hours: number;
    quality: number; // 0-100
  }>;
}

export interface SelfReportData {
  stress: number; // 0-100
  energy: number; // 0-100
  timestamp: Date;
}

// ============================================
// Signal Collection
// ============================================

/**
 * Collect all available signals for a founder
 */
export async function collectSignals(
  founderId: string,
  options: {
    slack?: SlackData;
    github?: GitHubData;
    calendar?: CalendarData;
    sleep?: SleepData;
    selfReport?: SelfReportData;
    lookbackDays?: number;
  }
): Promise<SignalCollectionResult> {
  logger.info('[FBEWS] Collecting signals', { founderId });

  const lookbackDays = options.lookbackDays || 30;
  const signals: Signal[] = [];

  // Slack signals
  if (options.slack) {
    signals.push(...await extractSlackSignals(options.slack, lookbackDays));
  }

  // GitHub signals
  if (options.github) {
    signals.push(...await extractGitHubSignals(options.github, lookbackDays));
  }

  // Calendar signals
  if (options.calendar) {
    signals.push(...await extractCalendarSignals(options.calendar, lookbackDays));
  }

  // Sleep signals
  if (options.sleep) {
    signals.push(...extractSleepSignals(options.sleep, lookbackDays));
  }

  // Self-report signals
  if (options.selfReport) {
    signals.push(...extractSelfReportSignals(options.selfReport));
  }

  // Calculate summary
  const highRiskSignals = signals.filter(s => s.value > 70).length;
  const averageConfidence = signals.length > 0
    ? signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length
    : 0;

  const allSignalTypes = Object.values(SignalType);
  const collectedTypes = new Set(signals.map(s => s.type));
  const missingSignals = allSignalTypes.filter(t => !collectedTypes.has(t));

  return {
    founderId,
    signals,
    collectedAt: new Date(),
    summary: {
      totalSignals: signals.length,
      highRiskSignals,
      averageConfidence: Math.round(averageConfidence),
      missingSignals,
    },
  };
}

// ============================================
// Slack Signal Extraction
// ============================================

async function extractSlackSignals(data: SlackData, lookbackDays: number): Promise<Signal[]> {
  const signals: Signal[] = [];
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - lookbackDays);

  // Filter recent messages
  const recentMessages = data.messages.filter(m => m.timestamp > cutoffDate);

  // 1. Sentiment analysis (simplified - would use real NLP in production)
  const sentimentScore = analyzeSentiment(recentMessages.map(m => m.text));
  signals.push({
    type: SignalType.SLACK_SENTIMENT,
    value: 100 - sentimentScore, // Invert: low sentiment = high risk
    raw: { messageCount: recentMessages.length, avgSentiment: sentimentScore },
    timestamp: new Date(),
    confidence: recentMessages.length > 20 ? 90 : 60,
  });

  // 2. Response time (delayed responses = exhaustion)
  const responseTimes = recentMessages
    .map(m => m.responseTimeMs)
    .filter(t => t !== undefined) as number[];
  
  if (responseTimes.length > 0) {
    const avgResponseTime = responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length;
    const normalizedResponseTime = Math.min(100, (avgResponseTime / (1000 * 60 * 60)) * 100); // Hours to 0-100
    signals.push({
      type: SignalType.SLACK_RESPONSE_TIME,
      value: normalizedResponseTime,
      raw: { avgResponseTimeMs: avgResponseTime, samples: responseTimes.length },
      timestamp: new Date(),
      confidence: responseTimes.length > 10 ? 85 : 60,
    });
  }

  // 3. Activity patterns (ghosting = withdrawal)
  const activeDays = new Set(recentMessages.map(m => m.timestamp.toDateString())).size;
  const activityRate = (activeDays / lookbackDays) * 100;
  signals.push({
    type: SignalType.SLACK_ACTIVITY,
    value: 100 - activityRate, // Invert: low activity = high risk
    raw: { activeDays, totalDays: lookbackDays, messageCount: recentMessages.length },
    timestamp: new Date(),
    confidence: 80,
  });

  return signals;
}

// ============================================
// GitHub Signal Extraction
// ============================================

async function extractGitHubSignals(data: GitHubData, lookbackDays: number): Promise<Signal[]> {
  const signals: Signal[] = [];
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - lookbackDays);

  // Filter recent commits
  const recentCommits = data.commits.filter(c => c.timestamp > cutoffDate);

  // 1. Commit frequency (declining = disengagement)
  const commitsPerDay = recentCommits.length / lookbackDays;
  const expectedCommitsPerDay = 3; // Baseline
  const commitFrequencyRisk = Math.max(0, 100 - (commitsPerDay / expectedCommitsPerDay) * 100);
  signals.push({
    type: SignalType.GITHUB_COMMITS,
    value: commitFrequencyRisk,
    raw: { commitsPerDay, totalCommits: recentCommits.length },
    timestamp: new Date(),
    confidence: recentCommits.length > 10 ? 85 : 60,
  });

  // 2. Code quality (huge commits, poor messages = exhaustion)
  const avgChangesPerCommit = recentCommits.length > 0
    ? recentCommits.reduce((sum, c) => sum + c.additions + c.deletions, 0) / recentCommits.length
    : 0;
  const poorQualityCommits = recentCommits.filter(c =>
    c.message.length < 10 || // Lazy commit messages
    (c.additions + c.deletions) > 1000 // Massive commits
  ).length;
  const qualityScore = recentCommits.length > 0
    ? (poorQualityCommits / recentCommits.length) * 100
    : 0;
  signals.push({
    type: SignalType.GITHUB_CODE_QUALITY,
    value: qualityScore,
    raw: { avgChanges: avgChangesPerCommit, poorQualityCommits, totalCommits: recentCommits.length },
    timestamp: new Date(),
    confidence: recentCommits.length > 10 ? 75 : 50,
  });

  // 3. PR activity (stalled PRs = overwhelmed)
  const recentPRs = data.pullRequests.filter(pr => pr.createdAt > cutoffDate);
  const stalledPRs = recentPRs.filter(pr =>
    !pr.mergedAt && // Still open
    (new Date().getTime() - pr.createdAt.getTime()) > (1000 * 60 * 60 * 24 * 7) // >7 days old
  ).length;
  const prActivityRisk = recentPRs.length > 0
    ? (stalledPRs / recentPRs.length) * 100
    : 0;
  signals.push({
    type: SignalType.GITHUB_PR_ACTIVITY,
    value: prActivityRisk,
    raw: { stalledPRs, totalPRs: recentPRs.length },
    timestamp: new Date(),
    confidence: recentPRs.length > 3 ? 80 : 55,
  });

  return signals;
}

// ============================================
// Calendar Signal Extraction
// ============================================

async function extractCalendarSignals(data: CalendarData, lookbackDays: number): Promise<Signal[]> {
  const signals: Signal[] = [];
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - lookbackDays);

  // Filter recent events
  const recentEvents = data.events.filter(e => e.start > cutoffDate);

  // 1. Meeting density (too many meetings = no focus time)
  const meetingsPerDay = recentEvents.length / lookbackDays;
  const meetingDensityRisk = Math.min(100, (meetingsPerDay / 8) * 100); // 8+ meetings/day = 100% risk
  signals.push({
    type: SignalType.CALENDAR_MEETING_DENSITY,
    value: meetingDensityRisk,
    raw: { meetingsPerDay, totalMeetings: recentEvents.length },
    timestamp: new Date(),
    confidence: recentEvents.length > 20 ? 85 : 65,
  });

  // 2. Work hours (extreme hours = unsustainable)
  const workDays = groupEventsByDay(recentEvents);
  const dailyWorkHours = workDays.map(day => calculateWorkHours(day.events));
  const avgWorkHours = dailyWorkHours.length > 0
    ? dailyWorkHours.reduce((sum, h) => sum + h, 0) / dailyWorkHours.length
    : 0;
  const workHoursRisk = Math.min(100, Math.max(0, (avgWorkHours - 8) / 8 * 100)); // >16 hours = 100% risk
  signals.push({
    type: SignalType.CALENDAR_WORK_HOURS,
    value: workHoursRisk,
    raw: { avgWorkHours, samples: dailyWorkHours.length },
    timestamp: new Date(),
    confidence: dailyWorkHours.length > 10 ? 80 : 60,
  });

  // 3. Breaks (no breaks = exhaustion)
  const daysWithBreaks = workDays.filter(day => hasAdequateBreaks(day.events)).length;
  const breakRate = workDays.length > 0 ? (daysWithBreaks / workDays.length) * 100 : 100;
  signals.push({
    type: SignalType.CALENDAR_BREAKS,
    value: 100 - breakRate, // Invert: no breaks = high risk
    raw: { daysWithBreaks, totalDays: workDays.length },
    timestamp: new Date(),
    confidence: workDays.length > 10 ? 75 : 55,
  });

  return signals;
}

// ============================================
// Sleep Signal Extraction
// ============================================

function extractSleepSignals(data: SleepData, lookbackDays: number): Signal[] {
  const signals: Signal[] = [];
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - lookbackDays);

  // Filter recent sleep data
  const recentSleep = data.entries.filter(e => e.date > cutoffDate);

  // 1. Sleep hours (insufficient sleep = burnout)
  const avgSleepHours = recentSleep.length > 0
    ? recentSleep.reduce((sum, e) => sum + e.hours, 0) / recentSleep.length
    : 0;
  const sleepHoursRisk = Math.max(0, 100 - (avgSleepHours / 8) * 100); // <8 hours = risk
  signals.push({
    type: SignalType.SLEEP_HOURS,
    value: sleepHoursRisk,
    raw: { avgSleepHours, samples: recentSleep.length },
    timestamp: new Date(),
    confidence: recentSleep.length > 20 ? 90 : 70,
  });

  // 2. Sleep quality (poor quality = exhaustion)
  const avgSleepQuality = recentSleep.length > 0
    ? recentSleep.reduce((sum, e) => sum + e.quality, 0) / recentSleep.length
    : 100;
  signals.push({
    type: SignalType.SLEEP_QUALITY,
    value: 100 - avgSleepQuality, // Invert: poor quality = high risk
    raw: { avgSleepQuality, samples: recentSleep.length },
    timestamp: new Date(),
    confidence: recentSleep.length > 20 ? 90 : 70,
  });

  return signals;
}

// ============================================
// Self-Report Signal Extraction
// ============================================

function extractSelfReportSignals(data: SelfReportData): Signal[] {
  const signals: Signal[] = [];

  // 1. Stress level (direct self-report)
  signals.push({
    type: SignalType.SELF_REPORT_STRESS,
    value: data.stress,
    raw: { stress: data.stress },
    timestamp: data.timestamp,
    confidence: 95, // Self-reports are highly reliable
  });

  // 2. Energy level (inverted)
  signals.push({
    type: SignalType.SELF_REPORT_ENERGY,
    value: 100 - data.energy, // Invert: low energy = high risk
    raw: { energy: data.energy },
    timestamp: data.timestamp,
    confidence: 95,
  });

  return signals;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Simplified sentiment analysis (would use real NLP in production)
 */
function analyzeSentiment(texts: string[]): number {
  if (texts.length === 0) return 50;

  const positiveWords = ['great', 'good', 'excellent', 'awesome', 'love', 'happy', 'excited', 'thanks'];
  const negativeWords = ['bad', 'terrible', 'hate', 'frustrated', 'tired', 'exhausted', 'overwhelmed', 'stressed'];

  let positiveCount = 0;
  let negativeCount = 0;

  texts.forEach(text => {
    const lowerText = text.toLowerCase();
    positiveWords.forEach(word => {
      if (lowerText.includes(word)) positiveCount++;
    });
    negativeWords.forEach(word => {
      if (lowerText.includes(word)) negativeCount++;
    });
  });

  const totalSentiments = positiveCount + negativeCount;
  if (totalSentiments === 0) return 50; // Neutral

  return (positiveCount / totalSentiments) * 100;
}

/**
 * Group events by day
 */
function groupEventsByDay(events: CalendarData['events']): Array<{ date: string; events: CalendarData['events'] }> {
  const groups = new Map<string, CalendarData['events']>();
  
  events.forEach(event => {
    const dateKey = event.start.toDateString();
    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey)!.push(event);
  });

  return Array.from(groups.entries()).map(([date, events]) => ({ date, events }));
}

/**
 * Calculate work hours for a day
 */
function calculateWorkHours(events: CalendarData['events']): number {
  if (events.length === 0) return 0;

  // Sort events by start time
  const sorted = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());
  
  // Calculate span from first to last event
  const firstStart = sorted[0].start;
  const lastEnd = sorted[sorted.length - 1].end;
  
  const hours = (lastEnd.getTime() - firstStart.getTime()) / (1000 * 60 * 60);
  return Math.max(0, hours);
}

/**
 * Check if day has adequate breaks
 */
function hasAdequateBreaks(events: CalendarData['events']): boolean {
  if (events.length <= 1) return true;

  // Sort events by start time
  const sorted = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());
  
  // Check for breaks between events
  for (let i = 0; i < sorted.length - 1; i++) {
    const currentEnd = sorted[i].end;
    const nextStart = sorted[i + 1].start;
    const breakMinutes = (nextStart.getTime() - currentEnd.getTime()) / (1000 * 60);
    
    if (breakMinutes >= 30) return true; // At least one 30-min break
  }

  return false;
}
