/**
 * Health check endpoint for monitoring and uptime
 * 
 * @route GET /api/health
 * @returns Service health status with database connectivity check
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check database connectivity
    let dbStatus = 'unknown';
    let dbLatency = 0;
    
    try {
      const start = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      dbLatency = Date.now() - start;
      dbStatus = 'ok';
    } catch (dbError) {
      logger.error('Database health check failed:', dbError);
      dbStatus = 'error';
    }

    const isHealthy = dbStatus === 'ok';
    const statusCode = isHealthy ? 200 : 503;

    return NextResponse.json({
      status: isHealthy ? 'ok' : 'degraded',
      service: 'VentureClaw',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV,
      uptime: process.uptime(),
      database: {
        status: dbStatus,
        latency: dbLatency > 0 ? `${dbLatency}ms` : 'N/A',
      },
      features: {
        auth: true,
        pitch_submission: true,
        ai_analysis: true,
        dashboard: true,
        web3: true,
      },
      deployment: {
        commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'local',
        branch: process.env.VERCEL_GIT_COMMIT_REF || 'unknown',
        url: process.env.VERCEL_URL || 'localhost',
      },
    }, { status: statusCode });
    
  } catch (error) {
    logger.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'error',
      service: 'VentureClaw',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 503 });
  }
}
