import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'VentureClaw',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    uptime: process.uptime(),
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
  });
}
