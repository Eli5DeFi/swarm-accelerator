"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  RocketLaunchIcon,
  BanknotesIcon,
  UserGroupIcon,
  SparklesIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  ScaleIcon,
} from "@heroicons/react/24/outline";

// Agent data for visualization
const agents = [
  { id: 1, name: "Financial Analyst", icon: ChartBarIcon, color: "#00f0ff", delay: 0 },
  { id: 2, name: "Technical DD", icon: CpuChipIcon, color: "#a855f7", delay: 0.5 },
  { id: 3, name: "Market Research", icon: UserGroupIcon, color: "#22d3ee", delay: 1 },
  { id: 4, name: "Legal & Compliance", icon: ScaleIcon, color: "#10b981", delay: 1.5 },
];

// Stats data
const stats = [
  { value: "$47M+", label: "Total Funded" },
  { value: "234", label: "Startups Accelerated" },
  { value: "89", label: "VC Partners" },
  { value: "4.8s", label: "Avg Analysis Time" },
];

// How it works steps
const steps = [
  {
    step: 1,
    title: "Submit Your Pitch",
    description: "Upload your deck and provide key details about your startup. Our AI agents begin analysis immediately.",
    icon: RocketLaunchIcon,
  },
  {
    step: 2,
    title: "AI Swarm Analysis",
    description: "Four specialized agents evaluate financials, technology, market potential, and compliance simultaneously.",
    icon: SparklesIcon,
  },
  {
    step: 3,
    title: "Get Funded & Connected",
    description: "Receive valuation, connect with matching VCs, and access our full accelerator ecosystem.",
    icon: BanknotesIcon,
  },
];

// Product suite
const products = [
  {
    title: "🎯 Pitch Accelerator",
    description: "4 AI agents analyze your startup in 20 seconds",
    href: "/pitch",
    price: "Free - $499",
    features: ["Financial analysis", "Technical DD", "Market research", "Legal compliance"],
  },
  {
    title: "🔥 DeFi Protocol Accelerator",
    description: "Complete DeFi launch: tokenomics, security, liquidity",
    href: "/defi",
    price: "$2,999",
    features: ["Tokenomics design (ve-model)", "Smart contract audit", "Liquidity strategy", "72-hour delivery"],
  },
  {
    title: "💰 Capital Marketplace",
    description: "AI-powered investor matching + OTC trading",
    href: "/marketplace-demo",
    price: "$199 - $999/mo",
    features: ["Investor matching", "OTC order book", "Dark pool", "Success fees"],
  },
  {
    title: "🚀 M&A Exit Accelerator",
    description: "Complete exit analysis: valuation, acquirers, DD prep",
    href: "/exit",
    price: "$9,999",
    features: ["20-30 acquirer matches", "Valuation range", "Due diligence prep", "Deal structure"],
  },
];

