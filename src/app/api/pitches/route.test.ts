/**
 * Tests for pitches API route
 * @file src/app/api/pitches/route.test.ts
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST, GET } from './route';
import { prisma } from '@/lib/prisma';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    startup: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

vi.mock('@/lib/agents/orchestrator-optimized', () => ({
  analyzeStartupOptimized: vi.fn(() => Promise.resolve()),
}));

vi.mock('@/lib/security/anti-sybil', () => ({
  performSecurityCheck: vi.fn(() =>
    Promise.resolve({ passed: true, severity: 'low', issues: [] })
  ),
  logSecurityEvent: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn(() => null), // No rate limit for tests
}));

vi.mock('@/lib/cache', () => ({
  withCache: vi.fn((key, fn) => fn()), // Skip cache for tests
}));

describe('POST /api/pitches', () => {
  const validPitchData = {
    name: 'Test Startup',
    tagline: 'Revolutionizing the test industry',
    description:
      'A comprehensive description of our amazing startup that will change the world. ' +
      'We have a strong team and a clear vision for success.',
    stage: 'MVP',
    industry: 'Technology',
    fundingAsk: 500000,
    teamSize: 5,
    founderName: 'John Doe',
    founderEmail: 'john@test.com',
    website: 'https://test.com',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a pitch with valid data', async () => {
    const mockStartup = {
      id: 'startup-123',
      ...validPitchData,
      status: 'PENDING',
      createdAt: new Date(),
    };

    (prisma.startup.create as any).mockResolvedValue(mockStartup);

    const request = new Request('http://localhost:3000/api/pitches', {
      method: 'POST',
      body: JSON.stringify(validPitchData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.startupId).toBe('startup-123');
    expect(data.message).toContain('Analysis in progress');
  });

  it('should reject pitch with missing required fields', async () => {
    const invalidData = {
      name: 'Test',
      // Missing required fields
    };

    const request = new Request('http://localhost:3000/api/pitches', {
      method: 'POST',
      body: JSON.stringify(invalidData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Validation failed');
    expect(data.details).toBeDefined();
  });

  it('should reject pitch with invalid stage', async () => {
    const invalidData = {
      ...validPitchData,
      stage: 'INVALID_STAGE',
    };

    const request = new Request('http://localhost:3000/api/pitches', {
      method: 'POST',
      body: JSON.stringify(invalidData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
  });

  it('should reject pitch with too short description', async () => {
    const invalidData = {
      ...validPitchData,
      description: 'Too short',
    };

    const request = new Request('http://localhost:3000/api/pitches', {
      method: 'POST',
      body: JSON.stringify(invalidData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
  });

  it('should reject pitch with invalid email', async () => {
    const invalidData = {
      ...validPitchData,
      founderEmail: 'not-an-email',
    };

    const request = new Request('http://localhost:3000/api/pitches', {
      method: 'POST',
      body: JSON.stringify(invalidData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
  });

  it('should reject pitch with funding ask too low', async () => {
    const invalidData = {
      ...validPitchData,
      fundingAsk: 5000, // Below minimum
    };

    const request = new Request('http://localhost:3000/api/pitches', {
      method: 'POST',
      body: JSON.stringify(invalidData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
  });
});

describe('GET /api/pitches', () => {
  const mockStartups = [
    {
      id: 'startup-1',
      name: 'Startup 1',
      status: 'APPROVED',
      createdAt: new Date('2026-01-01'),
      analysis: { score: 85 },
    },
    {
      id: 'startup-2',
      name: 'Startup 2',
      status: 'PENDING',
      createdAt: new Date('2026-01-02'),
      analysis: null,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return all pitches without filter', async () => {
    (prisma.startup.findMany as any).mockResolvedValue(mockStartups);
    (prisma.startup.count as any).mockResolvedValue(2);

    const request = new Request('http://localhost:3000/api/pitches');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(2);
    expect(data.pagination.total).toBe(2);
  });

  it('should filter pitches by status', async () => {
    const approvedStartups = mockStartups.filter((s) => s.status === 'APPROVED');

    (prisma.startup.findMany as any).mockResolvedValue(approvedStartups);
    (prisma.startup.count as any).mockResolvedValue(1);

    const request = new Request(
      'http://localhost:3000/api/pitches?status=APPROVED'
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(1);
    expect(data.data[0].status).toBe('APPROVED');
  });

  it('should handle pagination', async () => {
    (prisma.startup.findMany as any).mockResolvedValue([mockStartups[0]]);
    (prisma.startup.count as any).mockResolvedValue(2);

    const request = new Request(
      'http://localhost:3000/api/pitches?limit=1&offset=0'
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.pagination.limit).toBe(1);
    expect(data.pagination.offset).toBe(0);
    expect(data.pagination.hasMore).toBe(true);
  });

  it('should handle errors gracefully', async () => {
    (prisma.startup.findMany as any).mockRejectedValue(
      new Error('Database error')
    );

    const request = new Request('http://localhost:3000/api/pitches');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Failed to fetch pitches');
  });
});
