'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

type Transit = {
  planet: string;
  currentSign: string;
  degree: number;
  house: number;
  retrograde: boolean;
};

const PLANET_COLORS: Record<string, string> = {
  Sun: '#D4A24C', Moon: '#F7F7F5', Mars: '#E53935', Mercury: '#43A047',
  Jupiter: '#FB8C00', Venus: '#AB47BC', Saturn: '#5C6BC0', Rahu: '#78909C', Ketu: '#8D6E63',
};

export default function TransitsPage() {
  const params = useParams();
  const id = params?.id as string;
  const [transits, setTransits] = useState<Transit[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    async function fetchTransits() {
      setLoading(true);
      try {
        const res = await fetch(`/api/profiles/${id}/transits`);
        const data = await res.json();
        if (data.transits) setTransits(data.transits);
      } catch {
        setTransits([]);
      } finally {
        setLoading(false);
      }
    }
    fetchTransits();
  }, [id]);

  return (
    <div className="min-h-screen bg-[#0B1120] text-[#F7F7F5]">
      <header className="border-b border-[#F7F7F5]/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl font-semibold text-[#D4A24C]">VedAI</Link>
          <nav className="flex items-center gap-6 text-sm text-[#F7F7F5]/60">
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link href={`/chart/${id}`} className="hover:text-white transition-colors">Chart</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <Link href={`/chart/${id}`} className="text-sm text-[#3B5BDB] hover:underline">← Back to Chart</Link>
          <h1 className="font-serif text-3xl font-semibold mt-2">Current Transits</h1>
          <p className="text-[#F7F7F5]/50 mt-1">Where planets are today over your natal chart</p>
        </div>

        <div className="mb-6 flex items-center gap-4">
          <label className="text-sm text-[#F7F7F5]/50">Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-4 py-2 rounded-lg bg-[#1A2338] border border-[#F7F7F5]/10 text-[#F7F7F5] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-[#3B5BDB] rounded-full animate-pulse" />
              <div className="w-3 h-3 bg-[#3B5BDB] rounded-full animate-pulse [animation-delay:0.2s]" />
              <div className="w-3 h-3 bg-[#3B5BDB] rounded-full animate-pulse [animation-delay:0.4s]" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {transits.map((t) => (
              <div key={t.planet} className={`bg-[#1A2338]/60 backdrop-blur-xl p-5 rounded-2xl border transition-colors ${t.retrograde ? 'border-red-500/30' : 'border-[#F7F7F5]/10'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: PLANET_COLORS[t.planet] + '30', color: PLANET_COLORS[t.planet] }}>
                    {t.planet[0]}
                  </div>
                  <div>
                    <h3 className="font-medium">{t.planet}</h3>
                    <p className="text-xs text-[#F7F7F5]/40">House {t.house}</p>
                  </div>
                  {t.retrograde && <span className="ml-auto text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">Retrograde</span>}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#F7F7F5]/70">{t.currentSign}</span>
                  <span className="text-sm text-[#F7F7F5]/50">{t.degree?.toFixed(1)}°</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
