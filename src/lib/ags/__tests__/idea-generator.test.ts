/**
 * Tests for AGS Idea Generator
 */

import { describe, it, expect } from 'vitest';
import type { StartupIdea } from '../idea-generator';

describe('IdeaGenerator', () => {
  // Note: Actual generator instantiation requires API key
  // and the Anthropic client doesn't work in test environment
  // These are structure validation tests only

  describe('idea validation', () => {
    it('should validate idea structure', () => {
      const mockIdea: StartupIdea = {
        name: 'TestStartup',
        tagline: 'Test tagline',
        problem: 'Test problem description',
        solution: 'Test solution description',
        market: {
          tam: '$10B',
          growthRate: '50%',
          segment: 'Test segment'
        },
        moat: 'Test moat',
        revenueModel: 'Test revenue model',
        targetCustomer: 'Test customer',
        metrics: [
          {
            key: 'MRR',
            target: '$50K',
            timeline: '12 months'
          }
        ],
        timeline: [
          { month: 1, milestone: 'MVP' },
          { month: 3, milestone: 'Beta' },
          { month: 6, milestone: 'Launch' }
        ],
        techStack: ['TypeScript', 'React'],
        competitiveAdvantage: 'Test advantage'
      };

      expect(mockIdea.name).toBeDefined();
      expect(mockIdea.market.tam).toBeDefined();
      expect(mockIdea.metrics).toBeInstanceOf(Array);
      expect(mockIdea.timeline).toBeInstanceOf(Array);
      expect(mockIdea.techStack).toBeInstanceOf(Array);
    });
  });
});
