import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface Startup {
    id: string;
    name: string;
    tagline: string;
    description: string;
    stage: 'idea' | 'mvp' | 'growth' | 'scale';
    industry: string;
    fundingAsk: number;
    teamSize: number;
    founderName: string;
    founderEmail: string;
    website?: string;
    deckUrl?: string;
    pitchVideo?: string;
    createdAt: Date;
    status: 'pending' | 'analyzing' | 'approved' | 'rejected' | 'conditional';
    analysis?: AgentAnalysis;
}

export interface AgentAnalysis {
    financial: AgentScore;
    technical: AgentScore;
    market: AgentScore;
    legal: AgentScore;
    vcAgents: VCAgentScore[];
    overallScore: number;
    valuation: number;
    fundingRecommendation: 'approved' | 'rejected' | 'conditional';
    summary: string;
    completedAt: Date;
}

export interface AgentScore {
    agentName: string;
    score: number; // 0-100
    confidence: number; // 0-100
    feedback: string[];
    strengths: string[];
    concerns: string[];
}

export interface VCAgentScore {
    vcId: string;
    vcName: string;
    interested: boolean;
    interestLevel: number; // 0-100
    feedback: string;
}

export interface VC {
    id: string;
    name: string;
    firmName: string;
    email: string;
    fundSize: string;
    focusAreas: string[];
    stagePreference: string[];
    investmentRange: { min: number; max: number };
    thesis: string;
    portfolio: string[];
    createdAt: Date;
    agentPersona?: VCAgentPersona;
}

export interface VCAgentPersona {
    name: string;
    personality: string;
    investmentStyle: string;
    riskTolerance: 'conservative' | 'moderate' | 'aggressive';
    priorities: string[];
}

// Store State
interface AppState {
    // Startups
    startups: Startup[];
    addStartup: (startup: Omit<Startup, 'id' | 'createdAt' | 'status'>) => string;
    updateStartup: (id: string, updates: Partial<Startup>) => void;
    getStartup: (id: string) => Startup | undefined;

    // VCs
    vcs: VC[];
    addVC: (vc: Omit<VC, 'id' | 'createdAt'>) => string;
    updateVC: (id: string, updates: Partial<VC>) => void;
    getVC: (id: string) => VC | undefined;

