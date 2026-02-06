// M&A Agent: Due Diligence Preparer
// Creates comprehensive data room checklist and exit readiness scorecard

import { createOptimizedClient } from '../../ai-client';


export interface DataRoomSection {
  category: string;
  documents: string[];
  priority: 'critical' | 'important' | 'nice-to-have';
  status?: 'complete' | 'in-progress' | 'missing';
}

export interface ExitReadinessScore {
  overall: number; // 0-100
  categories: {
    category: string;
    score: number;
    issues: string[];
    recommendations: string[];
  }[];
}

export interface DueDiligenceResult {
  dataRoomChecklist: DataRoomSection[];
  exitReadiness: ExitReadinessScore;
  timeline: {
    phase: string;
    duration: string;
    milestones: string[];
  }[];
  risks: {
    risk: string;
    severity: 'high' | 'medium' | 'low';
    mitigation: string;
  }[];
  recommendations: string[];
}

export async function prepareDueDiligence(companyData: {
  stage: string;
  industry: string;
  hasIP: boolean;
  employeeCount: number;
  hasLitigation: boolean;
  hasDebt: boolean;
  hasPreferredStock: boolean;
  revenueModel: string;
  geography: string[];
  hasForeignSubsidiaries: boolean;
}): Promise<DueDiligenceResult> {
  const prompt = `You are an M&A due diligence expert preparing a company for acquisition.

Company Profile:
- Stage: ${companyData.stage}
- Industry: ${companyData.industry}
- IP Portfolio: ${companyData.hasIP ? 'Yes' : 'No'}
- Employees: ${companyData.employeeCount}
- Active Litigation: ${companyData.hasLitigation ? 'Yes' : 'No'}
- Debt: ${companyData.hasDebt ? 'Yes' : 'No'}
- Preferred Stock: ${companyData.hasPreferredStock ? 'Yes' : 'No'}
- Revenue Model: ${companyData.revenueModel}
- Geography: ${companyData.geography.join(', ')}
- Foreign Subsidiaries: ${companyData.hasForeignSubsidiaries ? 'Yes' : 'No'}

Task: Create comprehensive due diligence preparation plan:

1. **Data Room Checklist** (100+ documents)
   
   Categories to cover:
   - Corporate Documents (incorporation, bylaws, stockholder agreements)
   - Financial Statements (audited if available, 3 years historical)
   - Tax Returns (3 years, federal + state)
   - Intellectual Property (patents, trademarks, copyrights, licenses)
   - Contracts (customer agreements, vendor contracts, leases)
   - Employment (org chart, compensation, stock options, benefits)
   - Compliance (licenses, permits, regulatory filings)
   - Litigation (lawsuits, disputes, settlements)
   - Technology (architecture docs, code repos, security audits)
   - Sales & Marketing (pipeline, customer list, case studies)
   - Product (roadmap, feature specs, user metrics)
   - Insurance (policies, claims history)
   - Related Party Transactions
   - Environmental (if applicable)
   
   For each document:
   - Mark priority (critical/important/nice-to-have)
   - Add notes on what acquirers focus on

2. **Exit Readiness Scorecard** (0-100)
   
   Evaluate these categories:
   - Corporate Structure (clean cap table, proper entity structure)
   - Financial Systems (GAAP compliance, audit-ready books)
   - Legal Compliance (contracts, IP, employment law)
   - Technology (documented architecture, no tech debt risks)
   - Operations (processes, documentation, scalability)
   - Team (key person risk, retention plans)
   - Customer Concentration (no single customer >20% revenue)
   - Revenue Quality (recurring, diversified, growing)
   
   For each category:
   - Score (0-100)
   - Identify issues (what's broken)
   - Provide recommendations (how to fix)

3. **Deal Timeline** (typical 3-6 months)
   - Phase 1: NDA & Initial Discussions (2-4 weeks)
   - Phase 2: LOI & Valuation (2-3 weeks)
   - Phase 3: Due Diligence (4-8 weeks)
   - Phase 4: Definitive Agreement (2-4 weeks)
   - Phase 5: Closing & Integration (2-4 weeks)

4. **Risk Assessment**
   - Identify deal-breaker risks (high severity)
   - Medium risks that need mitigation
   - Low risks to monitor
   - Mitigation strategies for each

5. **Preparation Recommendations**
   - What to do in next 30/60/90 days
   - Which documents to create/clean up first
   - Which issues to resolve before going to market

Format as JSON with detailed checklists.`;

  // Use Gemini for analysis (50% cheaper than OpenAI)
  const client = createOptimizedClient('analysis');
  const response = await client.chat([
    {
      role: 'system',
      content:
        'You are a due diligence expert. Provide thorough, practical checklists that prepare companies for acquisition.',
    },
    { role: 'user', content: prompt },
  ], {
    temperature: 0.3,
    jsonMode: true,
  });

  const result = JSON.parse(response.content);

  return {
    dataRoomChecklist: result.dataRoomChecklist || [],
    exitReadiness: result.exitReadiness || { overall: 0, categories: [] },
    timeline: result.timeline || [],
    risks: result.risks || [],
    recommendations: result.recommendations || [],
  };
}

