/**
 * STREAMING Analysis API - Real-time Progress Updates
 * 
 * Provides instant feedback to users during analysis:
 * - Agent spawn notifications
 * - Progress updates
 * - Real-time results
 * - 10x better UX (perceived speed)
 */

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { FinancialAnalystAgent } from "@/lib/agents/financial-analyst";
import { TechnicalDDAgent } from "@/lib/agents/technical-dd";
import { MarketResearchAgent } from "@/lib/agents/market-research";
import { LegalComplianceAgent } from "@/lib/agents/legal-compliance";
import { selectAgents, getAgentBreakdown } from "@/lib/agents/agent-registry";

export const runtime = 'nodejs'; // Required for streaming
export const dynamic = 'force-dynamic';

interface StreamEvent {
  type: 'status' | 'agent_start' | 'agent_progress' | 'agent_complete' | 'synthesis' | 'complete' | 'error';
  message?: string;
  agent?: string;
  progress?: number;
  result?: any;
  data?: any;
  error?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  // Create Server-Sent Events stream
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      // Helper to send SSE event
      const sendEvent = (event: StreamEvent) => {
        const data = `data: ${JSON.stringify(event)}\n\n`;
        controller.enqueue(encoder.encode(data));
      };

      try {
        // 1. Validate startup exists
        const startup = await prisma.startup.findUnique({ where: { id } });
        
        if (!startup) {
          sendEvent({ type: 'error', error: 'Startup not found' });
          controller.close();
          return;
        }

        sendEvent({
          type: 'status',
          message: '🚀 Initializing AI agent swarm...'
        });

        // 2. Update status to analyzing
        await prisma.startup.update({
          where: { id },
          data: { status: "ANALYZING" },
        });

        // 3. Determine required agents
        const selectedAgents = selectAgents(startup);
        const agentBreakdown = getAgentBreakdown(startup);

        sendEvent({
          type: 'status',
          message: `Spawning ${agentBreakdown.total} specialized agents...`
        });

        // 4. Initialize agents
        const financialAgent = new FinancialAnalystAgent();
        const technicalAgent = new TechnicalDDAgent();
        const marketAgent = new MarketResearchAgent();
        const legalAgent = new LegalComplianceAgent();

        // 5. Execute core agents with progress tracking
        const coreAgents = [
          { name: 'Financial Analyst', agent: financialAgent, emoji: '💰' },
          { name: 'Technical DD', agent: technicalAgent, emoji: '🔧' },
          { name: 'Market Research', agent: marketAgent, emoji: '📊' },
          { name: 'Legal Compliance', agent: legalAgent, emoji: '⚖️' },
        ];

        const results: any[] = [];

        // Execute agents in parallel with progress updates
        await Promise.all(
          coreAgents.map(async ({ name, agent, emoji }) => {
            sendEvent({
              type: 'agent_start',
              agent: name,
              message: `${emoji} ${name} analyzing...`
            });

            // Simulate progress (in real implementation, this would come from agent)
            const progressInterval = setInterval(() => {
              const progress = Math.min(95, Math.random() * 100);
              sendEvent({
                type: 'agent_progress',
                agent: name,
                progress: Math.round(progress)
              });
            }, 500);

            try {
              // Execute analysis
              const result = await agent.analyze(startup);
              
              clearInterval(progressInterval);

              // Send completion
              sendEvent({
                type: 'agent_complete',
                agent: name,
                progress: 100,
                result: {
                  score: result.score,
                  strengths: result.strengths.slice(0, 2),
                  concerns: result.concerns.slice(0, 2),
                }
              });

              results.push({ name, result });
            } catch (error) {
              clearInterval(progressInterval);
              sendEvent({
                type: 'error',
                agent: name,
                error: String(error)
              });
            }
          })
        );

        // 6. Synthesize results
        sendEvent({
          type: 'synthesis',
          message: '🧠 Synthesizing agent insights...'
        });

        // Calculate overall score
        const scores = results.map(r => r.result.score);
        const overallScore = Math.round(
          scores.reduce((sum, score) => sum + score, 0) / scores.length
        );

        const recommendation = 
          overallScore >= 75 ? 'APPROVED' :
          overallScore >= 55 ? 'CONDITIONAL' :
          'REJECTED';

        // 7. Save to database
        const analysisCompletedAt = new Date();
        
        await prisma.analysis.create({
          data: {
            startupId: id,
            financialScore: results[0]?.result.score || 0,
            technicalScore: results[1]?.result.score || 0,
            marketScore: results[2]?.result.score || 0,
            legalScore: results[3]?.result.score || 0,
            overallScore,
            recommendation: recommendation as any,
            summary: `Analysis completed with overall score of ${overallScore}/100`,
            financialFeedback: results[0]?.result || null,
            technicalFeedback: results[1]?.result || null,
            marketFeedback: results[2]?.result || null,
            legalFeedback: results[3]?.result || null,
            valuation: results[0]?.result.valuation || 0,
            analysisStartedAt: new Date(),
            analysisCompletedAt,
            analysisDuration: 0,
          },
        });

        // Update startup status
        await prisma.startup.update({
          where: { id },
          data: { status: recommendation as any },
        });

        // 8. Send final result
        sendEvent({
          type: 'complete',
          data: {
            overallScore,
            recommendation,
            results: results.map(r => ({
              agent: r.name,
              score: r.result.score,
              strengths: r.result.strengths.slice(0, 3),
              concerns: r.result.concerns.slice(0, 3),
            })),
          },
          message: `✅ Analysis complete! Score: ${overallScore}/100 - ${recommendation}`
        });

      } catch (error) {
        sendEvent({
          type: 'error',
          error: String(error),
          message: '❌ Analysis failed'
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable Nginx buffering
    },
  });
}
