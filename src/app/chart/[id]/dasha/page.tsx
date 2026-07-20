'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

type Antardasha = {
  planet: string;
  startDate: string;
  endDate: string;
};

type Dasha = {
  planet: string;
  startDate: string;
  endDate: string;
  totalYears: number;
  antardashas: Antardasha[];
};

const PLANET_COLORS: Record<string, string> = {
  Ketu: '#8D6E63', Venus: '#AB47BC', Sun: '#D4A24C', Moon: '#F7F7F5',
  Mars: '#E53935', Rahu: '#78909C', Jupiter: '#FB8C00', Saturn: '#5C6BC0', Mercury: '#43A047',
};

function isCurrentPeriod(startDate: string, endDate: string) {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  return now >= start && now <= end;
}

export default function DashaPage() {
  const params = useParams();
  const id = params?.id as string;
  const [dashas, setDashas] = useState<Dasha[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDasha, setExpandedDasha] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDasha() {
      try {
        const res = await fetch(`/api/profiles/${id}/dasha`);
        const data = await res.json();
        if (data.dashas) {
          setDashas(data.dashas);
          const current = data.dashas.find((d: Dasha) => isCurrentPeriod(d.startDate, d.endDate));
          if (current) setExpandedDasha(current.planet);
        }
      } catch {
        setDashas([]);
      } finally {
        setLoading(false);
      }
    }
    fetchDasha();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-[#3B5BDB] rounded-full animate-pulse" />
          <div className="w-3 h-3 bg-[#3B5BDB] rounded-full animate-pulse [animation-delay:0.2s]" />
          <div className="w-3 h-3 bg-[#3B5BDB] rounded-full animate-pulse [animation-delay:0.4s]" />
        </div>
      </div>
    );
  }

  const totalYears = dashas.reduce((sum, d) => sum + d.totalYears, 0);

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
          <h1 className="font-serif text-3xl font-semibold mt-2">Vimshottari Dasha Timeline</h1>
          <p className="text-[#F7F7F5]/50 mt-1">120-year cycle based on Moon&apos;s nakshatra at birth</p>
        </div>

        <div className="mb-8 bg-[#1A2338]/60 backdrop-blur-xl p-4 rounded-2xl border border-[#F7F7F5]/10">
          <div className="flex gap-1 h-8">
            {dashas.map((d) => {
              const width = (d.totalYears / totalYears) * 100;
              const isCurrent = isCurrentPeriod(d.startDate, d.endDate);
              return (
                <div
                  key={d.planet}
                  className="relative group cursor-pointer rounded transition-all"
                  style={{
                    width: `${width}%`,
                    backgroundColor: PLANET_COLORS[d.planet] || '#555',
                    opacity: isCurrent ? 1 : 0.4,
                    border: isCurrent ? '2px solid #F7F7F5' : 'none',
                  }}
                  onClick={() => setExpandedDasha(expandedDasha === d.planet ? null : d.planet)}
                >
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#0B1120]">
                    {d.planet.slice(0, 3)}
                  </span>
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#0B1120] border border-[#F7F7F5]/20 px-3 py-2 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                    <p className="font-medium">{d.planet} Mahadasha</p>
                    <p className="text-[#F7F7F5]/50">{d.startDate} — {d.endDate}</p>
                    <p className="text-[#F7F7F5]/50">{d.totalYears} years</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs text-[#F7F7F5]/30">
            <span>Birth</span>
            <span>120 years</span>
          </div>
        </div>

        <div className="space-y-4">
          {dashas.map((d) => {
            const isCurrent = isCurrentPeriod(d.startDate, d.endDate);
            const isExpanded = expandedDasha === d.planet;
            return (
              <div key={d.planet} className={`bg-[#1A2338]/60 backdrop-blur-xl rounded-2xl border transition-colors ${isCurrent ? 'border-[#3B5BDB]/50' : 'border-[#F7F7F5]/10'}`}>
                <button
                  onClick={() => setExpandedDasha(isExpanded ? null : d.planet)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: PLANET_COLORS[d.planet] + '30', color: PLANET_COLORS[d.planet] }}>
                      {d.planet[0]}
                    </div>
                    <div>
                      <h3 className="font-medium flex items-center gap-2">
                        {d.planet} Mahadasha
                        {isCurrent && <span className="text-xs px-2 py-0.5 rounded-full bg-[#3B5BDB] text-white">Current</span>}
                      </h3>
                      <p className="text-sm text-[#F7F7F5]/50">{d.startDate} — {d.endDate} · {d.totalYears} years</p>
                    </div>
                  </div>
                  <svg className={`w-5 h-5 text-[#F7F7F5]/30 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-[#F7F7F5]/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                      {d.antardashas.map((ad) => {
                        const isAdCurrent = isCurrentPeriod(ad.startDate, ad.endDate);
                        return (
                          <div key={`${d.planet}-${ad.planet}`} className={`p-3 rounded-xl border ${isAdCurrent ? 'bg-[#3B5BDB]/10 border-[#3B5BDB]/30' : 'bg-[#0B1120]/40 border-[#F7F7F5]/5'}`}>
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PLANET_COLORS[ad.planet] }} />
                              <span className="text-sm font-medium">{ad.planet}</span>
                              {isAdCurrent && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#3B5BDB] text-white">Now</span>}
                            </div>
                            <p className="text-xs text-[#F7F7F5]/40">{ad.startDate} — {ad.endDate}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
