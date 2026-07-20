'use client';

import React, { useEffect, useState } from 'react';

type PanchangData = {
  tithi: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  sunrise: string;
  sunset: string;
};

export default function PanchangSection() {
  const [data, setData] = useState<PanchangData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPanchang() {
      try {
        const today = new Date().toISOString().split('T')[0];
        const res = await fetch(`/api/panchang?date=${today}`);
        if (!res.ok) throw new Error('Failed to fetch Panchang data');
        const json = await res.json();
        setData({
          tithi: json.tithi || 'N/A',
          nakshatra: json.nakshatra || 'N/A',
          yoga: json.yoga || 'N/A',
          karana: json.karana || 'N/A',
          sunrise: json.sunrise || 'N/A',
          sunset: json.sunset || 'N/A',
        });
      } catch (err) {
        setError('Unable to load Panchang data at this moment.');
      } finally {
        setLoading(false);
      }
    }
    fetchPanchang();
  }, []);

  if (loading) {
    return (
      <div className="bg-[#1A2338]/60 backdrop-blur-xl p-6 rounded-2xl border border-[#F7F7F5]/10">
        <h3 className="text-lg font-medium mb-4 text-[#F7F7F5]">Today's Panchang</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-[#0B1120]/60 rounded-xl p-4 border border-[#F7F7F5]/5 h-20">
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1A2338]/60 backdrop-blur-xl p-6 rounded-2xl border border-[#F7F7F5]/10">
        <h3 className="text-lg font-medium mb-4 text-[#F7F7F5]">Today's Panchang</h3>
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  const items = [
    { label: 'Tithi', value: data?.tithi },
    { label: 'Nakshatra', value: data?.nakshatra },
    { label: 'Yoga', value: data?.yoga },
    { label: 'Karana', value: data?.karana },
  ];

  return (
    <div className="bg-[#1A2338]/60 backdrop-blur-xl p-6 rounded-2xl border border-[#F7F7F5]/10">
      <h3 className="text-lg font-medium mb-4 text-[#F7F7F5]">Today's Panchang</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item.label} className="bg-[#0B1120]/60 rounded-xl p-4 border border-[#F7F7F5]/5">
            <p className="text-xs text-[#3B5BDB] uppercase tracking-wider mb-1">{item.label}</p>
            <p className="text-sm font-medium text-[#F7F7F5] truncate" title={item.value}>{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
