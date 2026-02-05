/**
 * Tests for funding API route (v1)
 * @file src/app/api/v1/funding/route.test.ts
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from './route';
import { prisma } from '@/lib/prisma';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    funding: {
      findUnique: vi.fn(),
    },
    startup: {
      findUnique: vi.fn(),
    },
  },
}));

describe('GET /api/v1/funding', () => {
  const mockApiKey = 'sk_test_12345';
  const mockUserId = 'user-123';
  const validFundingId = '550e8400-e29b-41d4-a716-446655440000';
  const validPitchId = '550e8400-e29b-41d4-a716-446655440001';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 without API key', async () => {
    const request = new Request(
      `http://localhost:3000/api/v1/funding?fundingId=${validFundingId}`
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Invalid or missing API key');
  });

  it('should return 401 with invalid API key', async () => {
    (prisma.user.findUnique as any).mockResolvedValue(null);

    const request = new Request(
      `http://localhost:3000/api/v1/funding?fundingId=${validFundingId}`,
      {
        headers: {
          Authorization: 'Bearer invalid_key',
        },
      }
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Invalid or missing API key');
  });

  it('should return 400 without fundingId or pitchId', async () => {
    (prisma.user.findUnique as any).mockResolvedValue({ id: mockUserId });

    const request = new Request('http://localhost:3000/api/v1/funding', {
      headers: {
        Authorization: `Bearer ${mockApiKey}`,
      },
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('fundingId or pitchId query parameter required');
  });

  it('should reject invalid UUID format for fundingId', async () => {
    (prisma.user.findUnique as any).mockResolvedValue({ id: mockUserId });

    const request = new Request(
      'http://localhost:3000/api/v1/funding?fundingId=invalid-uuid',
      {
        headers: {
          Authorization: `Bearer ${mockApiKey}`,
        },
      }
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Invalid fundingId format');
  });

  it('should reject invalid UUID format for pitchId', async () => {
    (prisma.user.findUnique as any).mockResolvedValue({ id: mockUserId });

    const request = new Request(
      'http://localhost:3000/api/v1/funding?pitchId=not-a-uuid',
      {
        headers: {
          Authorization: `Bearer ${mockApiKey}`,
        },
      }
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Invalid pitchId format');
  });

  it('should return funding details by fundingId', async () => {
    const mockFunding = {
      id: validFundingId,
      dealAmount: 100000,
      equityPercent: 10,
      dealType: 'SAFE',
      status: 'active',
      totalReleased: 20000,
      acceptedAt: new Date('2026-01-01'),
      startup: {
        id: validPitchId,
        name: 'Test Startup',
        userId: mockUserId,
      },
      milestones: [
        {
          id: 'milestone-1',
          number: 1,
          description: 'First milestone',
          amount: 20000,
          dueDate: new Date('2026-03-01'),
          status: 'completed',
          completedAt: new Date('2026-02-28'),
          verifiedAt: new Date('2026-03-01'),
          txHash: '0x123...',
        },
        {
          id: 'milestone-2',
          number: 2,
          description: 'Second milestone',
          amount: 30000,
          dueDate: new Date('2026-06-01'),
          status: 'pending',
          completedAt: null,
          verifiedAt: null,
          txHash: null,
        },
      ],
    };

    (prisma.user.findUnique as any).mockResolvedValue({ id: mockUserId });
    (prisma.funding.findUnique as any).mockResolvedValue(mockFunding);

    const request = new Request(
      `http://localhost:3000/api/v1/funding?fundingId=${validFundingId}`,
      {
        headers: {
          Authorization: `Bearer ${mockApiKey}`,
        },
      }
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.funding.id).toBe(validFundingId);
    expect(data.funding.dealAmount).toBe(100000);
    expect(data.funding.progress.completedMilestones).toBe(1);
    expect(data.funding.progress.totalMilestones).toBe(2);
    expect(data.funding.progress.progressPercent).toBe(50);
  });

  it('should return 404 for non-existent funding', async () => {
    (prisma.user.findUnique as any).mockResolvedValue({ id: mockUserId });
    (prisma.funding.findUnique as any).mockResolvedValue(null);

    const request = new Request(
      `http://localhost:3000/api/v1/funding?fundingId=${validFundingId}`,
      {
        headers: {
          Authorization: `Bearer ${mockApiKey}`,
        },
      }
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Funding not found');
  });

  it('should prevent access to another user\'s funding', async () => {
    const mockFunding = {
      id: validFundingId,
      startup: {
        id: validPitchId,
        name: 'Test Startup',
        userId: 'different-user-id', // Different user
      },
      milestones: [],
    };

    (prisma.user.findUnique as any).mockResolvedValue({ id: mockUserId });
    (prisma.funding.findUnique as any).mockResolvedValue(mockFunding);

    const request = new Request(
      `http://localhost:3000/api/v1/funding?fundingId=${validFundingId}`,
      {
        headers: {
          Authorization: `Bearer ${mockApiKey}`,
        },
      }
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Funding not found');
  });
});
