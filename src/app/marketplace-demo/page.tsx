'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

// Mock data
const mockProjects = [
  {
    id: '1',
    name: 'DeFi Pulse',
    tagline: 'Simplify DeFi portfolio management',
    industry: 'DeFi',
    stage: 'Seed',
    fundingType: 'EQUITY',
    amountSeeking: 2000000,
    revenue: 500000,
    revenueGrowth: 200,
    investmentThesis: 'Compelling DeFi UX play targeting retail. Strong early traction (5K users) and product-market fit evidenced by 200% growth.',
    matches: [
      { investor: { name: 'Crypto Ventures' }, overallScore: 85 },
      { investor: { name: 'Web3 Capital' }, overallScore: 78 },
      { investor: { name: 'DeFi Fund' }, overallScore: 72 },
    ],
  },
  {
    id: '2',
    name: 'AI Trading Bot',
    tagline: 'Algorithmic trading powered by ML',
    industry: 'AI/ML',
    stage: 'Series A',
    fundingType: 'TOKEN',
    amountSeeking: 5000000,
    revenue: 2000000,
    revenueGrowth: 150,
    investmentThesis: 'AI-native trading platform with proven alpha generation. $2M ARR growing 150% YoY.',
    matches: [
      { investor: { name: 'a16z Crypto' }, overallScore: 92 },
      { investor: { name: 'Sequoia' }, overallScore: 88 },
    ],
  },
  {
    id: '3',
    name: 'Green Energy DAO',
    tagline: 'Decentralized renewable energy marketplace',
    industry: 'Climate Tech',
    stage: 'Growth',
    fundingType: 'SAFE',
    amountSeeking: 10000000,
    revenue: 8000000,
    revenueGrowth: 80,
    investmentThesis: 'Climate tech meets Web3. Large existing revenue base ($8M) provides downside protection.',
    matches: [
      { investor: { name: 'Climate Capital' }, overallScore: 95 },
      { investor: { name: 'Breakthrough Energy' }, overallScore: 89 },
    ],
  },
];

const mockOrderBook = {
  asset: {
    symbol: 'ACME-EQUITY',
    name: 'Acme Corp Private Shares',
    type: 'EQUITY',
  },
  orderBook: {
    bids: [
      { price: 10.50, quantity: 1000, orders: 3, total: 10500 },
      { price: 10.45, quantity: 500, orders: 2, total: 5225 },
      { price: 10.40, quantity: 2000, orders: 5, total: 20800 },
    ],
    asks: [
      { price: 10.55, quantity: 800, orders: 2, total: 8440 },
      { price: 10.60, quantity: 1200, orders: 4, total: 12720 },
      { price: 10.65, quantity: 500, orders: 1, total: 5325 },
    ],
    spread: { absolute: 0.05, percentage: 0.47 },
  },
  market: {
    lastPrice: 10.52,
    high24h: 10.75,
    low24h: 10.30,
    volume24h: 150000,
    trades24h: 47,
    change24h: 2.14,
  },
  recentTrades: [
    { id: '1', price: 10.52, quantity: 100, totalValue: 1052, timestamp: new Date(Date.now() - 120000) },
    { id: '2', price: 10.51, quantity: 250, totalValue: 2627.5, timestamp: new Date(Date.now() - 300000) },
    { id: '3', price: 10.53, quantity: 75, totalValue: 789.75, timestamp: new Date(Date.now() - 600000) },
  ],
};

type View = 'projects' | 'otc' | 'submit';