// Standard data room categories (baseline checklist)
export const standardDataRoom: DataRoomSection[] = [
  {
    category: 'Corporate Documents',
    priority: 'critical',
    documents: [
      'Certificate of Incorporation',
      'Amended & Restated Bylaws',
      'Board Minutes (last 3 years)',
      'Stockholder Agreements',
      'Cap Table (fully diluted)',
      'Stock Option Plan & Grants',
      'Voting Agreements',
      'Right of First Refusal Agreements',
      'Drag-Along Provisions',
    ],
  },
  {
    category: 'Financial Statements',
    priority: 'critical',
    documents: [
      'Audited Financials (if available)',
      'Unaudited Financials (last 3 years)',
      'Monthly P&L (last 12 months)',
      'Balance Sheet (current)',
      'Cash Flow Statement',
      'Budget vs Actuals',
      'Revenue Recognition Policy',
      'Chart of Accounts',
      'AR/AP Aging Reports',
    ],
  },
  {
    category: 'Tax Documents',
    priority: 'critical',
    documents: [
      'Federal Tax Returns (last 3 years)',
      'State Tax Returns (last 3 years)',
      'Sales Tax Returns',
      'Payroll Tax Filings',
      'Tax Audit History',
      'NOL Carryforwards',
      '83(b) Elections (all employees)',
      '409A Valuations',
    ],
  },
  {
    category: 'Intellectual Property',
    priority: 'critical',
    documents: [
      'Patent List & Status',
      'Trademark Registrations',
      'Copyright Registrations',
      'Domain Name List',
      'IP Assignment Agreements (all employees)',
      'Confidentiality Agreements',
      'Invention Assignment Agreements',
      'Open Source Software Audit',
      'Third-Party Licenses',
    ],
  },
  {
    category: 'Contracts & Agreements',
    priority: 'critical',
    documents: [
      'Customer Agreements (top 20)',
      'Vendor Contracts',
      'Partnership Agreements',
      'Reseller Agreements',
      'Leases (office, equipment)',
      'Loan Agreements',
      'Lines of Credit',
      'Guarantees',
      'Material Contracts (>$50K)',
    ],
  },
  {
    category: 'Employment & HR',
    priority: 'important',
    documents: [
      'Organization Chart',
      'Employee List (name, title, comp)',
      'Offer Letters (all employees)',
      'Employment Agreements',
      'Contractor Agreements',
      'Stock Option Grants',
      'Benefits Summary',
      '401(k) Plan Documents',
      'Severance Agreements',
      'Non-Compete Agreements',
      'Diversity Metrics',
    ],
  },
  {
    category: 'Compliance & Regulatory',
    priority: 'important',
    documents: [
      'Business Licenses',
      'Permits',
      'Regulatory Filings',
      'Privacy Policy',
      'Terms of Service',
      'GDPR Compliance Docs',
      'SOC 2 Report (if available)',
      'ISO Certifications',
      'Industry Certifications',
    ],
  },
  {
    category: 'Litigation & Disputes',
    priority: 'critical',
    documents: [
      'Active Lawsuits',
      'Demand Letters',
      'Settlement Agreements',
      'Arbitrations',
      'Regulatory Investigations',
      'IP Disputes',
      'Employment Disputes',
    ],
  },
  {
    category: 'Technology & Product',
    priority: 'important',
    documents: [
      'System Architecture Diagram',
      'Tech Stack Documentation',
      'Code Repository Access',
      'Security Audit Reports',
      'Penetration Test Results',
      'Disaster Recovery Plan',
      'Product Roadmap',
      'Technical Debt Analysis',
      'Uptime/SLA Metrics',
    ],
  },
  {
    category: 'Sales & Marketing',
    priority: 'important',
    documents: [
      'Customer List (anonymized if needed)',
      'Sales Pipeline (current)',
      'Customer Acquisition Metrics',
      'Marketing Materials',
      'Case Studies',
      'Pricing History',
      'Sales Forecasts',
      'Churn Analysis',
      'NPS Scores',
    ],
  },
  {
    category: 'Insurance',
    priority: 'nice-to-have',
    documents: [
      'General Liability Policy',
      'D&O Insurance',
      'E&O Insurance',
      'Cyber Insurance',
      'Workers Comp',
      'Claims History',
    ],
  },
];
