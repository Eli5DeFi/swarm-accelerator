'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

type View = 'projects' | 'otc' | 'submit';

export default function Marketplace() {
  const [view, setView] = useState<View>('projects');
  const [projects, setProjects] = useState<any[]>([]);
  const [orderBook, setOrderBook] = useState<any>(null);
  const [selectedAsset, setSelectedAsset] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Fetch projects
  useEffect(() => {
    if (view === 'projects') {
      fetchProjects();
    }
  }, [view]);

  // Fetch order book
  useEffect(() => {
    if (view === 'otc' && selectedAsset) {
      fetchOrderBook(selectedAsset);
      const interval = setInterval(() => fetchOrderBook(selectedAsset), 5000); // Poll every 5s
      return () => clearInterval(interval);
    }
  }, [view, selectedAsset]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/matching/projects');
      const data = await res.json();
      if (data.success) {
        setProjects(data.projects);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderBook = async (assetId: string) => {
    try {
      const res = await fetch(`/api/otc/orderbook?assetId=${assetId}`);
      const data = await res.json();
      if (data.success) {
        setOrderBook(data);
      }
    } catch (error) {
      console.error('Failed to fetch order book:', error);
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
    return `$${value}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold mb-4">Capital Marketplace</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            AI-powered matching: Projects seeking capital ↔ Investors + OTC liquidity
          </p>
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setView('projects')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              view === 'projects'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            📊 Projects Seeking Capital
          </button>
          <button
            onClick={() => setView('otc')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              view === 'otc'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            📈 OTC Order Book
          </button>
          <button
            onClick={() => setView('submit')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              view === 'submit'
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            ✨ Submit Project
          </button>
        </div>

        {/* Projects View */}
        {view === 'projects' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                Open Projects ({projects.length})
              </h2>
              <div className="flex gap-2">
                <select className="px-4 py-2 rounded-lg bg-gray-700 border border-gray-600">
                  <option>All Industries</option>
                  <option>DeFi</option>
                  <option>AI/ML</option>
                  <option>SaaS</option>
                  <option>FinTech</option>
                </select>
                <select className="px-4 py-2 rounded-lg bg-gray-700 border border-gray-600">
                  <option>All Stages</option>
                  <option>Seed</option>
                  <option>Series A</option>
                  <option>Series B</option>
                  <option>Growth</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12 bg-gray-800/50 rounded-xl">
                <p className="text-gray-400 text-lg">
                  No projects yet. Be the first to submit!
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {projects.map((project) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 hover:bg-gray-800/70 transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold">{project.name}</h3>
                          <span className="px-3 py-1 rounded-full bg-blue-600/20 text-blue-400 text-sm">
                            {project.industry}
                          </span>
                          <span className="px-3 py-1 rounded-full bg-purple-600/20 text-purple-400 text-sm">
                            {project.stage}
                          </span>
                        </div>
                        <p className="text-gray-400 mb-4">{project.tagline}</p>
                        
                        <div className="grid grid-cols-4 gap-4 mb-4">
                          <div>
                            <div className="text-sm text-gray-500">Seeking</div>
                            <div className="text-xl font-bold text-green-400">
                              {formatCurrency(Number(project.amountSeeking))}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Type</div>
                            <div className="text-xl font-bold">
                              {project.fundingType}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Revenue</div>
                            <div className="text-xl font-bold">
                              {formatCurrency(Number(project.revenue))}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Growth</div>
                            <div className="text-xl font-bold text-green-400">
                              +{project.revenueGrowth}%
                            </div>
                          </div>
                        </div>

                        {project.investmentThesis && (
                          <div className="mb-4">
                            <div className="text-sm text-gray-500 mb-1">
                              Investment Thesis
                            </div>
                            <p className="text-gray-300">
                              {project.investmentThesis}
                            </p>
                          </div>
                        )}

                        {project.matches && project.matches.length > 0 && (
                          <div>
                            <div className="text-sm text-gray-500 mb-2">
                              Top Matches ({project.matches.length})
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              {project.matches.map((match: any) => (
                                <div
                                  key={match.id}
                                  className="px-3 py-1 rounded-full bg-gray-700 text-sm"
                                >
                                  {match.investor.name} ({match.overallScore}%)
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-all">
                        View Details →
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* OTC View */}
        {view === 'otc' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Select Asset
              </label>
              <select
                value={selectedAsset}
                onChange={(e) => setSelectedAsset(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600"
              >
                <option value="">Choose an asset...</option>
                <option value="asset-1">ACME-EQUITY (Private Shares)</option>
                <option value="asset-2">DEFI-TOKEN (Token Sale)</option>
                <option value="asset-3">STARTUP-SAFE (SAFE Notes)</option>
              </select>
            </div>

            {orderBook && (
              <div className="grid grid-cols-2 gap-6">
                {/* Market Stats */}
                <div className="col-span-2 grid grid-cols-5 gap-4">
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <div className="text-sm text-gray-400">Last Price</div>
                    <div className="text-2xl font-bold">
                      ${orderBook.market.lastPrice.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <div className="text-sm text-gray-400">24h High</div>
                    <div className="text-2xl font-bold text-green-400">
                      ${orderBook.market.high24h.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <div className="text-sm text-gray-400">24h Low</div>
                    <div className="text-2xl font-bold text-red-400">
                      ${orderBook.market.low24h.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <div className="text-sm text-gray-400">24h Volume</div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(orderBook.market.volume24h)}
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <div className="text-sm text-gray-400">Spread</div>
                    <div className="text-2xl font-bold">
                      {orderBook.orderBook.spread.percentage.toFixed(2)}%
                    </div>
                  </div>
                </div>

                {/* Order Book - Bids */}
                <div className="bg-gray-800/50 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-4 text-green-400">
                    Bids (Buy Orders)
                  </h3>
                  <div className="space-y-2">
                    {orderBook.orderBook.bids.slice(0, 10).map((bid: any, i: number) => (
                      <div
                        key={i}
                        className="flex justify-between items-center p-2 rounded bg-green-900/20 hover:bg-green-900/30 transition-colors"
                      >
                        <div className="font-mono text-green-400">
                          ${bid.price.toFixed(2)}
                        </div>
                        <div className="text-gray-400">
                          {bid.quantity.toFixed(2)}
                        </div>
                        <div className="text-gray-500">
                          {formatCurrency(bid.total)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Book - Asks */}
                <div className="bg-gray-800/50 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-4 text-red-400">
                    Asks (Sell Orders)
                  </h3>
                  <div className="space-y-2">
                    {orderBook.orderBook.asks.slice(0, 10).map((ask: any, i: number) => (
                      <div
                        key={i}
                        className="flex justify-between items-center p-2 rounded bg-red-900/20 hover:bg-red-900/30 transition-colors"
                      >
                        <div className="font-mono text-red-400">
                          ${ask.price.toFixed(2)}
                        </div>
                        <div className="text-gray-400">
                          {ask.quantity.toFixed(2)}
                        </div>
                        <div className="text-gray-500">
                          {formatCurrency(ask.total)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Trades */}
                <div className="col-span-2 bg-gray-800/50 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-4">Recent Trades</h3>
                  <div className="space-y-2">
                    {orderBook.recentTrades.map((trade: any) => (
                      <div
                        key={trade.id}
                        className="flex justify-between items-center p-2 rounded bg-gray-700/50"
                      >
                        <div className="font-mono">${trade.price.toFixed(2)}</div>
                        <div className="text-gray-400">{trade.quantity}</div>
                        <div>{formatCurrency(trade.totalValue)}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(trade.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Place Order */}
                <div className="col-span-2 bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-4">Place Order</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm mb-2">Side</label>
                      <select className="w-full px-4 py-3 rounded-lg bg-gray-700">
                        <option>Buy</option>
                        <option>Sell</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm mb-2">Type</label>
                      <select className="w-full px-4 py-3 rounded-lg bg-gray-700">
                        <option>Limit</option>
                        <option>Market</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm mb-2">Quantity</label>
                      <input
                        type="number"
                        placeholder="100"
                        className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-2">Price</label>
                      <input
                        type="number"
                        placeholder="10.00"
                        className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600"
                      />
                    </div>
                  </div>
                  <button className="w-full mt-4 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-lg transition-colors">
                    Place Order
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Submit View */}
        {view === 'submit' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-3xl mx-auto bg-gray-800/50 rounded-xl p-8"
          >
            <h2 className="text-2xl font-bold mb-6">Submit Your Project</h2>
            <p className="text-gray-400 mb-6">
              AI will analyze your project and match you with relevant investors
            </p>

            <form className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Project Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600"
                    placeholder="Acme Corp"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Industry
                  </label>
                  <select className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600">
                    <option>DeFi</option>
                    <option>AI/ML</option>
                    <option>SaaS</option>
                    <option>FinTech</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Funding Type
                  </label>
                  <select className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600">
                    <option>Equity</option>
                    <option>Token</option>
                    <option>SAFE</option>
                    <option>Debt</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Amount Seeking ($)
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600"
                    placeholder="1000000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Problem You're Solving
                </label>
                <textarea
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600"
                  rows={3}
                  placeholder="What pain point are you addressing?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Your Solution
                </label>
                <textarea
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600"
                  rows={3}
                  placeholder="How are you solving it?"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold text-lg transition-all"
              >
                Submit & Match with Investors →
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
