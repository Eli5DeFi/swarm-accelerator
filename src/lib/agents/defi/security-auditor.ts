// DeFi Agent: Smart Contract Security Auditor
// Pre-audit analysis of smart contracts (before formal audit)

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface SecurityAuditResult {
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  score: number; // 0-100
  
  vulnerabilities: {
    severity: 'critical' | 'high' | 'medium' | 'low';
    category: string;
    description: string;
    location: string;
    recommendation: string;
  }[];
  
  bestPractices: {
    check: string;
    status: 'pass' | 'fail' | 'warning';
    details: string;
  }[];
  
  recommendations: {
    priority: 'urgent' | 'high' | 'medium' | 'low';
    action: string;
    reasoning: string;
  }[];
  
  auditReadiness: {
    ready: boolean;
    blockers: string[];
    suggestions: string[];
  };
  
  estimatedCost: {
    selfAudit: string;
    professionalAudit: string;
    timeline: string;
  };
}

export async function auditSmartContract(contractData: {
  contractType: string; // "DEX", "Lending", "Token", "Vault", etc.
  language: string; // "Solidity" or "Vyper"
  complexity: 'simple' | 'medium' | 'complex';
  hasUpgradeability: boolean;
  hasOracles: boolean;
  hasMultisig: boolean;
  tvlExpected: number;
  codeSnippet?: string; // Optional: paste key functions
  dependencies: string[]; // e.g., ["OpenZeppelin", "Uniswap V3"]
}): Promise<SecurityAuditResult> {
  const prompt = `You are a smart contract security auditor (formerly at Trail of Bits, OpenZeppelin).

Analyze this DeFi protocol for security:
- Type: ${contractData.contractType}
- Language: ${contractData.language}
- Complexity: ${contractData.complexity}
- Upgradeability: ${contractData.hasUpgradeability ? 'Yes (Proxy pattern)' : 'No (Immutable)'}
- Oracles: ${contractData.hasOracles ? 'Yes' : 'No'}
- Multisig: ${contractData.hasMultisig ? 'Yes' : 'No'}
- Expected TVL: $${contractData.tvlExpected.toLocaleString()}
- Dependencies: ${contractData.dependencies.join(', ')}

${contractData.codeSnippet ? `Code Sample:\n${contractData.codeSnippet}` : ''}

Task: Perform pre-audit security analysis:

1. **Common Vulnerabilities** (check for these):
   
   **Critical:**
   - Reentrancy (check external calls + state changes)
   - Integer overflow/underflow (if not using Solidity 0.8+)
   - Access control (onlyOwner, role-based)
   - Front-running (MEV attacks, sandwich)
   - Flash loan attacks
   - Oracle manipulation
   - Proxy storage collisions (if upgradeable)
   
   **High:**
   - Unchecked external calls
   - Missing input validation
   - Centralization risks (admin keys)
   - Time manipulation (block.timestamp)
   - Denial of service vectors
   
   **Medium:**
   - Gas optimization issues
   - Event emission gaps
   - Incorrect error handling
   - Uninitialized storage pointers
   
   **Low:**
   - Code readability
   - Missing NatSpec comments
   - Unused variables

2. **Best Practices Checklist:**
   - Uses latest Solidity version (0.8.x+)
   - Has comprehensive tests (>90% coverage)
   - Uses audited libraries (OpenZeppelin)
   - Has emergency pause mechanism
   - Implements time-locks for critical operations
   - Has multi-sig for admin functions
   - Uses SafeMath (or 0.8+ built-in)
   - Checks for zero addresses
   - Emits events for state changes
   - Has clear upgrade path (if needed)

3. **DeFi-Specific Checks:**
   - Price oracle resilience (TWAP, Chainlink)
   - Liquidity pool manipulation resistance
   - Flash loan attack vectors
   - Slippage protection
   - Fee calculation accuracy
   - Rounding errors (favor protocol or user?)

4. **Recommendations** (prioritize):
   - What to fix before mainnet
   - Which auditors to engage (Trail of Bits, OpenZeppelin, Consensys Diligence)
   - Estimated audit cost & timeline
   - Bug bounty program suggestions

5. **Audit Readiness:**
   - Is code ready for professional audit?
   - What blockers exist?
   - Timeline to audit-ready

Return JSON with detailed security analysis.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content:
          'You are a smart contract security auditor. Be thorough and conservative in risk assessment.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.2,
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(completion.choices[0].message.content || '{}');

  return {
    overallRisk: result.overallRisk || 'medium',
    score: result.score || 50,
    vulnerabilities: result.vulnerabilities || [],
    bestPractices: result.bestPractices || [],
    recommendations: result.recommendations || [],
    auditReadiness: result.auditReadiness || { ready: false, blockers: [], suggestions: [] },
    estimatedCost: result.estimatedCost || {
      selfAudit: 'Free (GitHub checklist)',
      professionalAudit: '$10K-50K',
      timeline: '2-4 weeks',
    },
  };
}

// Common vulnerability patterns
export const vulnerabilityPatterns = {
  reentrancy: {
    name: 'Reentrancy Attack',
    description: 'External calls before state updates allow recursive calls',
    example: 'The DAO hack (2016, $60M loss)',
    fix: 'Use checks-effects-interactions pattern or ReentrancyGuard',
  },
  frontRunning: {
    name: 'Front-Running (MEV)',
    description: 'Attackers see pending transactions and front-run them',
    example: 'Sandwich attacks on DEXs',
    fix: 'Use commit-reveal schemes or private mempools (Flashbots)',
  },
  flashLoan: {
    name: 'Flash Loan Attack',
    description: 'Borrow large amounts to manipulate prices/voting',
    example: 'Harvest Finance (2020, $34M loss)',
    fix: 'Use TWAP oracles, limit governance by flash loans',
  },
  oracleManipulation: {
    name: 'Oracle Manipulation',
    description: 'Manipulate price feeds to exploit protocol',
    example: 'Inverse Finance (2022, $15M loss)',
    fix: 'Use multiple oracles, TWAP, Chainlink',
  },
  accessControl: {
    name: 'Access Control Issues',
    description: 'Missing or incorrect access controls',
    example: 'Poly Network (2021, $610M loss)',
    fix: 'Use OpenZeppelin AccessControl, test thoroughly',
  },
};

// Recommended auditors (by price/quality)
export const auditors = {
  tier1: [
    { name: 'Trail of Bits', cost: '$50K-200K', timeline: '4-8 weeks', focus: 'Critical infrastructure' },
    { name: 'OpenZeppelin', cost: '$40K-150K', timeline: '3-6 weeks', focus: 'Token standards, DeFi' },
    { name: 'Consensys Diligence', cost: '$40K-150K', timeline: '3-6 weeks', focus: 'Ethereum ecosystem' },
  ],
  tier2: [
    { name: 'CertiK', cost: '$20K-80K', timeline: '2-4 weeks', focus: 'Automated + manual' },
    { name: 'PeckShield', cost: '$15K-60K', timeline: '2-4 weeks', focus: 'DeFi, fast turnaround' },
    { name: 'Quantstamp', cost: '$20K-70K', timeline: '2-4 weeks', focus: 'Smart contracts' },
  ],
  community: [
    { name: 'Code4rena', cost: '$10K-50K', timeline: '1-2 weeks', focus: 'Competitive audit' },
    { name: 'Immunefi Bug Bounty', cost: 'Variable', timeline: 'Ongoing', focus: 'Continuous' },
    { name: 'Spearbit', cost: '$15K-60K', timeline: '1-3 weeks', focus: 'Security researcher network' },
  ],
};

// Audit checklist (automated checks)
export function runBasicChecks(contractInfo: {
  solidityVersion: string;
  hasTests: boolean;
  testCoverage: number;
  usesOpenZeppelin: boolean;
  hasPauseFunction: boolean;
  hasMultisig: boolean;
}): { passed: number; failed: number; warnings: number; checks: any[] } {
  const checks = [
    {
      name: 'Solidity version >= 0.8.0',
      passed: parseFloat(contractInfo.solidityVersion) >= 0.8,
      severity: 'high',
    },
    {
      name: 'Has tests',
      passed: contractInfo.hasTests,
      severity: 'critical',
    },
    {
      name: 'Test coverage >= 80%',
      passed: contractInfo.testCoverage >= 80,
      severity: 'high',
    },
    {
      name: 'Uses OpenZeppelin',
      passed: contractInfo.usesOpenZeppelin,
      severity: 'medium',
    },
    {
      name: 'Has pause mechanism',
      passed: contractInfo.hasPauseFunction,
      severity: 'medium',
    },
    {
      name: 'Uses multisig for admin',
      passed: contractInfo.hasMultisig,
      severity: 'high',
    },
  ];

  const passed = checks.filter((c) => c.passed).length;
  const failed = checks.filter((c) => !c.passed && c.severity === 'critical').length;
  const warnings = checks.filter((c) => !c.passed && c.severity !== 'critical').length;

  return { passed, failed, warnings, checks };
}
