export const runtime = 'edge';

const VEDASTRO_API = process.env.VEDASTRO_API_URL || 'https://api.vedastro.org';

async function getPlanets(profile: { date: string; time?: string; latitude: number; longitude: number; timezone?: string }) {
  const params = new URLSearchParams({
    Date: `${profile.date}T${profile.time || '12:00'}:00`,
    Latitude: String(profile.latitude),
    Longitude: String(profile.longitude),
    Timezone: profile.timezone || 'UTC',
  });
  const res = await fetch(`${VEDASTRO_API}/api/PlanetPosition/${params.toString()}`, {
    headers: { 'Accept': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to fetch chart');
  return res.json();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { profileA, profileB } = body;

    if (!profileA || !profileB) {
      return Response.json(
        { error: 'Two profiles required for compatibility' },
        { status: 400 }
      );
    }

    const [chartA, chartB] = await Promise.all([
      getPlanets(profileA),
      getPlanets(profileB),
    ]);

    const planetsA = Array.isArray(chartA) ? chartA : [];
    const planetsB = Array.isArray(chartB) ? chartB : [];

    const nakshatraScores: Record<string, number> = {
      'Vishnu': 4, 'Indra': 3, 'Diti': 2, 'Yama': 1, 'Prajapati': 3,
      'Brahma': 4, 'Shiva': 2, 'Surya': 3, 'Chandra': 4, 'Agni': 2,
      'Vayu': 3, 'Kubera': 3,
    };

    let totalScore = 0;
    const maxScore = 36;
    const matchingPoints: Array<{ name: string; score: number; description: string }> = [];

    for (let i = 0; i < Math.min(planetsA.length, planetsB.length); i++) {
      const pA = planetsA[i];
      const pB = planetsB[i];
      const nameA = pA.PlanetName || pA.Name || '';

      if (nameA === (pB.PlanetName || pB.Name || '')) {
        const nakA = pA.Nakshatra || '';
        const score = nakshatraScores[nakA] || 2;
        totalScore += score;
        matchingPoints.push({
          name: `${nameA} Nakshatra`,
          score,
          description: `${nameA} in ${pA.Rashi || ''} (A) vs ${pB.Rashi || ''} (B)`,
        });
      }
    }

    const compatibilityScore = Math.min(Math.round((totalScore / maxScore) * 100), 100);

    let verdict = '';
    if (compatibilityScore >= 75) verdict = 'Excellent compatibility — strong Vedic match';
    else if (compatibilityScore >= 50) verdict = 'Good compatibility — favorable match';
    else if (compatibilityScore >= 25) verdict = 'Moderate compatibility — requires understanding';
    else verdict = 'Challenging compatibility — needs extra effort';

    return Response.json({
      score: compatibilityScore,
      totalScore,
      maxScore,
      verdict,
      matchingPoints,
      personA: { planets: planetsA.map((p: Record<string, unknown>) => ({ name: p.PlanetName || p.Name, sign: p.Rashi, nakshatra: p.Nakshatra })) },
      personB: { planets: planetsB.map((p: Record<string, unknown>) => ({ name: p.PlanetName || p.Name, sign: p.Rashi, nakshatra: p.Nakshatra })) },
      source: 'vedastro',
    });
  } catch {
    return Response.json({ error: 'Compatibility calculation failed' }, { status: 500 });
  }
}
