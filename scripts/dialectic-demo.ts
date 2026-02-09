/**
 * DIALECTIC Demo Script
 * 
 * Demonstrates the full DIALECTIC pipeline with a sample startup.
 */

import { runDialecticPipeline, quickEvaluate, formatResults } from '../src/lib/dialectic/pipeline';
import type { Company } from '../src/lib/dialectic/types';

async function main() {
  console.log('🔬 DIALECTIC Demo - Startup Evaluation Pipeline\n');
  console.log('='.repeat(70));
  console.log('');

  // Sample company
  const company: Company = {
    name: 'Acme AI',
    industry: 'Enterprise AI',
    description: 'AI-powered customer support automation for enterprise SaaS companies. Uses GPT-5 to handle 80% of tier-1 support tickets automatically.',
    stage: 'seed',
    founder: 'Sarah Chen (ex-Zendesk, ex-OpenAI)',
    website: 'https://acmeai.com',
    metadata: {
      founded: '2025',
      employees: 8,
      revenue: '$50K MRR',
      customers: 15,
    },
  };

  console.log('📋 Company Profile:');
  console.log(`   Name: ${company.name}`);
  console.log(`   Industry: ${company.industry}`);
  console.log(`   Stage: ${company.stage}`);
  console.log(`   Founder: ${company.founder}`);
  console.log(`   Description: ${company.description}`);
  console.log('');
  console.log('='.repeat(70));
  console.log('');

  try {
    console.log('🚀 Running Quick Evaluation (2 pro + 2 contra, 1 iteration)...\n');
    
    const startTime = Date.now();
    const result = await quickEvaluate(company);
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log('');
    console.log('='.repeat(70));
    console.log('');
    console.log('✅ Evaluation Complete!');
    console.log('');
    console.log(formatResults(result));
    console.log('');
    console.log('='.repeat(70));
    console.log('');
    console.log(`⏱️  Duration: ${duration}s`);
    console.log(`📊 Final Score: ${result.finalScore?.toFixed(1) || 'N/A'}/140`);
    console.log(`🎯 Decision: ${result.finalDecision?.toUpperCase() || 'N/A'}`);
    console.log(`💬 Arguments: ${result.finalArguments.length}`);
    console.log(`🔄 Iterations: ${result.argumentsHistory.length}`);
    console.log('');

    // Show detailed breakdown
    console.log('='.repeat(70));
    console.log('📈 Detailed Breakdown:');
    console.log('');
    
    const proArgs = result.finalArguments.filter(arg => arg.argumentType === 'pro');
    const contraArgs = result.finalArguments.filter(arg => arg.argumentType === 'contra');
    const avgProScore = proArgs.reduce((sum, arg) => sum + (arg.score || 0), 0) / (proArgs.length || 1);
    const avgContraScore = contraArgs.reduce((sum, arg) => sum + (arg.score || 0), 0) / (contraArgs.length || 1);

    console.log(`   Pro Arguments: ${proArgs.length} (avg score: ${avgProScore.toFixed(1)})`);
    console.log(`   Contra Arguments: ${contraArgs.length} (avg score: ${avgContraScore.toFixed(1)})`);
    console.log('');

    // Futarchy trigger check
    if (result.finalScore && result.finalScore > 85) {
      console.log('🎰 Futarchy Market Trigger: SCORE > 85 ✅');
      console.log('   → Create prediction market for this startup');
      console.log('');
    } else {
      console.log('🎰 Futarchy Market Trigger: Score < 85 (no market)');
      console.log('');
    }

    console.log('='.repeat(70));
    console.log('');
    console.log('✨ Demo complete!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Replace LLM mocks with real OpenClaw AI client');
    console.log('2. Integrate web_search tool');
    console.log('3. Test with 10 real pitches');
    console.log('4. Wire into VentureClaw shark pipeline');
    console.log('');

  } catch (error) {
    console.error('❌ Demo failed:', error);
    process.exit(1);
  }
}

main();
