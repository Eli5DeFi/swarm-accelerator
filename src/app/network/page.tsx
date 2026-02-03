"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    ArrowLeftIcon,
    UserGroupIcon,
    ChatBubbleLeftRightIcon,
    BuildingOffice2Icon,
    RocketLaunchIcon,
    SparklesIcon,
    MagnifyingGlassIcon,
    CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import { useStore } from "@/lib/store";

type ConnectionType = "all" | "startups" | "vcs" | "mentors";

export default function NetworkPage() {
    const startups = useStore((state) => state.startups);
    const vcs = useStore((state) => state.vcs);

    const [filter, setFilter] = useState<ConnectionType>("all");
    const [searchQuery, setSearchQuery] = useState("");

    // Combine startups and VCs for the network
    const fundedStartups = startups.filter((s) => s.status === "approved");

    // Mock mentors
    const mentors = [
        { id: "m1", name: "Sarah Chen", role: "Growth Expert", company: "ex-Stripe", avatar: "🧑‍💼", specialty: "GTM Strategy" },
        { id: "m2", name: "Marcus Johnson", role: "Tech Advisor", company: "ex-Google", avatar: "👨‍💻", specialty: "Engineering" },
        { id: "m3", name: "Elena Rodriguez", role: "Finance Expert", company: "ex-Goldman", avatar: "👩‍💼", specialty: "Fundraising" },
    ];

    const allConnections = [
        ...fundedStartups.map((s) => ({ type: "startup" as const, data: s })),
        ...vcs.map((v) => ({ type: "vc" as const, data: v })),
        ...mentors.map((m) => ({ type: "mentor" as const, data: m })),
    ];

    const filteredConnections = allConnections.filter((conn) => {
        if (filter !== "all") {
            if (filter === "startups" && conn.type !== "startup") return false;
            if (filter === "vcs" && conn.type !== "vc") return false;
            if (filter === "mentors" && conn.type !== "mentor") return false;
        }

        if (searchQuery) {
            const name = conn.type === "startup"
                ? conn.data.name
                : conn.type === "vc"
                    ? (conn.data as typeof vcs[0]).firmName
                    : (conn.data as typeof mentors[0]).name;
            return name.toLowerCase().includes(searchQuery.toLowerCase());
        }

        return true;
    });

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
                            <UserGroupIcon className="w-8 h-8 text-[#22d3ee]" />
                            Network
                        </h1>
                        <p className="text-[var(--text-secondary)]">
                            Connect with startups, VCs, and mentors
                        </p>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                        <input
                            type="text"
                            placeholder="Search connections..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl glass bg-white/5 border border-[var(--glass-border)] focus:border-[#22d3ee] focus:outline-none transition"
                        />
                    </div>

                    <div className="flex gap-2">
                        {(["all", "startups", "vcs", "mentors"] as const).map((type) => (
                            <motion.button
                                key={type}
                                onClick={() => setFilter(type)}
                                className={`px-4 py-2 rounded-xl transition capitalize ${filter === type
                                        ? "bg-[#22d3ee] text-black font-medium"
                                        : "glass hover:bg-white/5"
                                    }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {type}
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {[
                        { label: "Startups", count: fundedStartups.length || 23, icon: RocketLaunchIcon },
                        { label: "VCs", count: vcs.length || 89, icon: BuildingOffice2Icon },
                        { label: "Mentors", count: mentors.length + 12, icon: SparklesIcon },
                    ].map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            className="card text-center py-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <stat.icon className="w-6 h-6 mx-auto mb-2 text-[#22d3ee]" />
                            <div className="text-2xl font-bold">{stat.count}</div>
                            <div className="text-sm text-[var(--text-secondary)]">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Connections Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredConnections.length > 0 ? (
                        filteredConnections.map((conn, index) => (
                            <motion.div
                                key={`${conn.type}-${conn.type === "startup" ? conn.data.id : conn.type === "vc" ? conn.data.id : (conn.data as typeof mentors[0]).id}`}
                                className="card relative overflow-hidden group"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ y: -4 }}
                            >
                                {/* Type Badge */}
                                <span className={`absolute top-4 right-4 px-2 py-0.5 text-xs rounded-full ${conn.type === "startup"
                                        ? "bg-[#00f0ff]/20 text-[#00f0ff]"
                                        : conn.type === "vc"
                                            ? "bg-[#a855f7]/20 text-[#a855f7]"
                                            : "bg-[#10b981]/20 text-[#10b981]"
                                    }`}>
                                    {conn.type === "startup" ? "Startup" : conn.type === "vc" ? "VC" : "Mentor"}
                                </span>

                                {conn.type === "startup" && (
                                    <>
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00f0ff] to-[#22d3ee] flex items-center justify-center">
                                                <RocketLaunchIcon className="w-6 h-6 text-black" />
                                            </div>
                                            <div>
                                                <div className="font-semibold flex items-center gap-2">
                                                    {conn.data.name}
                                                    <CheckBadgeIcon className="w-4 h-4 text-[#10b981]" />
                                                </div>
                                                <div className="text-sm text-[var(--text-secondary)]">{conn.data.industry}</div>
                                            </div>
                                        </div>
                                        <p className="text-sm text-[var(--text-muted)] mb-4">{conn.data.tagline}</p>
                                        {conn.data.analysis && (
                                            <div className="text-sm text-[#00f0ff]">
                                                ${(conn.data.analysis.valuation / 1000000).toFixed(1)}M valuation
                                            </div>
                                        )}
                                    </>
                                )}

                                {conn.type === "vc" && (
                                    <>
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#a855f7] to-[#ec4899] flex items-center justify-center">
                                                <BuildingOffice2Icon className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <div className="font-semibold">{(conn.data as typeof vcs[0]).firmName}</div>
                                                <div className="text-sm text-[var(--text-secondary)]">{(conn.data as typeof vcs[0]).name}</div>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {(conn.data as typeof vcs[0]).focusAreas.slice(0, 3).map((area) => (
                                                <span key={area} className="px-2 py-0.5 text-xs rounded-full bg-[#a855f7]/20 text-[#a855f7]">
                                                    {area}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="text-sm text-[var(--text-muted)]">
                                            {(conn.data as typeof vcs[0]).fundSize} fund
                                        </div>
                                    </>
                                )}

                                {conn.type === "mentor" && (
                                    <>
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#10b981] to-[#22d3ee] flex items-center justify-center text-2xl">
                                                {(conn.data as typeof mentors[0]).avatar}
                                            </div>
                                            <div>
                                                <div className="font-semibold">{(conn.data as typeof mentors[0]).name}</div>
                                                <div className="text-sm text-[var(--text-secondary)]">{(conn.data as typeof mentors[0]).role}</div>
                                            </div>
                                        </div>
                                        <div className="text-sm text-[var(--text-muted)] mb-2">
                                            {(conn.data as typeof mentors[0]).company}
                                        </div>
                                        <span className="px-2 py-0.5 text-xs rounded-full bg-[#10b981]/20 text-[#10b981]">
                                            {(conn.data as typeof mentors[0]).specialty}
                                        </span>
                                    </>
                                )}

                                {/* Connect Button */}
                                <motion.button
                                    className="w-full mt-4 py-2 rounded-xl border border-[var(--glass-border)] hover:border-[#22d3ee] hover:bg-[#22d3ee]/10 transition flex items-center justify-center gap-2 text-sm"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <ChatBubbleLeftRightIcon className="w-4 h-4" />
                                    Connect
                                </motion.button>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 text-[var(--text-secondary)]">
                            <UserGroupIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No connections found</p>
                            <p className="text-sm text-[var(--text-muted)]">
                                {searchQuery ? "Try a different search term" : "Network members will appear here"}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
