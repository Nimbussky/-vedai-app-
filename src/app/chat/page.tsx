'use client';
import React from 'react';
import Link from 'next/link';
import ChatBox from '@/components/Chat/ChatBox';

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-[#0B1120] text-[#F7F7F5] flex flex-col">
      <header className="border-b border-[#F7F7F5]/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl font-semibold text-[#D4A24C]">VedAI</Link>
          <nav className="flex items-center gap-6 text-sm text-[#F7F7F5]/60">
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link href="/panchang" className="hover:text-white transition-colors">Panchang</Link>
            <Link href="/chat" className="hover:text-white transition-colors text-white">AI Chat</Link>
          </nav>
        </div>
      </header>
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        <div className="flex-1 flex flex-col p-4">
          <ChatBox />
        </div>
      </div>
    </div>
  );
}
