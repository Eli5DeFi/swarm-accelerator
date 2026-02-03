"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  RocketLaunchIcon,
  ChartBarIcon,
  SparklesIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

interface Startup {
  id: string;
  name: string;
  tagline: string;
  status: string;
  createdAt: string;
  analysis?: {
    overallScore: number;
    recommendation: string;
  };
}

export default function DashboardPage() {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStartups();
  }, []);

  const fetchStartups = async () => {
    try {
      const response = await fetch("/api/pitches");
      const result = await response.json();
      
      if (result.success) {
        setStartups(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch startups:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; icon: any }> = {
      PENDING: { bg: "bg-[#f59e0b]/20", text: "text-[#f59e0b]", icon: ClockIcon },
      ANALYZING: { bg: "bg-[#00f0ff]/20", text: "text-[#00f0ff]", icon: SparklesIcon },
      APPROVED: { bg: "bg-[#10b981]/20", text: "text-[#10b981]", icon: CheckCircleIcon },
      CONDITIONAL: { bg: "bg-[#a855f7]/20", text: "text-[#a855f7]", icon: ChartBarIcon },
      REJECTED: { bg: "bg-[#ef4444]/20", text: "text-[#ef4444]", icon: XCircleIcon },
    };

    const badge = badges[status] || badges.PENDING;
    const Icon = badge.icon;

    return (
      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${badge.bg} ${badge.text}`}>
        <Icon className="w-4 h-4" />
        {status.charAt(0) + status.slice(1).toLowerCase()}
      </span>
    );
  };

  return (
    <main className="min-h-screen bg-[var(--background)] py-20">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Your <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-[var(--text-secondary)]">
              Track your pitches and analysis results
            </p>
          </div>

          <Link href="/pitch">
            <motion.button
              className="btn-primary flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <RocketLaunchIcon className="w-5 h-5" />
              New Pitch
            </motion.button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card">
            <div className="text-sm text-[var(--text-secondary)] mb-1">Total Pitches</div>
            <div className="text-3xl font-bold gradient-text">{startups.length}</div>
          </div>
          <div className="card">
            <div className="text-sm text-[var(--text-secondary)] mb-1">Approved</div>
            <div className="text-3xl font-bold text-[#10b981]">
              {startups.filter(s => s.status === "APPROVED").length}
            </div>
          </div>
          <div className="card">
            <div className="text-sm text-[var(--text-secondary)] mb-1">In Review</div>
            <div className="text-3xl font-bold text-[#00f0ff]">
              {startups.filter(s => s.status === "ANALYZING" || s.status === "PENDING").length}
            </div>
          </div>
          <div className="card">
            <div className="text-sm text-[var(--text-secondary)] mb-1">Avg Score</div>
            <div className="text-3xl font-bold gradient-text">
              {startups.filter(s => s.analysis).length > 0
                ? Math.round(
                    startups
                      .filter(s => s.analysis)
                      .reduce((sum, s) => sum + (s.analysis?.overallScore || 0), 0) /
                    startups.filter(s => s.analysis).length
                  )
                : "—"}
            </div>
          </div>
        </div>

        {/* Pitches List */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Your Pitches</h2>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-[#00f0ff]/30 border-t-[#00f0ff] rounded-full animate-spin" />
              <p className="mt-4 text-[var(--text-secondary)]">Loading pitches...</p>
            </div>
          ) : startups.length === 0 ? (
            <div className="text-center py-12">
              <RocketLaunchIcon className="w-16 h-16 mx-auto mb-4 text-[var(--text-muted)]" />
              <p className="text-[var(--text-secondary)] mb-4">No pitches yet</p>
              <Link href="/pitch">
                <button className="btn-primary">Submit Your First Pitch</button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {startups.map((startup, index) => (
                <motion.div
                  key={startup.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/pitch/${startup.id}`}>
                    <div className="p-4 rounded-xl bg-[var(--background-tertiary)] border border-[var(--glass-border)] hover:border-[#00f0ff]/30 transition cursor-pointer">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-1">{startup.name}</h3>
                          <p className="text-sm text-[var(--text-secondary)] mb-3">
                            {startup.tagline}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                            <span>Submitted {new Date(startup.createdAt).toLocaleDateString()}</span>
                            {startup.analysis && (
                              <span className="text-[#00f0ff]">
                                Score: {startup.analysis.overallScore}/100
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(startup.status)}
                          <button className="text-sm text-[#00f0ff] hover:underline">
                            View Details →
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <Link href="/pricing">
            <div className="card hover:border-[#00f0ff]/30 transition cursor-pointer">
              <ChartBarIcon className="w-8 h-8 text-[#00f0ff] mb-2" />
              <h3 className="font-semibold mb-1">Upgrade Plan</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Get more pitches and advanced features
              </p>
            </div>
          </Link>

          <Link href="/funding">
            <div className="card hover:border-[#a855f7]/30 transition cursor-pointer">
              <SparklesIcon className="w-8 h-8 text-[#a855f7] mb-2" />
              <h3 className="font-semibold mb-1">Browse ICOs</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Explore active fundraising rounds
              </p>
            </div>
          </Link>

          <Link href="/accelerator">
            <div className="card hover:border-[#10b981]/30 transition cursor-pointer">
              <RocketLaunchIcon className="w-8 h-8 text-[#10b981] mb-2" />
              <h3 className="font-semibold mb-1">Join Accelerator</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Get coaching and marketing support
              </p>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
