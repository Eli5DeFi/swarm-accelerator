/**
 * DIALECTIC - TypeScript Types
 * 
 * Adapted from: https://github.com/pantageepapa/DIALECTIC
 * Academic paper: EACL 2026 Industry Track
 * 
 * Type definitions for the LLM-based multi-agent startup evaluation system.
 */

export interface Company {
  name: string;
  industry: string;
  description: string;
  stage: 'pre-seed' | 'seed' | 'series-a' | 'series-b+';
  founder?: string;
  website?: string;
  metadata?: Record<string, unknown>;
}

export interface Config {
  /** Number of pro arguments to generate per iteration */
  nProArguments: number;
  /** Number of contra arguments to generate per iteration */
  nContraArguments: number;
  /** Number of best arguments to select per iteration (e.g., [3, 1] = 3 in iter 1, 1 in iter 2) */
  kBestArgumentsPerIteration: number[];
  /** Maximum refinement iterations */
  maxIterations: number;
  /** Model to use for LLM calls */
  model?: string;
  /** Temperature for generation tasks */
  temperature?: number;
  /** Whether to enable caching */
  enableCache?: boolean;
}

export type ArgumentType = 'pro' | 'contra';

export interface Argument {
  /** Unique identifier */
  id: string;
  /** Tracking ID for lineage (survives refinement) */
  trackingId: string;
  /** Type: pro or contra */
  argumentType: ArgumentType;
  /** Original argument content */
  content: string;
  /** Devil's advocate critique */
  critique?: string;
  /** Refined argument content (after addressing critique) */
  refinedContent?: string;
  /** Numeric score (0-100, sum of 14 criteria) */
  score?: number;
  /** Detailed feedback per criterion */
  argumentFeedback?: CriterionScore[];
  /** Source question IDs that contributed to this argument */
  sourceQuestions?: string[];
  /** Metadata */
  metadata?: Record<string, unknown>;
}

export interface CriterionScore {
  criterion: string;
  score: number;
  reasoning?: string;
}

export interface Question {
  /** Unique identifier */
  id: string;
  /** Question text */
  question: string;
  /** Answer text (populated after answering stage) */
  answer?: string;
  /** Question type: fundamental, detailed, exploratory */
  type: 'fundamental' | 'detailed' | 'exploratory';
  /** Parent question ID (null for root) */
  parentId?: string;
  /** Child question IDs */
  childIds: string[];
  /** Metadata */
  metadata?: Record<string, unknown>;
}

export interface QuestionTree {
  /** Investment aspect (general_company, market, product, team) */
  aspect: string;
  /** Root question */
  rootQuestion: Question;
  /** All questions in the tree (flat for easy access) */
  allQuestions: Map<string, Question>;
  /** Total questions in tree */
  totalQuestions: number;
}

export interface QAPair {
  question: string;
  answer: string;
  aspect: string;
  questionId: string;
}

export interface IterationData {
  iteration: number;
  selectedArguments: Argument[];
  refinedProArguments: Argument[];
  refinedContraArguments: Argument[];
}

export interface PipelineState {
  /** Company being analyzed */
  company: Company;
  /** Pipeline configuration */
  config: Config;
  
  /** Question trees (one per aspect) */
  questionTrees: Map<string, QuestionTree>;
  /** Combined Q&A pairs from all trees */
  allQAPairs: QAPair[];
  
  /** Current iteration number */
  currentIteration: number;
  /** Arguments in current iteration */
  currentArguments: Argument[];
  /** Arguments after refinement */
  refinedArguments: Argument[];
  /** Selected top-K arguments */
  selectedArguments: Argument[];
  
  /** Per-type argument tracking */
  proArguments: Argument[];
  contraArguments: Argument[];
  devilsAdvocateProArguments: Argument[];
  devilsAdvocateContraArguments: Argument[];
  refinedProArguments: Argument[];
  refinedContraArguments: Argument[];
  
  /** Iteration history */
  argumentsHistory: IterationData[];
  
  /** Final outputs */
  finalArguments: Argument[];
  finalDecision?: 'invest' | 'not_invest';
  finalScore?: number;
  
  /** Metadata */
  metadata?: Record<string, unknown>;
}

/**
 * 14 evaluation criteria from the DIALECTIC paper
 * Each scored 0-10, total score 0-140
 */
export const EVALUATION_CRITERIA = [
  'local_acceptability',
  'local_relevance',
  'local_sufficiency',
  'global_acceptability',
  'global_relevance',
  'global_sufficiency',
  'cogency',
  'credibility',
  'clarity',
  'reasonableness',
  'effectiveness',
  'overall_quality',
  'persuasiveness',
  'coherence',
] as const;

export type EvaluationCriterion = typeof EVALUATION_CRITERIA[number];

/**
 * Investment aspects (4 core questions from DIALECTIC)
 */
export const INVESTMENT_ASPECTS = [
  'general_company',
  'market',
  'product',
  'team',
] as const;

export type InvestmentAspect = typeof INVESTMENT_ASPECTS[number];

/**
 * Root questions for each aspect (from DIALECTIC paper)
 */
export const ROOT_QUESTIONS: Record<InvestmentAspect, string> = {
  general_company: 'Should we invest in this company?',
  market: 'Is the market opportunity attractive?',
  product: 'Is the product innovative and defensible?',
  team: 'Does the team have what it takes to succeed?',
};
