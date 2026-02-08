/**
 * Tests for health check endpoint
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { prisma } from '@/lib/prisma';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    $queryRaw: vi.fn(),
  },
}));

describe('GET /api/health', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return healthy status when database is connected', async () => {
    // Mock successful database query
    vi.mocked(prisma.$queryRaw).mockResolvedValue([1]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('ok');
    expect(data.service).toBe('VentureClaw');
    expect(data.database.status).toBe('ok');
    // Latency should be present (either ms or N/A if timing failed)
    expect(data.database.latency).toBeDefined();
  });

  it('should return degraded status when database fails', async () => {
    // Mock database error
    vi.mocked(prisma.$queryRaw).mockRejectedValue(new Error('Database connection failed'));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.status).toBe('degraded');
    expect(data.database.status).toBe('error');
  });

  it('should include service metadata', async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValue([1]);

    const response = await GET();
    const data = await response.json();

    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('version');
    expect(data).toHaveProperty('environment');
    expect(data).toHaveProperty('uptime');
    expect(data.features).toBeDefined();
    expect(data.deployment).toBeDefined();
  });

  it('should check all feature flags', async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValue([1]);

    const response = await GET();
    const data = await response.json();

    expect(data.features).toEqual({
      auth: true,
      pitch_submission: true,
      ai_analysis: true,
      dashboard: true,
      web3: true,
    });
  });

  it('should include deployment information', async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValue([1]);

    const response = await GET();
    const data = await response.json();

    expect(data.deployment).toHaveProperty('commit');
    expect(data.deployment).toHaveProperty('branch');
    expect(data.deployment).toHaveProperty('url');
  });

  it('should handle complete failure gracefully', async () => {
    // Mock complete failure (even the try-catch wrapper)
    vi.mocked(prisma.$queryRaw).mockImplementation(() => {
      throw new Error('Critical error');
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.status).toBe('degraded');
  });

  it('should measure database latency', async () => {
    // Mock slow database
    vi.mocked(prisma.$queryRaw).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve([1]), 100))
    );

    const response = await GET();
    const data = await response.json();

    expect(data.database.status).toBe('ok');
    
    // Extract latency value (e.g., "105ms" -> 105)
    const latencyMatch = data.database.latency.match(/(\d+)ms/);
    expect(latencyMatch).toBeTruthy();
    
    const latency = parseInt(latencyMatch![1]);
    expect(latency).toBeGreaterThanOrEqual(100);
  });

  it('should include timestamp in ISO format', async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValue([1]);

    const response = await GET();
    const data = await response.json();

    // Check if timestamp is valid ISO 8601
    const timestamp = new Date(data.timestamp);
    expect(timestamp.toISOString()).toBe(data.timestamp);
  });

  it('should set correct status code for degraded service', async () => {
    vi.mocked(prisma.$queryRaw).mockRejectedValue(new Error('DB down'));

    const response = await GET();

    // 503 Service Unavailable for degraded state
    expect(response.status).toBe(503);
  });

  it('should handle database timeout', async () => {
    // Mock database timeout (faster for testing)
    vi.mocked(prisma.$queryRaw).mockRejectedValue(new Error('Connection timeout'));

    const response = await GET();
    const data = await response.json();

    expect(data.database.status).toBe('error');
    expect(response.status).toBe(503);
  });
});
