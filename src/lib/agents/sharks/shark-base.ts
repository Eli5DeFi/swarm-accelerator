import { createOptimizedClient, type AIClient } from '../../ai-client';

export interface SharkPersonality {
  name: string;
  title: string;
  specialty: string[];
  personality: string;
  investmentStyle: string;
  signatureQuote: string;
  avatar: string;
}

export interface Pitch {
  id: string;
  name: string;
  tagline: string;
  description: string;
  industry: string;
  stage: string;
  fundingAsk: number;
  valuation: number;
  revenue?: number;
  users?: number;
  teamSize: number;
  founderName: string;
  founderBackground: string;
  traction?: string;
  metrics?: Record<string, any>;
}

export interface SharkAnalysis {
  sharkName: string;
  interestLevel: number; // 0-100
  strengths: string[];
  concerns: string[];
  questions: string[];
  reasoning: string;
}

export interface SharkOffer {
  sharkName: string;
  interested: boolean;
  amount?: number;
  equity?: number;
  dealStructure: 'equity' | 'debt' | 'royalty' | 'hybrid';
  terms?: string;
  conditions?: string[];
  reasoning: string;
}

export abstract class SharkAgent {
  protected personality: SharkPersonality;

  constructor(personality: SharkPersonality) {
    this.personality = personality;
  }

  abstract analyzePitch(pitch: Pitch): Promise<SharkAnalysis>;
  abstract makeOffer(pitch: Pitch, analysis: SharkAnalysis): Promise<SharkOffer>;
  abstract respondToQuestion(pitch: Pitch, question: string): Promise<string>;

  /**
   * Generate AI response using optimized provider routing
   * - Analysis tasks → Gemini (50% cheaper)
   * - Critical decisions → OpenAI (most reliable)
   */
  protected async generateResponse(
    systemPrompt: string,
    userPrompt: string,
    taskType: 'analysis' | 'critical' = 'analysis'
  ): Promise<string> {
    const client = createOptimizedClient(taskType);
    
    const response = await client.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], {
      temperature: 0.8,
      maxTokens: 1000,
    });

    return response.content;
  }

  protected getSystemPrompt(): string {
    return `You are ${this.personality.name}, a legendary investor from Shark Tank.

PERSONALITY: ${this.personality.personality}

SPECIALTY: ${this.personality.specialty.join(', ')}

INVESTMENT STYLE: ${this.personality.investmentStyle}

SIGNATURE QUOTE: "${this.personality.signatureQuote}"

You evaluate startups from your unique perspective. Be authentic to your character:
- Use your signature phrases and mannerisms
- Focus on areas within your specialty
- Make decisions aligned with your investment style
- Be tough but fair in your analysis
- Show enthusiasm when genuinely interested
- Be direct when saying "I'm out"

Always respond in character. Be specific, actionable, and true to your personality.`;
  }
}

export class MarkCubanAI extends SharkAgent {
  constructor() {
    super({
      name: 'Mark Cuban',
      title: 'Tech Billionaire',
      specialty: ['Tech', 'SaaS', 'Scalable Businesses', 'AI/ML'],
      personality: 'Direct, numbers-focused, loves tech disruption, analytical',
      investmentStyle: 'Large checks, hands-off, expects high growth',
      signatureQuote: 'Show me the metrics, show me the scale',
      avatar: '🏀',
    });
  }

  async analyzePitch(pitch: Pitch): Promise<SharkAnalysis> {
    // Compressed prompt format (30% fewer tokens)
    const prompt = `Analyze: ${pitch.name} - ${pitch.tagline}

Industry: ${pitch.industry} | Stage: ${pitch.stage}
Ask: $${(pitch.fundingAsk / 1000).toFixed(0)}K @ $${(pitch.valuation / 1000000).toFixed(1)}M
Revenue: ${pitch.revenue ? `$${(pitch.revenue / 1000).toFixed(0)}K` : 'Pre-rev'} | Users: ${pitch.users?.toLocaleString() || 'N/A'} | Team: ${pitch.teamSize}

${pitch.description}

Focus: Tech scale, market growth, unit economics, team capability.

JSON:
{
  "interestLevel": 0-100,
  "strengths": ["2-3 points"],
  "concerns": ["2-3 points"],
  "questions": ["2-3 questions"],
  "reasoning": "2-3 sentences"
}`;

    const response = await this.generateResponse(this.getSystemPrompt(), prompt);

    try {
      const analysis = JSON.parse(response);
      return {
        sharkName: this.personality.name,
        ...analysis,
      };
    } catch (e) {
      return {
        sharkName: this.personality.name,
        interestLevel: 50,
        strengths: ['Tech-focused'],
        concerns: ['Need more data'],
        questions: ['What are your metrics?'],
        reasoning: response,
      };
    }
  }

  async makeOffer(pitch: Pitch, analysis: SharkAnalysis): Promise<SharkOffer> {
    if (analysis.interestLevel < 60) {
      return {
        sharkName: this.personality.name,
        interested: false,
        dealStructure: 'equity',
        reasoning: "I'm out. " + analysis.reasoning,
      };
    }

    // Compressed prompt (30% fewer tokens)
    const prompt = `Offer for ${pitch.name} (interest: ${analysis.interestLevel}/100)

Ask: $${(pitch.fundingAsk / 1000).toFixed(0)}K @ $${(pitch.valuation / 1000000).toFixed(1)}M
Strengths: ${analysis.strengths.slice(0, 2).join('; ')}
Concerns: ${analysis.concerns.slice(0, 2).join('; ')}

Your style: Large checks, high growth, hands-off.

JSON:
{
  "interested": true,
  "amount": number,
  "equity": number,
  "dealStructure": "equity"|"debt"|"royalty"|"hybrid",
  "terms": "brief",
  "conditions": ["1-2"],
  "reasoning": "2 sentences"
}`;

    const response = await this.generateResponse(this.getSystemPrompt(), prompt);

    try {
      const offer = JSON.parse(response);
      return {
        sharkName: this.personality.name,
        ...offer,
      };
    } catch (e) {
      return {
        sharkName: this.personality.name,
        interested: false,
        dealStructure: 'equity',
        reasoning: "I'm out. Can't structure a deal that works.",
      };
    }
  }

  async respondToQuestion(pitch: Pitch, question: string): Promise<string> {
    // Compressed prompt
    const prompt = `Pitch: ${pitch.name}
Founder: "${question}"

Respond as Mark Cuban (direct, metrics-focused).`;

    return this.generateResponse(this.getSystemPrompt(), prompt);
  }
}

// Export all shark agents
