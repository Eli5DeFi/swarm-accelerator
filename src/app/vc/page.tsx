"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeftIcon,
    BanknotesIcon,
    SparklesIcon,
    CheckIcon,
    UserCircleIcon,
    BuildingOffice2Icon,
    RocketLaunchIcon,
} from "@heroicons/react/24/outline";
import { useStore, type VCAgentPersona } from "@/lib/store";

const focusAreaOptions = [
    "AI / Machine Learning",
    "Blockchain / Web3",
    "FinTech",
    "HealthTech",
    "EdTech",
    "SaaS",
    "E-Commerce",
    "Climate Tech",
    "Gaming",
    "Deep Tech",
    "Consumer",
    "Enterprise",
];

const stageOptions = [
    { id: "pre-seed", label: "Pre-Seed", range: "$50K - $500K" },
    { id: "seed", label: "Seed", range: "$500K - $3M" },
    { id: "series-a", label: "Series A", range: "$3M - $15M" },
    { id: "series-b", label: "Series B", range: "$15M - $50M" },
    { id: "growth", label: "Growth", range: "$50M+" },
];

const personalityTraits = [
    "Analytical", "Visionary", "Risk-taker", "Conservative",
    "Hands-on", "Strategic", "Data-driven", "Intuitive",
    "Founder-friendly", "Metrics-focused",
];

