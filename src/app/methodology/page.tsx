import React from 'react';
import Link from 'next/link';

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-[#0B1120] text-[#F7F7F5]">
      <header className="border-b border-[#F7F7F5]/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl font-semibold text-[#D4A24C]">VedAI</Link>
          <nav className="flex items-center gap-6 text-sm text-[#F7F7F5]/60">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/methodology" className="hover:text-white transition-colors text-white">Methodology</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="font-serif text-4xl font-semibold mb-8">Methodology</h1>

        <div className="space-y-8">
          <section className="bg-[#1A2338]/60 backdrop-blur-xl p-8 rounded-2xl border border-[#F7F7F5]/10">
            <h2 className="font-serif text-2xl font-medium mb-4 text-[#3B5BDB]">Chart Calculation</h2>
            <div className="space-y-3 text-[#F7F7F5]/70 leading-relaxed">
              <p>All birth charts are calculated using the <strong className="text-[#F7F7F5]">VedAstro engine</strong>, an open-source Vedic astrology computation system built on Swiss Ephemeris — the same astronomical library used by professional astrologers worldwide.</p>
              <p>We use the <strong className="text-[#F7F7F5]">Lahiri ayanamsha</strong> (Chitrapaksha) for sidereal calculations, which is the most widely accepted ayanamsha in Vedic astrology.</p>
              <p>Planetary positions are calculated for the exact moment and location of birth, accounting for timezone and geographic coordinates.</p>
            </div>
          </section>

          <section className="bg-[#1A2338]/60 backdrop-blur-xl p-8 rounded-2xl border border-[#F7F7F5]/10">
            <h2 className="font-serif text-2xl font-medium mb-4 text-[#D4A24C]">Dasha System</h2>
            <div className="space-y-3 text-[#F7F7F5]/70 leading-relaxed">
              <p>We use the <strong className="text-[#F7F7F5]">Vimshottari Dasha</strong> system, the most widely followed timing system in Vedic astrology. It spans 120 years based on the Moon&apos;s nakshatra at birth.</p>
              <p>Each planet governs a specific period (Mahadasha), subdivided into sub-periods (Antardasha) and further into sub-sub-periods (Pratyantardasha).</p>
              <p>The dasha periods help identify favorable and challenging times for career, relationships, health, and spiritual growth.</p>
            </div>
          </section>

          <section className="bg-[#1A2338]/60 backdrop-blur-xl p-8 rounded-2xl border border-[#F7F7F5]/10">
            <h2 className="font-serif text-2xl font-medium mb-4">AI Interpretation</h2>
            <div className="space-y-3 text-[#F7F7F5]/70 leading-relaxed">
              <p>Our AI models receive your complete planetary data as structured JSON — every planet, house, nakshatra, and divisional chart position. The AI then generates a personalized interpretation based on classical Vedic astrology texts.</p>
              <p>The AI does <strong className="text-[#F7F7F5]">not</strong> use generic templates. Each reading is generated fresh from your specific chart data.</p>
              <p>We use multiple AI models (Mistral, Cerebras, Gemini) for different types of readings, each chosen for its strengths in handling the specific analysis required.</p>
            </div>
          </section>

          <section className="bg-[#1A2338]/60 backdrop-blur-xl p-8 rounded-2xl border border-[#F7F7F5]/10">
            <h2 className="font-serif text-2xl font-medium mb-4">Transparency</h2>
            <div className="space-y-3 text-[#F7F7F5]/70 leading-relaxed">
              <p>The VedAstro engine is <strong className="text-[#F7F7F5]">open source</strong> — you can verify our calculations at <a href="https://github.com/VedAstro/VedAstro" target="_blank" rel="noopener noreferrer" className="text-[#3B5BDB] hover:underline">github.com/VedAstro/VedAstro</a>.</p>
              <p>We clearly state which calculation method we use (Lahiri ayanamsha, Vimshottari dasha) so you can compare with other tools.</p>
              <p>If our calculations don&apos;t match your expectations, check the birth time and location accuracy first — these are the most common sources of discrepancies.</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
