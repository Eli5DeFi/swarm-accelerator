'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    pitchesAnalyzed: 0,
    avgScore: 0,
    defiAnalyses: 0,
    matchesMade: 0,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  const quickActions = [
    {
      title: 'Analyze Pitch',
      description: 'Submit a new startup pitch for AI analysis',
      href: '/pitch',
      icon: '🎯',
      color: 'from-blue-600 to-cyan-600',
    },
    {
      title: 'DeFi Accelerator',
      description: 'Launch your DeFi protocol',
      href: '/defi',
      icon: '🔥',
      color: 'from-purple-600 to-pink-600',
    },
    {
      title: 'Match Investors',
      description: 'Find investors for your startup',
      href: '/marketplace-demo',
      icon: '💰',
      color: 'from-green-600 to-emerald-600',
    },
    {
      title: 'M&A Exit',
      description: 'Plan your exit strategy',
      href: '/exit',
      icon: '🚀',
      color: 'from-orange-600 to-red-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {session.user?.name || 'Founder'}!
            </h1>
            <p className="text-gray-400">
              Here's what's happening with your startups
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-gray-800 rounded-lg">
              <div className="text-sm text-gray-400">Current Plan</div>
              <div className="font-bold capitalize">
                {session.user?.tier || 'Free'} Tier
              </div>
            </div>
            <Link
              href="/pricing"
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold transition-all"
            >
              Upgrade
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
          >
            <div className="text-sm text-gray-400 mb-1">Pitches Analyzed</div>
            <div className="text-3xl font-bold">{stats.pitchesAnalyzed}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
          >
            <div className="text-sm text-gray-400 mb-1">Average Score</div>
            <div className="text-3xl font-bold">{stats.avgScore}/100</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
          >
            <div className="text-sm text-gray-400 mb-1">DeFi Analyses</div>
            <div className="text-3xl font-bold">{stats.defiAnalyses}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
          >
            <div className="text-sm text-gray-400 mb-1">Investor Matches</div>
            <div className="text-3xl font-bold">{stats.matchesMade}</div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={action.href}>
                  <div className="h-full bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-all cursor-pointer group">
                    <div className={`text-4xl mb-3`}>{action.icon}</div>
                    <h3 className="font-bold mb-2 group-hover:text-purple-400 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-400">{action.description}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
          <div className="text-center py-12 text-gray-400">
            <svg
              className="w-16 h-16 mx-auto mb-4 opacity-50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p className="text-lg mb-2">No activity yet</p>
            <p className="text-sm">
              Start by analyzing your first pitch or DeFi protocol
            </p>
          </div>
        </div>

        {/* API Key Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-6 border border-blue-600/30">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-lg mb-2">🤖 AI Agent Access</h3>
              <p className="text-gray-300 mb-3">
                Use Swarm programmatically via CLI/API for automation
              </p>
              <Link
                href="/api-keys"
                className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-all"
              >
                View API Keys
              </Link>
            </div>
            <div className="text-sm text-gray-400">
              <div className="mb-1">Your API key starts with:</div>
              <code className="px-2 py-1 bg-gray-900 rounded font-mono">
                sk_{session.user?.tier || 'free'}_xxxxx
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
