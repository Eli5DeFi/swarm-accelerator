/**
 * GET /api/ags/ideas/[id]
 * Get single AI-generated startup idea details
 * 
 * Auth: Public
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch idea
    const idea = await prisma.generatedIdea.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            applications: true
          }
        }
      }
    });

    if (!idea) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      );
    }

    // Only show PUBLISHED, IN_PROGRESS, or LAUNCHED ideas
    if (idea.status === 'DRAFT' || idea.status === 'ARCHIVED') {
      return NextResponse.json(
        { error: 'Idea not available' },
        { status: 404 }
      );
    }

    // Format response
    const formatted = {
      id: idea.id,
      name: idea.name,
      tagline: idea.tagline,
      problem: idea.problem,
      solution: idea.solution,
      market: {
        tam: idea.marketTam,
        growth: idea.marketGrowth,
        segment: idea.marketSegment
      },
      moat: idea.moat,
      revenueModel: idea.revenueModel,
      targetCustomer: idea.targetCustomer,
      metrics: JSON.parse(idea.metrics),
      timeline: JSON.parse(idea.timeline),
      techStack: JSON.parse(idea.techStack),
      competitiveAdvantage: idea.competitiveAdvantage,
      score: idea.score,
      generatedAt: idea.generatedAt,
      status: idea.status,
      applicationsCount: idea._count.applications
    };

    return NextResponse.json(formatted);

  } catch (error) {
    console.error('AGS idea detail error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch idea', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
