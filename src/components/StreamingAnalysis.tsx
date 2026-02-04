/**
 * STREAMING Analysis Component - Real-time Progress UI
 * 
 * Provides 10x better UX:
 * - Instant feedback (<500ms to first update)
 * - Real-time progress bars
 * - Agent-by-agent results
 * - No more 30s loading spinners!
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AgentProgress {
  name: string;
  progress: number;
  status: 'pending' | 'running' | 'complete' | 'error';
  result?: {
    score: number;
    strengths: string[];
    concerns: string[];
  };
}

interface AnalysisResult {
  overallScore: number;
  recommendation: string;
  results: any[];
}

interface StreamingAnalysisProps {
  pitchId: string;
  onComplete?: (result: AnalysisResult) => void;
}

export function StreamingAnalysis({ pitchId, onComplete }: StreamingAnalysisProps) {
  const [status, setStatus] = useState('Initializing...');
  const [agents, setAgents] = useState<Record<string, AgentProgress>>({});
  const [finalResult, setFinalResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize EventSource for Server-Sent Events
    const eventSource = new EventSource(`/api/pitches/${pitchId}/analyze-stream`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'status':
            setStatus(data.message);
            break;

          case 'agent_start':
            setAgents(prev => ({
              ...prev,
              [data.agent]: {
                name: data.agent,
                progress: 0,
                status: 'running',
              }
            }));
            setStatus(data.message || `${data.agent} started`);
            break;

          case 'agent_progress':
            setAgents(prev => ({
              ...prev,
              [data.agent]: {
                ...prev[data.agent],
                progress: data.progress,
              }
            }));
            break;

          case 'agent_complete':
            setAgents(prev => ({
              ...prev,
              [data.agent]: {
                ...prev[data.agent],
                progress: 100,
                status: 'complete',
                result: data.result,
              }
            }));
            break;

          case 'synthesis':
            setStatus(data.message);
            break;

          case 'complete':
            setStatus(data.message);
            setFinalResult(data.data);
            if (onComplete) {
              onComplete(data.data);
            }
            eventSource.close();
            break;

          case 'error':
            setError(data.error || 'Analysis failed');
            setStatus('❌ Analysis failed');
            eventSource.close();
            break;
        }
      } catch (err) {
        console.error('Error parsing SSE event:', err);
      }
    };

    eventSource.onerror = () => {
      setError('Connection lost');
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [pitchId, onComplete]);

  const agentsList = Object.values(agents);

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <div className="flex items-center gap-3 p-4 bg-purple-900/20 border border-purple-500/20 rounded-lg">
        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
        <div className="text-lg font-semibold text-white">{status}</div>
      </div>

      {/* Agent Progress */}
      <div className="space-y-4">
        <AnimatePresence>
          {agentsList.map((agent) => (
            <motion.div
              key={agent.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg"
            >
              {/* Agent Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    agent.status === 'complete' ? 'bg-green-400' :
                    agent.status === 'running' ? 'bg-blue-400 animate-pulse' :
                    agent.status === 'error' ? 'bg-red-400' :
                    'bg-gray-400'
                  }`} />
                  <span className="font-semibold text-white">{agent.name}</span>
                </div>
                <span className="text-sm text-gray-400">{agent.progress}%</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                <motion.div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${agent.progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Agent Result (when complete) */}
              {agent.result && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2 pt-3 border-t border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Score:</span>
                    <span className={`text-lg font-bold ${
                      agent.result.score >= 75 ? 'text-green-400' :
                      agent.result.score >= 55 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {agent.result.score}/100
                    </span>
                  </div>

                  {agent.result.strengths && agent.result.strengths.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs text-green-400 font-semibold">Strengths:</div>
                      {agent.result.strengths.map((strength: string, idx: number) => (
                        <div key={idx} className="text-xs text-gray-300 pl-3">
                          • {strength}
                        </div>
                      ))}
                    </div>
                  )}

                  {agent.result.concerns && agent.result.concerns.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs text-yellow-400 font-semibold">Concerns:</div>
                      {agent.result.concerns.map((concern: string, idx: number) => (
                        <div key={idx} className="text-xs text-gray-300 pl-3">
                          • {concern}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Final Result */}
      {finalResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-lg"
        >
          <div className="text-center space-y-4">
            <div className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {finalResult.overallScore}/100
            </div>
            
            <div className={`inline-block px-6 py-2 rounded-full text-lg font-semibold ${
              finalResult.recommendation === 'APPROVED' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
              finalResult.recommendation === 'CONDITIONAL' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
              'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {finalResult.recommendation}
            </div>

            <div className="text-gray-300">
              {finalResult.recommendation === 'APPROVED' && '🎉 Congratulations! Your startup has been approved for funding.'}
              {finalResult.recommendation === 'CONDITIONAL' && '⚠️ Conditional approval. Address the concerns and resubmit.'}
              {finalResult.recommendation === 'REJECTED' && '❌ Not approved at this time. Review feedback and reapply later.'}
            </div>
          </div>
        </motion.div>
      )}

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400"
        >
          <div className="font-semibold mb-2">Error:</div>
          <div className="text-sm">{error}</div>
        </motion.div>
      )}
    </div>
  );
}
