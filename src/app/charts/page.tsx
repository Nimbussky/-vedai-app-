'use client';
import React from 'react';
import Link from 'next/link';

const savedCharts = [
  { id: 1, name: 'My Chart', date: '1990-01-15', place: 'Mumbai, India' },
  { id: 2, name: 'Partner', date: '1992-05-20', place: 'Delhi, India' },
  { id: 3, name: 'Mom', date: '1965-08-12', place: 'Kolkata, India' },
];

export default function ChartsPage() {
  return (
    <div className="min-h-screen bg-[#0B1120] text-[#F7F7F5]">
      <header className="border-b border-[#F7F7F5]/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl font-semibold text-[#D4A24C]">VedAI</Link>
          <nav className="flex items-center gap-6 text-sm text-[#F7F7F5]/60">
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link href="/charts" className="hover:text-white transition-colors text-white">My Charts</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-semibold">My Charts</h1>
            <p className="text-[#F7F7F5]/50 mt-1">All saved birth charts</p>
          </div>
          <Link href="/onboarding">
            <button className="px-4 py-2 rounded-lg bg-[#3B5BDB] text-white text-sm font-medium hover:bg-[#3B5BDB]/90 transition-colors">
              + New Chart
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedCharts.map((chart) => (
            <Link key={chart.id} href={`/chart/${chart.id}`}>
              <div className="bg-[#1A2338]/60 backdrop-blur-xl p-6 rounded-2xl border border-[#F7F7F5]/10 hover:border-[#3B5BDB]/30 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#3B5BDB]/20 flex items-center justify-center text-[#3B5BDB] font-bold text-sm">
                    {chart.name[0]}
                  </div>
                  <div>
                    <h3 className="font-medium group-hover:text-[#3B5BDB] transition-colors">{chart.name}</h3>
                    <p className="text-xs text-[#F7F7F5]/40">{chart.date}</p>
                  </div>
                </div>
                <p className="text-sm text-[#F7F7F5]/50">{chart.place}</p>
                <div className="flex gap-2 mt-4">
                  <span className="px-2 py-1 rounded text-xs bg-[#3B5BDB]/10 text-[#3B5BDB]">D1</span>
                  <span className="px-2 py-1 rounded text-xs bg-[#D4A24C]/10 text-[#D4A24C]">Dasha</span>
                  <span className="px-2 py-1 rounded text-xs bg-[#43A047]/10 text-[#43A047]">Report</span>
                </div>
              </div>
            </Link>
          ))}

          <Link href="/onboarding">
            <div className="bg-[#1A2338]/30 backdrop-blur-xl p-6 rounded-2xl border border-dashed border-[#F7F7F5]/10 hover:border-[#3B5BDB]/30 transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[180px]">
              <div className="w-12 h-12 rounded-full bg-[#3B5BDB]/10 flex items-center justify-center mb-3">
                <span className="text-2xl text-[#3B5BDB]">+</span>
              </div>
              <p className="text-sm text-[#F7F7F5]/50">Add new chart</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