// Agent Orb Component
function AgentOrb({ agent, index }: { agent: typeof agents[0]; index: number }) {
  return (
    <motion.div
      className="absolute"
      style={{
        top: "50%",
        left: "50%",
      }}
      animate={{
        rotate: [0, 360],
      }}
      transition={{
        duration: 20 + index * 5,
        repeat: Infinity,
        ease: "linear",
        delay: agent.delay,
      }}
    >
      <motion.div
        className="relative"
        style={{
          transform: `translateX(${120 + index * 40}px) translateY(-50%)`,
        }}
        animate={{
          rotate: [0, -360],
        }}
        transition={{
          duration: 20 + index * 5,
          repeat: Infinity,
          ease: "linear",
          delay: agent.delay,
        }}
      >
        <motion.div
          className="agent-orb glass"
          style={{
            boxShadow: `0 0 30px ${agent.color}40, 0 0 60px ${agent.color}20`,
            background: `linear-gradient(135deg, ${agent.color}20, transparent)`,
          }}
          whileHover={{ scale: 1.2 }}
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: index * 0.3,
          }}
        >
          <agent.icon className="w-8 h-8" style={{ color: agent.color }} />
        </motion.div>
        <motion.div
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium"
          style={{ color: agent.color }}
        >
          {agent.name}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// Hero Section
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      <div className="absolute inset-0 radial-overlay" />

      {/* Gradient Orbs */}
      <motion.div
        className="absolute top-20 left-1/4 w-96 h-96 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #00f0ff 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 right-1/4 w-80 h-80 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #a855f7 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.35, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, delay: 2 }}
      />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <SparklesIcon className="w-4 h-4 text-[#00f0ff]" />
              <span className="text-sm text-[var(--text-secondary)]">AI-Powered Accelerator</span>
            </motion.div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              <span className="text-white">Pitch to the</span>
              <br />
              <span className="gradient-text">Agent Swarm</span>
            </h1>

            <p className="text-xl text-[var(--text-secondary)] mb-8 max-w-xl">
              Complete AI platform: <span className="text-[#00f0ff]">Pitch Analysis</span>, 
              <span className="text-[#a855f7]"> Investor Matching</span>, 
              <span className="text-[#00f0ff]"> OTC Trading</span>, and 
              <span className="text-[#a855f7]"> M&A Exit</span> — all powered by AI agents.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/pitch">
                <motion.button
                  className="btn-primary text-lg flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <RocketLaunchIcon className="w-5 h-5" />
                  Start Pitching
                </motion.button>
              </Link>
              <Link href="/marketplace-demo">
                <motion.button
                  className="btn-secondary text-lg flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <BanknotesIcon className="w-5 h-5" />
                  Capital Marketplace
                </motion.button>
              </Link>
              <Link href="/exit">
                <motion.button
                  className="btn-secondary text-lg flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ChartBarIcon className="w-5 h-5" />
                  M&A Exit
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Right - Agent Swarm Visualization */}
          <motion.div
            className="relative h-[500px] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            {/* Central Core */}
            <motion.div
              className="absolute w-32 h-32 rounded-full glass glow-cyan flex items-center justify-center"
              animate={{
                boxShadow: [
                  "0 0 30px rgba(0, 240, 255, 0.3), 0 0 60px rgba(0, 240, 255, 0.15)",
                  "0 0 50px rgba(0, 240, 255, 0.5), 0 0 100px rgba(0, 240, 255, 0.25)",
                  "0 0 30px rgba(0, 240, 255, 0.3), 0 0 60px rgba(0, 240, 255, 0.15)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <SparklesIcon className="w-12 h-12 text-[#00f0ff]" />
            </motion.div>

            {/* Orbiting Agents */}
            {agents.map((agent, index) => (
              <AgentOrb key={agent.id} agent={agent} index={index} />
            ))}

            {/* Connection Lines (visual effect) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0.3" />
                </linearGradient>
              </defs>
              {[160, 200, 240, 280].map((r, i) => (
                <motion.circle
                  key={i}
                  cx="50%"
                  cy="50%"
                  r={r}
                  fill="none"
                  stroke="url(#lineGrad)"
                  strokeWidth="1"
                  strokeDasharray="8 8"
                  initial={{ opacity: 0.2 }}
                  animate={{ opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
                />
              ))}
            </svg>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Stats Section
function StatsSection() {
  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                {stat.value}
              </div>
              <div className="text-[var(--text-secondary)]">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// How It Works Section
function HowItWorksSection() {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
            Three simple steps to get your startup funded and accelerated
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              className="relative"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <div className="card h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00f0ff] to-[#a855f7] flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-black" />
                  </div>
                  <span className="text-5xl font-bold text-[var(--background-tertiary)]">
                    0{step.step}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-[var(--text-secondary)]">{step.description}</p>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-[#00f0ff] to-transparent" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Products Section
function ProductsSection() {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Complete <span className="gradient-text">Product Suite</span>
          </h2>
          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
            From pitch analysis to exit — we've got your entire startup journey covered
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <Link href={product.href}>
                <div className="card h-full hover:scale-[1.02] transition-transform cursor-pointer glass-hover">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold">{product.title}</h3>
                    <span className="text-sm px-3 py-1 rounded-full bg-green-600/20 text-green-400 border border-green-600/30">
                      {product.price}
                    </span>
                  </div>
                  <p className="text-[var(--text-secondary)] mb-6">
                    {product.description}
                  </p>
                  <ul className="space-y-2">
                    {product.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                        <svg className="w-4 h-4 text-[#00f0ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 flex items-center gap-2 text-[#00f0ff]">
                    <span>Launch →</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Unified Stats */}
        <motion.div
          className="mt-16 p-8 rounded-2xl glass text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-3xl font-bold gradient-text mb-1">$13M-18M</div>
              <div className="text-sm text-[var(--text-secondary)]">ARR Potential (Year 1)</div>
            </div>
            <div>
              <div className="text-3xl font-bold gradient-text mb-1">4 Products</div>
              <div className="text-sm text-[var(--text-secondary)]">Pitch, DeFi, Marketplace, M&A</div>
            </div>
            <div>
              <div className="text-3xl font-bold gradient-text mb-1">20s - 72h</div>
              <div className="text-sm text-[var(--text-secondary)]">AI Analysis Time</div>
            </div>
            <div>
              <div className="text-3xl font-bold gradient-text mb-1">100%</div>
              <div className="text-sm text-[var(--text-secondary)]">AI-Powered</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Features Section
function FeaturesSection() {
  const features = [
    {
      icon: SparklesIcon,
      title: "AI Agent Swarm",
      description: "Four specialized AI agents analyze every aspect of your startup in parallel.",
    },
    {
      icon: ChartBarIcon,
      title: "Instant Valuation",
      description: "Get data-driven valuation estimates based on comprehensive analysis.",
    },
    {
      icon: ShieldCheckIcon,
      title: "VC Persona Agents",
      description: "VCs create AI personas that participate in funding decisions.",
    },
    {
      icon: BanknotesIcon,
      title: "Futarchy Funding",
      description: "Revolutionary prediction market governance for ICO fundraising.",
    },
    {
      icon: UserGroupIcon,
      title: "Network Access",
      description: "Connect with funded startups, VCs, and mentors post-funding.",
    },
    {
      icon: RocketLaunchIcon,
      title: "Full Accelerator",
      description: "Not just funding — get mentorship, resources, and growth support.",
    },
  ];

  return (
    <section className="py-24 relative bg-[var(--background-secondary)]">
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            The Future of <span className="gradient-text-secondary">Acceleration</span>
          </h2>
          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
            Everything you need to launch, fund, and grow your startup
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="card glass-hover"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
            >
              <div className="w-12 h-12 rounded-xl glass flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-[#00f0ff]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-[var(--text-secondary)]">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA Section
function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-30"
        style={{ background: "radial-gradient(circle, #a855f7 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to <span className="gradient-text">Accelerate</span>?
          </h2>
          <p className="text-xl text-[var(--text-secondary)] mb-8">
            Join the future of startup acceleration. Whether you&apos;re a founder
            seeking funding or a VC looking for the next unicorn.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/pitch">
              <motion.button
                className="btn-primary text-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                Submit Your Pitch
              </motion.button>
            </Link>
            <Link href="/vc">
              <motion.button
                className="btn-secondary text-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                Become a VC Partner
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="py-12 border-t border-[var(--glass-border)]">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-6 h-6 text-[#00f0ff]" />
            <span className="text-xl font-bold">SwarmAccelerator</span>
          </div>
          <div className="flex gap-8 text-[var(--text-secondary)]">
            <Link href="/pitch" className="hover:text-white transition">Pitch</Link>
            <Link href="/defi" className="hover:text-white transition">DeFi</Link>
            <Link href="/marketplace-demo" className="hover:text-white transition">Marketplace</Link>
            <Link href="/exit" className="hover:text-white transition">M&A Exit</Link>
            <Link href="/pricing" className="hover:text-white transition">Pricing</Link>
          </div>
          <div className="text-[var(--text-muted)]">
            © 2026 SwarmAccelerator. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

// Main Page
export default function Home() {
  return (
    <main className="relative">
      <HeroSection />
      <StatsSection />
      <HowItWorksSection />
      <ProductsSection />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </main>
  );
}
