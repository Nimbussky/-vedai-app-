'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import NatalChart from '@/components/Chart/NatalChart';

type Planet = {
  name: string;
  sign: string;
  degree: number;
  house: number;
  retrograde: boolean;
  nakshatra: string;
};

const PLANET_COLORS: Record<string, string> = {
  Sun: '#D4A24C', Moon: '#F7F7F5', Mars: '#E53935', Mercury: '#43A047',
  Jupiter: '#FB8C00', Venus: '#AB47BC', Saturn: '#5C6BC0', Rahu: '#78909C', Ketu: '#8D6E63',
};

const HOUSE_MEANINGS: Record<number, string> = {
  1: 'Self, personality, physical body', 2: 'Wealth, family, speech', 3: 'Siblings, courage, communication',
  4: 'Home, mother, property', 5: 'Children, education, creativity', 6: 'Enemies, diseases, debt',
  7: 'Marriage, partnership, business', 8: 'Longevity, transformation, hidden matters',
  9: 'Fortune, dharma, father, long travel', 10: 'Career, reputation, authority',
  11: 'Gains, income, fulfillment', 12: 'Losses, expenses, foreign lands, moksha',
};

const tabs = ['Overview', 'Planets', 'Houses', 'Divisional Charts', 'Yogas'] as const;

