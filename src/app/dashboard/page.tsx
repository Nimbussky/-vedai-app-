'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ChatBox from '@/components/Chat/ChatBox';
import NatalChart from '@/components/Chart/NatalChart';

type UserBirth = {
  name: string;
  dob: string;
  timeOfBirth: string;
  placeOfBirth: string;
  latitude?: number;
  longitude?: number;
};

type PanchangData = {
  tithi: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  sunrise: string;
  sunset: string;
};

type TransitPlanet = {
  name: string;
  sign: string;
  house: number;
  retrograde: boolean;
};

export default function Dashboard() {
  const [userBirth, setUserBirth] = useState<UserBirth | null>(null);
  const [panchang, setPanchang] = useState<PanchangData | null>(null);
  const [transits, setTransits] = useState<TransitPlanet[]>([]);
  const [chartCount, setChartCount] = useState(0);

  useEffect(() => {
    // Load user birth info
    const stored = localStorage.getItem('vedai_user_birth');
    if (stored) {
      try { 
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') setUserBirth(parsed);
      } catch {}
    }

    // Count saved charts
    const chartKeys = Object.keys(localStorage).filter(k => k.startsWith('vedai_profile_'));
    setChartCount(chartKeys.length + 1); // +1 for the main chart

    const abortController = new AbortController();

    // Fetch Panchang
    fetch(`/api/panchang?date=${new Date().toISOString().split('T')[0]}`, { signal: abortController.signal })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d) setPanchang({
          tithi: d.tithi || 'N/A',
          nakshatra: d.nakshatra || 'N/A',
          yoga: d.yoga || 'N/A',
          karana: d.karana || 'N/A',
          sunrise: d.sunrise || '--:--',
          sunset: d.sunset || '--:--',
        });
      })
      .catch((err) => { if (err.name !== 'AbortError') console.error(err); });

    return () => abortController.abort();
  }, []);

  // Fetch transits after userBirth is loaded
  useEffect(() => {
    const lat = userBirth?.latitude || 28.6139;
    const lon = userBirth?.longitude || 77.2090;
    const today = new Date().toISOString().split('T')[0];

    const abortController = new AbortController();

    fetch('/api/astrology', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: today,
        time: '12:00',
        latitude: lat,
        longitude: lon,
        timezone: 'UTC',
      }),
      signal: abortController.signal,
    })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.planets) {
          const keyPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
          setTransits(d.planets.filter((p: TransitPlanet) => keyPlanets.includes(p.name)).slice(0, 5));
        }
      })
      .catch((err) => { if (err.name !== 'AbortError') console.error(err); });

    return () => abortController.abort();
  }, [userBirth]);

  const initials = typeof userBirth?.name === 'string'
    ? userBirth.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'S'
    : 'S';

  const greetingName = typeof userBirth?.name === 'string' ? userBirth.name.split(' ')[0] : 'Seeker';

  return (
    <div className="min-h-screen bg-[#0B1120] text-[#F7F7F5] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1A2338]/80 backdrop-blur-xl border-r border-[#F7F7F5]/10 p-6 flex flex-col hidden md:flex shrink-0">
        <Link href="/" className="text-2xl font-serif font-bold text-[#D4A24C] mb-8 tracking-widest">VEDAI</Link>
        <nav className="flex-1 space-y-1">
          {[
            { href: '/dashboard', label: 'Dashboard', icon: '◈' },
            { href: '/charts', label: 'My Charts', icon: '☉' },
            { href: '/panchang', label: 'Panchang', icon: '☽' },
            { href: '/compatibility', label: 'Kundli Milan', icon: '♡' },
            { href: '/chat', label: 'AI Chat', icon: '♃' },
            { href: '/settings', label: 'Settings', icon: '⚙' },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all ${
                item.href === '/dashboard'
                  ? 'bg-[#3B5BDB] text-white shadow-lg shadow-[#3B5BDB]/20'
                  : 'text-[#F7F7F5]/60 hover:text-white hover:bg-[#F7F7F5]/5'
              }`}
            >
              <span className="text-base opacity-70">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="pt-4 border-t border-[#F7F7F5]/10 text-xs text-[#F7F7F5]/30">
          {chartCount} chart{chartCount !== 1 ? 's' : ''} saved
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-[#1A2338]/50 backdrop-blur-md border-b border-[#F7F7F5]/10 shrink-0">
          <div>
            <h1 className="text-lg font-light">
              Welcome back, <span className="font-semibold text-[#D4A24C]">{greetingName}</span>
            </h1>
            {userBirth && (
              <p className="text-xs text-[#F7F7F5]/40">
                {userBirth.dob} · {userBirth.placeOfBirth}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Link href="/onboarding" className="text-xs text-[#3B5BDB] hover:underline">
              {userBirth ? 'Update Chart' : 'Add Birth Chart'}
            </Link>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#3B5BDB] to-[#D4A24C] shadow-lg flex items-center justify-center text-white text-xs font-bold">
              {initials}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Charts Saved', value: chartCount, color: '#3B5BDB' },
              { label: 'Panchang', value: panchang?.tithi?.split(' (')[0] || '--', color: '#D4A24C' },
              { label: 'Nakshatra', value: panchang?.nakshatra || '--', color: '#43A047' },
              { label: 'Active Transits', value: `${transits.length} planets`, color: '#AB47BC' },
            ].map(s => (
              <div key={s.label} className="bg-[#1A2338]/60 backdrop-blur-xl p-4 rounded-2xl border border-[#F7F7F5]/10">
                <p className="text-xs text-[#F7F7F5]/50 mb-1">{s.label}</p>
                <p className="text-lg font-semibold truncate" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left: Natal Chart + Panchang + Transits */}
            <div className="lg:col-span-3 space-y-6">
              {/* Natal Chart */}
              <div className="bg-[#1A2338]/60 backdrop-blur-xl p-6 rounded-2xl border border-[#F7F7F5]/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-medium">Your Natal Chart</h3>
                  <Link href={userBirth ? `/chart/1` : '/onboarding'} className="text-xs text-[#3B5BDB] hover:underline">
                    {userBirth ? 'View Details →' : 'Create Chart →'}
                  </Link>
                </div>
                <div className="flex justify-center">
                  <NatalChart />
                </div>
              </div>

              {/* Panchang */}
              <div className="bg-[#1A2338]/60 backdrop-blur-xl p-6 rounded-2xl border border-[#F7F7F5]/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-medium">Today's Panchang</h3>
                  <span className="text-xs text-[#F7F7F5]/40">
                    {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Tithi', value: panchang?.tithi },
                    { label: 'Nakshatra', value: panchang?.nakshatra },
                    { label: 'Yoga', value: panchang?.yoga },
                    { label: 'Karana', value: panchang?.karana },
                  ].map(item => (
                    <div key={item.label} className="bg-[#0B1120]/60 rounded-xl p-3 border border-[#F7F7F5]/5">
                      <p className="text-[10px] text-[#3B5BDB] uppercase tracking-wider mb-1">{item.label}</p>
                      <p className="text-sm font-medium truncate" title={item.value}>{item.value || '--'}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transits */}
              <div className="bg-[#1A2338]/60 backdrop-blur-xl p-6 rounded-2xl border border-[#F7F7F5]/10">
                <h3 className="text-base font-medium mb-4">
                  Current Transits
                  {userBirth?.placeOfBirth && (
                    <span className="text-xs text-[#F7F7F5]/40 font-normal ml-2">
                      near {userBirth.placeOfBirth}
                    </span>
                  )}
                </h3>
                {transits.length > 0 ? (
                  <div className="space-y-2">
                    {transits.map(t => (
                      <div key={t.name} className="flex items-center gap-3 p-3 rounded-lg bg-[#0B1120]/40 border border-[#F7F7F5]/5">
                        <div className="w-7 h-7 rounded-full bg-[#D4A24C]/20 flex items-center justify-center text-[#D4A24C] text-xs font-bold">
                          {t.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{t.name} in {t.sign}</p>
                          <p className="text-xs text-[#F7F7F5]/50">
                            House {t.house} {t.retrograde ? '· Retrograde' : ''}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#F7F7F5]/40">Loading transits...</p>
                )}
              </div>
            </div>

            {/* Right: AI Chat */}
            <div className="lg:col-span-2 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-medium">Vedic Guide</h3>
                <Link href="/chat" className="text-xs text-[#3B5BDB] hover:underline">Full Chat →</Link>
              </div>
              <div className="flex-1 rounded-2xl border border-[#F7F7F5]/10 shadow-2xl overflow-hidden min-h-[500px] flex flex-col">
                <ChatBox />
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { href: '/charts', label: 'All Charts', desc: 'View saved charts' },
              { href: '/compatibility', label: 'Kundli Milan', desc: 'Check compatibility' },
              { href: '/panchang', label: 'Full Panchang', desc: 'Detailed calendar' },
              { href: '/onboarding', label: 'Add Chart', desc: 'New birth chart' },
            ].map(item => (
              <Link key={item.href} href={item.href}
                className="bg-[#1A2338]/40 hover:bg-[#1A2338]/80 backdrop-blur-xl p-4 rounded-2xl border border-[#F7F7F5]/10 hover:border-[#3B5BDB]/30 transition-all group"
              >
                <p className="text-sm font-medium group-hover:text-[#3B5BDB] transition-colors">{item.label}</p>
                <p className="text-xs text-[#F7F7F5]/40 mt-0.5">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
