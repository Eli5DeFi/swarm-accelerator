"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ScaleIcon,
  SparklesIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

interface FutarchyMarketProps {
  startupId: string;
  startupName: string;
  yesPool: number;
  noPool: number;
  yesShares: number;
  noShares: number;
  agentScore?: number;
  onBet?: (side: "yes" | "no", amount: number) => void;
}

export default function FutarchyMarket({
  startupId,
  startupName,
  yesPool,
  noPool,
  yesShares,
  noShares,
  agentScore,
  onBet,
}: FutarchyMarketProps) {
  const [selectedSide, setSelectedSide] = useState<"yes" | "no">("yes");
  const [amount, setAmount] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const totalPool = yesPool + noPool;
  const totalShares = yesShares + noShares;
  
  // Calculate implied probability
  const yesImpliedProb = totalPool > 0 ? (yesPool / totalPool) * 100 : 50;
  const noImpliedProb = 100 - yesImpliedProb;
  
  // Calculate expected returns
  const yesExpectedReturn = yesShares > 0 ? ((totalPool / yesShares) - 1) * 100 : 0;
  const noExpectedReturn = noShares > 0 ? ((totalPool / noShares) - 1) * 100 : 0;
  
  // Calculate share price
  const yesSharePrice = yesShares > 0 ? yesPool / yesShares : 1;
  const noSharePrice = noShares > 0 ? noPool / noShares : 1;

  const handleBet = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    
    setIsProcessing(true);
    try {
      if (onBet) {
        await onBet(selectedSide, parseFloat(amount));
      }
      setAmount("");
    } catch (error) {
      console.error("Bet failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <ScaleIcon className="w-6 h-6 text-[#a855f7]" />
            Futarchy Market
          </h3>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Will <span className="font-medium text-white">{startupName}</span> succeed if funded?
          </p>
        </div>
        
        {agentScore && (
          <div className="text-right">
            <div className="text-sm text-[var(--text-muted)]">AI Score</div>
            <div className="text-2xl font-bold gradient-text">{agentScore}/100</div>
          </div>
        )}
      </div>

      {/* Market Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 rounded-lg bg-[var(--background-tertiary)]">
          <div className="flex items-center justify-center gap-1 text-[var(--text-muted)] mb-1">
            <CurrencyDollarIcon className="w-4 h-4" />
            <span className="text-xs">Total Pool</span>
          </div>
          <div className="text-lg font-bold text-[#00f0ff]">
            ${totalPool.toLocaleString()}
          </div>
        </div>
        
        <div className="text-center p-3 rounded-lg bg-[var(--background-tertiary)]">
          <div className="flex items-center justify-center gap-1 text-[var(--text-muted)] mb-1">
            <UserGroupIcon className="w-4 h-4" />
            <span className="text-xs">Participants</span>
          </div>
          <div className="text-lg font-bold">
            {Math.floor(totalShares / 100) || 0}
          </div>
        </div>
        
        <div className="text-center p-3 rounded-lg bg-[var(--background-tertiary)]">
          <div className="flex items-center justify-center gap-1 text-[var(--text-muted)] mb-1">
            <SparklesIcon className="w-4 h-4" />
            <span className="text-xs">Market Confidence</span>
          </div>
          <div className="text-lg font-bold gradient-text">
            {yesImpliedProb.toFixed(0)}%
          </div>
        </div>
      </div>

      {/* YES/NO Markets */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* YES Market */}
        <motion.div
          className={`relative p-4 rounded-xl border-2 transition cursor-pointer ${
            selectedSide === "yes"
              ? "border-[#10b981] bg-[#10b981]/10"
              : "border-[#10b981]/30 hover:border-[#10b981]/50"
          }`}
          onClick={() => setSelectedSide("yes")}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ArrowTrendingUpIcon className="w-5 h-5 text-[#10b981]" />
              <span className="text-lg font-bold text-[#10b981]">YES</span>
            </div>
            <div className="text-right">
              <div className="text-xs text-[var(--text-muted)]">Implied Prob</div>
              <div className="text-lg font-bold text-[#10b981]">
                {yesImpliedProb.toFixed(1)}%
              </div>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Pool Size</span>
              <span className="font-medium">${yesPool.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Share Price</span>
              <span className="font-medium">${yesSharePrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Expected Return</span>
              <span className="font-medium text-[#10b981]">
                +{yesExpectedReturn.toFixed(1)}%
              </span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full bg-[#10b981]"
              initial={{ width: 0 }}
              animate={{ width: `${yesImpliedProb}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        {/* NO Market */}
        <motion.div
          className={`relative p-4 rounded-xl border-2 transition cursor-pointer ${
            selectedSide === "no"
              ? "border-[#ef4444] bg-[#ef4444]/10"
              : "border-[#ef4444]/30 hover:border-[#ef4444]/50"
          }`}
          onClick={() => setSelectedSide("no")}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ArrowTrendingDownIcon className="w-5 h-5 text-[#ef4444]" />
              <span className="text-lg font-bold text-[#ef4444]">NO</span>
            </div>
            <div className="text-right">
              <div className="text-xs text-[var(--text-muted)]">Implied Prob</div>
              <div className="text-lg font-bold text-[#ef4444]">
                {noImpliedProb.toFixed(1)}%
              </div>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Pool Size</span>
              <span className="font-medium">${noPool.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Share Price</span>
              <span className="font-medium">${noSharePrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Expected Return</span>
              <span className="font-medium text-[#ef4444]">
                +{noExpectedReturn.toFixed(1)}%
              </span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full bg-[#ef4444]"
              initial={{ width: 0 }}
              animate={{ width: `${noImpliedProb}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>
      </div>

      {/* Bet Input */}
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            Place Prediction: <span className={selectedSide === "yes" ? "text-[#10b981]" : "text-[#ef4444]"}>
              {selectedSide.toUpperCase()}
            </span>
          </span>
          <span className="text-xs text-[var(--text-muted)]">
            You'll receive {amount ? (parseFloat(amount) / (selectedSide === "yes" ? yesSharePrice : noSharePrice)).toFixed(2) : "0"} shares
          </span>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">$</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount in USDC"
              className="w-full pl-8 pr-4 py-3 rounded-xl glass bg-white/5 border border-[var(--glass-border)] focus:border-[#00f0ff] focus:outline-none transition"
              disabled={isProcessing}
            />
          </div>

          <motion.button
            onClick={handleBet}
            disabled={isProcessing || !amount || parseFloat(amount) <= 0}
            className={`px-8 py-3 rounded-xl font-medium transition whitespace-nowrap ${
              selectedSide === "yes"
                ? "bg-[#10b981] hover:bg-[#10b981]/90 text-black"
                : "bg-[#ef4444] hover:bg-[#ef4444]/90 text-white"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isProcessing ? "Processing..." : `Buy ${selectedSide.toUpperCase()}`}
          </motion.button>
        </div>

        <div className="flex justify-center gap-2">
          {[10, 50, 100, 500].map((preset) => (
            <button
              key={preset}
              onClick={() => setAmount(preset.toString())}
              className="px-3 py-1 text-xs rounded-lg glass hover:bg-white/5 transition"
            >
              ${preset}
            </button>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 rounded-xl bg-[var(--background-tertiary)]">
        <div className="flex items-start gap-3">
          <SparklesIcon className="w-5 h-5 text-[#a855f7] flex-shrink-0 mt-0.5" />
          <div className="text-sm text-[var(--text-secondary)]">
            <p className="mb-2">
              <strong className="text-white">How it works:</strong> Buy YES shares if you believe this startup will succeed. Buy NO shares if you think it will fail.
            </p>
            <p>
              Market prices reflect collective wisdom. If YES wins, YES holders profit. If NO wins, NO holders profit. Your prediction helps guide funding decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
