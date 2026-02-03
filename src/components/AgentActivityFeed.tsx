"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SparklesIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChartBarIcon,
  CpuChipIcon,
  ScaleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

interface AgentActivity {
  id: string;
  agentName: string;
  agentType: string;
  action: string;
  description: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  result?: string;
  startedAt: string;
  completedAt?: string;
  duration?: number;
  startup?: {
    id: string;
    name: string;
  };
}

interface AgentActivityFeedProps {
  startupId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  maxItems?: number;
}

export default function AgentActivityFeed({
  startupId,
  autoRefresh = true,
  refreshInterval = 2000,
  maxItems = 20,
}: AgentActivityFeedProps) {
  const [activities, setActivities] = useState<AgentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
    
    if (autoRefresh) {
      const interval = setInterval(fetchActivities, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [startupId, autoRefresh, refreshInterval]);

  const fetchActivities = async () => {
    try {
      const url = startupId
        ? `/api/agent-activity?startupId=${startupId}&limit=${maxItems}`
        : `/api/agent-activity?limit=${maxItems}`;
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        setActivities(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch agent activity:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAgentIcon = (agentType: string) => {
    const icons: Record<string, any> = {
      FINANCIAL_ANALYST: ChartBarIcon,
      TECHNICAL_DD: CpuChipIcon,
      MARKET_RESEARCH: SparklesIcon,
      LEGAL_COMPLIANCE: ScaleIcon,
      BLOCKCHAIN_EXPERT: ShieldCheckIcon,
      AI_ML_SPECIALIST: CpuChipIcon,
      FINTECH_REGULATOR: ScaleIcon,
    };
    return icons[agentType] || SparklesIcon;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return CheckCircleIcon;
      case "FAILED":
        return XCircleIcon;
      case "RUNNING":
        return SparklesIcon;
      default:
        return ClockIcon;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "text-[#10b981]";
      case "FAILED":
        return "text-[#ef4444]";
      case "RUNNING":
        return "text-[#00f0ff]";
      default:
        return "text-[#f59e0b]";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-[#10b981]/10 border-[#10b981]/30";
      case "FAILED":
        return "bg-[#ef4444]/10 border-[#ef4444]/30";
      case "RUNNING":
        return "bg-[#00f0ff]/10 border-[#00f0ff]/30";
      default:
        return "bg-[#f59e0b]/10 border-[#f59e0b]/30";
    }
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return "—";
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffMin < 60) return `${diffMin}m ago`;
    return date.toLocaleTimeString();
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-[#00f0ff]/30 border-t-[#00f0ff] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <SparklesIcon className="w-6 h-6 text-[#00f0ff]" />
          Live Agent Activity
          {activities.filter(a => a.status === "RUNNING").length > 0 && (
            <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse" />
          )}
        </h3>
        
        {autoRefresh && (
          <div className="text-xs text-[var(--text-muted)] flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
            Auto-refreshing
          </div>
        )}
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-12 text-[var(--text-secondary)]">
          <SparklesIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No agent activity yet</p>
          <p className="text-sm text-[var(--text-muted)] mt-2">
            Agents will appear here when analyzing startups
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {activities.map((activity, index) => {
              const AgentIcon = getAgentIcon(activity.agentType);
              const StatusIcon = getStatusIcon(activity.status);
              const statusColor = getStatusColor(activity.status);
              const statusBg = getStatusBg(activity.status);

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`p-4 rounded-xl border ${statusBg} transition-all hover:scale-[1.02]`}
                >
                  <div className="flex items-start gap-3">
                    {/* Agent Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-lg glass flex items-center justify-center">
                        <AgentIcon className="w-5 h-5 text-[#00f0ff]" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {activity.agentName}
                            </span>
                            <StatusIcon className={`w-4 h-4 ${statusColor}`} />
                          </div>
                          {activity.startup && (
                            <div className="text-xs text-[var(--text-muted)] mt-0.5">
                              Analyzing: <span className="text-[#00f0ff]">{activity.startup.name}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right text-xs">
                          <div className="text-[var(--text-muted)]">
                            {formatTimestamp(activity.startedAt)}
                          </div>
                          {activity.duration && (
                            <div className="text-[#00f0ff] mt-0.5">
                              {formatDuration(activity.duration)}
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-[var(--text-secondary)] mb-2">
                        {activity.description}
                      </p>

                      {activity.result && (
                        <div className="text-xs px-2 py-1 rounded bg-white/5 inline-block">
                          <span className="text-[#00f0ff]">Result:</span> {activity.result}
                        </div>
                      )}

                      {/* Progress Bar for Running */}
                      {activity.status === "RUNNING" && (
                        <div className="mt-2 h-1 rounded-full bg-white/10 overflow-hidden">
                          <motion.div
                            className="h-full bg-[#00f0ff]"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{
                              duration: 8,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Stats Footer */}
      {activities.length > 0 && (
        <div className="mt-6 pt-4 border-t border-[var(--glass-border)] grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-xs text-[var(--text-muted)] mb-1">Total</div>
            <div className="text-lg font-bold">{activities.length}</div>
          </div>
          <div>
            <div className="text-xs text-[var(--text-muted)] mb-1">Running</div>
            <div className="text-lg font-bold text-[#00f0ff]">
              {activities.filter(a => a.status === "RUNNING").length}
            </div>
          </div>
          <div>
            <div className="text-xs text-[var(--text-muted)] mb-1">Completed</div>
            <div className="text-lg font-bold text-[#10b981]">
              {activities.filter(a => a.status === "COMPLETED").length}
            </div>
          </div>
          <div>
            <div className="text-xs text-[var(--text-muted)] mb-1">Failed</div>
            <div className="text-lg font-bold text-[#ef4444]">
              {activities.filter(a => a.status === "FAILED").length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
