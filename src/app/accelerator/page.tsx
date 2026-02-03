"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
    ArrowLeftIcon,
    RocketLaunchIcon,
    ChartBarIcon,
    AcademicCapIcon,
    LightBulbIcon,
    UsersIcon,
    CalendarIcon,
    TrophyIcon,
    ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { useStore } from "@/lib/store";

const programs = [
    {
        id: "incubator",
        title: "Incubator Track",
        description: "For early-stage teams with an idea. 12-week intensive program.",
        duration: "12 weeks",
        stage: "Idea - MVP",
        icon: LightBulbIcon,
        color: "#00f0ff",
        features: ["Mentorship", "Workspace", "$25K Grant", "Demo Day"],
    },
    {
        id: "accelerator",
        title: "Accelerator Track",
        description: "For startups with traction. Scale fast with expert guidance.",
        duration: "8 weeks",
        stage: "MVP - Growth",
        icon: RocketLaunchIcon,
        color: "#a855f7",
        features: ["$100K Investment", "VC Intros", "Growth Coaching", "Global Network"],
    },
    {
        id: "scale",
        title: "Scale Program",
        description: "For growth-stage companies ready to dominate markets.",
        duration: "16 weeks",
        stage: "Growth - Scale",
        icon: TrophyIcon,
        color: "#10b981",
        features: ["$500K+ Funding", "C-Suite Advisors", "M&A Support", "IPO Prep"],
    },
];

const resources = [
    { title: "Pitch Templates", count: 12, icon: ChartBarIcon },
    { title: "Legal Documents", count: 24, icon: AcademicCapIcon },
    { title: "Financial Models", count: 8, icon: ChartBarIcon },
    { title: "Market Research", count: 16, icon: LightBulbIcon },
];

export default function AcceleratorPage() {
    const startups = useStore((state) => state.startups);
    const vcs = useStore((state) => state.vcs);

    // Get portfolio (approved startups)
    const portfolio = startups.filter((s) => s.status === "approved");

    return (
        <main className="min-h-screen bg-[var(--background)] relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-20" />

            <div className="relative z-10 container mx-auto px-6 py-12">
                {/* Header */}
                <div className="flex items-center gap-4 mb-12">
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
                            <RocketLaunchIcon className="w-8 h-8 text-[#00f0ff]" />
                            Accelerator Hub
                        </h1>
                        <p className="text-[var(--text-secondary)]">
                            Programs, resources, and portfolio management
                        </p>
                    </div>
                </div>

                {/* Stats Banner */}
                <motion.div
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {[
                        { label: "Active Startups", value: portfolio.length || 23, icon: RocketLaunchIcon },
                        { label: "VC Partners", value: vcs.length || 89, icon: UsersIcon },
                        { label: "Total Raised", value: "$47M+", icon: ChartBarIcon },
                        { label: "Success Rate", value: "78%", icon: TrophyIcon },
                    ].map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            className="card text-center"
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

                {/* Programs */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">Accelerator Programs</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {programs.map((program, index) => (
                            <motion.div
                                key={program.id}
                                className="card relative overflow-hidden group"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + index * 0.1 }}
                                whileHover={{ y: -8 }}
                            >
                                {/* Glow */}
                                <div
                                    className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity"
                                    style={{
                                        background: `radial-gradient(circle at 50% 0%, ${program.color}, transparent 70%)`,
                                    }}
                                />

                                <div className="relative z-10">
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                                        style={{ background: `${program.color}20` }}
                                    >
                                        <program.icon className="w-6 h-6" style={{ color: program.color }} />
                                    </div>

                                    <h3 className="text-xl font-semibold mb-2">{program.title}</h3>
                                    <p className="text-sm text-[var(--text-secondary)] mb-4">{program.description}</p>

                                    <div className="flex items-center gap-4 mb-4 text-sm">
                                        <span className="flex items-center gap-1 text-[var(--text-muted)]">
                                            <CalendarIcon className="w-4 h-4" />
                                            {program.duration}
                                        </span>
                                        <span className="text-[var(--text-muted)]">{program.stage}</span>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {program.features.map((feature) => (
                                            <span
                                                key={feature}
                                                className="px-2 py-1 text-xs rounded-full"
                                                style={{ background: `${program.color}15`, color: program.color }}
                                            >
                                                {feature}
                                            </span>
                                        ))}
                                    </div>

                                    <motion.button
                                        className="w-full py-2 rounded-xl border border-[var(--glass-border)] hover:border-white/30 transition flex items-center justify-center gap-2"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        Learn More
                                        <ArrowRightIcon className="w-4 h-4" />
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Portfolio + Resources Grid */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Portfolio */}
                    <div className="lg:col-span-2">
                        <div className="card">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <TrophyIcon className="w-5 h-5 text-[#10b981]" />
                                    Portfolio Companies
                                </h2>
                            </div>

                            {portfolio.length > 0 ? (
                                <div className="grid md:grid-cols-2 gap-4">
                                    {portfolio.map((startup, index) => (
                                        <motion.div
                                            key={startup.id}
                                            className="p-4 rounded-xl bg-[var(--background-tertiary)] border border-[var(--glass-border)] hover:border-[#10b981]/30 transition"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.3 + index * 0.1 }}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <div className="font-medium">{startup.name}</div>
                                                    <div className="text-sm text-[var(--text-secondary)]">
                                                        {startup.industry}
                                                    </div>
                                                </div>
                                                <span className="px-2 py-0.5 text-xs rounded-full bg-[#10b981]/20 text-[#10b981]">
                                                    Funded
                                                </span>
                                            </div>
                                            <div className="text-xs text-[var(--text-muted)]">{startup.tagline}</div>
                                            {startup.analysis && (
                                                <div className="mt-3 pt-3 border-t border-[var(--glass-border)] text-sm">
                                                    <span className="text-[#00f0ff]">
                                                        ${(startup.analysis.valuation / 1000000).toFixed(1)}M valuation
                                                    </span>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-[var(--text-secondary)]">
                                    <TrophyIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No portfolio companies yet</p>
                                    <Link href="/pitch">
                                        <button className="mt-4 text-[#00f0ff] hover:underline">
                                            Submit a pitch →
                                        </button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Resources */}
                    <div className="space-y-6">
                        <div className="card">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <AcademicCapIcon className="w-5 h-5 text-[#a855f7]" />
                                Resource Library
                            </h3>
                            <div className="space-y-3">
                                {resources.map((resource, index) => (
                                    <motion.div
                                        key={resource.title}
                                        className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition cursor-pointer"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 + index * 0.1 }}
                                        whileHover={{ x: 4 }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <resource.icon className="w-5 h-5 text-[#a855f7]" />
                                            <span>{resource.title}</span>
                                        </div>
                                        <span className="text-sm text-[var(--text-muted)]">{resource.count}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Upcoming Events */}
                        <div className="card">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <CalendarIcon className="w-5 h-5 text-[#00f0ff]" />
                                Upcoming Events
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { title: "Demo Day 2026", date: "Feb 15", type: "Live" },
                                    { title: "VC Networking", date: "Feb 20", type: "Virtual" },
                                    { title: "Pitch Workshop", date: "Feb 28", type: "Live" },
                                ].map((event, index) => (
                                    <motion.div
                                        key={event.title}
                                        className="p-3 rounded-xl bg-[var(--background-tertiary)]"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + index * 0.1 }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-sm">{event.title}</span>
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-[#00f0ff]/20 text-[#00f0ff]">
                                                {event.type}
                                            </span>
                                        </div>
                                        <div className="text-xs text-[var(--text-muted)] mt-1">{event.date}</div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
