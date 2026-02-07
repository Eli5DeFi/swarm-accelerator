/**
 * GET /api/ags/ideas
 * Browse AI-generated startup ideas
 * 
 * Auth: Public
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse query parameters
    const status = searchParams.get('status') || 'PUBLISHED';
    const minScore = parseInt(searchParams.get('minScore') || '85');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Validate status
    const validStatuses = ['DRAFT', 'PUBLISHED', 'IN_PROGRESS', 'LAUNCHED', 'ARCHIVED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Build query
    const where = {
      status: status as any,
      score: {
        gte: minScore
      }
    };

    // Fetch ideas
    const [ideas, total] = await Promise.all([
      prisma.generatedIdea.findMany({
        where,
        select: {
          id: true,
          name: true,
          tagline: true,
          marketTam: true,
          marketGrowth: true,
          marketSegment: true,
          revenueModel: true,
          techStack: true,
          score: true,
          generatedAt: true,
          status: true,
          _count: {
            select: {
              applications: true
            }
          }
        },
        orderBy: [
          { score: 'desc' },
          { generatedAt: 'desc' }
        ],
        take: limit,
        skip: offset
      }),
      prisma.generatedIdea.count({ where })
    ]);

    // Format response
    const formatted = ideas.map(idea => ({
      id: idea.id,
      name: idea.name,
      tagline: idea.tagline,
      market: {
        tam: idea.marketTam,
        growth: idea.marketGrowth,
        segment: idea.marketSegment
      },
      revenueModel: idea.revenueModel,
      techStack: JSON.parse(idea.techStack),
      score: idea.score,
      generatedAt: idea.generatedAt,
      status: idea.status,
      applicationsCount: idea._count.applications
    }));

    return NextResponse.json({
      ideas: formatted,
      total,
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });

  } catch (error) {
    console.error('AGS browse error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ideas', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
