/**
 * POST /api/ags/generate
 * Generate new batch of AI startup ideas
 * 
 * Auth: Admin only (API key required)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { IdeaGenerator } from '@/lib/ags/idea-generator';

export async function POST(request: NextRequest) {
  try {
    // Check API key
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing API key' },
        { status: 401 }
      );
    }

    // Verify admin user
    const user = await prisma.user.findUnique({
      where: { apiKey },
      select: { id: true, email: true, tier: true }
    });

    if (!user || user.tier !== 'enterprise') {
      return NextResponse.json(
        { error: 'Unauthorized (admin only)' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const count = body.count || 10;

    if (count < 1 || count > 100) {
      return NextResponse.json(
        { error: 'Count must be between 1 and 100' },
        { status: 400 }
      );
    }

    console.log(`🧬 Generating ${count} startup ideas...`);

    // Generate ideas
    const generator = new IdeaGenerator();
    const ideas = await generator.generateBatch(count);

    // Score and save ideas
    const results = [];
    let validatedCount = 0;
    let totalScore = 0;
    let topScore = 0;

    for (const idea of ideas) {
      // Score idea
      const score = await generator.scoreIdea(idea);
      totalScore += score;
      if (score > topScore) topScore = score;

      // Save to database
      const savedIdea = await prisma.generatedIdea.create({
        data: {
          name: idea.name,
          tagline: idea.tagline,
          problem: idea.problem,
          solution: idea.solution,
          marketTam: idea.market.tam,
          marketGrowth: idea.market.growthRate,
          marketSegment: idea.market.segment,
          moat: idea.moat,
          revenueModel: idea.revenueModel,
          targetCustomer: idea.targetCustomer,
          metrics: JSON.stringify(idea.metrics),
          timeline: JSON.stringify(idea.timeline),
          techStack: JSON.stringify(idea.techStack),
          competitiveAdvantage: idea.competitiveAdvantage,
          score,
          status: score >= 85 ? 'PUBLISHED' : 'DRAFT'
        }
      });

      if (score >= 85) {
        validatedCount++;
        results.push({
          id: savedIdea.id,
          name: savedIdea.name,
          tagline: savedIdea.tagline,
          score
        });
      }

      console.log(`  ✓ ${idea.name} (${score}/100) ${score >= 85 ? '⭐ VALIDATED' : ''}`);
    }

    const avgScore = Math.round(totalScore / count * 10) / 10;

    console.log(`✅ Generated ${count} ideas, validated ${validatedCount}`);

    return NextResponse.json({
      success: true,
      generated: count,
      validated: validatedCount,
      avgScore,
      topScore,
      ideas: results
    });

  } catch (error) {
    console.error('AGS generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate ideas', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
