"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  CheckIcon,
  SparklesIcon,
  RocketLaunchIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import { SUBSCRIPTION_TIERS } from "@/lib/stripe";

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSubscribe = async (tier: "starter" | "growth", period: "monthly" | "yearly") => {
    setIsLoading(tier);

    try {
      const priceId = period === "yearly" 
        ? SUBSCRIPTION_TIERS[tier].yearlyPriceId 
        : SUBSCRIPTION_TIERS[tier].priceId;

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId,
          tier,
          billingPeriod: period,
        }),
      });

      const result = await response.json();

      if (result.success && result.url) {
        window.location.href = result.url;
      } else {
        console.error("Checkout failed:", result.error);
        alert("Failed to start checkout. Please try again.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsLoading(null);
    }
  };

  const tiers = [
    {
      id: "free",
      name: SUBSCRIPTION_TIERS.free.name,
      icon: SparklesIcon,
      price: 0,
      description: "Perfect for exploring the platform",
      features: SUBSCRIPTION_TIERS.free.features,
      cta: "Get Started Free",
      ctaLink: "/pitch",
      popular: false,
    },
    {
      id: "starter",
      name: SUBSCRIPTION_TIERS.starter.name,
      icon: RocketLaunchIcon,
      price: billingPeriod === "monthly" ? SUBSCRIPTION_TIERS.starter.price : SUBSCRIPTION_TIERS.starter.yearlyPrice,
      description: "For solo founders building their first startup",
      features: SUBSCRIPTION_TIERS.starter.features,
      cta: "Start Free Trial",
      popular: false,
    },
    {
      id: "growth",
      name: SUBSCRIPTION_TIERS.growth.name,
      icon: BuildingOfficeIcon,
      price: billingPeriod === "monthly" ? SUBSCRIPTION_TIERS.growth.price : SUBSCRIPTION_TIERS.growth.yearlyPrice,
      description: "For funded startups ready to scale",
      features: SUBSCRIPTION_TIERS.growth.features,
      cta: "Start Free Trial",
      popular: true,
    },
  ];

  return (
    <main className="min-h-screen bg-[var(--background)] relative overflow-hidden py-20">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      <motion.div
        className="absolute top-20 right-1/4 w-96 h-96 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #00f0ff 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="relative z-10 container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/">
            <motion.button
              className="mb-8 text-[var(--text-secondary)] hover:text-white transition"
              whileHover={{ scale: 1.05 }}
            >
              ← Back to Home
            </motion.button>
          </Link>

          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Choose Your <span className="gradient-text">Plan</span>
          </h1>
          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
            Get instant AI analysis, funding opportunities, and autonomous support
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-3 p-1 rounded-full glass">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-6 py-2 rounded-full transition ${
                billingPeriod === "monthly"
                  ? "bg-gradient-to-r from-[#00f0ff] to-[#a855f7] text-black"
                  : "text-[var(--text-secondary)] hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`px-6 py-2 rounded-full transition flex items-center gap-2 ${
                billingPeriod === "yearly"
                  ? "bg-gradient-to-r from-[#00f0ff] to-[#a855f7] text-black"
                  : "text-[var(--text-secondary)] hover:text-white"
              }`}
            >
              Yearly
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#10b981] text-white">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`card relative ${
                tier.popular ? "border-2 border-[#00f0ff] shadow-2xl" : ""
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full bg-gradient-to-r from-[#00f0ff] to-[#a855f7] text-black text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <tier.icon className="w-8 h-8 text-[#00f0ff]" />
                  <h3 className="text-2xl font-bold">{tier.name}</h3>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">{tier.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold gradient-text">
                    ${tier.price}
                  </span>
                  {tier.price > 0 && (
                    <span className="text-[var(--text-muted)]">
                      /{billingPeriod === "monthly" ? "mo" : "yr"}
                    </span>
                  )}
                </div>
                {billingPeriod === "yearly" && tier.price > 0 && (
                  <p className="text-sm text-[var(--text-muted)] mt-1">
                    ${Math.round(tier.price / 12)}/mo billed annually
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckIcon className="w-5 h-5 text-[#10b981] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-[var(--text-secondary)]">{feature}</span>
                  </li>
                ))}
              </ul>

              {tier.id === "free" ? (
                <Link href={tier.ctaLink!}>
                  <motion.button
                    className="w-full py-3 rounded-xl border border-[var(--glass-border)] hover:border-white/30 transition font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {tier.cta}
                  </motion.button>
                </Link>
              ) : (
                <motion.button
                  onClick={() => handleSubscribe(tier.id as "starter" | "growth", billingPeriod)}
                  disabled={isLoading === tier.id}
                  className={`w-full py-3 rounded-xl font-medium transition ${
                    tier.popular
                      ? "bg-gradient-to-r from-[#00f0ff] to-[#a855f7] text-black hover:opacity-90"
                      : "border border-[var(--glass-border)] hover:border-white/30"
                  } disabled:opacity-50`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading === tier.id ? "Loading..." : tier.cta}
                </motion.button>
              )}
            </motion.div>
          ))}
        </div>

        {/* Enterprise CTA */}
        <motion.div
          className="mt-12 max-w-4xl mx-auto card text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-2xl font-bold mb-2">Enterprise / Venture Studio</h3>
          <p className="text-[var(--text-secondary)] mb-4">
            White-label platform, custom AI training, bulk analysis, API access, and dedicated support
          </p>
          <Link href="/contact">
            <motion.button
              className="btn-secondary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Contact Sales
            </motion.button>
          </Link>
        </motion.div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>

          <div className="space-y-4">
            {[
              {
                q: "Can I try before I buy?",
                a: "Yes! Start with our free Community tier to test the platform. All paid plans include a 14-day free trial with full access to features.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards (Visa, Mastercard, Amex) via Stripe. For Enterprise plans, we also accept bank transfers and custom invoicing.",
              },
              {
                q: "Can I cancel anytime?",
                a: "Absolutely. Cancel anytime from your dashboard. Your access continues until the end of your billing period, and we don't offer prorated refunds.",
              },
              {
                q: "How accurate is the AI analysis?",
                a: "Our AI agents have been benchmarked against human VC decisions with 78% agreement rate. They analyze 1000+ data points in 4-8 seconds vs weeks for traditional VCs.",
              },
              {
                q: "Do you take equity in my startup?",
                a: "Only if you choose to raise via our platform. Standard accelerator model: 5-7% equity for funded startups. No equity for subscription-only users.",
              },
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="card"
              >
                <h4 className="font-semibold mb-2">{faq.q}</h4>
                <p className="text-sm text-[var(--text-secondary)]">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
