'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function DeFiAccelerator() {
  const [step, setStep] = useState(1);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'DEX',
    description: '',
    targetLaunchDate: '',
    expectedTVL: '',
    competitorTokenomics: '',
    revenueModel: '',
    communitySize: '',
    contractLanguage: 'Solidity',
    contractComplexity: 'medium',
    hasUpgradeability: false,
    hasOracles: false,
    hasMultisig: true,
    dependencies: 'OpenZeppelin',
    liquidityBudget: '',
    hasRevenue: false,
    monthlyRevenue: '',
    competitors: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnalyzing(true);

    try {
      const response = await fetch('/api/defi/accelerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          expectedTVL: parseInt(formData.expectedTVL),
          communitySize: parseInt(formData.communitySize) || 1000,
          liquidityBudget: parseInt(formData.liquidityBudget) || 500000,
          monthlyRevenue: parseInt(formData.monthlyRevenue) || 0,
          competitorTokenomics: formData.competitorTokenomics.split(',').map((s) => s.trim()),
          competitors: formData.competitors.split(',').map((s) => s.trim()),
          dependencies: formData.dependencies.split(',').map((s) => s.trim()),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.report);
        setStep(4);
      } else {
        alert('Analysis failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Failed to run analysis. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
    return `$${value}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-[#00f0ff] hover:text-[#a855f7] transition-colors">
            ← Back to Home
          </Link>
          <div className="text-sm text-gray-400">
            Powered by eli5defi expertise 🦾
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4">🔥 DeFi Protocol Accelerator</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Complete 72-hour DeFi launch: Tokenomics design, security audit, liquidity strategy
          </p>
          <div className="mt-6 flex justify-center gap-8 text-sm">
            <div>
              <div className="text-3xl font-bold text-green-400">$2,999</div>
              <div className="text-gray-400">Premium tier</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-400">72 hrs</div>
              <div className="text-gray-400">Analysis time</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-400">3 Agents</div>
              <div className="text-gray-400">Specialized AI</div>
            </div>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step >= s ? 'bg-purple-600' : 'bg-gray-700'
                  }`}
                >
                  {s}
                </div>
                {s < 4 && (
                  <div
                    className={`w-24 h-1 ${
                      step > s ? 'bg-purple-600' : 'bg-gray-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-400">
            <span>Protocol Info</span>
            <span>Technical</span>
            <span>Liquidity</span>
            <span>Results</span>
          </div>
        </div>

        {/* Form Steps */}
        <div className="max-w-4xl mx-auto bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Protocol Info */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold mb-6">Protocol Information</h2>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Protocol Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                      placeholder="Acme DEX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Protocol Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                    >
                      <option value="DEX">DEX (Decentralized Exchange)</option>
                      <option value="Lending">Lending Protocol</option>
                      <option value="Yield Aggregator">Yield Aggregator</option>
                      <option value="Derivatives">Derivatives</option>
                      <option value="Stablecoin">Stablecoin</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                    rows={3}
                    placeholder="Describe your DeFi protocol..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Target Launch Date
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.targetLaunchDate}
                      onChange={(e) =>
                        setFormData({ ...formData, targetLaunchDate: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Expected TVL ($)
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.expectedTVL}
                      onChange={(e) =>
                        setFormData({ ...formData, expectedTVL: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                      placeholder="10000000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Competitor Tokenomics (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.competitorTokenomics}
                      onChange={(e) =>
                        setFormData({ ...formData, competitorTokenomics: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                      placeholder="Curve (veCRV), Uniswap (UNI)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Revenue Model
                    </label>
                    <input
                      type="text"
                      value={formData.revenueModel}
                      onChange={(e) =>
                        setFormData({ ...formData, revenueModel: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                      placeholder="Trading fees, Interest spread, etc."
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full py-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold text-lg transition-colors"
                >
                  Next: Technical Details →
                </button>
              </motion.div>
            )}

            {/* Step 2: Technical */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold mb-6">Technical Details</h2>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Contract Language
                    </label>
                    <select
                      value={formData.contractLanguage}
                      onChange={(e) =>
                        setFormData({ ...formData, contractLanguage: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                    >
                      <option value="Solidity">Solidity</option>
                      <option value="Vyper">Vyper</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Contract Complexity
                    </label>
                    <select
                      value={formData.contractComplexity}
                      onChange={(e) =>
                        setFormData({ ...formData, contractComplexity: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                    >
                      <option value="simple">Simple</option>
                      <option value="medium">Medium</option>
                      <option value="complex">Complex</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Dependencies (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.dependencies}
                    onChange={(e) =>
                      setFormData({ ...formData, dependencies: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                    placeholder="OpenZeppelin, Uniswap V3"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.hasUpgradeability}
                      onChange={(e) =>
                        setFormData({ ...formData, hasUpgradeability: e.target.checked })
                      }
                      className="w-5 h-5 rounded border-gray-600"
                    />
                    <span>Upgradeable</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.hasOracles}
                      onChange={(e) =>
                        setFormData({ ...formData, hasOracles: e.target.checked })
                      }
                      className="w-5 h-5 rounded border-gray-600"
                    />
                    <span>Uses Oracles</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.hasMultisig}
                      onChange={(e) =>
                        setFormData({ ...formData, hasMultisig: e.target.checked })
                      }
                      className="w-5 h-5 rounded border-gray-600"
                    />
                    <span>Has Multisig</span>
                  </label>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-4 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-1 py-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
                  >
                    Next: Liquidity →
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Liquidity */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold mb-6">Liquidity Strategy</h2>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Liquidity Budget ($)
                    </label>
                    <input
                      type="number"
                      value={formData.liquidityBudget}
                      onChange={(e) =>
                        setFormData({ ...formData, liquidityBudget: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                      placeholder="500000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Competitors (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.competitors}
                      onChange={(e) =>
                        setFormData({ ...formData, competitors: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                      placeholder="Uniswap, SushiSwap"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.hasRevenue}
                      onChange={(e) =>
                        setFormData({ ...formData, hasRevenue: e.target.checked })
                      }
                      className="w-5 h-5 rounded border-gray-600"
                    />
                    <span>Protocol has revenue</span>
                  </label>

                  {formData.hasRevenue && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Monthly Revenue ($)
                      </label>
                      <input
                        type="number"
                        value={formData.monthlyRevenue}
                        onChange={(e) =>
                          setFormData({ ...formData, monthlyRevenue: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                        placeholder="50000"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 py-4 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={analyzing}
                    className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-semibold transition-all disabled:opacity-50"
                  >
                    {analyzing ? 'Analyzing...' : 'Run DeFi Analysis →'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Results */}
            {step === 4 && results && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                <h2 className="text-3xl font-bold mb-6">🎉 DeFi Analysis Complete!</h2>

                {/* Executive Summary */}
                <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl p-6">
                  <h3 className="text-2xl font-bold mb-4">Executive Summary</h3>
                  <div className="grid grid-cols-3 gap-6 mb-6">
                    <div>
                      <div className="text-sm text-gray-400">Overall Score</div>
                      <div className="text-3xl font-bold text-green-400">
                        {results.executiveSummary.overallScore}/100
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Timeline</div>
                      <div className="text-2xl font-bold">
                        {results.executiveSummary.estimatedTimeline}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Total Cost</div>
                      <div className="text-2xl font-bold">
                        {results.executiveSummary.estimatedCost}
                      </div>
                    </div>
                  </div>
                  <div className="text-lg p-4 bg-gray-800/50 rounded-lg">
                    <strong>Recommendation:</strong> {results.executiveSummary.recommendation}
                  </div>
                  {results.executiveSummary.readyForLaunch && (
                    <div className="mt-4 p-4 bg-green-900/30 border border-green-600/30 rounded-lg text-green-400">
                      ✅ Ready for professional audit and mainnet deployment!
                    </div>
                  )}
                </div>

                {/* Tokenomics */}
                <div className="bg-gray-800/50 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-4">💎 Tokenomics Design</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-400">Token Symbol</div>
                      <div className="text-xl font-bold">{results.tokenomics.tokenSymbol}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Total Supply</div>
                      <div className="text-xl font-bold">
                        {results.tokenomics.totalSupply.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  {results.tokenomics.veModel?.enabled && (
                    <div className="mt-4 p-3 bg-purple-900/30 rounded-lg">
                      <strong>Ve-Model Enabled:</strong> Vote-escrowed tokenomics for sustainable governance
                    </div>
                  )}
                </div>

                {/* Security */}
                <div className="bg-gray-800/50 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-4">🔒 Security Audit</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-400">Security Score</div>
                      <div className="text-3xl font-bold text-green-400">
                        {results.security.score}/100
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Risk Level</div>
                      <div
                        className={`text-2xl font-bold ${
                          results.security.overallRisk === 'low'
                            ? 'text-green-400'
                            : results.security.overallRisk === 'medium'
                            ? 'text-yellow-400'
                            : 'text-red-400'
                        }`}
                      >
                        {results.security.overallRisk.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-300">
                    <strong>Audit Cost:</strong> {results.security.estimatedCost.professionalAudit}
                  </div>
                </div>

                {/* Liquidity */}
                <div className="bg-gray-800/50 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-4">💧 Liquidity Strategy</h3>
                  <div className="space-y-3">
                    <div>
                      <strong>Launch Method:</strong> {results.liquidity.launchMethod.type} on{' '}
                      {results.liquidity.launchMethod.platform}
                    </div>
                    <div>
                      <strong>Initial Liquidity:</strong>{' '}
                      {formatCurrency(results.liquidity.initialLiquidity.amount)}
                    </div>
                    {results.liquidity.pol.enabled && (
                      <div className="p-3 bg-blue-900/30 rounded-lg">
                        <strong>POL (Protocol-Owned Liquidity):</strong> Target{' '}
                        {results.liquidity.pol.targetPercentage}% ownership
                      </div>
                    )}
                  </div>
                </div>

                {/* Next Steps */}
                <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-4">📋 Next Steps</h3>
                  <ul className="space-y-2">
                    {results.nextSteps.slice(0, 5).map((step: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-purple-400 font-bold">{i + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => window.print()}
                  className="w-full py-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold text-lg transition-colors"
                >
                  Download Full Report (PDF)
                </button>
              </motion.div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
