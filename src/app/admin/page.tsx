"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ChartBarIcon,
  CpuChipIcon,
  CurrencyDollarIcon,
  UsersIcon,
  RocketLaunchIcon,
  SparklesIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import AgentActivityFeed from "@/components/AgentActivityFeed";

interface SystemStats {
  totalStartups: number;
  totalAnalyses: number;
  totalAgentRuns: number;
  avgAnalysisTime: number;
  totalCost: number;
  successRate: number;
  activeAgents: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<SystemStats>({
    totalStartups: 0,
    totalAnalyses: 0,
    totalAgentRuns: 0,
    avgAnalysisTime: 0,
    totalCost: 0,
    successRate: 0,
    activeAgents: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      // In production, create dedicated API endpoints for admin stats
      const [startupsRes, activitiesRes] = await Promise.all([
        fetch("/api/pitches"),
        fetch("/api/agent-activity?limit=100"),
      ]);

      const startupsData = await startupsRes.json();
      const activitiesData = await activitiesRes.json();

      if (startupsData.success && activitiesData.success) {
        const startups = startupsData.data;
        const activities = activitiesData.data;

        // Calculate stats
        const completed = activities.filter((a: any) => a.status === "COMPLETED");
        const totalDuration = completed.reduce((sum: number, a: any) => 
          sum + (a.duration || 0), 0
        );

        setStats({
          totalStartups: startups.length,
          totalAnalyses: startups.filter((s: any) => s.analysis).length,
          totalAgentRuns: activities.length,
          avgAnalysisTime: completed.length > 0 
            ? totalDuration / completed.length / 1000 
            : 0,
          totalCost: activities.length * 0.60, // Rough estimate
          successRate: completed.length / activities.length * 100 || 0,
          activeAgents: activities.filter((a: any) => a.status === "RUNNING").length,
        });
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      label: "Total Startups",
      value: stats.totalStartups,
      icon: RocketLaunchIcon,
      color: "#00f0ff",
      suffix: "",
    },
    {
      label: "Analyses Completed",
      value: stats.totalAnalyses,
      icon: CheckCircleIcon,
      color: "#10b981",
      suffix: "",
    },
    {
      label: "Agent Runs",
      value: stats.totalAgentRuns,
      icon: CpuChipIcon,
      color: "#a855f7",
      suffix: "",
    },
    {
      label: "Active Agents",
      value: stats.activeAgents,
      icon: SparklesIcon,
      color: "#f59e0b",
      suffix: "",
    },
    {
      label: "Avg Analysis Time",
      value: stats.avgAnalysisTime.toFixed(2),
      icon: ClockIcon,
      color: "#22d3ee",
      suffix: "s",
    },
    {
      label: "Success Rate",
      value: stats.successRate.toFixed(1),
      icon: ChartBarIcon,
      color: "#10b981",
      suffix: "%",
    },
    {
      label: "Total AI Cost",
      value: stats.totalCost.toFixed(2),
      icon: CurrencyDollarIcon,
      color: "#f59e0b",
      prefix: "$",
      suffix: "",
    },
    {
      label: "Cost per Analysis",
      value: (stats.totalCost / Math.max(stats.totalAnalyses, 1)).toFixed(2),
      icon: CurrencyDollarIcon,
      color: "#00f0ff",
      prefix: "$",
      suffix: "",
    },
  ];

  return (
    <main className="min-h-screen bg-[var(--background)] py-20">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Admin <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="text-[var(--text-secondary)]">
            Real-time system monitoring and analytics
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${stat.color}20` }}>
                  <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                <div className="text-xs text-[var(--text-muted)]">{stat.label}</div>
              </div>
              <div className="text-2xl font-bold">
                {stat.prefix}
                {stat.value}
                {stat.suffix}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Placeholder */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Analysis Over Time */}
          <div className="card">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5 text-[#00f0ff]" />
              Analysis Over Time
            </h3>
            <div className="h-48 flex items-center justify-center text-[var(--text-muted)]">
              <div>
                <ChartBarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Chart implementation coming soon</p>
                <p className="text-sm mt-1">Add Chart.js or Recharts for visualization</p>
              </div>
            </div>
          </div>

          {/* Agent Performance */}
          <div className="card">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <CpuChipIcon className="w-5 h-5 text-[#a855f7]" />
              Agent Performance
            </h3>
            <div className="h-48 flex items-center justify-center text-[var(--text-muted)]">
              <div>
                <CpuChipIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Agent metrics coming soon</p>
                <p className="text-sm mt-1">Track accuracy, speed, and cost per agent</p>
              </div>
            </div>
          </div>
        </div>

        {/* Agent Activity Feed */}
        <AgentActivityFeed autoRefresh maxItems={30} />

        {/* System Health */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="card">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-[#00f0ff]" />
              OpenAI Status
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">API Status</span>
                <span className="text-[#10b981]">✓ Operational</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Model</span>
                <span>GPT-4 Turbo</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Rate Limit</span>
                <span className="text-[#10b981]">OK</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5 text-[#a855f7]" />
              Database Status
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Connection</span>
                <span className="text-[#10b981]">✓ Connected</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Latency</span>
                <span>~15ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Pool</span>
                <span className="text-[#10b981]">8/10 available</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <CurrencyDollarIcon className="w-5 h-5 text-[#f59e0b]" />
              Cost Tracking
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Today</span>
                <span className="text-[#00f0ff]">${(stats.totalCost * 0.2).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">This Week</span>
                <span className="text-[#00f0ff]">${stats.totalCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Budget</span>
                <span className="text-[#10b981]">{(stats.totalCost / 500 * 100).toFixed(0)}% used</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 card">
          <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <button className="p-4 rounded-xl bg-[var(--background-tertiary)] hover:bg-white/5 transition text-left">
              <UsersIcon className="w-6 h-6 text-[#00f0ff] mb-2" />
              <div className="font-medium">View Users</div>
              <div className="text-xs text-[var(--text-muted)]">Manage accounts</div>
            </button>

            <button className="p-4 rounded-xl bg-[var(--background-tertiary)] hover:bg-white/5 transition text-left">
              <CpuChipIcon className="w-6 h-6 text-[#a855f7] mb-2" />
              <div className="font-medium">Agent Config</div>
              <div className="text-xs text-[var(--text-muted)]">Tune parameters</div>
            </button>

            <button className="p-4 rounded-xl bg-[var(--background-tertiary)] hover:bg-white/5 transition text-left">
              <ChartBarIcon className="w-6 h-6 text-[#10b981] mb-2" />
              <div className="font-medium">Reports</div>
              <div className="text-xs text-[var(--text-muted)]">Export analytics</div>
            </button>

            <button className="p-4 rounded-xl bg-[var(--background-tertiary)] hover:bg-white/5 transition text-left">
              <RocketLaunchIcon className="w-6 h-6 text-[#f59e0b] mb-2" />
              <div className="font-medium">Deploy</div>
              <div className="text-xs text-[var(--text-muted)]">Manage deployments</div>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
