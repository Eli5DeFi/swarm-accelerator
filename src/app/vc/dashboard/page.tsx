"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
    ArrowLeftIcon,
    SparklesIcon,
    ChartBarIcon,
    RocketLaunchIcon,
    UserGroupIcon,
    BanknotesIcon,
    EyeIcon,
    CheckCircleIcon,
    ClockIcon,
} from "@heroicons/react/24/outline";
import { useStore } from "@/lib/store";

function DashboardContent() {
    const searchParams = useSearchParams();
    const vcId = searchParams.get("id");

    const vcs = useStore((state) => state.vcs);
    const startups = useStore((state) => state.startups);

    const vc = vcId ? vcs.find((v) => v.id === vcId) : vcs[0];

    // Mock stats
    const stats = [
        { label: "Deals Reviewed", value: startups.length || 12, icon: EyeIcon },
        { label: "Approved", value: startups.filter((s) => s.status === "approved").length || 4, icon: CheckCircleIcon },
        { label: "Pending", value: startups.filter((s) => s.status === "pending" || s.status === "analyzing").length || 3, icon: ClockIcon },
        { label: "Total Invested", value: "$2.4M", icon: BanknotesIcon },
    ];

    return (
        <main className="min-h-screen bg-[var(--background)] relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-20" />

            <div className="relative z-10 container mx-auto px-6 py-12">
                {/* Header */}
                <div className="flex items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/">
                            <motion.button
                                className="p-2 rounded-lg glass hover:bg-white/5 transition"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <ArrowLeftIcon className="w-5 h-5" />
                            </motion.button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold">{vc?.firmName || "VC"} Dashboard</h1>
                            <p className="text-[var(--text-secondary)]">
                                Manage deals and track your AI agent
                            </p>
                        </div>
                    </div>

                    {vc?.agentPersona && (
                        <motion.div
                            className="flex items-center gap-3 px-4 py-2 rounded-xl glass"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <motion.div
                                className="w-10 h-10 rounded-full bg-gradient-to-br from-[#a855f7] to-[#ec4899] flex items-center justify-center"
                                animate={{
                                    boxShadow: [
                                        "0 0 10px rgba(168, 85, 247, 0.3)",
                                        "0 0 20px rgba(168, 85, 247, 0.5)",
                                        "0 0 10px rgba(168, 85, 247, 0.3)",
                                    ],
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <SparklesIcon className="w-5 h-5 text-white" />
                            </motion.div>
                            <div>
                                <div className="text-sm font-medium">{vc.agentPersona.name}</div>
                                <div className="text-xs text-[#10b981]">Online & Active</div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            className="card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <stat.icon className="w-5 h-5 text-[#a855f7]" />
                                <span className="text-sm text-[var(--text-secondary)]">{stat.label}</span>
                            </div>
                            <div className="text-2xl font-bold gradient-text-secondary">{stat.value}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Recent Deals */}
                    <div className="lg:col-span-2">
                        <div className="card">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <RocketLaunchIcon className="w-5 h-5 text-[#00f0ff]" />
                                    Recent Pitches
                                </h2>
                                <Link href="/accelerator">
                                    <button className="text-sm text-[#00f0ff] hover:underline">
                                        View All
                                    </button>
                                </Link>
                            </div>

                            {startups.length > 0 ? (
                                <div className="space-y-4">
                                    {startups.slice(0, 5).map((startup, index) => (
                                        <motion.div
                                            key={startup.id}
                                            className="p-4 rounded-xl bg-[var(--background-tertiary)] border border-[var(--glass-border)] hover:border-[#00f0ff]/30 transition"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.2 + index * 0.1 }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-medium">{startup.name}</div>
                                                    <div className="text-sm text-[var(--text-secondary)]">
                                                        {startup.industry} • {startup.stage}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${startup.status === "approved"
                                                            ? "bg-[#10b981]/20 text-[#10b981]"
                                                            : startup.status === "rejected"
                                                                ? "bg-[#ef4444]/20 text-[#ef4444]"
                                                                : startup.status === "conditional"
                                                                    ? "bg-[#f59e0b]/20 text-[#f59e0b]"
                                                                    : "bg-white/10 text-[var(--text-secondary)]"
                                                        }`}>
                                                        {startup.status}
                                                    </span>
                                                    <Link href={`/pitch/${startup.id}`}>
                                                        <button className="text-[#00f0ff] hover:underline text-sm">
                                                            View
                                                        </button>
                                                    </Link>
                                                </div>
                                            </div>
                                            {startup.analysis && (
                                                <div className="mt-3 flex gap-4 text-sm">
                                                    <span className="text-[var(--text-muted)]">
                                                        Score: <span className="text-white">{startup.analysis.overallScore}</span>
                                                    </span>
                                                    <span className="text-[var(--text-muted)]">
                                                        Valuation: <span className="text-[#00f0ff]">
                                                            ${(startup.analysis.valuation / 1000000).toFixed(1)}M
                                                        </span>
                                                    </span>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-[var(--text-secondary)]">
                                    <RocketLaunchIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No pitches yet</p>
                                    <p className="text-sm text-[var(--text-muted)]">
                                        Startups will appear here once they submit
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Agent Status */}
                        {vc?.agentPersona && (
                            <motion.div
                                className="card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <SparklesIcon className="w-5 h-5 text-[#a855f7]" />
                                    Your AI Agent
                                </h3>

                                <div className="p-4 rounded-xl bg-gradient-to-br from-[#a855f7]/10 to-[#ec4899]/10 border border-[#a855f7]/30">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#a855f7] to-[#ec4899] flex items-center justify-center">
                                            <SparklesIcon className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <div className="font-medium">{vc.agentPersona.name}</div>
                                            <div className="text-xs text-[#10b981] flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                                                Active
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-[var(--text-secondary)]">Risk Level</span>
                                            <span className="capitalize">{vc.agentPersona.riskTolerance}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {vc.agentPersona.priorities.map((p) => (
                                                <span key={p} className="px-2 py-0.5 text-xs rounded-full bg-[#a855f7]/20 text-[#a855f7]">
                                                    {p}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Quick Links */}
                        <motion.div
                            className="card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                            <div className="space-y-2">
                                {[
                                    { href: "/accelerator", label: "Accelerator", icon: ChartBarIcon },
                                    { href: "/funding", label: "Funding", icon: BanknotesIcon },
                                    { href: "/network", label: "Network", icon: UserGroupIcon },
                                ].map((link) => (
                                    <Link key={link.href} href={link.href}>
                                        <motion.div
                                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition"
                                            whileHover={{ x: 4 }}
                                        >
                                            <link.icon className="w-5 h-5 text-[#00f0ff]" />
                                            <span>{link.label}</span>
                                        </motion.div>
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function VCDashboardPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <motion.div
                    className="w-12 h-12 border-4 border-[#a855f7]/30 border-t-[#a855f7] rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}