export default function MarketplaceDemo() {
  const [view, setView] = useState<View>('projects');

  const formatCurrency = (value: number) => {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
    return `$${value}`;
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
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
          <h1 className="text-5xl font-bold mb-4">💎 Capital Marketplace</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            AI-powered matching: Projects seeking capital ↔ Investors + OTC liquidity
          </p>
          <div className="mt-4 inline-block px-4 py-2 bg-yellow-600/20 border border-yellow-600/50 rounded-lg text-yellow-400">
            🎮 DEMO MODE - Using mock data (no database required)
          </div>
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
                Open Projects ({mockProjects.length})
              </h2>
            </div>

            <div className="grid gap-4">
              {mockProjects.map((project) => (
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
                            {formatCurrency(project.amountSeeking)}
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
                            {formatCurrency(project.revenue)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Growth</div>
                          <div className="text-xl font-bold text-green-400">
                            +{project.revenueGrowth}%
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="text-sm text-gray-500 mb-1">
                          Investment Thesis
                        </div>
                        <p className="text-gray-300">
                          {project.investmentThesis}
                        </p>
                      </div>

                      <div>
                        <div className="text-sm text-gray-500 mb-2">
                          Top Matches ({project.matches.length})
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {project.matches.map((match, i) => (
                            <div
                              key={i}
                              className="px-3 py-1 rounded-full bg-gray-700 text-sm"
                            >
                              {match.investor.name} ({match.overallScore}%)
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-all">
                      View Details →
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
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
              <h2 className="text-2xl font-bold mb-2">
                {mockOrderBook.asset.symbol}
              </h2>
              <p className="text-gray-400">{mockOrderBook.asset.name}</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Market Stats */}
              <div className="col-span-2 grid grid-cols-5 gap-4">
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <div className="text-sm text-gray-400">Last Price</div>
                  <div className="text-2xl font-bold">
                    ${mockOrderBook.market.lastPrice.toFixed(2)}
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <div className="text-sm text-gray-400">24h High</div>
                  <div className="text-2xl font-bold text-green-400">
                    ${mockOrderBook.market.high24h.toFixed(2)}
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <div className="text-sm text-gray-400">24h Low</div>
                  <div className="text-2xl font-bold text-red-400">
                    ${mockOrderBook.market.low24h.toFixed(2)}
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <div className="text-sm text-gray-400">24h Volume</div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(mockOrderBook.market.volume24h)}
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <div className="text-sm text-gray-400">Spread</div>
                  <div className="text-2xl font-bold">
                    {mockOrderBook.orderBook.spread.percentage.toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* Order Book - Bids */}
              <div className="bg-gray-800/50 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 text-green-400">
                  Bids (Buy Orders)
                </h3>
                <div className="space-y-2">
                  {mockOrderBook.orderBook.bids.map((bid, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center p-2 rounded bg-green-900/20 hover:bg-green-900/30 transition-colors"
                    >
                      <div className="font-mono text-green-400">
                        ${bid.price.toFixed(2)}
                      </div>
                      <div className="text-gray-400">
                        {bid.quantity.toFixed(0)}
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
                  {mockOrderBook.orderBook.asks.map((ask, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center p-2 rounded bg-red-900/20 hover:bg-red-900/30 transition-colors"
                    >
                      <div className="font-mono text-red-400">
                        ${ask.price.toFixed(2)}
                      </div>
                      <div className="text-gray-400">
                        {ask.quantity.toFixed(0)}
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
                  {mockOrderBook.recentTrades.map((trade) => (
                    <div
                      key={trade.id}
                      className="flex justify-between items-center p-2 rounded bg-gray-700/50"
                    >
                      <div className="font-mono">${trade.price.toFixed(2)}</div>
                      <div className="text-gray-400">{trade.quantity}</div>
                      <div>{formatCurrency(trade.totalValue)}</div>
                      <div className="text-sm text-gray-500">
                        {formatTime(trade.timestamp)}
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
                      placeholder="10.50"
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600"
                    />
                  </div>
                </div>
                <button
                  onClick={() => alert('Demo mode - order placement disabled')}
                  className="w-full mt-4 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-lg transition-colors"
                >
                  Place Order (Demo)
                </button>
              </div>
            </div>
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

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('Demo mode - submission disabled. In production, this would trigger AI analysis.');
              }}
              className="space-y-6"
            >
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
                Submit & Match with Investors (Demo) →
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
