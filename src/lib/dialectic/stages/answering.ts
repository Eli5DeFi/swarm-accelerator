/**
 * DIALECTIC - Stage 2: Question Answering
 * 
 * Answers all questions in the question trees using web search.
 * Replaces Perplexity API with OpenClaw's web_search tool.
 */

import type { PipelineState, Question, QAPair } from '../types';
import { callLLM } from '../llm-client';
import { logger } from '@/lib/logger';

/**
 * Search the web for information (replace this with actual web_search tool)
 */
async function searchWeb(query: string): Promise<string> {
  // TODO: Replace with actual web_search tool call
  // For now, mock implementation
  try {
    // In production, this would be:
    // const results = await webSearch({ query, count: 5 });
    // return results.map(r => `${r.title}: ${r.snippet}`).join('\n\n');
    
    return `[Web search results for: "${query}"]
This is a mock response. In production, this will use OpenClaw's web_search tool to gather real-time information from the web.`;
  } catch (error) {
    logger.error('Web search failed', {
      query,
      error: error instanceof Error ? error.message : String(error),
    });
    return 'No information found.';
  }
}

/**
 * Answer a single question using web search + LLM synthesis
 */
async function answerQuestion(
  question: Question,
  company: string,
  aspect: string
): Promise<Question> {
  // Search for information
  const searchQuery = `${question.question} ${company} startup`;
  const searchResults = await searchWeb(searchQuery);

  // Synthesize answer from search results
  const prompt = `You are analyzing "${company}" for venture capital investment.

Question: ${question.question}
Aspect: ${aspect}

Web search results:
${searchResults}

Based on these search results, provide a concise, factual answer to the question. Focus on specific data points, metrics, and evidence. If information is not available, say so.

Answer:`;

  try {
    const answer = await callLLM(prompt, {
      temperature: 0.3,
      maxTokens: 300,
    });

    return {
      ...question,
      answer: answer.trim(),
    };

  } catch (error) {
    logger.error('Question answering failed', {
      question: question.question,
      error: error instanceof Error ? error.message : String(error),
    });
    
    return {
      ...question,
      answer: 'Unable to find reliable information.',
    };
  }
}

/**
 * Answer all questions in a tree (breadth-first)
 */
async function answerQuestionTree(
  tree: { aspect: string; allQuestions: Map<string, Question> },
  company: string
): Promise<Map<string, Question>> {
  const answeredQuestions = new Map<string, Question>();

  // Answer all questions in parallel (with rate limiting in production)
  const questions = Array.from(tree.allQuestions.values());
  const batchSize = 5; // Process 5 at a time to avoid rate limits

  for (let i = 0; i < questions.length; i += batchSize) {
    const batch = questions.slice(i, i + batchSize);
    const answeredBatch = await Promise.all(
      batch.map(q => answerQuestion(q, company, tree.aspect))
    );
    
    answeredBatch.forEach(q => {
      answeredQuestions.set(q.id, q);
    });
  }

  return answeredQuestions;
}

/**
 * Answer all question trees and extract Q&A pairs
 */
export async function answerAllTrees(
  state: PipelineState
): Promise<PipelineState> {
  const answeredTrees = new Map();
  const allQAPairs: QAPair[] = [];

  // Answer each tree
  for (const [aspect, tree] of state.questionTrees.entries()) {
    const answeredQuestions = await answerQuestionTree(tree, state.company.name);
    
    answeredTrees.set(aspect, {
      ...tree,
      allQuestions: answeredQuestions,
    });

    // Extract Q&A pairs
    for (const [id, question] of answeredQuestions.entries()) {
      if (question.answer && question.answer !== 'Unable to find reliable information.') {
        allQAPairs.push({
          question: question.question,
          answer: question.answer,
          aspect,
          questionId: id,
        });
      }
    }
  }

  return {
    ...state,
    questionTrees: answeredTrees,
    allQAPairs,
  };
}
