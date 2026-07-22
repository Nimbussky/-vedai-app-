export const runtime = 'edge';

import { getDb } from '@/lib/db';
import { birthProfiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const VEDASTRO_API = process.env.VEDASTRO_API_URL || 'https://api.vedastro.org';

const DASHA_SEQUENCE = [
  { planet: 'Ketu', years: 7 },
  { planet: 'Venus', years: 20 },
  { planet: 'Sun', years: 6 },
  { planet: 'Moon', years: 10 },
  { planet: 'Mars', years: 7 },
  { planet: 'Rahu', years: 18 },
  { planet: 'Jupiter', years: 16 },
  { planet: 'Saturn', years: 19 },
  { planet: 'Mercury', years: 17 },
];

const PLANET_DASHA_YEARS: Record<string, number> = {
  Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7,
  Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17,
};

function calculateDasha(nakshatraLord: string, birthDate: string) {
  const totalCycle = 120;
  const startIdx = DASHA_SEQUENCE.findIndex(d => d.planet === nakshatraLord) || 0;
  const birth = new Date(birthDate);
  const dashas: Array<{
    planet: string;
    startDate: string;
    endDate: string;
    totalYears: number;
    antardashas: Array<{
      planet: string;
      startDate: string;
      endDate: string;
    }>;
  }> = [];

  let currentDate = new Date(birth);

  for (let i = 0; i < DASHA_SEQUENCE.length; i++) {
    const seqIdx = (startIdx + i) % DASHA_SEQUENCE.length;
    const { planet, years } = DASHA_SEQUENCE[seqIdx];

    const startDate = new Date(currentDate);
    const endDate = new Date(currentDate);
    endDate.setFullYear(endDate.getFullYear() + years);

    const antardashas: Array<{
      planet: string;
      startDate: string;
      endDate: string;
    }> = [];

    let antiDate = new Date(startDate);
    const antiPlanets = DASHA_SEQUENCE.map(d => d.planet);
    const startAntiIdx = antiPlanets.indexOf(planet);

    for (let j = 0; j < antiPlanets.length; j++) {
      const aIdx = (startAntiIdx + j) % antiPlanets.length;
      const antiPlanet = antiPlanets[aIdx];
      const antiYears = (PLANET_DASHA_YEARS[antiPlanet] * years) / totalCycle;
      const antiEndDate = new Date(antiDate);
      antiEndDate.setDate(antiEndDate.getDate() + Math.round(antiYears * 365.25));

      if (antiEndDate > endDate) {
        antardashas.push({
          planet: antiPlanet,
          startDate: antiDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        });
        break;
      }

      antardashas.push({
        planet: antiPlanet,
        startDate: antiDate.toISOString().split('T')[0],
        endDate: antiEndDate.toISOString().split('T')[0],
      });

      antiDate = new Date(antiEndDate);
    }

    dashas.push({
      planet,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      totalYears: years,
      antardashas,
    });

    currentDate = new Date(endDate);
  }

  return dashas;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const profileId = parseInt(id, 10);

  if (isNaN(profileId)) {
    return Response.json({ error: 'Invalid profile ID' }, { status: 400 });
  }

  // Fetch profile from database
  const db = getDb();
  if (!db) {
    return Response.json({ error: 'Database not available' }, { status: 500 });
  }

  try {
    const profile = await db.select().from(birthProfiles).where(eq(birthProfiles.id, profileId)).limit(1);
    if (profile.length === 0) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }

    const { date, time, latitude, longitude, timezone } = profile[0];

    const vedParams = new URLSearchParams({
      Date: `${date}T${time || '12:00'}:00`,
      Latitude: String(latitude),
      Longitude: String(longitude),
      Timezone: timezone || 'UTC',
    });

    let nakshatraLord = 'Moon';
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const response = await fetch(`${VEDASTRO_API}/api/PlanetPosition/${vedParams.toString()}`, {
        headers: { 'Accept': 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          const moonData = data.find((p: Record<string, unknown>) =>
            (p.PlanetName || p.Name) === 'Moon'
          );
          if (moonData) {
            nakshatraLord = moonData.NakshatraLord || moonData.Nakshatra || 'Moon';
          }
        }
      }
    } catch {
      // fallback to default
    }

    const dashas = calculateDasha(nakshatraLord, date);

    return Response.json({
      profileId,
      nakshatraLord,
      dashas,
      source: 'vedastro',
    });
  } catch {
    return Response.json({ error: 'Failed to calculate dashas' }, { status: 500 });
  }
}
