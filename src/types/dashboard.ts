/**
 * Type definitions for Dashboard
 */

/**
 * User type for dashboard
 */
export interface DashboardUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  tier?: string;
}

/**
 * Funding information
 */
export interface Funding {
  id: string;
  dealAmount: number;
  equityPercent: number;
  dealType: string;
  status: string;
  totalReleased: number;
  acceptedAt: Date;
  milestones?: Milestone[];
}

/**
 * Milestone information
 */
export interface Milestone {
  id: string;
  number: number;
  description: string;
  amount: number;
  dueDate: Date;
  status: 'pending' | 'completed' | 'verified' | 'failed';
  completedAt?: Date | null;
  verifiedAt?: Date | null;
  txHash?: string | null;
}

/**
 * Pitch/Startup information
 */
export interface Pitch {
  id: string;
  name: string;
  tagline: string;
  industry: string;
  stage: 'IDEA' | 'MVP' | 'GROWTH' | 'SCALE';
  fundingAsk: number;
  status: 'PENDING' | 'ANALYZING' | 'APPROVED' | 'REJECTED' | 'CONDITIONAL' | 'FUNDED';
  createdAt: Date;
  funding?: Funding | null;
}

/**
 * Analysis feedback structure
 */
export interface AgentFeedback {
  score: number;
  reasoning: string;
  strengths?: string[];
  concerns?: string[];
  recommendations?: string[];
}

/**
 * Complete pitch analysis
 */
export interface PitchAnalysis {
  id: string;
  startupId: string;
  overallScore: number;
  recommendation: 'APPROVE' | 'REJECT' | 'CONDITIONAL';
  financialFeedback: AgentFeedback;
  technicalFeedback: AgentFeedback;
  marketFeedback: AgentFeedback;
  legalFeedback: AgentFeedback;
  completedAt: Date;
}
