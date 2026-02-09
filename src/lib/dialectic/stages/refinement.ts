/**
 * DIALECTIC - Stage 4: Argument Refinement
 * 
 * Refines arguments based on devil's advocate critiques.
 * Addresses weaknesses while maintaining core message.
 */

import type { PipelineState, Argument } from '../types';
import { callLLM } from '../llm-client';
import { logger } from '@/lib/logger';

/**
 * Refine a single argument based on critique
 */
async function refineArgument(argument: Argument): Promise<Argument> {
  if (!argument.critique) {
    // No critique = no refinement needed
    return {
      ...argument,
      refinedContent: argument.content,
    };
  }

  const prompt = `You are refining an investment argument to address critiques.

Original Argument (${argument.argumentType.toUpperCase()}):
"${argument.content}"

Critique:
"${argument.critique}"

Your task: Refine the argument to address the critique while maintaining its core message. The refined argument should:
1. Acknowledge valid points from the critique
2. Provide additional evidence or nuance
3. Address assumptions or gaps identified
4. Remain concise and persuasive

Refined Argument:`;

  try {
    const refinedContent = await callLLM(prompt, {
      temperature: 0.7,
      maxTokens: 300,
    });

    return {
      ...argument,
      refinedContent: refinedContent.trim(),
    };

  } catch (error) {
    logger.error('Argument refinement failed', {
      argumentId: argument.id,
      error: error instanceof Error ? error.message : String(error),
    });
    
    // Return with original content on error
    return {
      ...argument,
      refinedContent: argument.content,
    };
  }
}

/**
 * Refine all arguments in parallel
 */
async function refineArgumentsBatch(args: Argument[]): Promise<Argument[]> {
  const batchSize = 5;
  const refined: Argument[] = [];

  for (let i = 0; i < args.length; i += batchSize) {
    const batch = args.slice(i, i + batchSize);
    const refinedBatch = await Promise.all(
      batch.map(arg => refineArgument(arg))
    );
    refined.push(...refinedBatch);
  }

  return refined;
}

/**
 * Refine pro and contra arguments separately
 */
export async function refineArguments(
  state: PipelineState
): Promise<PipelineState> {
  const proToRefine = state.selectedArguments.filter(
    arg => arg.argumentType === 'pro'
  );
  const contraToRefine = state.selectedArguments.filter(
    arg => arg.argumentType === 'contra'
  );

  const [refinedProArguments, refinedContraArguments] = await Promise.all([
    refineArgumentsBatch(proToRefine),
    refineArgumentsBatch(contraToRefine),
  ]);

  return {
    ...state,
    refinedProArguments,
    refinedContraArguments,
  };
}
