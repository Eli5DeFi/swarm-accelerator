'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function ExitAccelerator() {
  const [step, setStep] = useState(1);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    stage: 'growth',
    founded: '',
    revenue: '',
    revenueGrowth: '',
    ebitda: '',
    arr: '',
    customerCount: '',
    employeeCount: '',
    founderOwnership: '',
    totalRaised: '',
    targetExitValue: '',
    timelinePressure: 'moderate',
    foundersStaying: true,
    hasIP: false,
    technology: '',
    moat: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnalyzing(true);

    try {
      const response = await fetch('/api/ma/exit-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          revenue: parseInt(formData.revenue),
          revenueGrowth: parseInt(formData.revenueGrowth),
          ebitda: parseInt(formData.ebitda || '0'),
          arr: parseInt(formData.arr || formData.revenue),
          customerCount: parseInt(formData.customerCount),
          employeeCount: parseInt(formData.employeeCount),
          founderOwnership: parseInt(formData.founderOwnership),
          totalRaised: parseInt(formData.totalRaised || '0'),
          targetExitValue: parseInt(formData.targetExitValue),
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
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
    return `$${value}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4">M&A Exit Accelerator</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            AI-powered exit analysis: valuation, acquirer matching, due diligence prep
          </p>
          <div className="mt-6 flex justify-center gap-8 text-sm">
            <div>
              <div className="text-3xl font-bold text-green-400">$9,999</div>
              <div className="text-gray-400">One-time fee</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-400">3-6 mo</div>
              <div className="text-gray-400">Time to exit</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-400">20-30</div>
              <div className="text-gray-400">Acquirer matches</div>
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
            <span>Company Info</span>
            <span>Financials</span>
            <span>Exit Goals</span>
            <span>Results</span>
          </div>
        </div>

        {/* Form Steps */}
        <div className="max-w-4xl mx-auto bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Company Info */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold mb-6">Company Information</h2>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                      placeholder="Acme Inc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Industry
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.industry}
                      onChange={(e) =>
                        setFormData({ ...formData, industry: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                      placeholder="SaaS, FinTech, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Stage</label>
                    <select
                      value={formData.stage}
                      onChange={(e) =>
                        setFormData({ ...formData, stage: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                    >
                      <option value="seed">Seed</option>
                      <option value="series-a">Series A</option>
                      <option value="series-b">Series B</option>
                      <option value="growth">Growth</option>
                      <option value="late">Late Stage</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Founded Year
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.founded}
                      onChange={(e) =>
                        setFormData({ ...formData, founded: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                      placeholder="2020"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Employee Count
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.employeeCount}
                      onChange={(e) =>
                        setFormData({ ...formData, employeeCount: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                      placeholder="50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Technology Stack
                    </label>
                    <input
                      type="text"
                      value={formData.technology}
                      onChange={(e) =>
                        setFormData({ ...formData, technology: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                      placeholder="React, Node.js, AWS"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Competitive Moat
                  </label>
                  <textarea
                    value={formData.moat}
                    onChange={(e) =>
                      setFormData({ ...formData, moat: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                    rows={3}
                    placeholder="Network effects, proprietary data, brand, patents..."
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.hasIP}
                      onChange={(e) =>
                        setFormData({ ...formData, hasIP: e.target.checked })
                      }
                      className="w-5 h-5 rounded border-gray-600"
                    />
                    <span>Has IP (patents/trademarks)</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.foundersStaying}
                      onChange={(e) =>
                        setFormData({ ...formData, foundersStaying: e.target.checked })
                      }
                      className="w-5 h-5 rounded border-gray-600"
                    />
                    <span>Founders staying post-exit</span>
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full py-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold text-lg transition-colors"
                >
                  Next: Financials →
                </button>
              </motion.div>
            )}

            {/* Step 2: Financials */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold mb-6">Financial Metrics</h2>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Annual Revenue ($)
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.revenue}
                      onChange={(e) =>
                        setFormData({ ...formData, revenue: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                      placeholder="5000000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Revenue Growth (%)
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.revenueGrowth}
                      onChange={(e) =>
                        setFormData({ ...formData, revenueGrowth: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                      placeholder="120"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      EBITDA ($)
                    </label>
                    <input
                      type="number"
                      value={formData.ebitda}
                      onChange={(e) =>
                        setFormData({ ...formData, ebitda: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                      placeholder="500000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      ARR ($) - for SaaS
                    </label>
                    <input
                      type="number"
                      value={formData.arr}
                      onChange={(e) =>
                        setFormData({ ...formData, arr: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                      placeholder="5000000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Customer Count
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.customerCount}
                      onChange={(e) =>
                        setFormData({ ...formData, customerCount: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                      placeholder="500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Total Raised ($)
                    </label>
                    <input
                      type="number"
                      value={formData.totalRaised}
                      onChange={(e) =>
                        setFormData({ ...formData, totalRaised: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                      placeholder="2000000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Founder Ownership (%)
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.founderOwnership}
                      onChange={(e) =>
                        setFormData({ ...formData, founderOwnership: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                      placeholder="60"
                    />
                  </div>
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
                    Next: Exit Goals →
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Exit Goals */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold mb-6">Exit Strategy</h2>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Target Exit Value ($)
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.targetExitValue}
                      onChange={(e) =>
                        setFormData({ ...formData, targetExitValue: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                      placeholder="50000000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Timeline Pressure
                    </label>
                    <select
                      value={formData.timelinePressure}
                      onChange={(e) =>
                        setFormData({ ...formData, timelinePressure: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                    >
                      <option value="urgent">Urgent (&lt;3 months)</option>
                      <option value="moderate">Moderate (3-6 months)</option>
                      <option value="patient">Patient (6-12 months)</option>
                    </select>
                  </div>
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
                    {analyzing ? 'Analyzing...' : 'Run Exit Analysis →'}
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
                <h2 className="text-3xl font-bold mb-6">Exit Analysis Report</h2>

                {/* Executive Summary */}
                <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl p-6">
                  <h3 className="text-2xl font-bold mb-4">Executive Summary</h3>
                  <div className="grid grid-cols-3 gap-6 mb-6">
                    <div>
                      <div className="text-sm text-gray-400">Valuation Range</div>
                      <div className="text-2xl font-bold">
                        {formatCurrency(results.executiveSummary.estimatedValue.low)} -{' '}
                        {formatCurrency(results.executiveSummary.estimatedValue.high)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Readiness Score</div>
                      <div className="text-2xl font-bold">
                        {results.executiveSummary.readinessScore}/100
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Time to Exit</div>
                      <div className="text-2xl font-bold">
                        {results.executiveSummary.timeToExit}
                      </div>
                    </div>
                  </div>
                  <div className="text-lg">
                    {results.executiveSummary.recommendation}
                  </div>
                </div>

                {/* Top Acquirers */}
                <div className="bg-gray-800/50 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-4">
                    Top Potential Acquirers (
                    {results.acquirers.topAcquirers.length})
                  </h3>
                  <div className="space-y-3">
                    {results.acquirers.topAcquirers.slice(0, 5).map((acq: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg"
                      >
                        <div>
                          <div className="font-bold">{acq.name}</div>
                          <div className="text-sm text-gray-400">
                            {acq.type} • {acq.dealSize}
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-green-400">
                          {acq.fitScore}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Plan */}
                <div className="bg-gray-800/50 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-4">
                    Next Steps ({results.actionPlan.length} phases)
                  </h3>
                  <div className="space-y-4">
                    {results.actionPlan.map((phase: any, i: number) => (
                      <div key={i} className="border-l-4 border-purple-500 pl-4">
                        <div className="font-bold">{phase.phase}</div>
                        <div className="text-sm text-gray-400 mb-2">
                          {phase.timeframe}
                        </div>
                        <ul className="text-sm space-y-1">
                          {phase.actions.slice(0, 3).map((action: string, j: number) => (
                            <li key={j}>• {action}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
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