export default function ChartDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [activeTab, setActiveTab] = useState<string>('Overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChart() {
      try {
        const res = await fetch(`/api/profiles/${id}/chart`);
        const data = await res.json();
        if (data.planets) setPlanets(data.planets);
      } catch {
        // fallback to stored chart
        const stored = localStorage.getItem('vedai_user_chart');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setPlanets(parsed && Array.isArray(parsed.planets) ? parsed.planets : (Array.isArray(parsed) ? parsed : []));
          } catch (e) {
            console.error("Error parsing stored chart", e);
          }
        }
      } finally {
        setLoading(false);
      }
    }
    fetchChart();
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

  return (
    <div className="min-h-screen bg-[#0B1120] text-[#F7F7F5]">
      <header className="border-b border-[#F7F7F5]/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl font-semibold text-[#D4A24C]">VedAI</Link>
          <nav className="flex items-center gap-6 text-sm text-[#F7F7F5]/60">
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link href="/charts" className="hover:text-white transition-colors">My Charts</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <Link href="/charts" className="text-sm text-[#3B5BDB] hover:underline">← Back to Charts</Link>
          <h1 className="font-serif text-3xl font-semibold mt-2">Birth Chart Detail</h1>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'bg-[#3B5BDB] text-white'
                  : 'bg-[#1A2338] text-[#F7F7F5]/60 hover:text-white border border-[#F7F7F5]/10'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-[#1A2338]/60 backdrop-blur-xl p-6 rounded-2xl border border-[#F7F7F5]/10">
              <h3 className="text-lg font-medium mb-6">Natal Chart</h3>
              <div className="flex justify-center">
                <NatalChart planets={planets} />
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-[#1A2338]/60 backdrop-blur-xl p-6 rounded-2xl border border-[#F7F7F5]/10">
                <h3 className="text-lg font-medium mb-4">Chart Summary</h3>
                <div className="grid grid-cols-2 gap-3">
                  {planets.slice(0, 9).map((p) => (
                    <div key={p.name} className="flex items-center gap-2 p-2 rounded-lg bg-[#0B1120]/40">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PLANET_COLORS[p.name] || '#F7F7F5' }} />
                      <span className="text-sm">{p.name}</span>
                      <span className="text-xs text-[#F7F7F5]/40 ml-auto">{p.sign}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-[#1A2338]/60 backdrop-blur-xl p-6 rounded-2xl border border-[#F7F7F5]/10">
                <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Link href={`/chart/${id}/dasha`} className="block px-4 py-3 rounded-lg bg-[#3B5BDB]/10 border border-[#3B5BDB]/30 text-[#3B5BDB] hover:bg-[#3B5BDB]/20 transition-colors text-sm">
                    View Dasha Timeline →
                  </Link>
                  <Link href={`/chart/${id}/transits`} className="block px-4 py-3 rounded-lg bg-[#D4A24C]/10 border border-[#D4A24C]/30 text-[#D4A24C] hover:bg-[#D4A24C]/20 transition-colors text-sm">
                    Current Transits →
                  </Link>
                  <Link href={`/chart/${id}/report`} className="block px-4 py-3 rounded-lg bg-[#43A047]/10 border border-[#43A047]/30 text-[#43A047] hover:bg-[#43A047]/20 transition-colors text-sm">
                    Generate AI Report →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Planets' && (
          <div className="bg-[#1A2338]/60 backdrop-blur-xl rounded-2xl border border-[#F7F7F5]/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#F7F7F5]/10">
                    <th className="text-left px-6 py-4 text-sm font-medium text-[#F7F7F5]/60">Planet</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-[#F7F7F5]/60">Sign</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-[#F7F7F5]/60">Degree</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-[#F7F7F5]/60">House</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-[#F7F7F5]/60">Nakshatra</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-[#F7F7F5]/60">Retro</th>
                  </tr>
                </thead>
                <tbody>
                  {planets.map((p) => (
                    <tr key={p.name} className="border-b border-[#F7F7F5]/5 hover:bg-[#0B1120]/40">
                      <td className="px-6 py-3 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PLANET_COLORS[p.name] }} />
                        <span className="font-medium">{p.name}</span>
                      </td>
                      <td className="px-6 py-3 text-[#F7F7F5]/70">{p.sign}</td>
                      <td className="px-6 py-3 text-[#F7F7F5]/70">{p.degree?.toFixed(1)}°</td>
                      <td className="px-6 py-3 text-[#F7F7F5]/70">{p.house}</td>
                      <td className="px-6 py-3 text-[#F7F7F5]/70">{p.nakshatra || '-'}</td>
                      <td className="px-6 py-3">{p.retrograde ? <span className="text-red-400 text-sm">R</span> : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Houses' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(HOUSE_MEANINGS).map(([house, meaning]) => {
              const housePlanets = planets.filter(p => p.house === parseInt(house));
              return (
                <div key={house} className="bg-[#1A2338]/60 backdrop-blur-xl p-5 rounded-2xl border border-[#F7F7F5]/10">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-[#3B5BDB]">House {house}</h4>
                    <span className="text-xs text-[#F7F7F5]/30">{meaning.split(',')[0]}</span>
                  </div>
                  <p className="text-xs text-[#F7F7F5]/50 mb-3">{meaning}</p>
                  {housePlanets.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {housePlanets.map(p => (
                        <span key={p.name} className="px-2 py-1 rounded text-xs bg-[#3B5BDB]/20 text-[#3B5BDB]">{p.name}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#F7F7F5]/30">No planets in this house</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'Divisional Charts' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {['D1 (Rashi)', 'D9 (Navamsha)', 'D10 (Dashamsha)', 'D12 (Dwadashamsha)'].map((chart) => (
              <div key={chart} className="bg-[#1A2338]/60 backdrop-blur-xl p-6 rounded-2xl border border-[#F7F7F5]/10">
                <h4 className="font-medium mb-4">{chart}</h4>
                <div className="aspect-square bg-[#0B1120]/60 rounded-xl border border-[#F7F7F5]/5 flex items-center justify-center">
                  <NatalChart planets={planets} />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Yogas' && (
          <div className="bg-[#1A2338]/60 backdrop-blur-xl p-6 rounded-2xl border border-[#F7F7F5]/10">
            <h3 className="text-lg font-medium mb-4">Detected Yogas</h3>
            <div className="space-y-4">
              {planets.filter(p => p.retrograde).length > 0 && (
                <div className="p-4 rounded-lg bg-[#0B1120]/40 border border-[#F7F7F5]/5">
                  <h4 className="font-medium text-[#D4A24C] mb-1">Retrograde Planets</h4>
                  <p className="text-sm text-[#F7F7F5]/60">
                    {planets.filter(p => p.retrograde).map(p => p.name).join(', ')} {planets.filter(p => p.retrograde).length > 1 ? 'are' : 'is'} retrograde, intensifying their karmic influence.
                  </p>
                </div>
              )}
              {planets.filter(p => p.house === 1).length > 0 && (
                <div className="p-4 rounded-lg bg-[#0B1120]/40 border border-[#F7F7F5]/5">
                  <h4 className="font-medium text-[#D4A24C] mb-1">First House Stellium</h4>
                  <p className="text-sm text-[#F7F7F5]/60">
                    Multiple planets in the 1st house ({planets.filter(p => p.house === 1).map(p => p.name).join(', ')}) create a strong personality focus.
                  </p>
                </div>
              )}
              <div className="p-4 rounded-lg bg-[#0B1120]/40 border border-[#F7F7F5]/5">
                <h4 className="font-medium text-[#D4A24C] mb-1">Gaja Kesari Yoga</h4>
                <p className="text-sm text-[#F7F7F5]/60">
                  If Jupiter is in a kendra (1, 4, 7, 10) from the Moon, this yoga brings wisdom, wealth, and reputation.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
