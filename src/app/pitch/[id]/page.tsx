"use client";

import { useEffect, useState, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ArrowLeftIcon,
    SparklesIcon,
    ChartBarIcon,
    CpuChipIcon,
    UserGroupIcon,
    ScaleIcon,
    CheckCircleIcon,
    XCircleIcon,
    ExclamationCircleIcon,
    BanknotesIcon,
    ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { useStore, type AgentScore, type Startup } from "@/lib/store";

const agentInfo = [
    { key: "financial", name: "Financial Analyst", icon: ChartBarIcon, color: "#00f0ff" },
    { key: "technical", name: "Technical DD", icon: CpuChipIcon, color: "#a855f7" },
    { key: "market", name: "Market Research", icon: UserGroupIcon, color: "#22d3ee" },
    { key: "legal", name: "Legal & Compliance", icon: ScaleIcon, color: "#10b981" },
];

function formatCurrency(amount: number): string {
    if (amount >= 1000000000) {
        return `$${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
        return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
        return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount}`;
}

function AgentCard({
    agent,
    score,
    isAnalyzing,
    delay
}: {
    agent: typeof agentInfo[0];
    score?: AgentScore;
    isAnalyzing: boolean;
    delay: number;
}) {
    const [showDetails, setShowDetails] = useState(false);

    return (
        <motion.div
            className="card relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
        >
            {/* Glow Effect */}
            <motion.div
                className="absolute inset-0 opacity-20"
                style={{
                    background: `radial-gradient(circle at 50% 0%, ${agent.color}, transparent 70%)`,
                }}
                animate={isAnalyzing ? { opacity: [0.1, 0.3, 0.1] } : { opacity: 0.2 }}
                transition={{ duration: 2, repeat: isAnalyzing ? Infinity : 0 }}
            />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: `${agent.color}20` }}
                        >
                            <agent.icon className="w-5 h-5" style={{ color: agent.color }} />
                        </div>
                        <div>
                            <h3 className="font-semibold">{agent.name}</h3>
                            <p className="text-xs text-[var(--text-muted)]">
                                {isAnalyzing ? "Analyzing..." : "Analysis complete"}
                            </p>
                        </div>
                    </div>

                    {/* Score Badge */}
                    {score ? (
                        <motion.div
                            className="text-2xl font-bold"
                            style={{ color: agent.color }}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", delay: delay + 0.3 }}
                        >
                            {score.score}
                        </motion.div>
                    ) : (
                        <motion.div
                            className="w-8 h-8 rounded-full border-2 border-t-transparent"
                            style={{ borderColor: agent.color }}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                    )}
                </div>

                {/* Score Bar */}
                {score && (
                    <div className="mb-4">
                        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                            <motion.div
                                className="h-full rounded-full"
                                style={{ background: agent.color }}
                                initial={{ width: 0 }}
                                animate={{ width: `${score.score}%` }}
                                transition={{ duration: 1, delay: delay + 0.2 }}
                            />
                        </div>
                        <div className="flex justify-between mt-1 text-xs text-[var(--text-muted)]">
                            <span>Score</span>
                            <span>{score.confidence}% confidence</span>
                        </div>
                    </div>
                )}

                {/* Feedback */}
                {score && (
                    <div className="space-y-2">
                        <button
                            onClick={() => setShowDetails(!showDetails)}
                            className="w-full text-left text-sm text-[var(--text-secondary)] hover:text-white transition"
                        >
                            {showDetails ? "Hide details ↑" : "Show details ↓"}
                        </button>

                        <AnimatePresence>
                            {showDetails && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="space-y-3 pt-2">
                                        {/* Strengths */}
                                        <div>
                                            <div className="text-xs font-medium text-[#10b981] mb-1">Strengths</div>
                                            <ul className="space-y-1">
                                                {score.strengths.map((s, i) => (
                                                    <li key={i} className="text-xs text-[var(--text-secondary)] flex items-start gap-2">
                                                        <span className="text-[#10b981] mt-0.5">✓</span>
                                                        {s}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Concerns */}
                                        <div>
                                            <div className="text-xs font-medium text-[#f59e0b] mb-1">Concerns</div>
                                            <ul className="space-y-1">
                                                {score.concerns.map((c, i) => (
                                                    <li key={i} className="text-xs text-[var(--text-secondary)] flex items-start gap-2">
                                                        <span className="text-[#f59e0b] mt-0.5">!</span>
                                                        {c}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Feedback */}
                                        <div>
                                            <div className="text-xs font-medium text-[var(--text-secondary)] mb-1">Feedback</div>
                                            <ul className="space-y-1">
                                                {score.feedback.map((f, i) => (
                                                    <li key={i} className="text-xs text-[var(--text-muted)]">
                                                        • {f}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

function ResultBanner({ startup }: { startup: Startup }) {
    const status = startup.status;
    const analysis = startup.analysis;

    if (!analysis || status === "analyzing" || status === "pending") return null;

    const config = {
        approved: {
            icon: CheckCircleIcon,
            color: "#10b981",
            title: "Funding Approved",
            bgColor: "rgba(16, 185, 129, 0.1)",
        },
        conditional: {
            icon: ExclamationCircleIcon,
            color: "#f59e0b",
            title: "Conditional Approval",
            bgColor: "rgba(245, 158, 11, 0.1)",
        },
        rejected: {
            icon: XCircleIcon,
            color: "#ef4444",
            title: "Not Approved",
            bgColor: "rgba(239, 68, 68, 0.1)",
        },
    };

    const currentConfig = config[status as keyof typeof config] || config.rejected;
    const Icon = currentConfig.icon;

    return (
        <motion.div
            className="card mb-8"
            style={{ background: currentConfig.bgColor, borderColor: currentConfig.color }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <Icon className="w-12 h-12" style={{ color: currentConfig.color }} />
                    <div>
                        <h3 className="text-2xl font-bold" style={{ color: currentConfig.color }}>
                            {currentConfig.title}
                        </h3>
                        <p className="text-[var(--text-secondary)]">{analysis.summary}</p>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="text-center">
                        <div className="text-sm text-[var(--text-secondary)]">Overall Score</div>
                        <div className="text-3xl font-bold gradient-text">{analysis.overallScore}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm text-[var(--text-secondary)]">Valuation</div>
                        <div className="text-3xl font-bold" style={{ color: "#00f0ff" }}>
                            {formatCurrency(analysis.valuation)}
                        </div>
                    </div>
                </div>
            </div>

            {status === "approved" && (
                <div className="mt-6 pt-6 border-t border-[var(--glass-border)]">
                    <div className="flex flex-wrap gap-4">
                        <Link href="/funding">
                            <motion.button
                                className="btn-primary flex items-center gap-2"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <BanknotesIcon className="w-5 h-5" />
                                Start Fundraising
                            </motion.button>
                        </Link>
                        <Link href="/network">
                            <motion.button
                                className="btn-secondary flex items-center gap-2"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Connect with VCs
                                <ArrowRightIcon className="w-4 h-4" />
                            </motion.button>
                        </Link>
                    </div>
                </div>
            )}
        </motion.div>
    );
}

export default function PitchAnalysisPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const getStartup = useStore((state) => state.getStartup);
    const analyzeStartup = useStore((state) => state.analyzeStartup);

    const [startup, setStartup] = useState<Startup | undefined>();
    const [isAnalyzing, setIsAnalyzing] = useState(true);

    useEffect(() => {
        const loadStartup = () => {
            const data = getStartup(id);
            if (!data) {
                router.push("/pitch");
                return;
            }
            setStartup(data);

            if (data.status === "pending") {
                setIsAnalyzing(true);
                analyzeStartup(id).then(() => {
                    setIsAnalyzing(false);
                });
            } else if (data.status === "analyzing") {
                setIsAnalyzing(true);
                // Poll for completion
                const interval = setInterval(() => {
                    const updated = getStartup(id);
                    if (updated && updated.status !== "analyzing") {
                        setStartup(updated);
                        setIsAnalyzing(false);
                        clearInterval(interval);
                    }
                }, 500);
                return () => clearInterval(interval);
            } else {
                setIsAnalyzing(false);
            }
        };

        loadStartup();
    }, [id, getStartup, analyzeStartup, router]);

    // Refresh startup data periodically while analyzing
    useEffect(() => {
        if (!isAnalyzing) return;

        const interval = setInterval(() => {
            const updated = getStartup(id);
            if (updated) {
                setStartup(updated);
                if (updated.analysis) {
                    setIsAnalyzing(false);
                }
            }
        }, 500);

        return () => clearInterval(interval);
    }, [id, isAnalyzing, getStartup]);

    if (!startup) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <motion.div
                    className="w-12 h-12 border-4 border-[#00f0ff]/30 border-t-[#00f0ff] rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[var(--background)] relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-grid-pattern opacity-20" />

            <div className="relative z-10 container mx-auto px-6 py-12">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/pitch">
                        <motion.button
                            className="p-2 rounded-lg glass hover:bg-white/5 transition"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <ArrowLeftIcon className="w-5 h-5" />
                        </motion.button>
                    </Link>
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold">{startup.name}</h1>
                            <span className="px-3 py-1 text-sm rounded-full glass capitalize">
                                {startup.stage}
                            </span>
                        </div>
                        <p className="text-[var(--text-secondary)]">{startup.tagline}</p>
                    </div>
                </div>

                {/* Analysis Status */}
                {isAnalyzing && (
                    <motion.div
                        className="glass rounded-xl p-6 mb-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <div className="flex items-center gap-4">
                            <motion.div
                                className="w-12 h-12 rounded-full border-4 border-[#00f0ff]/30 border-t-[#00f0ff]"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                            <div>
                                <h3 className="text-xl font-semibold flex items-center gap-2">
                                    <SparklesIcon className="w-5 h-5 text-[#00f0ff]" />
                                    AI Swarm Analyzing...
                                </h3>
                                <p className="text-[var(--text-secondary)]">
                                    Our agents are evaluating your pitch across multiple dimensions
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Result Banner */}
                {!isAnalyzing && startup.analysis && <ResultBanner startup={startup} />}

                {/* Agent Analysis Grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {agentInfo.map((agent, index) => (
                        <AgentCard
                            key={agent.key}
                            agent={agent}
                            score={startup.analysis?.[agent.key as keyof typeof startup.analysis] as AgentScore | undefined}
                            isAnalyzing={isAnalyzing}
                            delay={index * 0.15}
                        />
                    ))}
                </div>

                {/* VC Interest Section */}
                {startup.analysis?.vcAgents && startup.analysis.vcAgents.length > 0 && (
                    <motion.div
                        className="card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                    >
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <BanknotesIcon className="w-5 h-5 text-[#a855f7]" />
                            VC Interest
                        </h3>
                        <div className="grid md:grid-cols-3 gap-4">
                            {startup.analysis.vcAgents.map((vc) => (
                                <div
                                    key={vc.vcId}
                                    className={`p-4 rounded-xl border ${vc.interested
                                            ? "border-[#10b981]/30 bg-[#10b981]/5"
                                            : "border-[var(--glass-border)]"
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium">{vc.vcName}</span>
                                        {vc.interested ? (
                                            <span className="px-2 py-0.5 text-xs rounded-full bg-[#10b981]/20 text-[#10b981]">
                                                Interested
                                            </span>
                                        ) : (
                                            <span className="px-2 py-0.5 text-xs rounded-full bg-white/5 text-[var(--text-muted)]">
                                                Pass
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-sm text-[var(--text-secondary)]">{vc.feedback}</div>
                                    {vc.interested && (
                                        <div className="mt-2">
                                            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-[#10b981]"
                                                    style={{ width: `${vc.interestLevel}%` }}
                                                />
                                            </div>
                                            <div className="text-xs text-[var(--text-muted)] mt-1">
                                                {vc.interestLevel}% interest level
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </main>
    );
}
