'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative w-full min-h-[90vh] flex flex-col md:flex-row items-center justify-between px-6 md:px-12 lg:px-24 overflow-hidden pt-20">
      
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#3B5BDB] opacity-10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full md:w-1/2 flex justify-center md:justify-start mb-12 md:mb-0"
      >
        <div className="relative w-full max-w-[500px] aspect-square rounded-full border border-[#3B5BDB]/30 flex items-center justify-center p-4">
          <div className="w-full h-full rounded-full border border-[#D4A24C]/40 animate-[spin_60s_linear_infinite] flex items-center justify-center relative">
            <div className="w-3/4 h-3/4 rounded-full border border-[#F7F7F5]/10 animate-[spin_40s_linear_infinite_reverse]"></div>
            <div className="absolute w-1.5 h-1.5 bg-[#D4A24C] rounded-full top-0 left-1/2 shadow-[0_0_10px_#D4A24C]"></div>
            <div className="absolute w-1.5 h-1.5 bg-[#F7F7F5] rounded-full bottom-0 left-1/2 shadow-[0_0_10px_#F7F7F5]"></div>
            <div className="absolute w-1.5 h-1.5 bg-[#3B5BDB] rounded-full top-1/2 right-0 shadow-[0_0_10px_#3B5BDB]"></div>
            <div className="absolute w-1.5 h-1.5 bg-[#E53935] rounded-full top-1/2 left-0 shadow-[0_0_10px_#E53935]"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-serif text-2xl tracking-widest text-[#D4A24C] uppercase font-light">VedAI</span>
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        className="w-full md:w-1/2 flex flex-col items-start text-left z-10"
      >
        <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.1] mb-6 text-[#F7F7F5]">
          Instant Vedic Astrology, <br/>
          <span className="text-[#3B5BDB]">Powered by AI.</span>
        </h1>
        <p className="text-lg md:text-xl text-[#F7F7F5]/70 font-light mb-10 max-w-lg">
          Generate your birth chart in under 10 seconds and get instant AI-powered interpretation. Swiss Ephemeris precision, plain-language insights.
        </p>
        
        <div className="flex items-center gap-4">
          <Link href="/onboarding">
            <button className="bg-[#3B5BDB] hover:bg-[#3B5BDB]/90 text-white px-8 py-4 rounded-lg font-medium transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(59,91,219,0.3)]">
              Generate your chart free
            </button>
          </Link>
          <Link href="/panchang">
            <button className="px-6 py-4 rounded-lg font-medium text-[#F7F7F5]/80 hover:text-white transition-colors">
              See Panchang →
            </button>
          </Link>
        </div>
      </motion.div>

    </section>
  );
}