export default function VCRegistrationPage() {
    const router = useRouter();
    const addVC = useStore((state) => state.addVC);

    const [step, setStep] = useState<"form" | "persona" | "complete">("form");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        firmName: "",
        email: "",
        fundSize: "",
        focusAreas: [] as string[],
        stagePreference: [] as string[],
        investmentRange: { min: 100000, max: 2000000 },
        thesis: "",
        portfolio: "",
    });

    const [persona, setPersona] = useState<VCAgentPersona>({
        name: "",
        personality: "",
        investmentStyle: "",
        riskTolerance: "moderate",
        priorities: [],
    });

    const updateForm = (field: string, value: unknown) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const toggleFocusArea = (area: string) => {
        setFormData((prev) => ({
            ...prev,
            focusAreas: prev.focusAreas.includes(area)
                ? prev.focusAreas.filter((a) => a !== area)
                : [...prev.focusAreas, area],
        }));
    };

    const toggleStage = (stage: string) => {
        setFormData((prev) => ({
            ...prev,
            stagePreference: prev.stagePreference.includes(stage)
                ? prev.stagePreference.filter((s) => s !== stage)
                : [...prev.stagePreference, stage],
        }));
    };

    const togglePriority = (priority: string) => {
        setPersona((prev) => ({
            ...prev,
            priorities: prev.priorities.includes(priority)
                ? prev.priorities.filter((p) => p !== priority)
                : prev.priorities.length < 3
                    ? [...prev.priorities, priority]
                    : prev.priorities,
        }));
    };

    const isFormValid = () => {
        return (
            formData.name &&
            formData.firmName &&
            formData.email &&
            formData.fundSize &&
            formData.focusAreas.length > 0 &&
            formData.stagePreference.length > 0 &&
            formData.thesis.length >= 50
        );
    };

    const isPersonaValid = () => {
        return (
            persona.name &&
            persona.personality &&
            persona.investmentStyle &&
            persona.priorities.length > 0
        );
    };

    const handleCreatePersona = () => {
        if (isFormValid()) {
            // Auto-generate persona name based on firm
            setPersona((prev) => ({
                ...prev,
                name: `${formData.firmName} Agent`,
            }));
            setStep("persona");
        }
    };

    const handleSubmit = async () => {
        if (!isPersonaValid()) return;

        setIsSubmitting(true);

        try {
            const vcId = addVC({
                name: formData.name,
                firmName: formData.firmName,
                email: formData.email,
                fundSize: formData.fundSize,
                focusAreas: formData.focusAreas,
                stagePreference: formData.stagePreference,
                investmentRange: formData.investmentRange,
                thesis: formData.thesis,
                portfolio: formData.portfolio.split(",").map((p) => p.trim()).filter(Boolean),
                agentPersona: persona,
            });

            setStep("complete");

            // Redirect after delay
            setTimeout(() => {
                router.push(`/vc/dashboard?id=${vcId}`);
            }, 3000);
        } catch (error) {
            console.error("Error registering VC:", error);
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-[var(--background)] relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-grid-pattern opacity-20" />
            <motion.div
                className="absolute bottom-20 left-1/4 w-96 h-96 rounded-full opacity-15"
                style={{ background: "radial-gradient(circle, #a855f7 0%, transparent 70%)" }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 10, repeat: Infinity }}
            />

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
                            <BanknotesIcon className="w-8 h-8 text-[#a855f7]" />
                            Join as VC Partner
                        </h1>
                        <p className="text-[var(--text-secondary)]">
                            Register your fund and create your AI persona agent
                        </p>
                    </div>
                </div>

                {/* Progress */}
                <div className="flex justify-center mb-12">
                    <div className="flex items-center gap-4">
                        {[
                            { id: "form", label: "Fund Details" },
                            { id: "persona", label: "AI Persona" },
                            { id: "complete", label: "Complete" },
                        ].map((s, index) => (
                            <div key={s.id} className="flex items-center">
                                <div
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${step === s.id
                                            ? "bg-gradient-to-r from-[#a855f7] to-[#ec4899] text-white"
                                            : (s.id === "form" && step !== "form") ||
                                                (s.id === "persona" && step === "complete")
                                                ? "bg-[#10b981] text-black"
                                                : "glass text-[var(--text-secondary)]"
                                        }`}
                                >
                                    {((s.id === "form" && step !== "form") ||
                                        (s.id === "persona" && step === "complete")) ? (
                                        <CheckIcon className="w-4 h-4" />
                                    ) : (
                                        <span className="w-4 text-center text-sm">{index + 1}</span>
                                    )}
                                    <span className="font-medium hidden sm:inline">{s.label}</span>
                                </div>
                                {index < 2 && (
                                    <div
                                        className={`w-8 h-0.5 mx-2 ${(s.id === "form" && step !== "form") ||
                                                (s.id === "persona" && step === "complete")
                                                ? "bg-[#10b981]"
                                                : "bg-[var(--glass-border)]"
                                            }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Container */}
                <div className="max-w-2xl mx-auto">
                    <AnimatePresence mode="wait">
                        {/* Step 1: Fund Details */}
                        {step === "form" && (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="card glass p-8"
                            >
                                <div className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Your Name *</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => updateForm("name", e.target.value)}
                                                placeholder="John Smith"
                                                className="w-full px-4 py-3 rounded-xl glass bg-white/5 border border-[var(--glass-border)] focus:border-[#a855f7] focus:outline-none transition"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Firm Name *</label>
                                            <input
                                                type="text"
                                                value={formData.firmName}
                                                onChange={(e) => updateForm("firmName", e.target.value)}
                                                placeholder="Acme Ventures"
                                                className="w-full px-4 py-3 rounded-xl glass bg-white/5 border border-[var(--glass-border)] focus:border-[#a855f7] focus:outline-none transition"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Email *</label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => updateForm("email", e.target.value)}
                                                placeholder="partner@ventures.com"
                                                className="w-full px-4 py-3 rounded-xl glass bg-white/5 border border-[var(--glass-border)] focus:border-[#a855f7] focus:outline-none transition"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Fund Size *</label>
                                            <select
                                                value={formData.fundSize}
                                                onChange={(e) => updateForm("fundSize", e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl glass bg-white/5 border border-[var(--glass-border)] focus:border-[#a855f7] focus:outline-none transition appearance-none"
                                            >
                                                <option value="" className="bg-[var(--background)]">Select fund size</option>
                                                <option value="<$10M" className="bg-[var(--background)]">{"<$10M"}</option>
                                                <option value="$10M-$50M" className="bg-[var(--background)]">$10M - $50M</option>
                                                <option value="$50M-$100M" className="bg-[var(--background)]">$50M - $100M</option>
                                                <option value="$100M-$500M" className="bg-[var(--background)]">$100M - $500M</option>
                                                <option value=">$500M" className="bg-[var(--background)]">{">$500M"}</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Focus Areas * (select all that apply)</label>
                                        <div className="flex flex-wrap gap-2">
                                            {focusAreaOptions.map((area) => (
                                                <button
                                                    key={area}
                                                    type="button"
                                                    onClick={() => toggleFocusArea(area)}
                                                    className={`px-3 py-1.5 rounded-full text-sm transition ${formData.focusAreas.includes(area)
                                                            ? "bg-[#a855f7] text-white"
                                                            : "glass hover:bg-white/5"
                                                        }`}
                                                >
                                                    {area}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Stage Preference *</label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {stageOptions.map((stage) => (
                                                <button
                                                    key={stage.id}
                                                    type="button"
                                                    onClick={() => toggleStage(stage.id)}
                                                    className={`p-3 rounded-xl text-left transition ${formData.stagePreference.includes(stage.id)
                                                            ? "bg-[#a855f7]/20 border border-[#a855f7]"
                                                            : "glass hover:bg-white/5 border border-transparent"
                                                        }`}
                                                >
                                                    <div className="font-medium text-sm">{stage.label}</div>
                                                    <div className="text-xs text-[var(--text-muted)]">{stage.range}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Investment Thesis * <span className="text-[var(--text-muted)]">(min 50 characters)</span>
                                        </label>
                                        <textarea
                                            value={formData.thesis}
                                            onChange={(e) => updateForm("thesis", e.target.value)}
                                            placeholder="Describe your investment philosophy, what you look for in startups, and your unique value proposition..."
                                            rows={4}
                                            className="w-full px-4 py-3 rounded-xl glass bg-white/5 border border-[var(--glass-border)] focus:border-[#a855f7] focus:outline-none transition resize-none"
                                        />
                                        <div className="text-right text-xs text-[var(--text-muted)] mt-1">
                                            {formData.thesis.length} / 50 min
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Notable Portfolio Companies (optional, comma-separated)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.portfolio}
                                            onChange={(e) => updateForm("portfolio", e.target.value)}
                                            placeholder="Company A, Company B, Company C"
                                            className="w-full px-4 py-3 rounded-xl glass bg-white/5 border border-[var(--glass-border)] focus:border-[#a855f7] focus:outline-none transition"
                                        />
                                    </div>
                                </div>

                                <div className="mt-8 flex justify-end">
                                    <motion.button
                                        onClick={handleCreatePersona}
                                        disabled={!isFormValid()}
                                        className={`flex items-center gap-2 px-8 py-3 rounded-xl transition ${isFormValid()
                                                ? "bg-gradient-to-r from-[#a855f7] to-[#ec4899] text-white"
                                                : "bg-[var(--glass-border)] cursor-not-allowed opacity-50"
                                            }`}
                                        whileHover={isFormValid() ? { scale: 1.02 } : {}}
                                        whileTap={isFormValid() ? { scale: 0.98 } : {}}
                                    >
                                        <SparklesIcon className="w-5 h-5" />
                                        Create AI Persona
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: AI Persona */}
                        {step === "persona" && (
                            <motion.div
                                key="persona"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="card glass p-8"
                            >
                                <div className="text-center mb-8">
                                    <motion.div
                                        className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#a855f7] to-[#ec4899] flex items-center justify-center mb-4"
                                        animate={{
                                            boxShadow: [
                                                "0 0 20px rgba(168, 85, 247, 0.3)",
                                                "0 0 40px rgba(168, 85, 247, 0.5)",
                                                "0 0 20px rgba(168, 85, 247, 0.3)",
                                            ],
                                        }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <UserCircleIcon className="w-10 h-10 text-white" />
                                    </motion.div>
                                    <h2 className="text-2xl font-bold mb-2">Configure Your AI Persona</h2>
                                    <p className="text-[var(--text-secondary)]">
                                        This agent will represent your investment preferences and participate in funding decisions
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Agent Name *</label>
                                        <input
                                            type="text"
                                            value={persona.name}
                                            onChange={(e) => setPersona((prev) => ({ ...prev, name: e.target.value }))}
                                            placeholder="e.g., Acme Ventures Agent"
                                            className="w-full px-4 py-3 rounded-xl glass bg-white/5 border border-[var(--glass-border)] focus:border-[#a855f7] focus:outline-none transition"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Personality Traits * (select up to 3)</label>
                                        <div className="flex flex-wrap gap-2">
                                            {personalityTraits.map((trait) => (
                                                <button
                                                    key={trait}
                                                    type="button"
                                                    onClick={() => togglePriority(trait)}
                                                    disabled={persona.priorities.length >= 3 && !persona.priorities.includes(trait)}
                                                    className={`px-3 py-1.5 rounded-full text-sm transition ${persona.priorities.includes(trait)
                                                            ? "bg-[#a855f7] text-white"
                                                            : persona.priorities.length >= 3
                                                                ? "glass opacity-50 cursor-not-allowed"
                                                                : "glass hover:bg-white/5"
                                                        }`}
                                                >
                                                    {trait}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="text-xs text-[var(--text-muted)] mt-2">
                                            Selected: {persona.priorities.length}/3
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Investment Style *</label>
                                        <textarea
                                            value={persona.investmentStyle}
                                            onChange={(e) => setPersona((prev) => ({ ...prev, investmentStyle: e.target.value }))}
                                            placeholder="Describe how this agent should evaluate opportunities (e.g., 'Focus heavily on team experience and market size. Value profitability over growth...')"
                                            rows={3}
                                            className="w-full px-4 py-3 rounded-xl glass bg-white/5 border border-[var(--glass-border)] focus:border-[#a855f7] focus:outline-none transition resize-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Agent Personality *</label>
                                        <textarea
                                            value={persona.personality}
                                            onChange={(e) => setPersona((prev) => ({ ...prev, personality: e.target.value }))}
                                            placeholder="Describe the agent's communication style (e.g., 'Direct and to-the-point. Asks tough questions but provides constructive feedback...')"
                                            rows={3}
                                            className="w-full px-4 py-3 rounded-xl glass bg-white/5 border border-[var(--glass-border)] focus:border-[#a855f7] focus:outline-none transition resize-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Risk Tolerance *</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {(["conservative", "moderate", "aggressive"] as const).map((level) => (
                                                <button
                                                    key={level}
                                                    type="button"
                                                    onClick={() => setPersona((prev) => ({ ...prev, riskTolerance: level }))}
                                                    className={`p-4 rounded-xl text-center transition ${persona.riskTolerance === level
                                                            ? "bg-[#a855f7]/20 border border-[#a855f7]"
                                                            : "glass hover:bg-white/5 border border-transparent"
                                                        }`}
                                                >
                                                    <div className="font-medium capitalize">{level}</div>
                                                    <div className="text-xs text-[var(--text-muted)]">
                                                        {level === "conservative" && "Low risk, stable returns"}
                                                        {level === "moderate" && "Balanced approach"}
                                                        {level === "aggressive" && "High risk, high reward"}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 flex justify-between">
                                    <motion.button
                                        onClick={() => setStep("form")}
                                        className="flex items-center gap-2 px-6 py-3 rounded-xl glass hover:bg-white/5 transition"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <ArrowLeftIcon className="w-4 h-4" />
                                        Back
                                    </motion.button>

                                    <motion.button
                                        onClick={handleSubmit}
                                        disabled={!isPersonaValid() || isSubmitting}
                                        className={`flex items-center gap-2 px-8 py-3 rounded-xl transition ${isPersonaValid() && !isSubmitting
                                                ? "bg-gradient-to-r from-[#a855f7] to-[#ec4899] text-white"
                                                : "bg-[var(--glass-border)] cursor-not-allowed opacity-50"
                                            }`}
                                        whileHover={isPersonaValid() && !isSubmitting ? { scale: 1.02 } : {}}
                                        whileTap={isPersonaValid() && !isSubmitting ? { scale: 0.98 } : {}}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <motion.div
                                                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                />
                                                Creating Agent...
                                            </>
                                        ) : (
                                            <>
                                                <RocketLaunchIcon className="w-5 h-5" />
                                                Complete Registration
                                            </>
                                        )}
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Complete */}
                        {step === "complete" && (
                            <motion.div
                                key="complete"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="card glass p-8 text-center"
                            >
                                <motion.div
                                    className="w-24 h-24 mx-auto rounded-full bg-[#10b981] flex items-center justify-center mb-6"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", delay: 0.2 }}
                                >
                                    <CheckIcon className="w-12 h-12 text-white" />
                                </motion.div>

                                <h2 className="text-3xl font-bold mb-4">Welcome to SwarmAccelerator!</h2>
                                <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
                                    Your AI persona agent has been created and is now ready to participate in funding decisions.
                                </p>

                                <div className="p-6 rounded-xl bg-[var(--background-tertiary)] mb-6">
                                    <div className="flex items-center justify-center gap-4 mb-4">
                                        <motion.div
                                            className="w-16 h-16 rounded-full bg-gradient-to-br from-[#a855f7] to-[#ec4899] flex items-center justify-center"
                                            animate={{
                                                boxShadow: [
                                                    "0 0 20px rgba(168, 85, 247, 0.3)",
                                                    "0 0 40px rgba(168, 85, 247, 0.5)",
                                                    "0 0 20px rgba(168, 85, 247, 0.3)",
                                                ],
                                            }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        >
                                            <BuildingOffice2Icon className="w-8 h-8 text-white" />
                                        </motion.div>
                                        <div className="text-left">
                                            <div className="font-semibold text-lg">{persona.name}</div>
                                            <div className="text-sm text-[var(--text-secondary)]">{formData.firmName}</div>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {persona.priorities.map((p) => (
                                            <span key={p} className="px-2 py-1 text-xs rounded-full bg-[#a855f7]/20 text-[#a855f7]">
                                                {p}
                                            </span>
                                        ))}
                                        <span className="px-2 py-1 text-xs rounded-full bg-[#00f0ff]/20 text-[#00f0ff] capitalize">
                                            {persona.riskTolerance}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-sm text-[var(--text-muted)]">
                                    Redirecting to your dashboard...
                                </p>
                                <motion.div
                                    className="w-8 h-8 mx-auto mt-4 border-2 border-[#a855f7]/30 border-t-[#a855f7] rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </main>
    );
}
