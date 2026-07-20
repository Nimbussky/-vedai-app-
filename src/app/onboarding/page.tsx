'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const OnboardingUI: React.FC = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', dob: '', timeOfBirth: '', placeOfBirth: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const chartData = localStorage.getItem('vedai_user_chart');
      if (chartData) {
        router.push('/dashboard');
      }
    }
  }, [router]);

  const geocodeCity = async (cityName: string): Promise<{ latitude: number; longitude: number; timezone: string } | null> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}&limit=1`,
        { headers: { 'User-Agent': 'VedAI/1.0' } }
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        // Derive rough timezone offset from longitude
        const utcOffset = Math.round(lon / 15);
        // Etc/GMT uses inverted signs: UTC+5 = Etc/GMT-5
        const timezone = `Etc/GMT${utcOffset <= 0 ? '+' : '-'}${Math.abs(utcOffset)}`;
        return { latitude: lat, longitude: lon, timezone };
      }
    } catch (err) {
      console.error('Geocoding failed:', err);
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 4) {
      setStep(step + 1);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Geocode the city name to lat/lng
      const geo = await geocodeCity(formData.placeOfBirth);
      if (!geo) {
        setError('Could not find that city. Please check the spelling or try a nearby major city.');
        setIsLoading(false);
        return;
      }

      // Step 2: Call astrology API with correct field names
      const response = await fetch('/api/astrology', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: formData.dob,
          time: formData.timeOfBirth || '12:00',
          latitude: geo.latitude,
          longitude: geo.longitude,
          timezone: geo.timezone,
        }),
      });

      if (response.ok) {
        const chartData = await response.json();
        localStorage.setItem('vedai_user_chart', JSON.stringify(chartData));
        localStorage.setItem('vedai_user_birth', JSON.stringify({
          name: formData.name,
          dob: formData.dob,
          timeOfBirth: formData.timeOfBirth,
          placeOfBirth: formData.placeOfBirth,
          latitude: geo.latitude,
          longitude: geo.longitude,
          timezone: geo.timezone,
        }));
        router.push('/dashboard');
      } else {
        setError('Failed to generate chart. Please try again.');
      }
    } catch (error) {
      console.error('Error generating chart:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-[#0B1120] flex flex-col items-center justify-center font-sans relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#3B5BDB]/20 blur-[120px] rounded-full pointer-events-none" />
      
      <form onSubmit={handleSubmit} className="relative z-10 bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-2xl shadow-xl w-96">
        <h2 className="text-2xl text-white font-semibold mb-6">Step {step} of 4</h2>
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-2">
            <label htmlFor="name" className="block mb-2 text-sm font-medium text-[#D4A24C]">Legal Name</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="bg-[#0B1120]/50 border border-white/20 text-white text-sm rounded-lg focus:ring-[#D4A24C] focus:border-[#D4A24C] block w-full p-3 transition-colors" placeholder="Jane Doe" />
          </div>
        )}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-2">
            <label htmlFor="dob" className="block mb-2 text-sm font-medium text-[#D4A24C]">Date of Birth</label>
            <input type="date" id="dob" name="dob" value={formData.dob} onChange={handleChange} required className="bg-[#0B1120]/50 border border-white/20 text-white text-sm rounded-lg focus:ring-[#D4A24C] focus:border-[#D4A24C] block w-full p-3 transition-colors" />
          </div>
        )}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-2">
            <label htmlFor="timeOfBirth" className="block mb-2 text-sm font-medium text-[#D4A24C]">Time of Birth</label>
            <input type="time" id="timeOfBirth" name="timeOfBirth" value={formData.timeOfBirth} onChange={handleChange} required className="bg-[#0B1120]/50 border border-white/20 text-white text-sm rounded-lg focus:ring-[#D4A24C] focus:border-[#D4A24C] block w-full p-3 transition-colors" />
          </div>
        )}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-bottom-2">
            <label htmlFor="placeOfBirth" className="block mb-2 text-sm font-medium text-[#D4A24C]">City of Birth</label>
            <input type="text" id="placeOfBirth" name="placeOfBirth" value={formData.placeOfBirth} onChange={handleChange} required className="bg-[#0B1120]/50 border border-white/20 text-white text-sm rounded-lg focus:ring-[#D4A24C] focus:border-[#D4A24C] block w-full p-3 transition-colors" placeholder="San Francisco, CA" />
          </div>
        )}
        {error && (
          <p className="mt-4 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-3">{error}</p>
        )}
        <button type="submit" disabled={isLoading} className="w-full mt-8 bg-[#D4A24C] hover:bg-[#b5883b] text-[#0B1120] font-bold rounded-lg text-sm px-5 py-3 text-center transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
          {isLoading ? 'Generating Chart...' : step === 4 ? 'Generate Chart' : 'Continue'}
        </button>
      </form>
    </div>
  );
};

export default OnboardingUI;
