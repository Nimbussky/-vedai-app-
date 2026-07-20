import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-[#F7F7F5]/10 py-12 px-6 md:px-12 lg:px-24 bg-[#0B1120]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="mb-8 md:mb-0">
          <span className="font-serif text-2xl font-semibold text-[#F7F7F5]">VedAI</span>
          <p className="text-[#F7F7F5]/50 text-sm mt-2">Precision Vedic Astrology powered by AI.</p>
        </div>
        
        <div className="flex flex-wrap justify-center md:justify-end gap-8 text-sm text-[#F7F7F5]/60">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <Link href="/panchang" className="hover:text-white transition-colors">Panchang</Link>
          <Link href="/compatibility" className="hover:text-white transition-colors">Compatibility</Link>
          <Link href="/about" className="hover:text-white transition-colors">About</Link>
          <Link href="/methodology" className="hover:text-white transition-colors">Methodology</Link>
          <a href="https://github.com/VedAstro/VedAstro" target="_blank" rel="noopener noreferrer" className="hover:text-[#D4A24C] transition-colors">
            Powered by VedAstro
          </a>
        </div>
      </div>
    </footer>
  );
}
