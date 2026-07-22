'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ReportPage() {
  const params = useParams();
  const id = params?.id as string;
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState('');
  const [profile, setProfile] = useState<{ date: string; time: string; latitude: number; longitude: number; place: string; timezone: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('vedai_user_birth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          setProfile({
            date: parsed.dob || parsed.date || '1990-01-15',
            time: parsed.timeOfBirth || parsed.time || '10:30',
            latitude: parsed.latitude || 19.076,
            longitude: parsed.longitude || 72.8777,
            place: parsed.placeOfBirth || parsed.place || 'Mumbai, India',
            timezone: parsed.timezone || 'Asia/Kolkata',
          });
        }
      } catch {}
    }
  }, []);

  async function generateReport(type: string) {
    if (!profile) {
      setReport('Please complete your birth profile first.');
      return;
    }
    setLoading(true);
    setReport('');
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, type }),
      });
      const data = await res.json();
      if (data.report) {
        setReport(data.report);
        setGenerated(data.generated);
      }
    } catch {
      setReport('Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function downloadPDF() {
    if (!report) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>VedAI Report - ${profile?.place || 'Birth Chart'}</title>
        <style>
          body { font-family: Georgia, serif; max-width: 800px; margin: 40px auto; padding: 20px; color: #1a1a1a; line-height: 1.6; }
          h1 { color: #0B1120; border-bottom: 2px solid #D4A24C; padding-bottom: 10px; }
          h2 { color: #3B5BDB; margin-top: 30px; }
          h3 { color: #555; }
          .header { text-align: center; margin-bottom: 40px; }
          .logo { font-size: 28px; font-weight: bold; color: #D4A24C; }
          .meta { color: #666; font-size: 14px; margin-top: 10px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">VedAI</div>
          <div class="meta">Vedic Astrology Report | Generated: ${new Date().toLocaleDateString()}</div>
          <div class="meta">${profile?.place || ''} | ${profile?.date || ''}</div>
        </div>
        ${report.split('\n').map(line => {
          if (line.startsWith('# ')) return `<h1>${line.replace('# ', '')}</h1>`;
          if (line.startsWith('## ')) return `<h2>${line.replace('## ', '')}</h2>`;
          if (line.startsWith('### ')) return `<h3>${line.replace('### ', '')}</h3>`;
          if (line.startsWith('- ')) return `<li>${line.replace('- ', '')}</li>`;
          if (line.trim() === '') return '<br>';
          return `<p>${line}</p>`;
        }).join('')}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }

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

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <Link href={`/chart/${id}`} className="text-sm text-[#3B5BDB] hover:underline">← Back to Chart</Link>
          <h1 className="font-serif text-3xl font-semibold mt-2">AI Birth Chart Report</h1>
          <p className="text-[#F7F7F5]/50 mt-1">Get a detailed interpretation powered by AI</p>
        </div>

        <div className="flex gap-3 mb-8 flex-wrap">
          {['full', 'career', 'relationship', 'health'].map((type) => (
            <button
              key={type}
              onClick={() => generateReport(type)}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-[#1A2338] border border-[#F7F7F5]/10 hover:border-[#3B5BDB]/50 transition-colors disabled:opacity-50 capitalize"
            >
              {type === 'full' ? 'Full Report' : type}
            </button>
          ))}
          {report && !loading && (
            <button
              onClick={downloadPDF}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-[#D4A24C]/10 border border-[#D4A24C]/30 text-[#D4A24C] hover:bg-[#D4A24C]/20 transition-colors ml-auto"
            >
              Download PDF
            </button>
          )}
        </div>

        {loading && (
          <div className="bg-[#1A2338]/60 backdrop-blur-xl p-8 rounded-2xl border border-[#F7F7F5]/10 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-3 h-3 bg-[#3B5BDB] rounded-full animate-pulse" />
              <div className="w-3 h-3 bg-[#3B5BDB] rounded-full animate-pulse [animation-delay:0.2s]" />
              <div className="w-3 h-3 bg-[#3B5BDB] rounded-full animate-pulse [animation-delay:0.4s]" />
            </div>
            <p className="text-[#F7F7F5]/50">Generating your personalized Vedic reading...</p>
          </div>
        )}

        {report && !loading && (
          <div className="bg-[#1A2338]/60 backdrop-blur-xl p-8 rounded-2xl border border-[#F7F7F5]/10">
            {generated && (
              <p className="text-xs text-[#F7F7F5]/30 mb-4">Generated: {new Date(generated).toLocaleString()}</p>
            )}
            <div className="prose prose-invert max-w-none">
              {report.split('\n').map((line, i) => {
                if (line.startsWith('# ')) return <h1 key={i} className="font-serif text-2xl font-semibold mb-4 mt-6">{line.replace('# ', '')}</h1>;
                if (line.startsWith('## ')) return <h2 key={i} className="font-serif text-xl font-medium mb-3 mt-5 text-[#3B5BDB]">{line.replace('## ', '')}</h2>;
                if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-medium mb-2 mt-4">{line.replace('### ', '')}</h3>;
                if (line.startsWith('- ')) return <li key={i} className="text-[#F7F7F5]/70 ml-4 mb-1">{line.replace('- ', '')}</li>;
                if (line.trim() === '') return <br key={i} />;
                return <p key={i} className="text-[#F7F7F5]/70 leading-relaxed mb-2">{line}</p>;
              })}
            </div>
          </div>
        )}

        {!report && !loading && (
          <div className="bg-[#1A2338]/60 backdrop-blur-xl p-12 rounded-2xl border border-[#F7F7F5]/10 text-center">
            <div className="w-16 h-16 rounded-full bg-[#3B5BDB]/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#3B5BDB]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-[#F7F7F5]/50 mb-2">No report generated yet</p>
            <p className="text-sm text-[#F7F7F5]/30">Choose a report type above to get started</p>
          </div>
        )}
      </main>
    </div>
  );
}
