import { motion } from 'framer-motion';

export default function PitchHero() {
  return (
    <div className="text-center mb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="inline-block px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full mb-6">
          <span className="text-green-400 text-sm font-medium">100% FREE APPLICATION • NO CREDIT CARD REQUIRED</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
          Apply Free
        </h1>
        
        <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
          AI agents evaluate your startup in seconds. Get funded through our SharkTank model. 
          <span className="block mt-2 text-purple-400">We only charge on successful deals.</span>
        </p>

        <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto text-sm">
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-400 mb-1">$0</div>
            <div className="text-gray-400">Application</div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-pink-400 mb-1">$0</div>
            <div className="text-gray-400">Evaluation</div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-400 mb-1">24/7</div>
            <div className="text-gray-400">AI Support</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
