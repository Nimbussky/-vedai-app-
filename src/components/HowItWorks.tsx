'use client';

import { motion } from 'framer-motion';
import { User, Sparkles, Map } from 'lucide-react';

const steps = [
  {
    icon: <User className="w-6 h-6 text-[#D4A24C]" />,
    title: "1. Enter birth details",
    description: "Provide your exact time, date, and place of birth. We geocode the location automatically."
  },
  {
    icon: <Map className="w-6 h-6 text-[#3B5BDB]" />,
    title: "2. Fetch precision chart",
    description: "We query the VedAstro engine to construct your accurate D1 and divisional charts instantly."
  },
  {
    icon: <Sparkles className="w-6 h-6 text-white" />,
    title: "3. AI reads your chart",
    description: "Get plain-language interpretations for your dashas, transits, and planetary placements."
  }
];

export default function HowItWorks() {
  return (
    <section className="py-24 px-6 md:px-12 lg:px-24 bg-[#0B1120]/50 border-t border-[#F7F7F5]/10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16 md:text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-4 text-[#F7F7F5]">How VedAI Works</h2>
          <p className="text-[#F7F7F5]/60 text-lg">Three simple steps to unlock ancient wisdom with modern technology.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-[1px] bg-[#F7F7F5]/10 -translate-y-1/2 z-0"></div>

          {steps.map((step, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="bg-[#0B1120] border border-[#F7F7F5]/10 p-8 rounded-xl z-10 relative hover:border-[#3B5BDB]/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-[#1A2338] flex items-center justify-center mb-6">
                {step.icon}
              </div>
              <h3 className="text-xl font-medium mb-3 text-[#F7F7F5]">{step.title}</h3>
              <p className="text-[#F7F7F5]/60 leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
