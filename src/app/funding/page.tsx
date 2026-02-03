"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    ArrowLeftIcon,
    BanknotesIcon,
    ChartBarIcon,
    CurrencyDollarIcon,
    ScaleIcon,
    ArrowTrendingUpIcon,
    CheckCircleIcon,
    ClockIcon,
    SparklesIcon,
    UsersIcon,
} from "@heroicons/react/24/outline";
import { useStore } from "@/lib/store";

// Mock ICO projects
const mockICOProjects = [
    {
        id: "ico1",
        name: "NeuralChain AI",
        description: "Decentralized AI compute marketplace",
        tokenSymbol: "NCAI",
        softCap: 500000,
        hardCap: 2000000,
        raised: 1450000,
        contributors: 342,
        daysLeft: 5,
        futarchyScore: 78,
        priceImpact: { yes: 2.4, no: -1.2 },
    },
    {
        id: "ico2",
        name: "GreenLedger",
        description: "Carbon credit tokenization platform",
        tokenSymbol: "GRNL",
        softCap: 300000,
        hardCap: 1000000,
        raised: 620000,
        contributors: 189,
        daysLeft: 12,
        futarchyScore: 65,
        priceImpact: { yes: 1.8, no: -0.9 },
    },
];

function FutarchyExplainer() {
    return (
        <motion.div
            className="card mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#a855f7] to-[#ec4899] flex items-center justify-center flex-shrink-0">
                    <ScaleIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                        Futarchy Governance
                        <span className="px-2 py-0.5 text-xs rounded-full bg-[#a855f7]/20 text-[#a855f7]">
                            Prediction Markets
                        </span>
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] mb-4">
                        Futarchy uses prediction markets to make funding decisions. Participants bet on whether
                        funding a project will increase its value. The market price reflects collective wisdom
                        about the project&apos;s potential success.
                    </p>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div className="p-3 rounded-lg bg-[var(--background-tertiary)]">
                            <div className="font-medium text-[#10b981] mb-1">YES Market</div>
                            <div className="text-[var(--text-muted)]">
                                Price shows expected value if project is funded
                            </div>
                        </div>
                        <div className="p-3 rounded-lg bg-[var(--background-tertiary)]">
                            <div className="font-medium text-[#ef4444] mb-1">NO Market</div>
                            <div className="text-[var(--text-muted)]">
                                Price shows expected value if project is NOT funded
                            </div>
                        </div>
                        <div className="p-3 rounded-lg bg-[var(--background-tertiary)]">
                            <div className="font-medium text-[#00f0ff] mb-1">Decision</div>
                            <div className="text-[var(--text-muted)]">
                                Fund if YES price {">"} NO price
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function ICOCard({ project, index }: { project: typeof mockICOProjects[0]; index: number }) {
    const [contributionAmount, setContributionAmount] = useState("");
    const progressPercent = (project.raised / project.hardCap) * 100;
    const softCapReached = project.raised >= project.softCap;

    return (
        <motion.div
            className="card relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
        >
            {/* Status Badge */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
                <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-[#00f0ff]/20 text-[#00f0ff]">
                    <ClockIcon className="w-3 h-3" />
                    {project.daysLeft} days left
                </span>
            </div>

            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#00f0ff] to-[#a855f7] flex items-center justify-center text-lg font-bold text-black">
                    {project.tokenSymbol.slice(0, 2)}
                </div>
                <div>
                    <h3 className="text-xl font-semibold">{project.name}</h3>
                    <p className="text-sm text-[var(--text-secondary)]">{project.description}</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-[var(--text-secondary)]">
                        ${(project.raised / 1000000).toFixed(2)}M raised
                    </span>
                    <span className="text-[var(--text-muted)]">
                        of ${(project.hardCap / 1000000).toFixed(1)}M
                    </span>
                </div>
                <div className="h-3 rounded-full bg-white/10 overflow-hidden relative">
                    {/* Soft cap marker */}
                    <div
                        className="absolute top-0 bottom-0 w-px bg-[#f59e0b] z-10"
                        style={{ left: `${(project.softCap / project.hardCap) * 100}%` }}
                    />
                    <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-[#00f0ff] to-[#a855f7]"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                    />
                </div>
                <div className="flex justify-between text-xs mt-1">
                    <span className="text-[var(--text-muted)]">
                        {softCapReached ? (
                            <span className="text-[#10b981] flex items-center gap-1">
                                <CheckCircleIcon className="w-3 h-3" />
                                Soft cap reached
                            </span>
                        ) : (
                            `Soft cap: $${(project.softCap / 1000).toFixed(0)}K`
                        )}
                    </span>
                    <span>{progressPercent.toFixed(1)}%</span>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                <div>
                    <div className="text-lg font-bold text-[#00f0ff]">{project.contributors}</div>
                    <div className="text-xs text-[var(--text-muted)]">Contributors</div>
                </div>
                <div>
                    <div className="text-lg font-bold gradient-text">{project.futarchyScore}</div>
                    <div className="text-xs text-[var(--text-muted)]">Futarchy Score</div>
                </div>
                <div>
                    <div className="text-lg font-bold text-[#a855f7]">${project.tokenSymbol}</div>
                    <div className="text-xs text-[var(--text-muted)]">Token</div>
                </div>
            </div>

            {/* Futarchy Markets */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 rounded-xl bg-[#10b981]/10 border border-[#10b981]/30">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-[#10b981]">YES Market</span>
                        <ArrowTrendingUpIcon className="w-4 h-4 text-[#10b981]" />
                    </div>
                    <div className="text-xl font-bold text-[#10b981]">+{project.priceImpact.yes}%</div>
                    <div className="text-xs text-[var(--text-muted)]">Expected if funded</div>
                </div>
                <div className="p-3 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/30">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-[#ef4444]">NO Market</span>
                        <ArrowTrendingUpIcon className="w-4 h-4 text-[#ef4444] rotate-180" />
                    </div>
                    <div className="text-xl font-bold text-[#ef4444]">{project.priceImpact.no}%</div>
                    <div className="text-xs text-[var(--text-muted)]">Expected if not funded</div>
                </div>
            </div>

            {/* Contribution Input */}
            <div className="space-y-3">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <CurrencyDollarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                        <input
                            type="number"
                            value={contributionAmount}
                            onChange={(e) => setContributionAmount(e.target.value)}
                            placeholder="Amount in USDC"
                            className="w-full pl-10 pr-4 py-3 rounded-xl glass bg-white/5 border border-[var(--glass-border)] focus:border-[#00f0ff] focus:outline-none transition"
                        />
                    </div>
                    <motion.button
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#a855f7] text-black font-medium"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Contribute
                    </motion.button>
                </div>
                <div className="flex justify-center gap-2">
                    {[100, 500, 1000, 5000].map((amount) => (
                        <button
                            key={amount}
                            onClick={() => setContributionAmount(amount.toString())}
                            className="px-3 py-1 text-xs rounded-lg glass hover:bg-white/5 transition"
                        >
                            ${amount}
                        </button>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

export default function FundingPage() {
    const startups = useStore((state) => state.startups);
    const approvedStartups = startups.filter((s) => s.status === "approved");

    // Combine real approved startups with mock ICO data for demo
    const icoProjects = mockICOProjects;

    return (
        <main className="min-h-screen bg-[var(--background)] relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-20" />

            <div className="relative z-10 container mx-auto px-6 py-12">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
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
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <BanknotesIcon className="w-8 h-8 text-[#00f0ff]" />
                            Funding & ICO
                        </h1>
                        <p className="text-[var(--text-secondary)]">
                            Invest in approved startups via stablecoin with Futarchy governance
                        </p>
                    </div>
                </div>

                {/* Stats Banner */}
                <motion.div
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {[
                        { label: "Active ICOs", value: icoProjects.length + approvedStartups.length, icon: ChartBarIcon },
                        { label: "Total Raised", value: "$2.07M", icon: BanknotesIcon },
                        { label: "Contributors", value: "531", icon: UsersIcon },
                        { label: "Avg ROI", value: "+34%", icon: ArrowTrendingUpIcon },
                    ].map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            className="card text-center py-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <stat.icon className="w-6 h-6 mx-auto mb-2 text-[#00f0ff]" />
                            <div className="text-2xl font-bold gradient-text">{stat.value}</div>
                            <div className="text-sm text-[var(--text-secondary)]">{stat.label}</div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Futarchy Explainer */}
                <FutarchyExplainer />

                {/* ICO Projects */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <SparklesIcon className="w-6 h-6 text-[#a855f7]" />
                        Active Fundraising Rounds
                    </h2>

                    <div className="grid lg:grid-cols-2 gap-6">
                        {icoProjects.map((project, index) => (
                            <ICOCard key={project.id} project={project} index={index} />
                        ))}
                    </div>
                </div>

                {/* Approved Startups Ready for ICO */}
                {approvedStartups.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold mb-6">Ready to Launch ICO</h2>
                        <div className="grid md:grid-cols-3 gap-4">
                            {approvedStartups.map((startup, index) => (
                                <motion.div
                                    key={startup.id}
                                    className="card"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 + index * 0.1 }}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10b981] to-[#22d3ee] flex items-center justify-center">
                                            <CheckCircleIcon className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <div className="font-medium">{startup.name}</div>
                                            <div className="text-sm text-[var(--text-secondary)]">{startup.industry}</div>
                                        </div>
                                    </div>
                                    <div className="text-sm text-[#00f0ff] mb-3">
                                        ${startup.analysis ? (startup.analysis.valuation / 1000000).toFixed(1) : "0"}M valuation
                                    </div>
                                    <motion.button
                                        className="w-full py-2 rounded-xl border border-[#10b981] text-[#10b981] hover:bg-[#10b981]/10 transition text-sm"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        Launch ICO
                                    </motion.button>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* How Stablecoin Funding Works */}
                <motion.div
                    className="mt-12 card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <h3 className="text-lg font-semibold mb-4">How Stablecoin Funding Works</h3>
                    <div className="grid md:grid-cols-4 gap-4">
                        {[
                            { step: 1, title: "Connect Wallet", desc: "Link your Web3 wallet with USDC" },
                            { step: 2, title: "Choose Project", desc: "Select an approved startup to fund" },
                            { step: 3, title: "Contribute", desc: "Send USDC to the funding contract" },
                            { step: 4, title: "Receive Tokens", desc: "Get project tokens after ICO closes" },
                        ].map((item, index) => (
                            <motion.div
                                key={item.step}
                                className="text-center p-4 rounded-xl bg-[var(--background-tertiary)]"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 + index * 0.1 }}
                            >
                                <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-gradient-to-r from-[#00f0ff] to-[#a855f7] flex items-center justify-center text-black font-bold text-sm">
                                    {item.step}
                                </div>
                                <div className="font-medium mb-1">{item.title}</div>
                                <div className="text-xs text-[var(--text-muted)]">{item.desc}</div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
