'use client';

import { motion } from 'framer-motion';
import { Compass, Heart, Calendar } from 'lucide-react';

export default function Features() {
  return (
    <section className="py-24 px-6 md:px-12 lg:px-24">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-4 text-[#F7F7F5]">Insights that matter</h2>
          <p className="text-[#F7F7F5]/60 text-lg max-w-2xl">Don't just look at a chart. Understand what it means for your life right now.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="col-span-1 lg:col-span-2 bg-gradient-to-br from-[#1A2338] to-[#0B1120] border border-[#F7F7F5]/10 p-8 rounded-2xl overflow-hidden relative group"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#3B5BDB]/20 blur-[80px] rounded-full group-hover:bg-[#3B5BDB]/30 transition-colors" />
            <Compass className="w-8 h-8 text-[#3B5BDB] mb-6" />
            <h3 className="text-2xl font-medium mb-3 text-[#F7F7F5]">Understand your career timing</h3>
            <p className="text-[#F7F7F5]/70 max-w-md">Discover when favorable dashas align with key transits. VedAI highlights the optimal windows for job changes, promotions, and starting new ventures.</p>
          </motion.div>

          {/* Feature 2 */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="col-span-1 bg-gradient-to-br from-[#1A2338] to-[#0B1120] border border-[#F7F7F5]/10 p-8 rounded-2xl relative group"
          >
            <Heart className="w-8 h-8 text-[#D4A24C] mb-6" />
            <h3 className="text-2xl font-medium mb-3 text-[#F7F7F5]">Know your compatibility</h3>
            <p className="text-[#F7F7F5]/70">Run synastry charts instantly. Get an AI-narrated explanation of your relationship dynamics.</p>
          </motion.div>

          {/* Feature 3 */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="col-span-1 lg:col-span-3 bg-gradient-to-br from-[#1A2338] to-[#0B1120] border border-[#F7F7F5]/10 p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between"
          >
            <div className="mb-6 md:mb-0 max-w-lg">
              <Calendar className="w-8 h-8 text-white mb-6" />
              <h3 className="text-2xl font-medium mb-3 text-[#F7F7F5]">Daily Panchang</h3>
              <p className="text-[#F7F7F5]/70">Access today's Tithi, Nakshatra, Yoga, and Karana. Know the exact auspicious windows for important activities directly from the dashboard.</p>
            </div>
            <div className="w-full md:w-1/3 aspect-video bg-[#0B1120] rounded-lg border border-[#F7F7F5]/5 flex items-center justify-center overflow-hidden">
                <div className="grid grid-cols-4 gap-2 p-4">
                  {['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'].map((s, i) => (
                    <span key={i} className="text-[#D4A24C]/60 text-lg text-center">{s}</span>
                  ))}
                </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
