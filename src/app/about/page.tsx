import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0B1120] text-[#F7F7F5]">
      <header className="border-b border-[#F7F7F5]/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl font-semibold text-[#D4A24C]">VedAI</Link>
          <nav className="flex items-center gap-6 text-sm text-[#F7F7F5]/60">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/about" className="hover:text-white transition-colors text-white">About</Link>
            <Link href="/methodology" className="hover:text-white transition-colors">Methodology</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="font-serif text-4xl font-semibold mb-8">About VedAI</h1>

        <div className="space-y-8">
          <section className="bg-[#1A2338]/60 backdrop-blur-xl p-8 rounded-2xl border border-[#F7F7F5]/10">
            <h2 className="font-serif text-2xl font-medium mb-4 text-[#3B5BDB]">Our Mission</h2>
            <p className="text-[#F7F7F5]/70 leading-relaxed">
              VedAI bridges ancient Vedic wisdom with modern AI technology. We believe everyone deserves access to accurate, personalized astrological insights without the noise of generic horoscopes or the cost of traditional consultations.
            </p>
          </section>

          <section className="bg-[#1A2338]/60 backdrop-blur-xl p-8 rounded-2xl border border-[#F7F7F5]/10">
            <h2 className="font-serif text-2xl font-medium mb-4 text-[#D4A24C]">What Makes Us Different</h2>
            <div className="space-y-4 text-[#F7F7F5]/70 leading-relaxed">
              <p><strong className="text-[#F7F7F5]">Real calculations, not guesswork.</strong> Every chart is computed using the VedAstro engine, which uses Swiss Ephemeris for astronomical precision. No random number generators.</p>
              <p><strong className="text-[#F7F7F5]">AI interpretation, not templates.</strong> Our AI reads your specific planetary positions and generates personalized interpretations — not pre-written paragraphs pasted into every chart.</p>
              <p><strong className="text-[#F7F7F5]">Transparent source.</strong> The VedAstro engine is open source. You can verify our calculations yourself.</p>
            </div>
          </section>

          <section className="bg-[#1A2338]/60 backdrop-blur-xl p-8 rounded-2xl border border-[#F7F7F5]/10">
            <h2 className="font-serif text-2xl font-medium mb-4">Technology</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'VedAstro Engine', desc: 'Swiss Ephemeris precision' },
                { name: 'AI Models', desc: 'Mistral, Cerebras, Gemini' },
                { name: 'Next.js 15', desc: 'Edge-rendered React' },
                { name: 'Cloudflare', desc: 'Global edge deployment' },
              ].map((t) => (
                <div key={t.name} className="p-4 rounded-xl bg-[#0B1120]/40 border border-[#F7F7F5]/5 text-center">
                  <p className="text-sm font-medium text-[#F7F7F5]">{t.name}</p>
                  <p className="text-xs text-[#F7F7F5]/40 mt-1">{t.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
