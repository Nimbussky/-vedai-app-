import { useState } from 'react';

type PlanetData = {
  name: string;
  sign: string;
  degree: number;
  house: number;
  retrograde: boolean;
};

type AstrologyResponse = {
  planets: PlanetData[];
  ascendant: {
    sign: string;
    degree: number;
  };
  ayanamsha: string;
};

export function useAstrology() {
  const [data, setData] = useState<AstrologyResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateChart = async (date: string, lat: number, lng: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/astrology', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, lat, lng }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to calculate chart');
      }
      
      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, calculateChart };
}
