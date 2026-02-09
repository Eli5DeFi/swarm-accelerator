/**
 * DIALECTIC - Stage 3c: Argument Evaluation
 * 
 * Scores arguments on 14 quality criteria (0-10 each, total 0-140).
 * Selects top K arguments for refinement.
 */

import type { PipelineState, Argument, CriterionScore } from '../types';
import { EVALUATION_CRITERIA } from '../types';
import { callLLM } from '../llm-client';
import { logger } from '@/lib/logger';

interface EvaluationOutput {
  scores: Array<{
    criterion: string;
    score: number;
    reasoning: string;
  }>;
}

/**
 * Score a single argument on all 14 criteria
 */
async function scoreArgument(argument: Argument): Promise<Argument> {
  const criteriaList = EVALUATION_CRITERIA.join(', ');
  const critiqueText = argument.critique
    ? `\nCritique: ${argument.critique}`
    : '';

  const prompt = `You are evaluating an investment argument for quality.

Argument (${argument.argumentType.toUpperCase()}):
"${argument.content}"${critiqueText}

Score this argument on each criterion (0-10 scale):

Criteria:
1. local_acceptability - Argument is logically sound and acceptable
2. local_relevance - Argument is relevant to the specific point
3. local_sufficiency - Argument provides sufficient support for its claim
4. global_acceptability - Argument fits within broader investment thesis
5. global_relevance - Argument is relevant to overall investment decision
6. global_sufficiency - Argument contributes meaningfully to final decision
7. cogency - Argument is logically coherent and well-reasoned
8. credibility - Argument is believable and trustworthy
9. clarity - Argument is clear and easy to understand
10. reasonableness - Argument makes common sense
11. effectiveness - Argument is persuasive and impactful
12. overall_quality - Overall argument quality
13. persuasiveness - Argument is convincing
14. coherence - Argument is internally consistent

Return ONLY a JSON object:
{
  "scores": [
    {"criterion": "local_acceptability", "score": 8, "reasoning": "..."},
    {"criterion": "local_relevance", "score": 7, "reasoning": "..."},
    ...
  ]
}

Provide exactly ${EVALUATION_CRITERIA.length} scores.`;

  try {
    const response = await callLLM(prompt, {
      temperature: 0.0, // Deterministic scoring
      maxTokens: 2000,
      responseFormat: 'json',
    });

    const parsed: EvaluationOutput = JSON.parse(response);

    if (parsed.scores.length !== EVALUATION_CRITERIA.length) {
      throw new Error(`Expected ${EVALUATION_CRITERIA.length} scores, got ${parsed.scores.length}`);
    }

    const totalScore = parsed.scores.reduce((sum, s) => sum + s.score, 0);
    const feedback: CriterionScore[] = parsed.scores.map(s => ({
      criterion: s.criterion,
      score: s.score,
      reasoning: s.reasoning,
    }));

    return {
      ...argument,
      score: totalScore,
      argumentFeedback: feedback,
    };

  } catch (error) {
    logger.error('Argument scoring failed', {
      argumentId: argument.id,
      error: error instanceof Error ? error.message : String(error),
    });
    
    // Return with default score on error
    return {
      ...argument,
      score: 70, // Default middle score
    };
  }
}

/**
 * Score all arguments in parallel
 */
async function scoreArguments(args: Argument[]): Promise<Argument[]> {
  const batchSize = 3; // Conservative batch size (scoring is token-heavy)
  const scored: Argument[] = [];

  for (let i = 0; i < args.length; i += batchSize) {
    const batch = args.slice(i, i + batchSize);
    const scoredBatch = await Promise.all(
      batch.map(arg => scoreArgument(arg))
    );
    scored.push(...scoredBatch);
  }

  return scored;
}

/**
 * Select top K arguments based on score
 */
function selectBestK(args: Argument[], k: number): Argument[] {
  return args
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, k);
}

/**
 * Score and select best K arguments for refinement
 */
export async function scoreAndSelectBestK(
  state: PipelineState
): Promise<PipelineState> {
  // Score all arguments
  const allArguments = [
    ...state.devilsAdvocateProArguments,
    ...state.devilsAdvocateContraArguments,
  ];

  const scoredArguments = await scoreArguments(allArguments);

  // Select top K based on current iteration
  const k = state.config.kBestArgumentsPerIteration[state.currentIteration] || 1;
  const selectedArguments = selectBestK(scoredArguments, k);

  logger.info('Arguments scored and selected', {
    totalArguments: scoredArguments.length,
    selectedCount: selectedArguments.length,
    avgScore: (scoredArguments.reduce((sum, arg) => sum + (arg.score || 0), 0) / scoredArguments.length).toFixed(1),
    topScore: selectedArguments[0]?.score?.toFixed(1) || 'N/A',
  });

  return {
    ...state,
    selectedArguments,
  };
}