    // Analysis
    analyzeStartup: (startupId: string) => Promise<AgentAnalysis>;
}

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Create Store
export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            startups: [],
            vcs: [],

            addStartup: (startup) => {
                const id = generateId();
                const newStartup: Startup = {
                    ...startup,
                    id,
                    createdAt: new Date(),
                    status: 'pending',
                };
                set((state) => ({ startups: [...state.startups, newStartup] }));
                return id;
            },

            updateStartup: (id, updates) => {
                set((state) => ({
                    startups: state.startups.map((s) =>
                        s.id === id ? { ...s, ...updates } : s
                    ),
                }));
            },

            getStartup: (id) => {
                return get().startups.find((s) => s.id === id);
            },

            addVC: (vc) => {
                const id = generateId();
                const newVC: VC = {
                    ...vc,
                    id,
                    createdAt: new Date(),
                };
                set((state) => ({ vcs: [...state.vcs, newVC] }));
                return id;
            },

            updateVC: (id, updates) => {
                set((state) => ({
                    vcs: state.vcs.map((v) =>
                        v.id === id ? { ...v, ...updates } : v
                    ),
                }));
            },

            getVC: (id) => {
                return get().vcs.find((v) => v.id === id);
            },

            // Mock analysis function - will be replaced with real AI later
            analyzeStartup: async (startupId) => {
                const startup = get().getStartup(startupId);
                if (!startup) throw new Error('Startup not found');

                // Set status to analyzing
                get().updateStartup(startupId, { status: 'analyzing' });

                // Simulate analysis delay (2-4 seconds)
                await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 2000));

                // Generate mock analysis
                const baseScore = 60 + Math.random() * 30;
                const analysis: AgentAnalysis = {
                    financial: {
                        agentName: 'Financial Analyst',
                        score: Math.round(baseScore + (Math.random() - 0.5) * 20),
                        confidence: Math.round(70 + Math.random() * 25),
                        feedback: [
                            `Revenue model appears ${startup.stage === 'growth' ? 'proven' : 'promising but needs validation'}`,
                            `Funding ask of $${(startup.fundingAsk / 1000000).toFixed(1)}M is ${startup.fundingAsk > 5000000 ? 'ambitious' : 'reasonable'} for current stage`,
                        ],
                        strengths: ['Clear monetization strategy', 'Reasonable burn rate assumptions'],
                        concerns: startup.fundingAsk > 10000000
                            ? ['High capital requirement may limit investor pool']
                            : ['Need more detailed financial projections'],
                    },
                    technical: {
                        agentName: 'Technical Due Diligence',
                        score: Math.round(baseScore + (Math.random() - 0.5) * 20),
                        confidence: Math.round(75 + Math.random() * 20),
                        feedback: [
                            `Technology stack appears ${Math.random() > 0.5 ? 'modern and scalable' : 'adequate for current needs'}`,
                            `Team technical capability: ${startup.teamSize > 5 ? 'Strong' : 'Developing'}`,
                        ],
                        strengths: ['Innovative approach to problem', 'Defensible technology moat'],
                        concerns: ['Scaling infrastructure needs attention'],
                    },
                    market: {
                        agentName: 'Market Research',
                        score: Math.round(baseScore + (Math.random() - 0.5) * 20),
                        confidence: Math.round(65 + Math.random() * 30),
                        feedback: [
                            `${startup.industry} market showing ${Math.random() > 0.5 ? 'strong growth trends' : 'steady demand'}`,
                            `Competitive landscape is ${Math.random() > 0.5 ? 'fragmented - opportunity for consolidation' : 'competitive but differentiation is clear'}`,
                        ],
                        strengths: ['Clear target market', 'Strong value proposition'],
                        concerns: ['Market timing risk', 'Need to monitor competitor moves'],
                    },
                    legal: {
                        agentName: 'Legal & Compliance',
                        score: Math.round(baseScore + (Math.random() - 0.5) * 15),
                        confidence: Math.round(80 + Math.random() * 15),
                        feedback: [
                            'Standard incorporation structure recommended',
                            `Industry-specific compliance requirements ${Math.random() > 0.5 ? 'appear manageable' : 'need further review'}`,
                        ],
                        strengths: ['No immediate red flags', 'IP protection strategy in place'],
                        concerns: ['Ensure proper employee agreements', 'Review data privacy policies'],
                    },
                    vcAgents: get().vcs.slice(0, 3).map((vc) => ({
                        vcId: vc.id,
                        vcName: vc.firmName,
                        interested: Math.random() > 0.4,
                        interestLevel: Math.round(50 + Math.random() * 45),
                        feedback: `${vc.firmName} ${Math.random() > 0.5 ? 'sees strong alignment with portfolio' : 'interested in follow-up discussion'}`,
                    })),
                    overallScore: 0,
                    valuation: 0,
                    fundingRecommendation: 'pending' as 'approved' | 'rejected' | 'conditional',
                    summary: '',
                    completedAt: new Date(),
                };

                // Calculate overall score
                const scores = [analysis.financial.score, analysis.technical.score, analysis.market.score, analysis.legal.score];
                analysis.overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

                // Calculate valuation (simplified mock formula)
                const stageMultiplier = { idea: 1, mvp: 2.5, growth: 5, scale: 10 };
                analysis.valuation = Math.round(startup.fundingAsk * stageMultiplier[startup.stage] * (analysis.overallScore / 75));

                // Determine funding recommendation
                if (analysis.overallScore >= 75) {
                    analysis.fundingRecommendation = 'approved';
                    analysis.summary = `Strong candidate for funding. ${startup.name} demonstrates solid fundamentals across all evaluation criteria. Recommended for immediate VC matching.`;
                } else if (analysis.overallScore >= 55) {
                    analysis.fundingRecommendation = 'conditional';
                    analysis.summary = `Promising candidate with areas for improvement. ${startup.name} shows potential but should address identified concerns before full funding approval.`;
                } else {
                    analysis.fundingRecommendation = 'rejected';
                    analysis.summary = `Not recommended for funding at this time. ${startup.name} needs significant improvements in multiple areas before reapplying.`;
                }

                // Update startup with analysis
                get().updateStartup(startupId, {
                    status: analysis.fundingRecommendation,
                    analysis
                });

                return analysis;
            },
        }),
        {
            name: 'swarm-accelerator-store',
        }
    )
);
