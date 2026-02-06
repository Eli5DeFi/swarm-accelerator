// Matching Engine: Project Analyzer
// Analyzes projects seeking funding and creates investment profile

import { createOptimizedClient } from '../../ai-client';

export interface ProjectProfile {
  id: string;
  name: string;
  stage: string;
  industry: string;
  
  // Investment details
  fundingType: 'equity' | 'token' | 'safe' | 'debt' | 'revenue-share';
  amountSeeking: number;
  valuation?: number; // Pre-money valuation
  tokenPrice?: number; // For token sales
  
  // Fundamentals
  revenue: number;
  revenueGrowth: number;
  customers: number;
  teamSize: number;
  
  // Qualitative
  problem: string;
  solution: string;
  traction: string;
  moat: string;
  
  // Matching criteria
  idealInvestorType: string[];
  minTicketSize: number;
  maxTicketSize: number;
  geography: string[];
  
  // Investment profile (AI-generated)
  investmentThesis: string;
  keyRisks: string[];
  keyOpportunities: string[];
  comparables: string[];
  exitScenarios: string[];
  
  // Metadata
  createdAt: Date;
  status: 'active' | 'funded' | 'closed';
}

export interface InvestorProfile {
  id: string;
  name: string;
  type: 'vc' | 'angel' | 'family-office' | 'institutional' | 'retail' | 'dao';
  
  // Investment criteria
  focusAreas: string[]; // Industries
  stagePreference: string[]; // Seed, Series A, etc.
  checkSize: { min: number; max: number };
  geography: string[];
  
  // Preferences
  fundingTypes: ('equity' | 'token' | 'safe' | 'debt')[];
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  timeHorizon: string; // "2-5 years", "5-10 years"
  
  // Thesis
  investmentThesis: string;
  priorities: string[]; // ["growth", "profitability", "team", "market"]
  dealBreakers: string[];
  
  // Portfolio
  portfolioCompanies: string[];
  recentInvestments: {
    company: string;
    amount: number;
    date: string;
  }[];
  
  // Metadata
  createdAt: Date;
  active: boolean;
}

export interface MatchScore {
  overall: number; // 0-100
  breakdown: {
    industryFit: number;
    stageFit: number;
    ticketSizeFit: number;
    geographyFit: number;
    fundingTypeFit: number;
    thesisFit: number;
  };
  reasoning: string;
  synergies: string[];
  concerns: string[];
}

export async function analyzeProject(
  projectData: Partial<ProjectProfile>
): Promise<ProjectProfile> {
  const prompt = `You are a senior investment analyst creating an investment profile.

Project Information:
- Name: ${projectData.name}
- Stage: ${projectData.stage}
- Industry: ${projectData.industry}
- Funding Type: ${projectData.fundingType}
- Amount Seeking: $${projectData.amountSeeking?.toLocaleString()}
- Revenue: $${projectData.revenue?.toLocaleString()}
- Growth: ${projectData.revenueGrowth}%
- Customers: ${projectData.customers}
- Team: ${projectData.teamSize} people

Problem: ${projectData.problem}
Solution: ${projectData.solution}
Traction: ${projectData.traction}
Moat: ${projectData.moat}

Task: Create comprehensive investment profile:

1. **Investment Thesis** (2-3 sentences)
   - Why this is an attractive investment
   - What makes it compelling vs alternatives
   - Expected return profile

2. **Key Risks** (Top 5)
   - Execution risk
   - Market risk
   - Competition risk
   - Team risk
   - Financial risk

3. **Key Opportunities** (Top 5)
   - Market tailwinds
   - Competitive advantages
   - Growth levers
   - Exit potential
   - Strategic value

4. **Comparable Companies** (5-10)
   - Public companies in same space
   - Recent acquisitions
   - Competitors (funded)
   - Adjacent players

5. **Exit Scenarios** (3-5)
   - Strategic acquisition (who would buy, at what multiple)
   - IPO (timeline, comparable IPOs)
   - Secondary sale (PE, growth equity)
   - Earnout/acqui-hire (if struggling)

Format as JSON:
{
  "investmentThesis": "...",
  "keyRisks": ["Risk 1", "Risk 2", ...],
  "keyOpportunities": ["Opp 1", "Opp 2", ...],
  "comparables": ["Company 1", "Company 2", ...],
  "exitScenarios": ["Scenario 1", "Scenario 2", ...]
}`;

  // Use Gemini for analysis (50% cheaper than OpenAI)
  const client = createOptimizedClient('analysis');
  const response = await client.chat([
    {
      role: 'system',
      content:
        'You are a senior investment analyst. Create thorough, realistic investment profiles.',
    },
    { role: 'user', content: prompt },
  ], {
    temperature: 0.3,
    jsonMode: true,
  });

  const analysis = JSON.parse(response.content);

  return {
    id: projectData.id || '',
    name: projectData.name || '',
    stage: projectData.stage || '',
    industry: projectData.industry || '',
    fundingType: projectData.fundingType || 'equity',
    amountSeeking: projectData.amountSeeking || 0,
    valuation: projectData.valuation,
    tokenPrice: projectData.tokenPrice,
    revenue: projectData.revenue || 0,
    revenueGrowth: projectData.revenueGrowth || 0,
    customers: projectData.customers || 0,
    teamSize: projectData.teamSize || 0,
    problem: projectData.problem || '',
    solution: projectData.solution || '',
    traction: projectData.traction || '',
    moat: projectData.moat || '',
    idealInvestorType: projectData.idealInvestorType || [],
    minTicketSize: projectData.minTicketSize || 0,
    maxTicketSize: projectData.maxTicketSize || 0,
    geography: projectData.geography || [],
    investmentThesis: analysis.investmentThesis || '',
    keyRisks: analysis.keyRisks || [],
    keyOpportunities: analysis.keyOpportunities || [],
    comparables: analysis.comparables || [],
    exitScenarios: analysis.exitScenarios || [],
    createdAt: new Date(),
    status: 'active',
  };
}

