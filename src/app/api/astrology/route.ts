import { NextResponse } from 'next/server';

export const runtime = 'edge';

const VEDASTRO_API = process.env.VEDASTRO_API_URL || 'https://api.vedastro.org';

function getFallbackPlanets() {
  return [
    { name: 'Jupiter', sign: 'Taurus', degree: 14.5, house: 9, retrograde: false, nakshatra: 'Rohini', nakshatraPada: 2 },
    { name: 'Saturn', sign: 'Aquarius', degree: 18.2, house: 10, retrograde: true, nakshatra: 'Shatabhisha', nakshatraPada: 4 },
    { name: 'Rahu', sign: 'Pisces', degree: 22.1, house: 6, retrograde: true, nakshatra: 'Revati', nakshatraPada: 1 },
    { name: 'Sun', sign: 'Cancer', degree: 2.3, house: 1, retrograde: false, nakshatra: 'Punarvasu', nakshatraPada: 4 },
    { name: 'Moon', sign: 'Leo', degree: 10.1, house: 2, retrograde: false, nakshatra: 'Magha', nakshatraPada: 1 },
  ];
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, time, latitude, longitude, timezone } = body;

    if (!date || !latitude || !longitude) {
      return NextResponse.json(
        { error: 'Missing required parameters: date, latitude, longitude' },
        { status: 400 }
      );
    }

    const birthTime = time || '12:00';
    const tz = timezone || 'UTC';
    const dateTimeStr = `${date}T${birthTime}:00`;

    const params = new URLSearchParams({
      Date: dateTimeStr,
      Latitude: String(latitude),
      Longitude: String(longitude),
      Timezone: tz,
    });

    const vedastroUrl = `${VEDASTRO_API}/api/PlanetPosition/${params.toString()}`;

    const cacheKey = `chart:${date}:${birthTime}:${latitude}:${longitude}:${tz}`;

    let vedastroData;
    let usingFallback = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    try {
      const controller = new AbortController();
      timeout = setTimeout(() => controller.abort(), 10000);
      const response = await fetch(vedastroUrl, {
        headers: { 'Accept': 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`VedAstro returned ${response.status}`);
      }

      vedastroData = await response.json();
    } catch (apiError) {
      if (timeout) clearTimeout(timeout);
      console.error('VedAstro API error, using fallback:', apiError);
      vedastroData = getFallbackPlanets();
      usingFallback = true;
    }

    const planets = Array.isArray(vedastroData) ? vedastroData.map((p: Record<string, unknown>) => ({
      name: p.PlanetName || p.Name || p.name || String(p.Planet || ''),
      sign: p.Rashi || p.Sign || p.sign || '',
      degree: Number(p.Degree || p.Longitude || p.degree || 0),
      house: Number(p.House || p.house || 1),
      retrograde: Boolean(p.IsRetrograde || p.Retrograde || p.retrograde || false),
      nakshatra: p.Nakshatra || p.nakshatra || '',
      nakshatraPada: Number(p.NakshatraPada || p.nakshatraPada || 0),
    })) : [];

    return NextResponse.json({
      planets,
      cacheKey,
      source: usingFallback ? 'fallback' : 'vedastro',
      timestamp: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=2592000, stale-while-revalidate=86400'
      }
    });
  } catch (error) {
    console.error('Astrology API error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error processing astrology chart' },
      { status: 500 }
    );
  }
}

