/**
 * DIALECTIC - Stage 3b: Devil's Advocate Critique
 * 
 * Applies adversarial critique to each argument to expose weaknesses.
 */

import type { PipelineState, Argument } from '../types';
import { callLLM } from '../llm-client';
import { logger } from '@/lib/logger';

/**
 * Apply devil's advocate critique to a single argument
 */
async function critiqueArgument(argument: Argument): Promise<Argument> {
  const opposingView = argument.argumentType === 'pro'
    ? 'challenges and weaknesses'
    : 'counterarguments and alternative perspectives';

  const prompt = `You are a critical analyst playing devil's advocate.

Argument (${argument.argumentType.toUpperCase()}):
"${argument.content}"

Your task: Identify ${opposingView} in this argument. Be specific:
1. What assumptions might be wrong?
2. What evidence is missing or weak?
3. What alternative interpretations exist?
4. What risks or challenges are overlooked?

Provide a concise but thorough critique (2-3 sentences).

Critique:`;

  try {
    const critique = await callLLM(prompt, {
      temperature: 0.7,
      maxTokens: 200,
    });

    return {
      ...argument,
      critique: critique.trim(),
    };

  } catch (error) {
    logger.error('Argument critique failed', {
      argumentId: argument.id,
      error: error instanceof Error ? error.message : String(error),
    });
    
    return argument; // Return unchanged on error
  }
}

/**
 * Critique all arguments in parallel
 */
async function critiqueArguments(args: Argument[]): Promise<Argument[]> {
  const batchSize = 5;
  const critiqued: Argument[] = [];

  for (let i = 0; i < args.length; i += batchSize) {
    const batch = args.slice(i, i + batchSize);
    const critiquedBatch = await Promise.all(
      batch.map(arg => critiqueArgument(arg))
    );
    critiqued.push(...critiquedBatch);
  }

  return critiqued;
}

/**
 * Apply devil's advocate to pro and contra arguments
 */
export async function applyDevilsAdvocate(
  state: PipelineState
): Promise<PipelineState> {
  const [devilsAdvocateProArguments, devilsAdvocateContraArguments] = await Promise.all([
    critiqueArguments(state.proArguments),
    critiqueArguments(state.contraArguments),
  ]);

  return {
    ...state,
    devilsAdvocateProArguments,
    devilsAdvocateContraArguments,
  };
}
