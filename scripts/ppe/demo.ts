/**
 * Predictive Pivot Engine (PPE) Demo
 * 
 * Demonstrates full workflow:
 * 1. Extract assumptions from pitch
 * 2. Predict failure probability
 * 3. Generate pivot recommendations
 * 4. Simulate pivots
 * 5. Compare and recommend
 */

import { extractAssumptions } from '../../src/lib/ppe/assumption-extractor';
import { predictFailure, generateWarnings, analyzeFailurePatterns } from '../../src/lib/ppe/failure-predictor';
import { generatePivotRecommendations, rankPivots } from '../../src/lib/ppe/pivot-recommender';
import { simulatePivot, comparePivots, generateSimulationReport } from '../../src/lib/ppe/simulator';

async function main() {
  console.log('🧠 Predictive Pivot Engine (PPE) Demo\n');
  console.log('=====================================\n');

  // Sample startup data
  const startupId = 'demo-startup-123';
  const pitchText = `
We're building CodeGuard, an AI-powered code review platform for developers.

**Problem:** Manual code reviews take 2-4 hours per PR, slowing down shipping velocity.

**Solution:** Our AI reviews code in 30 seconds, catching bugs, security issues, and style violations.

**Market:** 10 million professional developers × $100/year = $1B TAM

**Business Model:**
- Pricing: $50/month per developer
- Sales: Self-service signup via Google Ads
- CAC: We estimate $5 per signup via targeted ads

**Traction:**
- Launched 6 months ago
- 100 signups (mostly free tier)
- 0 paying customers so far (still validating)
- $25 CAC (actual, from Google Ads)

**Funding Ask:** $500K to scale marketing and hire 2 engineers

**Team:** 2 technical co-founders (ex-Google)
`.trim();

  const pitchData = {
    name: 'CodeGuard',
    tagline: 'AI code review in 30 seconds',
    description: 'Automated code review platform using AI',
    stage: 'PRE_SEED' as const,
    fundingAsk: 50000000, // $500K in cents
    teamSize: 2,
  };

  const metrics = {
    monthsActive: 6,
    revenue: 0,
    mrr: 0,
    users: 100,
    cac: 25, // 5x higher than assumption
    churnRate: 0.08,
    cashRemaining: 200000,
    monthlyBurn: 40000,
    teamSize: 2,
    fundingRaised: 500000,
  };

  // Step 1: Extract Assumptions
  console.log('📝 Step 1: Extracting Assumptions\n');
  console.log('Analyzing pitch deck...\n');
  
  const extractionResult = await extractAssumptions(startupId, pitchText, pitchData);
  
  console.log(`✅ Extracted ${extractionResult.assumptions.length} assumptions`);
  console.log(`⚠️ Risk Score: ${extractionResult.riskScore}/100\n`);
  console.log('Top Assumptions:');
  extractionResult.assumptions.slice(0, 5).forEach((a, i) => {
    console.log(`  ${i + 1}. [${a.type}] ${a.statement}`);
    console.log(`     Value: ${a.value} ${a.unit || ''} (confidence: ${a.confidence}%)`);
  });
  console.log();

  // Step 2: Predict Failure
  console.log('\n🔮 Step 2: Predicting Failure Probability\n');
  console.log('Analyzing metrics vs assumptions...\n');

  const prediction = await predictFailure(
    startupId,
    extractionResult.assumptions,
    metrics
  );

  console.log(`❌ Failure Probability: ${prediction.failureProbability}%`);
  console.log(`⏱️  Time to Failure: ${prediction.timeToFailure || 'Unknown'} months`);
  console.log(`📊 Primary Reason: ${prediction.primaryReason}`);
  console.log(`🎯 Confidence: ${prediction.confidence}%\n`);
  console.log('Risk Factors:');
  prediction.riskFactors.forEach((rf, i) => {
    const emoji = rf.severity === 'critical' ? '🔴' : rf.severity === 'high' ? '🟠' : '🟡';
    console.log(`  ${emoji} [${rf.severity.toUpperCase()}] ${rf.description} (impact: ${rf.impact})`);
  });

  // Warnings
  const warnings = generateWarnings(prediction, metrics);
  if (warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    warnings.forEach((w) => {
      const emoji = w.level === 'critical' ? '🚨' : '⚠️';
      console.log(`  ${emoji} ${w.message}`);
      console.log(`     → ${w.action}`);
    });
  }

  // Historical patterns
  const patterns = await analyzeFailurePatterns(extractionResult.assumptions, metrics);
  console.log(`\n📚 Similar Failures in History: ${patterns.similarFailures}`);
  if (patterns.commonPatterns.length > 0) {
    console.log('Common Patterns:');
    patterns.commonPatterns.forEach((p) => console.log(`  - ${p}`));
  }

  // Step 3: Generate Pivot Recommendations
  console.log('\n\n💡 Step 3: Generating Pivot Recommendations\n');
  console.log('Finding optimal pivots...\n');

  const pivots = await generatePivotRecommendations(
    startupId,
    pitchData,
    prediction,
    extractionResult.assumptions,
    metrics
  );

  console.log(`✅ Generated ${pivots.length} pivot recommendations\n`);
  pivots.forEach((pivot, i) => {
    console.log(`${i + 1}. ${pivot.title}`);
    console.log(`   Type: ${pivot.pivotType}`);
    console.log(`   Success Probability: ${pivot.successProbability}%`);
    console.log(`   Expected MRR: $${pivot.metrics.expectedMRR}`);
    console.log(`   Cost: $${pivot.estimatedCost} | Timeline: ${pivot.timeline} weeks`);
    console.log(`   Runway Extension: +${pivot.metrics.expectedRunwayExtension} months`);
    if (pivot.caseStudies.length > 0) {
      const cs = pivot.caseStudies[0];
      console.log(`   📖 Case Study: ${cs.companyName} (${cs.outcome})`);
    }
    console.log();
  });

  // Step 4: Simulate Top Pivot
  console.log('\n🎲 Step 4: Simulating Top Pivot (1,000 scenarios)\n');
  const topPivot = pivots[0];
  console.log(`Simulating: "${topPivot.title}"\n`);
  console.log('Running Monte Carlo simulation...');

  const simulation = await simulatePivot(topPivot, metrics, 1000);

  console.log('\n📊 Simulation Results:');
  console.log(`   Scenarios Run: 1,000`);
  console.log(`   Confidence: ${simulation.confidence}%\n`);
  console.log('Outcomes:');
  console.log(`   ✅ Success: ${simulation.outcomes.success.toFixed(1)}%`);
  console.log(`   ⚖️  Breakeven: ${simulation.outcomes.breakeven.toFixed(1)}%`);
  console.log(`   ❌ Failure: ${simulation.outcomes.failure.toFixed(1)}%\n`);
  console.log('Projections:');
  console.log(`   Month 1:  $${Math.floor(simulation.projections.month1.revenue)} MRR | ${Math.floor(simulation.projections.month1.users)} users | $${Math.floor(simulation.projections.month1.cashRemaining)} cash`);
  console.log(`   Month 3:  $${Math.floor(simulation.projections.month3.revenue)} MRR | ${Math.floor(simulation.projections.month3.users)} users | $${Math.floor(simulation.projections.month3.cashRemaining)} cash`);
  console.log(`   Month 6:  $${Math.floor(simulation.projections.month6.revenue)} MRR | ${Math.floor(simulation.projections.month6.users)} users | $${Math.floor(simulation.projections.month6.cashRemaining)} cash`);
  console.log(`   Month 12: $${Math.floor(simulation.projections.month12.revenue)} MRR | ${Math.floor(simulation.projections.month12.users)} users | $${Math.floor(simulation.projections.month12.cashRemaining)} cash\n`);
  console.log('Risk Analysis:');
  console.log(`   Best Case (90th %ile):  $${Math.floor(simulation.riskAnalysis.bestCase.cashRemaining)} remaining`);
  console.log(`   Most Likely (median):   $${Math.floor(simulation.riskAnalysis.mostLikely.cashRemaining)} remaining`);
  console.log(`   Worst Case (10th %ile): $${Math.floor(simulation.riskAnalysis.worstCase.cashRemaining)} remaining`);
  console.log(`   Variance: ${Math.floor(simulation.riskAnalysis.variance)}\n`);
  console.log(`Recommendation: ${simulation.recommendation.toUpperCase()}`);

  const emoji = simulation.recommendation === 'proceed' ? '✅' : simulation.recommendation === 'caution' ? '⚠️' : '❌';
  console.log(`${emoji} ${
    simulation.recommendation === 'proceed' 
      ? 'Strong recommendation to proceed. High success probability with acceptable risk.'
      : simulation.recommendation === 'caution'
      ? 'Proceed with caution. Success is possible but not guaranteed.'
      : 'High risk of failure. Consider alternative pivots or prepare for shutdown.'
  }`);

  // Step 5: Compare All Pivots
  if (pivots.length > 1) {
    console.log('\n\n📊 Step 5: Comparing All Pivots\n');
    console.log('Running simulations for all pivots (500 scenarios each)...\n');

    const comparison = await comparePivots(pivots, metrics, 500);

    console.log('Rankings:\n');
    comparison.rankings.forEach((r) => {
      const medal = r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : '  ';
      console.log(`${medal} #${r.rank}: ${r.pivot.title}`);
      console.log(`     Score: ${r.score.toFixed(1)} | Success Rate: ${r.simulation.outcomes.success.toFixed(1)}% | Month 12 MRR: $${Math.floor(r.simulation.projections.month12.revenue)}`);
    });

    console.log('\n\n🎯 Final Recommendation:\n');
    console.log(`✅ ${comparison.recommendation.topPivot.title}\n`);
    console.log(comparison.recommendation.rationale);

    if (comparison.recommendation.alternatives.length > 0) {
      console.log('\n📋 Alternatives to Consider:');
      comparison.recommendation.alternatives.forEach((alt, i) => {
        console.log(`   ${i + 1}. ${alt.title} (${alt.successProbability}% success probability)`);
      });
    }
  }

  // Summary
  console.log('\n\n════════════════════════════════════════════════════════\n');
  console.log('🎉 Demo Complete!\n');
  console.log('Summary:');
  console.log(`  • Extracted ${extractionResult.assumptions.length} assumptions`);
  console.log(`  • Predicted ${prediction.failureProbability}% failure probability`);
  console.log(`  • Generated ${pivots.length} pivot recommendations`);
  console.log(`  • Simulated ${pivots.length} pivots (${pivots.length * 500} scenarios total)`);
  console.log(`  • Top pivot: ${pivots[0].title} (${simulation.outcomes.success.toFixed(1)}% success rate)\n`);
  console.log('Next steps:');
  console.log('  1. Integrate PPE into VentureClaw dashboard');
  console.log('  2. Set up automated monthly checks for all portfolio companies');
  console.log('  3. Track pivot acceptance rate and success outcomes');
  console.log('  4. Train ML models on historical portfolio data\n');
  console.log('════════════════════════════════════════════════════════\n');
}

// Run demo
main().catch((error) => {
  console.error('❌ Demo failed:', error);
  process.exit(1);
});
