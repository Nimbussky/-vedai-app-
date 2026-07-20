'use client';

import React, { useEffect, useState } from 'react';

type PlanetData = {
  name: string;
  house: number;
  sign: string;
};

export default function TransitsSection() {
  const [transits, setTransits] = useState<PlanetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTransits() {
      try {
        const today = new Date().toISOString().split('T')[0];
        
        // Let's assume user is around Delhi, India for dashboard defaults
        const res = await fetch('/api/astrology', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: today,
            time: '12:00',
            latitude: 28.6139,
            longitude: 77.2090,
            timezone: 'Asia/Kolkata',
          }),
        });
        
        if (!res.ok) throw new Error('Failed to fetch Transits');
        const json = await res.json();
        
        if (json.planets && Array.isArray(json.planets)) {
          // Filter some key planets for display
          const keyPlanets = ['Jupiter', 'Saturn', 'Rahu', 'Mars', 'Sun', 'Moon', 'Venus', 'Mercury', 'Ketu'];
          const availablePlanets = json.planets.filter((p: any) => keyPlanets.includes(p.name));
          setTransits(availablePlanets.slice(0, 3)); // show top 3 like before
        } else {
          throw new Error('Invalid format');
        }
      } catch (err) {
        setError('Unable to load Current Transits at this moment.');
      } finally {
        setLoading(false);
      }
    }
    fetchTransits();
  }, []);

  if (loading) {
    return (
      <div className="bg-[#1A2338]/60 backdrop-blur-xl p-6 rounded-2xl border border-[#F7F7F5]/10">
        <h3 className="text-lg font-medium mb-4 text-[#F7F7F5]">Current Transits</h3>
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-[#0B1120]/40 border border-[#F7F7F5]/5">
              <div className="w-8 h-8 rounded-full bg-[#D4A24C]/20"></div>
              <div className="flex-1 h-8 bg-[#F7F7F5]/5 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1A2338]/60 backdrop-blur-xl p-6 rounded-2xl border border-[#F7F7F5]/10">
        <h3 className="text-lg font-medium mb-4 text-[#F7F7F5]">Current Transits</h3>
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  if (transits.length === 0) {
    return (
      <div className="bg-[#1A2338]/60 backdrop-blur-xl p-6 rounded-2xl border border-[#F7F7F5]/10">
        <h3 className="text-lg font-medium mb-4 text-[#F7F7F5]">Current Transits</h3>
        <p className="text-sm text-[#F7F7F5]/70">No transit data available right now.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1A2338]/60 backdrop-blur-xl p-6 rounded-2xl border border-[#F7F7F5]/10">
      <h3 className="text-lg font-medium mb-4 text-[#F7F7F5]">Current Transits</h3>
      <div className="space-y-3">
        {transits.map((t) => (
          <div key={t.name} className="flex items-center gap-4 p-3 rounded-lg bg-[#0B1120]/40 border border-[#F7F7F5]/5">
            <div className="w-8 h-8 rounded-full bg-[#D4A24C]/20 flex items-center justify-center text-[#D4A24C] text-xs font-bold">
              {t.name[0]}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-[#F7F7F5]">{t.name} in {t.sign}</p>
              <p className="text-xs text-[#F7F7F5]/50">Transiting House {t.house || 1}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
