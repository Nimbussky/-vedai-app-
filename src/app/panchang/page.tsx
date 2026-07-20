'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

type PanchangData = {
  tithi: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  sunrise: string;
  sunset: string;
  sunTrueLong: string;
  moonLong: string;
};

export default function PanchangPage() {
  const [data, setData] = useState<PanchangData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPanchang() {
      try {
        const today = new Date().toISOString().split('T')[0];
        const res = await fetch(`/api/panchang?date=${today}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const json = await res.json();
        setData({
          tithi: json.tithi || 'N/A',
          nakshatra: json.nakshatra || 'N/A',
          yoga: json.yoga || 'N/A',
          karana: json.karana || 'N/A',
          sunrise: json.sunrise || 'N/A',
          sunset: json.sunset || 'N/A',
          sunTrueLong: json.sunTrueLong || 'N/A',
          moonLong: json.moonLong || 'N/A',
        });
      } catch {
        // Fallback to static data if API fails
        setData({
          tithi: 'Pratipada (Shukla Paksha)',
          nakshatra: 'Ashwini',
          yoga: 'Vishkambha',
          karana: 'Bava',
          sunrise: '06:00',
          sunset: '18:30',
          sunTrueLong: 'N/A',
          moonLong: 'N/A',
        });
      } finally {
        setLoading(false);
      }
    }
    fetchPanchang();
  }, []);

  return (
    <div className="min-h-screen bg-[#0B1120] text-[#F7F7F5]">
      <header className="border-b border-[#F7F7F5]/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl font-semibold text-[#D4A24C]">VedAI</Link>
          <nav className="flex items-center gap-6 text-sm text-[#F7F7F5]/60">
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link href="/panchang" className="hover:text-white transition-colors text-white">Panchang</Link>
            <Link href="/chat" className="hover:text-white transition-colors">AI Chat</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-semibold mb-2">Today&apos;s Panchang</h1>
          <p className="text-[#F7F7F5]/50">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          {data?.sunTrueLong && data.sunTrueLong !== 'N/A' && (
            <p className="text-xs text-[#F7F7F5]/30 mt-1">Computed astronomically (Lahiri Ayanamsa)</p>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-[#1A2338]/60 p-6 rounded-2xl border border-[#F7F7F5]/10 animate-pulse h-32" />
            ))}
          </div>
        ) : data ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {[
                { label: 'Tithi', value: data.tithi, icon: '🌙', color: '#D4A24C' },
                { label: 'Nakshatra', value: data.nakshatra, icon: '⭐', color: '#3B5BDB' },
                { label: 'Yoga', value: data.yoga, icon: '✨', color: '#43A047' },
                { label: 'Karana', value: data.karana, icon: '🔮', color: '#AB47BC' },
              ].map((item) => (
                <div key={item.label} className="bg-[#1A2338]/60 backdrop-blur-xl p-6 rounded-2xl border border-[#F7F7F5]/10 hover:border-[#3B5BDB]/30 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{item.icon}</span>
                    <h3 className="text-sm uppercase tracking-wider text-[#F7F7F5]/50">{item.label}</h3>
                  </div>
                  <p className="text-xl font-medium truncate" style={{ color: item.color }} title={item.value}>{item.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-[#1A2338]/60 backdrop-blur-xl p-6 rounded-2xl border border-[#F7F7F5]/10">
                <h2 className="font-serif text-xl font-semibold mb-4">Sun &amp; Moon</h2>
                <div className="space-y-3">
                  {[
                    { event: 'Sunrise', time: data.sunrise, icon: '☀️' },
                    { event: 'Sunset', time: data.sunset, icon: '🌅' },
                    { event: 'Sun Longitude', time: `${data.sunTrueLong}°`, icon: '☉' },
                    { event: 'Moon Longitude', time: `${data.moonLong}°`, icon: '☽' },
                  ].map((t) => (
                    <div key={t.event} className="flex items-center justify-between p-3 rounded-lg bg-[#0B1120]/40 border border-[#F7F7F5]/5">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{t.icon}</span>
                        <span className="text-sm text-[#F7F7F5]">{t.event}</span>
                      </div>
                      <span className="text-sm text-[#3B5BDB]">{t.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#1A2338]/60 backdrop-blur-xl p-6 rounded-2xl border border-[#F7F7F5]/10">
                <h2 className="font-serif text-xl font-semibold mb-4">Auspicious Times</h2>
                <div className="space-y-3">
                  {[
                    { period: 'Brahma Muhurta', time: '04:30 - 05:15', note: 'Best for meditation' },
                    { period: 'Abhijit Muhurta', time: '11:45 - 12:30', note: 'Good for important work' },
                    { period: 'Amrit Kalam', time: '21:00 - 22:30', note: 'Favorable for spiritual practices' },
                  ].map((t) => (
                    <div key={t.period} className="flex items-center justify-between p-3 rounded-lg bg-[#0B1120]/40 border border-[#F7F7F5]/5">
                      <div>
                        <p className="text-sm font-medium text-[#F7F7F5]">{t.period}</p>
                        <p className="text-xs text-[#F7F7F5]/40">{t.note}</p>
                      </div>
                      <span className="text-sm text-[#D4A24C]">{t.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
