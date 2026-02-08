/**
 * Tests for AGS idea generation endpoint
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { prisma } from '@/lib/prisma';
import { IdeaGenerator } from '@/lib/ags/idea-generator';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    generatedIdea: {
      create: vi.fn(),
    },
  },
}));

vi.mock('@/lib/ags/idea-generator', () => ({
  IdeaGenerator: vi.fn(),
}));

describe('POST /api/ags/generate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should require API key', async () => {
    const request = new Request('http://localhost:3000/api/ags/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ count: 5 }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Missing API key');
  });

  it('should require admin tier', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      tier: 'free', // Not admin
    } as any);

    const request = new Request('http://localhost:3000/api/ags/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'test-key',
      },
      body: JSON.stringify({ count: 5 }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Unauthorized (admin only)');
  });

  it('should validate count parameter', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'admin-1',
      email: 'admin@ventureclaw.com',
      tier: 'enterprise',
    } as any);

    const request = new Request('http://localhost:3000/api/ags/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'admin-key',
      },
      body: JSON.stringify({ count: 150 }), // Too high
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request body');
  });

  it('should validate count is a number', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'admin-1',
      email: 'admin@ventureclaw.com',
      tier: 'enterprise',
    } as any);

    const request = new Request('http://localhost:3000/api/ags/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'admin-key',
      },
      body: JSON.stringify({ count: '5' }), // String instead of number
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request body');
  });

  it('should use default count if not provided', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'admin-1',
      email: 'admin@ventureclaw.com',
      tier: 'enterprise',
    } as any);

    const mockIdea = {
      name: 'AI Startup',
      tagline: 'Revolutionary AI',
      problem: 'Problem X',
      solution: 'Solution Y',
      market: { tam: '1B', growthRate: '20%', segment: 'B2B' },
      moat: 'AI technology',
      revenueModel: 'SaaS',
      targetCustomer: 'Enterprises',
      metrics: [],
      timeline: [],
      techStack: [],
      competitiveAdvantage: 'First mover',
    };

    const mockGenerator = {
      generateBatch: vi.fn().mockResolvedValue([mockIdea]),
      scoreIdea: vi.fn().mockResolvedValue(90),
    };

    vi.mocked(IdeaGenerator).mockImplementation(() => mockGenerator as any);

    vi.mocked(prisma.generatedIdea.create).mockResolvedValue({
      id: 'idea-1',
      name: mockIdea.name,
      tagline: mockIdea.tagline,
      score: 90,
      status: 'PUBLISHED',
    } as any);

    const request = new Request('http://localhost:3000/api/ags/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'admin-key',
      },
      body: JSON.stringify({}), // No count provided
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockGenerator.generateBatch).toHaveBeenCalledWith(10); // Default
  });

  it('should generate ideas successfully', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'admin-1',
      email: 'admin@ventureclaw.com',
      tier: 'enterprise',
    } as any);

    const mockIdeas = [
      {
        name: 'AI Startup 1',
        tagline: 'Revolutionary AI 1',
        problem: 'Problem X',
        solution: 'Solution Y',
        market: { tam: '1B', growthRate: '20%', segment: 'B2B' },
        moat: 'AI technology',
        revenueModel: 'SaaS',
        targetCustomer: 'Enterprises',
        metrics: [],
        timeline: [],
        techStack: [],
        competitiveAdvantage: 'First mover',
      },
      {
        name: 'AI Startup 2',
        tagline: 'Revolutionary AI 2',
        problem: 'Problem X',
        solution: 'Solution Y',
        market: { tam: '1B', growthRate: '20%', segment: 'B2B' },
        moat: 'AI technology',
        revenueModel: 'SaaS',
        targetCustomer: 'Enterprises',
        metrics: [],
        timeline: [],
        techStack: [],
        competitiveAdvantage: 'First mover',
      },
    ];

    const mockGenerator = {
      generateBatch: vi.fn().mockResolvedValue(mockIdeas),
      scoreIdea: vi.fn()
        .mockResolvedValueOnce(90) // First idea: validated
        .mockResolvedValueOnce(75), // Second idea: not validated
    };

    vi.mocked(IdeaGenerator).mockImplementation(() => mockGenerator as any);

    vi.mocked(prisma.generatedIdea.create)
      .mockResolvedValueOnce({
        id: 'idea-1',
        name: 'AI Startup 1',
        tagline: 'Revolutionary AI 1',
        score: 90,
        status: 'PUBLISHED',
      } as any)
      .mockResolvedValueOnce({
        id: 'idea-2',
        name: 'AI Startup 2',
        tagline: 'Revolutionary AI 2',
        score: 75,
        status: 'DRAFT',
      } as any);

    const request = new Request('http://localhost:3000/api/ags/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'admin-key',
      },
      body: JSON.stringify({ count: 2 }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.generated).toBe(2);
    expect(data.validated).toBe(1); // Only score >= 85
    expect(data.avgScore).toBe(82.5);
    expect(data.topScore).toBe(90);
    expect(data.ideas).toHaveLength(1); // Only validated ideas returned
  });

  it('should handle LLM errors gracefully', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'admin-1',
      email: 'admin@ventureclaw.com',
      tier: 'enterprise',
    } as any);

    const mockGenerator = {
      generateBatch: vi.fn().mockRejectedValue(new Error('LLM API error')),
    };

    vi.mocked(IdeaGenerator).mockImplementation(() => mockGenerator as any);

    const request = new Request('http://localhost:3000/api/ags/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'admin-key',
      },
      body: JSON.stringify({ count: 5 }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to generate ideas');
    expect(data.details).toBe('LLM API error');
  });

  it('should calculate scores correctly', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'admin-1',
      email: 'admin@ventureclaw.com',
      tier: 'enterprise',
    } as any);

    const mockIdea = {
      name: 'Test Idea',
      tagline: 'Test tagline',
      problem: 'Problem',
      solution: 'Solution',
      market: { tam: '1B', growthRate: '20%', segment: 'B2B' },
      moat: 'Tech',
      revenueModel: 'SaaS',
      targetCustomer: 'B2B',
      metrics: [],
      timeline: [],
      techStack: [],
      competitiveAdvantage: 'First',
    };

    const mockGenerator = {
      generateBatch: vi.fn().mockResolvedValue([mockIdea, mockIdea, mockIdea]),
      scoreIdea: vi.fn()
        .mockResolvedValueOnce(95)
        .mockResolvedValueOnce(85)
        .mockResolvedValueOnce(70),
    };

    vi.mocked(IdeaGenerator).mockImplementation(() => mockGenerator as any);
    vi.mocked(prisma.generatedIdea.create).mockResolvedValue({} as any);

    const request = new Request('http://localhost:3000/api/ags/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'admin-key',
      },
      body: JSON.stringify({ count: 3 }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(data.avgScore).toBe(83.3); // (95 + 85 + 70) / 3 = 83.33...
    expect(data.topScore).toBe(95);
    expect(data.validated).toBe(2); // 95 and 85 are >= 85
  });

  it('should persist ideas to database with correct status', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'admin-1',
      email: 'admin@ventureclaw.com',
      tier: 'enterprise',
    } as any);

    const mockIdea = {
      name: 'Database Test',
      tagline: 'Test',
      problem: 'P',
      solution: 'S',
      market: { tam: '1B', growthRate: '20%', segment: 'B2B' },
      moat: 'M',
      revenueModel: 'SaaS',
      targetCustomer: 'B2B',
      metrics: [{ name: 'MRR', target: '10K' }],
      timeline: [{ milestone: 'Launch', month: 1 }],
      techStack: ['Next.js'],
      competitiveAdvantage: 'CA',
    };

    const mockGenerator = {
      generateBatch: vi.fn().mockResolvedValue([mockIdea]),
      scoreIdea: vi.fn().mockResolvedValue(88),
    };

    vi.mocked(IdeaGenerator).mockImplementation(() => mockGenerator as any);
    
    const createMock = vi.mocked(prisma.generatedIdea.create);
    createMock.mockResolvedValue({ id: 'idea-1' } as any);

    const request = new Request('http://localhost:3000/api/ags/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'admin-key',
      },
      body: JSON.stringify({ count: 1 }),
    });

    await POST(request as any);

    expect(createMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: 'Database Test',
        score: 88,
        status: 'PUBLISHED', // Score >= 85
        metrics: JSON.stringify(mockIdea.metrics),
        timeline: JSON.stringify(mockIdea.timeline),
        techStack: JSON.stringify(mockIdea.techStack),
      }),
    });
  });

  it('should mark low-scoring ideas as DRAFT', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'admin-1',
      email: 'admin@ventureclaw.com',
      tier: 'enterprise',
    } as any);

    const mockIdea = {
      name: 'Low Score',
      tagline: 'Test',
      problem: 'P',
      solution: 'S',
      market: { tam: '1B', growthRate: '20%', segment: 'B2B' },
      moat: 'M',
      revenueModel: 'SaaS',
      targetCustomer: 'B2B',
      metrics: [],
      timeline: [],
      techStack: [],
      competitiveAdvantage: 'CA',
    };

    const mockGenerator = {
      generateBatch: vi.fn().mockResolvedValue([mockIdea]),
      scoreIdea: vi.fn().mockResolvedValue(60), // Low score
    };

    vi.mocked(IdeaGenerator).mockImplementation(() => mockGenerator as any);
    
    const createMock = vi.mocked(prisma.generatedIdea.create);
    createMock.mockResolvedValue({ id: 'idea-1' } as any);

    const request = new Request('http://localhost:3000/api/ags/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'admin-key',
      },
      body: JSON.stringify({ count: 1 }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(createMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        status: 'DRAFT', // Score < 85
      }),
    });
    
    expect(data.validated).toBe(0);
    expect(data.ideas).toHaveLength(0); // Draft ideas not returned
  });
});
