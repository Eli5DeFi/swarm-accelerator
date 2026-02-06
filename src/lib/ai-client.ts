/**
 * AI Client with Intelligent Provider Routing
 * 
 * Routes AI requests to optimal providers based on task complexity:
 * - Triage/Classification → Kimi (87% cheaper than GPT-4o-mini)
 * - Analysis/Reasoning → Gemini (50% cheaper than GPT-4o-mini)
 * - Critical/Complex → OpenAI (most reliable, use sparingly)
 * 
 * Cost Comparison (per 1M tokens):
 * - Kimi:           $0.02 input / $0.08 output   (87% cheaper)
 * - Gemini 2.0:     $0.075 input / $0.30 output  (50% cheaper)
 * - GPT-4o-mini:    $0.15 input / $0.60 output   (baseline)
 * 
 * Usage:
 * ```typescript
 * const client = createOptimizedClient('triage');
 * const response = await client.chat([{ role: 'user', content: 'Classify this...' }]);
 * ```
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

export type TaskType = 'triage' | 'analysis' | 'critical';
export type AIProvider = 'kimi' | 'gemini' | 'openai';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  content: string;
  provider: AIProvider;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Get optimal provider for task type
 */
export function getOptimalProvider(taskType: TaskType): AIProvider {
  // Allow manual override via env
  const override = process.env.AI_PROVIDER as AIProvider;
  if (override && ['kimi', 'gemini', 'openai'].includes(override)) {
    return override;
  }

  // Route by complexity
  switch (taskType) {
    case 'triage':
      return 'kimi';      // 87% cheaper, perfect for classification
    case 'analysis':
      return 'gemini';    // 50% cheaper, good for reasoning
    case 'critical':
      return 'openai';    // Most reliable, use sparingly
    default:
      return 'gemini';    // Default to middle ground
  }
}

/**
 * AI Client with multi-provider support
 */
export class AIClient {
  private provider: AIProvider;
  private openai?: OpenAI;
  private anthropic?: Anthropic;

  constructor(provider: AIProvider) {
    this.provider = provider;

    if (provider === 'openai' || provider === 'kimi') {
      // Kimi uses OpenAI-compatible API
      this.openai = new OpenAI({
        apiKey: provider === 'kimi' 
          ? process.env.KIMI_API_KEY || process.env.OPENAI_API_KEY
          : process.env.OPENAI_API_KEY,
        baseURL: provider === 'kimi'
          ? 'https://api.moonshot.cn/v1'
          : undefined,
      });
    }

    if (provider === 'gemini') {
      // Use Anthropic client with OpenRouter for Gemini
      this.anthropic = new Anthropic({
        apiKey: process.env.OPENROUTER_API_KEY || process.env.ANTHROPIC_API_KEY,
        baseURL: 'https://openrouter.ai/api/v1',
      });
    }
  }

  /**
   * Send chat completion request
   */
  async chat(messages: ChatMessage[], options?: {
    temperature?: number;
    maxTokens?: number;
    jsonMode?: boolean;
  }): Promise<ChatResponse> {
    const temperature = options?.temperature ?? 0.3;
    const maxTokens = options?.maxTokens ?? 1500;

    if (this.provider === 'openai' || this.provider === 'kimi') {
      return this.chatOpenAI(messages, temperature, maxTokens, options?.jsonMode);
    }

    if (this.provider === 'gemini') {
      return this.chatGemini(messages, temperature, maxTokens);
    }

    throw new Error(`Unsupported provider: ${this.provider}`);
  }

  /**
   * OpenAI/Kimi chat completion
   */
  private async chatOpenAI(
    messages: ChatMessage[],
    temperature: number,
    maxTokens: number,
    jsonMode?: boolean
  ): Promise<ChatResponse> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized');
    }

    const model = this.provider === 'kimi' 
      ? 'moonshot-v1-8k'
      : 'gpt-4o-mini';

    const response = await this.openai.chat.completions.create({
      model,
      messages: messages as any,
      temperature,
      max_tokens: maxTokens,
      response_format: jsonMode ? { type: 'json_object' } : undefined,
    });

    const choice = response.choices[0];
    if (!choice?.message?.content) {
      throw new Error('Empty response from AI');
    }

    return {
      content: choice.message.content,
      provider: this.provider,
      model,
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
    };
  }

  /**
   * Gemini chat completion via OpenRouter
   */
  private async chatGemini(
    messages: ChatMessage[],
    temperature: number,
    maxTokens: number
  ): Promise<ChatResponse> {
    if (!this.anthropic) {
      throw new Error('Anthropic client not initialized');
    }

    // Convert to Anthropic format
    const systemMessage = messages.find(m => m.role === 'system');
    const userMessages = messages.filter(m => m.role !== 'system');

    const response = await this.anthropic.messages.create({
      model: 'google/gemini-2.0-flash-exp:free',
      max_tokens: maxTokens,
      temperature,
      system: systemMessage?.content,
      messages: userMessages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    } as any);

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Gemini');
    }

    return {
      content: content.text,
      provider: 'gemini',
      model: 'gemini-2.0-flash-exp',
      usage: {
        promptTokens: (response.usage as any)?.input_tokens || 0,
        completionTokens: (response.usage as any)?.output_tokens || 0,
        totalTokens: ((response.usage as any)?.input_tokens || 0) + ((response.usage as any)?.output_tokens || 0),
      },
    };
  }
}

/**
 * Create AI client optimized for task type
 */
export function createOptimizedClient(taskType: TaskType): AIClient {
  const provider = getOptimalProvider(taskType);
  return new AIClient(provider);
}

/**
 * Estimate cost savings vs baseline (GPT-4o-mini)
 */
export function estimateCostSavings(taskType: TaskType, tokens: number): {
  provider: AIProvider;
  baselineCost: number;
  actualCost: number;
  savings: number;
  savingsPercent: number;
} {
  const provider = getOptimalProvider(taskType);

  // Costs per 1M tokens (average of input/output)
  const costs: Record<AIProvider, number> = {
    openai: 0.375,  // $0.15 in + $0.60 out = $0.375 avg
    gemini: 0.1875, // $0.075 in + $0.30 out = $0.1875 avg (50% cheaper)
    kimi: 0.05,     // $0.02 in + $0.08 out = $0.05 avg (87% cheaper)
  };

  const baselineCost = (tokens / 1_000_000) * costs.openai;
  const actualCost = (tokens / 1_000_000) * costs[provider];
  const savings = baselineCost - actualCost;
  const savingsPercent = (savings / baselineCost) * 100;

  return {
    provider,
    baselineCost,
    actualCost,
    savings,
    savingsPercent,
  };
}
