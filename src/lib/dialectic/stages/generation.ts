/**
 * DIALECTIC - Stage 3: Argument Generation
 * 
 * Generates pro and contra investment arguments from Q&A pairs.
 */

import { v4 as uuidv4 } from 'uuid';
import type { PipelineState, Argument, QAPair } from '../types';
import { callLLM } from '../llm-client';
import { logger } from '@/lib/logger';

interface GenerationOutput {
  arguments: Array<{
    content: string;
    sourceQuestions: string[];
  }>;
}

/**
 * Generate pro arguments for investment
 */
async function generateProArguments(
  qaPairs: QAPair[],
  company: string,
  count: number
): Promise<Argument[]> {
  const qaText = qaPairs
    .map((qa, idx) => `${idx + 1}. Q: ${qa.question}\n   A: ${qa.answer}`)
    .join('\n\n');

  const prompt = `You are a venture capital analyst building a case FOR investing in "${company}".

Based on these facts from research:
${qaText}

Generate ${count} strong PRO investment arguments. Each argument should:
1. Be specific and evidence-based (cite facts from the Q&A)
2. Focus on growth potential, competitive advantages, or market opportunity
3. Be persuasive and well-structured
4. Identify which questions support the argument

Return ONLY a JSON object:
{
  "arguments": [
    {
      "content": "Clear, persuasive argument...",
      "sourceQuestions": ["1", "3", "5"]
    }
  ]
}`;

  try {
    const response = await callLLM(prompt, {
      temperature: 0.8,
      maxTokens: 1500,
      responseFormat: 'json',
    });

    const parsed: GenerationOutput = JSON.parse(response);

    return parsed.arguments.map(arg => ({
      id: uuidv4(),
      trackingId: uuidv4(),
      argumentType: 'pro' as const,
      content: arg.content,
      sourceQuestions: arg.sourceQuestions,
    }));

  } catch (error) {
    logger.error('Pro argument generation failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}

/**
 * Generate contra arguments against investment
 */
async function generateContraArguments(
  qaPairs: QAPair[],
  company: string,
  count: number
): Promise<Argument[]> {
  const qaText = qaPairs
    .map((qa, idx) => `${idx + 1}. Q: ${qa.question}\n   A: ${qa.answer}`)
    .join('\n\n');

  const prompt = `You are a venture capital analyst identifying risks and reasons NOT to invest in "${company}".

Based on these facts from research:
${qaText}

Generate ${count} strong CONTRA investment arguments. Each argument should:
1. Be specific and evidence-based (cite facts from the Q&A)
2. Focus on risks, challenges, or competitive threats
3. Be balanced and well-reasoned (not overly negative)
4. Identify which questions support the argument

Return ONLY a JSON object:
{
  "arguments": [
    {
      "content": "Well-reasoned risk or concern...",
      "sourceQuestions": ["2", "4", "6"]
    }
  ]
}`;

  try {
    const response = await callLLM(prompt, {
      temperature: 0.8,
      maxTokens: 1500,
      responseFormat: 'json',
    });

    const parsed: GenerationOutput = JSON.parse(response);

    return parsed.arguments.map(arg => ({
      id: uuidv4(),
      trackingId: uuidv4(),
      argumentType: 'contra' as const,
      content: arg.content,
      sourceQuestions: arg.sourceQuestions,
    }));

  } catch (error) {
    logger.error('Contra argument generation failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}

/**
 * Generate both pro and contra arguments in parallel
 */
export async function generateProAndContraArguments(
  state: PipelineState
): Promise<PipelineState> {
  const [proArguments, contraArguments] = await Promise.all([
    generateProArguments(
      state.allQAPairs,
      state.company.name,
      state.config.nProArguments
    ),
    generateContraArguments(
      state.allQAPairs,
      state.company.name,
      state.config.nContraArguments
    ),
  ]);

  return {
    ...state,
    proArguments,
    contraArguments,
  };
}
