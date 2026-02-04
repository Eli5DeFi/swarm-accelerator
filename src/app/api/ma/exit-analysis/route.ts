// API Route: M&A Exit Analysis
// POST /api/ma/exit-analysis - Run comprehensive exit analysis

import { NextRequest, NextResponse } from 'next/server';
import {
  orchestrateExitAnalysis,
  type ExitAnalysisInput,
} from '@/lib/agents/ma/ma-orchestrator';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const required = [
      'name',
      'industry',
      'stage',
      'revenue',
      'revenueGrowth',
      'employeeCount',
      'founderOwnership',
    ];

    for (const field of required) {
      if (body[field] === undefined) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create exit analysis record
    const exitAnalysis = await prisma.exitAnalysis.create({
      data: {
        companyName: body.name,
        industry: body.industry,
        stage: body.stage,
        revenue: body.revenue,
        status: 'analyzing',
      },
    });

    // Build input for orchestrator
    const input: ExitAnalysisInput = {
      name: body.name,
      industry: body.industry,
      stage: body.stage,
      founded: body.founded || '2020-01-01',
      revenue: body.revenue,
      revenueGrowth: body.revenueGrowth,
      ebitda: body.ebitda || body.revenue * 0.1,
      ebitdaMargin: body.ebitdaMargin || 10,
      arr: body.arr || body.revenue,
      burnRate: body.burnRate || 0,
      cashPosition: body.cashPosition || body.revenue * 2,
      runway: body.runway || 24,
      customerCount: body.customerCount || 100,
      ltv: body.ltv || 10000,
      cac: body.cac || 1000,
      churnRate: body.churnRate || 5,
      employeeCount: body.employeeCount,
      foundersStaying: body.foundersStaying ?? true,
      technology: body.technology || 'Web application',
      hasIP: body.hasIP ?? false,
      moat: body.moat || 'Network effects, brand',
      founderOwnership: body.founderOwnership,
      investorOwnership: body.investorOwnership || 100 - body.founderOwnership,
      totalRaised: body.totalRaised || 0,
      lastValuation: body.lastValuation || body.revenue * 10,
      liquidationPreference: body.liquidationPreference || body.totalRaised,
      hasLitigation: body.hasLitigation ?? false,
      hasDebt: body.hasDebt ?? false,
      hasPreferredStock: body.hasPreferredStock ?? false,
      geography: body.geography || ['United States'],
      hasForeignSubsidiaries: body.hasForeignSubsidiaries ?? false,
      targetExitValue: body.targetExitValue || body.revenue * 10,
      timelinePressure: body.timelinePressure || 'moderate',
      preferredAcquirerType: body.preferredAcquirerType,
    };

    console.log('[API] Starting M&A exit analysis for:', body.name);

    // Run orchestrator
    const report = await orchestrateExitAnalysis(input);

    // Update database with results
    await prisma.exitAnalysis.update({
      where: { id: exitAnalysis.id },
      data: {
        status: 'complete',
        valuationLow: report.valuation.recommendedRange.low,
        valuationBase: report.valuation.recommendedRange.base,
        valuationHigh: report.valuation.recommendedRange.high,
        readinessScore: report.executiveSummary.readinessScore,
        recommendation: report.executiveSummary.recommendation,
        topAcquirers: report.acquirers.topAcquirers.slice(0, 10).map((a) => a.name),
        completedAt: new Date(),
      },
    });

    console.log('[API] M&A exit analysis complete');

    return NextResponse.json({
      success: true,
      analysisId: exitAnalysis.id,
      report,
    });
  } catch (error) {
    console.error('[API] Exit analysis error:', error);
    return NextResponse.json(
      {
        error: 'Failed to run exit analysis',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET /api/ma/exit-analysis?id=xxx - Retrieve existing analysis
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing analysis ID' }, { status: 400 });
    }

    const analysis = await prisma.exitAnalysis.findUnique({
      where: { id },
    });

    if (!analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, analysis });
  } catch (error) {
    console.error('[API] Get analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve analysis' },
      { status: 500 }
    );
  }
}
