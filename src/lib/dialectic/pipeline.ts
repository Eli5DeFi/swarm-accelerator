/**
 * DIALECTIC - Main Pipeline
 * 
 * Orchestrates the 4-stage LLM-based startup evaluation:
 * 1. Decompose questions into hierarchical trees
 * 2. Answer all questions with web search
 * 3. Generate pro/contra arguments
 * 4. Critique, score, refine iteratively
 * 
 * Adapted from: https://github.com/pantageepapa/DIALECTIC
 */

import { logger } from '@/lib/logger';
import type {
  Company,
  Config,
  PipelineState,
  Argument,
  InvestmentAspect,
} from './types';
import { INVESTMENT_ASPECTS } from './types';
import { decomposeAllQuestions } from './stages/decomposition';
import { answerAllTrees } from './stages/answering';
import { generateProAndContraArguments } from './stages/generation';
import { applyDevilsAdvocate } from './stages/critique';
import { scoreAndSelectBestK } from './stages/evaluation';
import { refineArguments } from './stages/refinement';

/**
 * Main DIALECTIC pipeline
 * 
 * @param company - Company to evaluate
 * @param config - Pipeline configuration
 * @returns Final evaluation with arguments, score, and decision
 */
export async function runDialecticPipeline(
  company: Company,
  config: Partial<Config> = {}
): Promise<PipelineState> {
  const startTime = Date.now();
  
  // Initialize state with defaults
  const state: PipelineState = {
    company,
    config: {
      nProArguments: config.nProArguments ?? 3,
      nContraArguments: config.nContraArguments ?? 3,
      kBestArgumentsPerIteration: config.kBestArgumentsPerIteration ?? [3, 1],
      maxIterations: config.maxIterations ?? 2,
      model: config.model ?? 'anthropic/claude-sonnet-4',
      temperature: config.temperature ?? 0.7,
      enableCache: config.enableCache ?? true,
    },
    questionTrees: new Map(),
    allQAPairs: [],
    currentIteration: 0,
    currentArguments: [],
    refinedArguments: [],
    selectedArguments: [],
    proArguments: [],
    contraArguments: [],
    devilsAdvocateProArguments: [],
    devilsAdvocateContraArguments: [],
    refinedProArguments: [],
    refinedContraArguments: [],
    argumentsHistory: [],
    finalArguments: [],
  };

  logger.info('🔬 DIALECTIC Pipeline Started', {
    company: company.name,
    industry: company.industry,
    maxIterations: state.config.maxIterations,
  });

  try {
    // === STAGE 1: Decompose Questions ===
    logger.info('📋 Stage 1/4: Decomposing questions...');
    const decomposedState = await decomposeAllQuestions(state);
    state.questionTrees = decomposedState.questionTrees;
    
    const totalQuestions = Array.from(state.questionTrees.values())
      .reduce((sum, tree) => sum + tree.totalQuestions, 0);
    logger.info(`✅ Decomposition complete: ${totalQuestions} questions across ${state.questionTrees.size} aspects`);

    // === STAGE 2: Answer Questions ===
    logger.info('🔍 Stage 2/4: Answering questions with web search...');
    const answeredState = await answerAllTrees(decomposedState);
    state.allQAPairs = answeredState.allQAPairs;
    logger.info(`✅ Answering complete: ${state.allQAPairs.length} Q&A pairs`);

    // === STAGE 3-4: Iterative Argument Refinement ===
    for (let iteration = 0; iteration < state.config.maxIterations; iteration++) {
      state.currentIteration = iteration;
      logger.info(`🔄 Iteration ${iteration + 1}/${state.config.maxIterations}`);

      // Stage 3a: Generate arguments
      logger.info('💡 Stage 3/4: Generating pro/contra arguments...');
      const generatedState = await generateProAndContraArguments(state);
      state.proArguments = generatedState.proArguments;
      state.contraArguments = generatedState.contraArguments;
      state.currentArguments = [
        ...state.proArguments,
        ...state.contraArguments,
      ];
      logger.info(`✅ Generated ${state.proArguments.length} pro, ${state.contraArguments.length} contra arguments`);

      // Stage 3b: Apply devil's advocate critique
      logger.info('👿 Stage 3b: Applying devil\'s advocate critiques...');
      const critiquedState = await applyDevilsAdvocate(state);
      state.devilsAdvocateProArguments = critiquedState.devilsAdvocateProArguments;
      state.devilsAdvocateContraArguments = critiquedState.devilsAdvocateContraArguments;
      state.currentArguments = [
        ...state.devilsAdvocateProArguments,
        ...state.devilsAdvocateContraArguments,
      ];
      logger.info('✅ Critiques applied');

      // Stage 3c: Score and select best K
      logger.info('⭐ Stage 3c: Scoring arguments...');
      const scoredState = await scoreAndSelectBestK(state);
      state.selectedArguments = scoredState.selectedArguments;
      const avgScore = state.selectedArguments.reduce((sum, arg) => sum + (arg.score || 0), 0) / state.selectedArguments.length;
      logger.info(`✅ Selected ${state.selectedArguments.length} best arguments (avg score: ${avgScore.toFixed(1)})`);

      // Stage 4: Refine arguments
      logger.info('✨ Stage 4/4: Refining arguments...');
      const refinedState = await refineArguments(state);
      state.refinedProArguments = refinedState.refinedProArguments;
      state.refinedContraArguments = refinedState.refinedContraArguments;
      state.refinedArguments = [
        ...state.refinedProArguments,
        ...state.refinedContraArguments,
      ];
      logger.info('✅ Arguments refined');

      // Save iteration history
      state.argumentsHistory.push({
        iteration: iteration + 1,
        selectedArguments: state.selectedArguments,
        refinedProArguments: state.refinedProArguments,
        refinedContraArguments: state.refinedContraArguments,
      });
    }

    // === FINAL DECISION ===
    logger.info('🎯 Preparing final decision...');
    state.finalArguments = state.refinedArguments;
    
    // Calculate final score (average of all final argument scores)
    const scores = state.finalArguments
      .map(arg => arg.score || 0)
      .filter(score => score > 0);
    state.finalScore = scores.length > 0
      ? scores.reduce((sum, score) => sum + score, 0) / scores.length
      : 0;

    // Decision logic: invest if avg score > 70/140 (50%)
    const proScore = state.finalArguments
      .filter(arg => arg.argumentType === 'pro')
      .reduce((sum, arg) => sum + (arg.score || 0), 0);
    const contraScore = state.finalArguments
      .filter(arg => arg.argumentType === 'contra')
      .reduce((sum, arg) => sum + (arg.score || 0), 0);

    state.finalDecision = proScore > contraScore ? 'invest' : 'not_invest';

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    logger.info('✅ DIALECTIC Pipeline Complete', {
      company: company.name,
      finalScore: state.finalScore.toFixed(1),
      decision: state.finalDecision,
      proScore: proScore.toFixed(1),
      contraScore: contraScore.toFixed(1),
      arguments: state.finalArguments.length,
      duration: `${duration}s`,
    });

    return state;

  } catch (error) {
    logger.error('❌ DIALECTIC Pipeline Failed', {
      company: company.name,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Quick evaluation (single iteration, faster)
 */
export async function quickEvaluate(company: Company): Promise<PipelineState> {
  return runDialecticPipeline(company, {
    nProArguments: 2,
    nContraArguments: 2,
    kBestArgumentsPerIteration: [2],
    maxIterations: 1,
  });
}

/**
 * Deep evaluation (multiple iterations, higher quality)
 */
export async function deepEvaluate(company: Company): Promise<PipelineState> {
  return runDialecticPipeline(company, {
    nProArguments: 5,
    nContraArguments: 5,
    kBestArgumentsPerIteration: [5, 3, 1],
    maxIterations: 3,
  });
}

/**
 * Format results for display
 */
export function formatResults(state: PipelineState): string {
  const lines: string[] = [];
  
  lines.push('=== DIALECTIC EVALUATION ===');
  lines.push(`Company: ${state.company.name}`);
  lines.push(`Industry: ${state.company.industry}`);
  lines.push(`Final Score: ${state.finalScore?.toFixed(1) || 'N/A'}/140`);
  lines.push(`Decision: ${state.finalDecision?.toUpperCase() || 'N/A'}`);
  lines.push('');

  lines.push('=== FINAL ARGUMENTS ===');
  state.finalArguments.forEach((arg, idx) => {
    const content = arg.refinedContent || arg.content;
    lines.push(`\n${idx + 1}. ${arg.argumentType.toUpperCase()} (Score: ${arg.score?.toFixed(1) || 'N/A'})`);
    lines.push(`   ${content}`);
    if (arg.critique) {
      lines.push(`   Critique: ${arg.critique}`);
    }
  });

  lines.push('');
  lines.push('=== ITERATION HISTORY ===');
  state.argumentsHistory.forEach((iter, idx) => {
    lines.push(`\nIteration ${idx + 1}:`);
    iter.selectedArguments.forEach(arg => {
      lines.push(`  - ${arg.argumentType}: ${arg.content.substring(0, 80)}... (${arg.score?.toFixed(1)})`);
    });
  });

  return lines.join('\n');
}
