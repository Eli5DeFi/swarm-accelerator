'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 pt-32 pb-20">
      {/* Hero */}
      <section className="px-4 mb-20">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
              <span className="text-blue-400 text-sm font-medium">Web3 Native • Multi-Chain • 0.5% Fee</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Capital Marketplace
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              AI-powered investor matching. OTC trading. Dark pools. 
              Connect capital with opportunity.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/pitch"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 hover:scale-105"
              >
                Join Marketplace →
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 mb-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center"
            >
              <div className="text-4xl font-bold text-blue-400 mb-2">$10M+</div>
              <div className="text-gray-400">Available Capital</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center"
            >
              <div className="text-4xl font-bold text-purple-400 mb-2">50+</div>
              <div className="text-gray-400">Active Investors</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center"
            >
              <div className="text-4xl font-bold text-pink-400 mb-2">0.5%</div>
              <div className="text-gray-400">Transaction Fee</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center"
            >
              <div className="text-4xl font-bold text-green-400 mb-2">24/7</div>
              <div className="text-gray-400">Trading</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 mb-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-400">
              Simple, transparent, on-chain
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-8"
            >
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-2xl font-bold text-white mb-4">List Your Deal</h3>
              <p className="text-gray-300 mb-4">
                Post funding rounds, token sales, or OTC orders. Choose public order book or dark pool for privacy.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Equity, tokens, SAFEs, convertibles</li>
                <li>• Set your terms and conditions</li>
                <li>• Public or private listing</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8"
            >
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-2xl font-bold text-white mb-4">AI Matching</h3>
              <p className="text-gray-300 mb-4">
                Our agents analyze and match optimal counterparties based on criteria, risk profiles, and investment thesis.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Smart contract verification</li>
                <li>• KYC/AML checks</li>
                <li>• Accredited investor validation</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-pink-900/30 to-pink-800/30 backdrop-blur-sm border border-pink-500/20 rounded-2xl p-8"
            >
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold text-white mb-4">Execute On-Chain</h3>
              <p className="text-gray-300 mb-4">
                Negotiate terms and execute through smart contract escrow. Automated settlement, instant finality.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Multi-chain support (ETH, Base, etc.)</li>
                <li>• Trustless escrow</li>
                <li>• Only 0.5% transaction fee</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Web3 Features */}
      <section className="px-4 mb-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Web3 Native Features
            </h2>
            <p className="text-xl text-gray-400">
              Built for the decentralized future
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: '🌐',
                title: 'Multi-Chain Support',
                desc: 'Trade across Ethereum, Base, Optimism, Arbitrum, Polygon, Solana. Cross-chain swaps supported.'
              },
              {
                icon: '🔒',
                title: 'Smart Contract Escrow',
                desc: 'Trustless settlement through audited smart contracts. No intermediaries, instant finality.'
              },
              {
                icon: '🌑',
                title: 'Dark Pool Trading',
                desc: 'Private order book for large block trades. Zero market impact, maximum discretion.'
              },
              {
                icon: '💎',
                title: 'Token & NFT Support',
                desc: 'Trade equity tokens, governance tokens, NFTs, and other digital assets seamlessly.'
              },
              {
                icon: '📊',
                title: 'On-Chain Analytics',
                desc: 'Real-time order book, transparent price discovery, verifiable trade history.'
              },
              {
                icon: '⚡',
                title: 'Gas Optimization',
                desc: 'L2 rollups for low fees. Batch transactions. Meta-transactions for gasless trading.'
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gray-800/50 border border-gray-700 rounded-xl p-6"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-4 mb-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Simple Pricing
            </h2>
            
            <div className="text-6xl font-bold text-blue-400 mb-4">
              0.5%
            </div>
            <p className="text-xl text-gray-300 mb-8">
              Transaction fee on successful trades only
            </p>

            <div className="space-y-4 text-left max-w-2xl mx-auto mb-8">
              <div className="flex items-center gap-3">
                <span className="text-green-400 text-xl">✓</span>
                <span className="text-gray-300">Free to list deals (no upfront costs)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-green-400 text-xl">✓</span>
                <span className="text-gray-300">Free to browse order book</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-green-400 text-xl">✓</span>
                <span className="text-gray-300">AI matching included</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-green-400 text-xl">✓</span>
                <span className="text-gray-300">0.5% fee only on completed transactions</span>
              </div>
            </div>

            <Link 
              href="/pitch"
              className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 hover:scale-105"
            >
              Join Marketplace →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Ready to Trade?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join 50+ investors and founders using VentureClaw Marketplace
            </p>
            <Link 
              href="/pitch"
              className="inline-block px-12 py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-semibold rounded-lg shadow-lg transition-all duration-200 hover:scale-105"
            >
              Get Started →
            </Link>
            <p className="text-sm text-gray-500 mt-6">
              No upfront fees • 0.5% transaction fee • Web3 native
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
