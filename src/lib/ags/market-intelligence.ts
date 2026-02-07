/**
 * Market Intelligence Layer
 * Scrapes GitHub, Reddit, Twitter for market gaps and trends
 */

import Anthropic from '@anthropic-ai/sdk';

export interface MarketGap {
  problem: string;
  source: 'github' | 'reddit' | 'twitter' | 'hn';
  frequency: number;
  sentiment: number;
  url: string;
}

export interface TechTrend {
  technology: string;
  growthRate: number;
  maturity: 'emerging' | 'growing' | 'mature';
  applications: string[];
  githubStars: number;
}

export class MarketIntelligence {
  private anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Analyze GitHub trending repositories
   * Discovers what developers are building (early signals)
   */
  async analyzeGitHubTrends(): Promise<TechTrend[]> {
    try {
      // Fetch GitHub trending from API
      const response = await fetch('https://api.github.com/search/repositories?q=created:>2024-01-01&sort=stars&order=desc&per_page=50');
      const data = await response.json();
      
      const repos = data.items || [];
      
      // Use Claude to extract trends
      const analysis = await this.anthropic.messages.create({
        model: 'claude-sonnet-4',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: `Analyze these GitHub repositories and identify emerging tech trends:

${repos.map((r: any) => `- ${r.name}: ${r.description} (${r.stargazers_count} stars)`).join('\n')}

For each trend, provide:
1. Technology name
2. Growth rate (stars/month)
3. Maturity level (emerging/growing/mature)
4. Potential applications
5. GitHub stars

Output as JSON array.`
        }]
      });

      const content = analysis.content[0];
      const text = content.type === 'text' ? content.text : '';
      
      // Extract JSON from response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return [];
    } catch (error) {
      console.error('GitHub analysis failed:', error);
      return [];
    }
  }

  /**
   * Analyze Reddit r/startups and r/Entrepreneur
   * Discovers pain points and unmet needs
   */
  async analyzeRedditPainPoints(): Promise<MarketGap[]> {
    try {
      // Simulate Reddit API (in production, use actual Reddit API)
      const mockRedditPosts = [
        {
          title: "Struggling to find good devs for our startup",
          url: "https://reddit.com/r/startups/example1",
          upvotes: 250,
          comments: 80
        },
        {
          title: "Why is B2B SaaS pricing so complicated?",
          url: "https://reddit.com/r/startups/example2",
          upvotes: 180,
          comments: 45
        },
        {
          title: "Spent $10K on SEO, got zero results",
          url: "https://reddit.com/r/Entrepreneur/example3",
          upvotes: 420,
          comments: 120
        }
      ];

      // Use Claude to extract pain points
      const analysis = await this.anthropic.messages.create({
        model: 'claude-sonnet-4',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: `Analyze these Reddit posts and identify startup pain points:

${mockRedditPosts.map(p => `- ${p.title} (${p.upvotes} upvotes, ${p.comments} comments)`).join('\n')}

For each pain point, provide:
1. Problem statement
2. Source (reddit)
3. Frequency (how often mentioned)
4. Sentiment (-1 to 1)
5. URL

Output as JSON array.`
        }]
      });

      const content = analysis.content[0];
      const text = content.type === 'text' ? content.text : '';
      
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return [];
    } catch (error) {
      console.error('Reddit analysis failed:', error);
      return [];
    }
  }

  /**
   * Analyze VC Twitter activity
   * Discovers what investors are excited about
   */
  async analyzeVCTweets(): Promise<string[]> {
    // In production: use Twitter API to scrape VC tweets
    // For now, return mock data
    return [
      "AI agents for enterprise workflows",
      "Vertical SaaS for niche industries",
      "Developer tools for LLM ops",
      "Climate tech with AI optimization",
      "B2B fintech for SMBs"
    ];
  }

  /**
   * Combine all intelligence sources
   */
  async gatherIntelligence(): Promise<{
    trends: TechTrend[];
    gaps: MarketGap[];
    vcInterests: string[];
  }> {
    const [trends, gaps, vcInterests] = await Promise.all([
      this.analyzeGitHubTrends(),
      this.analyzeRedditPainPoints(),
      this.analyzeVCTweets()
    ]);

    return { trends, gaps, vcInterests };
  }
}
