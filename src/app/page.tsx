import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0B1120] text-[#F7F7F5] selection:bg-[#3B5BDB] selection:text-white">
      <Hero />
      <HowItWorks />
      <Features />
      <Footer />
    </main>
  );
}
