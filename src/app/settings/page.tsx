'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [notifications, setNotifications] = useState({
    dailyTransits: true,
    dashaChanges: true,
    reportReady: false,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('vedai_user_birth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.name) setName(parsed.name);
      } catch {}
    }
  }, []);

  function handleSave() {
    localStorage.setItem('vedai_settings', JSON.stringify({ name, email, notifications }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleDelete() {
    if (confirm('Are you sure? This will delete all your data.')) {
      localStorage.clear();
      router.push('/onboarding');
    }
  }

  function toggleNotification(key: keyof typeof notifications) {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-[#F7F7F5]">
      <header className="border-b border-[#F7F7F5]/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl font-semibold text-[#D4A24C]">VedAI</Link>
          <nav className="flex items-center gap-6 text-sm text-[#F7F7F5]/60">
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link href="/settings" className="hover:text-white transition-colors text-white">Settings</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="font-serif text-3xl font-semibold mb-6">Settings</h1>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['profile', 'account', 'notifications'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors capitalize ${activeTab === tab ? 'bg-[#3B5BDB] text-white' : 'bg-[#1A2338] text-[#F7F7F5]/60 hover:text-white border border-[#F7F7F5]/10'}`}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'profile' && (
          <div className="bg-[#1A2338]/60 backdrop-blur-xl p-6 rounded-2xl border border-[#F7F7F5]/10 space-y-4">
            <h3 className="font-medium mb-4">Profile Settings</h3>
            <div>
              <label className="block text-sm text-[#F7F7F5]/50 mb-1">Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-[#0B1120] border border-[#F7F7F5]/10 text-[#F7F7F5] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]" />
            </div>
            <div>
              <label className="block text-sm text-[#F7F7F5]/50 mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seeker@example.com" className="w-full px-4 py-2 rounded-lg bg-[#0B1120] border border-[#F7F7F5]/10 text-[#F7F7F5] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]" />
            </div>
            <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-[#3B5BDB] text-white text-sm font-medium hover:bg-[#3B5BDB]/90 transition-colors">
              {saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
        )}

        {activeTab === 'account' && (
          <div className="bg-[#1A2338]/60 backdrop-blur-xl p-6 rounded-2xl border border-[#F7F7F5]/10 space-y-4">
            <h3 className="font-medium mb-4">Account Settings</h3>
            <div className="flex items-center justify-between p-4 rounded-lg bg-[#0B1120]/40 border border-[#F7F7F5]/5">
              <div>
                <p className="font-medium text-sm">Delete Account</p>
                <p className="text-xs text-[#F7F7F5]/40">Permanently delete your account and all data</p>
              </div>
              <button onClick={handleDelete} className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors">Delete</button>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="bg-[#1A2338]/60 backdrop-blur-xl p-6 rounded-2xl border border-[#F7F7F5]/10 space-y-4">
            <h3 className="font-medium mb-4">Notification Preferences</h3>
            {[
              { key: 'dailyTransits' as const, label: 'Daily transit updates', desc: 'Get notified about significant transits' },
              { key: 'dashaChanges' as const, label: 'Dasha period changes', desc: 'Alert when your dasha period shifts' },
              { key: 'reportReady' as const, label: 'Report ready', desc: 'Notification when AI reports are generated' },
            ].map((n) => (
              <div key={n.key} className="flex items-center justify-between p-4 rounded-lg bg-[#0B1120]/40 border border-[#F7F7F5]/5">
                <div>
                  <p className="font-medium text-sm">{n.label}</p>
                  <p className="text-xs text-[#F7F7F5]/40">{n.desc}</p>
                </div>
                <button onClick={() => toggleNotification(n.key)} className={`w-10 h-6 rounded-full relative transition-colors ${notifications[n.key] ? 'bg-[#3B5BDB]' : 'bg-[#F7F7F5]/20'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifications[n.key] ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
            ))}
            <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-[#3B5BDB] text-white text-sm font-medium hover:bg-[#3B5BDB]/90 transition-colors">
              {saved ? 'Saved!' : 'Save Preferences'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
