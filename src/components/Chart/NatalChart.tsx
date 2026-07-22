"use client";
import React, { useEffect, useState } from 'react';

type Planet = {
  name: string;
  sign: string;
  degree: number;
  house: number;
  retrograde: boolean;
  nakshatra?: string;
};

const PLANET_COLORS: Record<string, string> = {
  Sun: '#D4A24C',
  Moon: '#F7F7F5',
  Mars: '#E53935',
  Mercury: '#43A047',
  Jupiter: '#FB8C00',
  Venus: '#AB47BC',
  Saturn: '#5C6BC0',
  Rahu: '#78909C',
  Ketu: '#8D6E63',
};

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉',
  Moon: '☽',
  Mars: '♂',
  Mercury: '☿',
  Jupiter: '♃',
  Venus: '♀',
  Saturn: '♄',
  Rahu: '☊',
  Ketu: '☋',
};

const SIGN_NAMES = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const SIGN_SYMBOLS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

const NatalChart: React.FC<{ planets?: Planet[]; onPlanetClick?: (planet: Planet) => void }> = ({ planets = [], onPlanetClick }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [chartData, setChartData] = useState<Planet[]>(planets);
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);

  useEffect(() => {
    setIsVisible(true);

    if (planets.length === 0) {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('vedai_user_chart') : null;
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const extracted = Array.isArray(parsed.planets) ? parsed.planets : (Array.isArray(parsed) ? parsed : null);
          if (extracted && extracted.length > 0) {
            setChartData(extracted);
          } else {
            setChartData(getDefaultPlanets());
          }
        } catch {
          setChartData(getDefaultPlanets());
        }
      } else {
        setChartData(getDefaultPlanets());
      }
    }
  }, [planets]);

  function handlePlanetClick(planet: Planet) {
    setSelectedPlanet(planet);
    onPlanetClick?.(planet);
  }

  const size = 384;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 8;
  const innerR = outerR * 0.38;
  const planetR = (outerR + innerR) / 2;

  const houseAngles = Array.from({ length: 12 }, (_, i) => (i * 30) * (Math.PI / 180));

  const getSignIndex = (sign: string) => SIGN_NAMES.findIndex(s => s === sign);

  return (
    <div className={`relative transition-all duration-1000 transform ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <radialGradient id="chartBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1A2338" />
            <stop offset="100%" stopColor="#0B1120" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle cx={cx} cy={cy} r={outerR} fill="url(#chartBg)" stroke="#3B5BDB" strokeWidth="1" opacity="0.9" />
        <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="#3B5BDB" strokeWidth="0.5" opacity="0.4" />

        {houseAngles.map((angle, i) => {
          const x1 = cx + innerR * Math.cos(angle - Math.PI / 2);
          const y1 = cy + innerR * Math.sin(angle - Math.PI / 2);
          const x2 = cx + outerR * Math.cos(angle - Math.PI / 2);
          const y2 = cy + outerR * Math.sin(angle - Math.PI / 2);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#F7F7F5" strokeWidth="0.5" opacity="0.15" />;
        })}

        {houseAngles.map((angle, i) => {
          const midAngle = angle + (15 * Math.PI / 180);
          const labelR = outerR - 14;
          const x = cx + labelR * Math.cos(midAngle - Math.PI / 2);
          const y = cy + labelR * Math.sin(midAngle - Math.PI / 2);
          return (
            <text key={`sign-${i}`} x={x} y={y} textAnchor="middle" dominantBaseline="central" fill="#F7F7F5" opacity="0.5" fontSize="10" fontFamily="serif">
              {SIGN_SYMBOLS[i]}
            </text>
          );
        })}

        {chartData.map((planet) => {
          const signIdx = getSignIndex(planet.sign);
          if (signIdx === -1) return null;

          const signStartAngle = signIdx * 30;
          const degreeInSign = planet.degree % 30;
          const angle = (signStartAngle + degreeInSign) * (Math.PI / 180);

          const x = cx + planetR * Math.cos(angle - Math.PI / 2);
          const y = cy + planetR * Math.sin(angle - Math.PI / 2);
          const color = PLANET_COLORS[planet.name] || '#F7F7F5';
          const symbol = PLANET_SYMBOLS[planet.name] || planet.name[0];
          const isSelected = selectedPlanet?.name === planet.name;

          return (
            <g key={planet.name} filter="url(#glow)" className="cursor-pointer" onClick={() => handlePlanetClick(planet)}>
              <circle cx={x} cy={y} r={isSelected ? 16 : 12} fill={color} opacity={isSelected ? 0.4 : 0.2} />
              <circle cx={x} cy={y} r={isSelected ? 10 : 8} fill={color} opacity="0.8" />
              <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fill="#0B1120" fontSize="9" fontWeight="bold" fontFamily="serif">
                {symbol}
              </text>
              <text x={x} y={y - 14} textAnchor="middle" dominantBaseline="central" fill={color} fontSize="8" fontFamily="sans-serif">
                {planet.name.slice(0, 3)}
              </text>
              {planet.retrograde && (
                <text x={x + 10} y={y - 8} fill="#E53935" fontSize="8" fontWeight="bold">R</text>
              )}
            </g>
          );
        })}

        <circle cx={cx} cy={cy} r={4} fill="#D4A24C" />
      </svg>

      {selectedPlanet && (
        <div className="mt-4 p-4 bg-[#1A2338] rounded-xl border border-[#3B5BDB]/30 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{PLANET_SYMBOLS[selectedPlanet.name]}</span>
            <div>
              <h4 className="font-medium" style={{ color: PLANET_COLORS[selectedPlanet.name] }}>{selectedPlanet.name}</h4>
              <p className="text-xs text-[#F7F7F5]/50">{selectedPlanet.sign} • House {selectedPlanet.house} {selectedPlanet.retrograde ? '• Retrograde' : ''}</p>
            </div>
          </div>
          {selectedPlanet.nakshatra && (
            <p className="text-xs text-[#F7F7F5]/40">Nakshatra: {selectedPlanet.nakshatra}</p>
          )}
          <p className="text-xs text-[#3B5BDB] mt-2">Click "AI Chat" for detailed interpretation</p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {chartData.map((planet) => (
          <div key={planet.name} className="flex items-center gap-1 px-2 py-1 rounded bg-[#1A2338] border border-[#F7F7F5]/5 text-xs cursor-pointer hover:bg-[#1A2338]/80 transition-colors" onClick={() => handlePlanetClick(planet)}>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PLANET_COLORS[planet.name] || '#F7F7F5' }} />
            <span className="text-[#F7F7F5]/80">{planet.name}</span>
            <span className="text-[#F7F7F5]/40">{planet.sign}</span>
            {planet.retrograde && <span className="text-red-400">R</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

function getDefaultPlanets(): Planet[] {
  return [
    { name: 'Sun', sign: 'Leo', degree: 14.5, house: 1, retrograde: false },
    { name: 'Moon', sign: 'Cancer', degree: 22.1, house: 12, retrograde: false },
    { name: 'Mars', sign: 'Gemini', degree: 5.4, house: 11, retrograde: false },
    { name: 'Mercury', sign: 'Leo', degree: 28.9, house: 1, retrograde: false },
    { name: 'Jupiter', sign: 'Taurus', degree: 12.0, house: 10, retrograde: true },
    { name: 'Venus', sign: 'Cancer', degree: 29.5, house: 12, retrograde: false },
    { name: 'Saturn', sign: 'Pisces', degree: 15.2, house: 8, retrograde: true },
    { name: 'Rahu', sign: 'Pisces', degree: 10.1, house: 8, retrograde: true },
    { name: 'Ketu', sign: 'Virgo', degree: 10.1, house: 2, retrograde: true },
  ];
}

export default NatalChart;
