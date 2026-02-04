/**
 * Smart AI model selection based on task complexity
 * Use cheaper models for simple tasks, GPT-4 for complex reasoning
 */

export type TaskType = 
  | "summarize"
  | "categorize"
  | "extract"
  | "analyze"
  | "synthesize"
  | "reason"
  | "code"
  | "creative";

export type ModelConfig = {
  model: string;
  costPerToken: number;
  contextWindow: number;
};

const MODEL_CONFIGS: Record<string, ModelConfig> = {
  "gpt-3.5-turbo": {
    model: "gpt-3.5-turbo",
    costPerToken: 0.0000015, // $0.0015 per 1K tokens
    contextWindow: 16385,
  },
  "gpt-4-turbo-preview": {
    model: "gpt-4-turbo-preview",
    costPerToken: 0.00001, // $0.01 per 1K tokens
    contextWindow: 128000,
  },
  "gpt-4": {
    model: "gpt-4",
    costPerToken: 0.00003, // $0.03 per 1K tokens
    contextWindow: 8192,
  },
};

/**
 * Select optimal model based on task type
 */
export function selectModel(taskType: TaskType): ModelConfig {
  const modelMap: Record<TaskType, string> = {
    // Simple tasks -> GPT-3.5-turbo (5x cheaper)
    "summarize": "gpt-3.5-turbo",
    "categorize": "gpt-3.5-turbo",
    "extract": "gpt-3.5-turbo",
    
    // Complex tasks -> GPT-4 Turbo
    "analyze": "gpt-4-turbo-preview",
    "synthesize": "gpt-4-turbo-preview",
    "reason": "gpt-4-turbo-preview",
    "code": "gpt-4-turbo-preview",
    "creative": "gpt-4-turbo-preview",
  };
  
  const modelName = modelMap[taskType];
  return MODEL_CONFIGS[modelName];
}

/**
 * Estimate cost for a task
 */
export function estimateCost(
  taskType: TaskType,
  inputTokens: number,
  outputTokens: number = 500
): number {
  const config = selectModel(taskType);
  const totalTokens = inputTokens + outputTokens;
  return (totalTokens / 1000) * config.costPerToken;
}

/**
 * Get model name for OpenAI API
 */
export function getModelName(taskType: TaskType): string {
  return selectModel(taskType).model;
}