export async function matchProjectToInvestor(
  project: ProjectProfile,
  investor: InvestorProfile
): Promise<MatchScore> {
  const prompt = `You are an investment matching AI evaluating project-investor fit.

Project:
- Name: ${project.name}
- Stage: ${project.stage}
- Industry: ${project.industry}
- Funding: $${project.amountSeeking.toLocaleString()} (${project.fundingType})
- Thesis: ${project.investmentThesis}

Investor:
- Name: ${investor.name}
- Type: ${investor.type}
- Focus: ${investor.focusAreas.join(', ')}
- Stage Pref: ${investor.stagePreference.join(', ')}
- Check Size: $${investor.checkSize.min.toLocaleString()} - $${investor.checkSize.max.toLocaleString()}
- Thesis: ${investor.investmentThesis}
- Priorities: ${investor.priorities.join(', ')}
- Deal Breakers: ${investor.dealBreakers.join(', ')}

Task: Score the match (0-100) across dimensions:

1. **Industry Fit** (0-100)
   - Does project industry align with investor focus areas?

2. **Stage Fit** (0-100)
   - Does project stage match investor preferences?

3. **Ticket Size Fit** (0-100)
   - Does project funding ask fit investor check size?

4. **Geography Fit** (0-100)
   - Geographic alignment?

5. **Funding Type Fit** (0-100)
   - Does investor do this type of funding (equity/token/etc.)?

6. **Thesis Fit** (0-100)
   - Does project thesis align with investor thesis?
   - Does it match investor priorities?
   - Any deal breakers?

Then calculate **Overall Score** (weighted average):
- Thesis Fit: 30%
- Industry Fit: 25%
- Stage Fit: 20%
- Ticket Size Fit: 15%
- Funding Type Fit: 5%
- Geography Fit: 5%

Provide:
- Reasoning (why this score)
- Synergies (why this is a good fit)
- Concerns (potential issues)

Format as JSON.`;

  // Use Gemini for matching analysis (50% cheaper)
  const client = createOptimizedClient('analysis');
  const response = await client.chat([
    {
      role: 'system',
      content: 'You are an investment matching AI. Score matches conservatively but fairly.',
    },
    { role: 'user', content: prompt },
  ], {
    temperature: 0.2,
    jsonMode: true,
  });

  const result = JSON.parse(response.content);

  return {
    overall: result.overall || 0,
    breakdown: result.breakdown || {},
    reasoning: result.reasoning || '',
    synergies: result.synergies || [],
    concerns: result.concerns || [],
  };
}

// Batch match: project to many investors
export async function matchProjectToInvestors(
  project: ProjectProfile,
  investors: InvestorProfile[]
): Promise<
  Array<{
    investor: InvestorProfile;
    score: MatchScore;
  }>
> {
  const matches = await Promise.all(
    investors.map(async (investor) => ({
      investor,
      score: await matchProjectToInvestor(project, investor),
    }))
  );

  // Sort by overall score (descending)
  return matches.sort((a, b) => b.score.overall - a.score.overall);
}
