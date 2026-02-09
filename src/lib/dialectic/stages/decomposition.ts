/**
 * DIALECTIC - Stage 1: Question Decomposition
 * 
 * Decomposes 4 root investment questions into hierarchical question trees.
 * Each tree explores one aspect (general company, market, product, team).
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  PipelineState,
  Question,
  QuestionTree,
  InvestmentAspect,
} from '../types';
import { INVESTMENT_ASPECTS, ROOT_QUESTIONS } from '../types';
import { callLLM } from '../llm-client';
import { logger } from '@/lib/logger';

interface DecompositionOutput {
  subQuestions: Array<{
    question: string;
    type: 'fundamental' | 'detailed' | 'exploratory';
  }>;
}

/**
 * Decompose a single question into sub-questions
 */
async function decomposeQuestion(
  question: string,
  aspect: InvestmentAspect,
  company: string,
  depth: number,
  maxDepth: number = 2
): Promise<Question[]> {
  if (depth >= maxDepth) {
    return [];
  }

  const prompt = `You are a venture capital analyst evaluating "${company}".

Decompose this investment question into 2-3 more specific sub-questions:
"${question}"

Focus on the ${aspect} aspect. Generate questions that are:
1. Specific and answerable with research
2. Cover different angles (fundamental, detailed, exploratory)
3. Help build a comprehensive investment thesis

Return ONLY a JSON object with this structure:
{
  "subQuestions": [
    {"question": "...", "type": "fundamental"},
    {"question": "...", "type": "detailed"},
    {"question": "...", "type": "exploratory"}
  ]
}`;

  try {
    const response = await callLLM(prompt, {
      temperature: 0.7,
      maxTokens: 500,
      responseFormat: 'json',
    });

    const parsed: DecompositionOutput = JSON.parse(response);
    
    return parsed.subQuestions.map(sq => ({
      id: uuidv4(),
      question: sq.question,
      type: sq.type,
      childIds: [],
    }));

  } catch (error) {
    logger.error('Decomposition failed', {
      question,
      aspect,
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}

/**
 * Build a complete question tree for one aspect
 */
async function buildQuestionTree(
  aspect: InvestmentAspect,
  company: string
): Promise<QuestionTree> {
  const rootQuestion: Question = {
    id: uuidv4(),
    question: ROOT_QUESTIONS[aspect],
    type: 'fundamental',
    childIds: [],
  };

  const allQuestions = new Map<string, Question>();
  allQuestions.set(rootQuestion.id, rootQuestion);

  const queue: Array<{ question: Question; depth: number }> = [
    { question: rootQuestion, depth: 0 },
  ];

  // Breadth-first decomposition
  while (queue.length > 0) {
    const { question, depth } = queue.shift()!;

    if (depth >= 2) continue; // Max depth 2 (root → level 1 → level 2)

    const subQuestions = await decomposeQuestion(
      question.question,
      aspect,
      company,
      depth
    );

    for (const subQ of subQuestions) {
      subQ.parentId = question.id;
      question.childIds.push(subQ.id);
      allQuestions.set(subQ.id, subQ);
      queue.push({ question: subQ, depth: depth + 1 });
    }
  }

  return {
    aspect,
    rootQuestion,
    allQuestions,
    totalQuestions: allQuestions.size,
  };
}

/**
 * Decompose all 4 investment aspects in parallel
 */
export async function decomposeAllQuestions(
  state: PipelineState
): Promise<PipelineState> {
  const trees = await Promise.all(
    INVESTMENT_ASPECTS.map(aspect =>
      buildQuestionTree(aspect, state.company.name)
    )
  );

  const questionTrees = new Map<string, QuestionTree>();
  trees.forEach(tree => {
    questionTrees.set(tree.aspect, tree);
  });

  return {
    ...state,
    questionTrees,
  };
}
