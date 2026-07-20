export const runtime = 'edge';

const VEDASTRO_API = process.env.VEDASTRO_API_URL || 'https://api.vedastro.org';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const profileId = parseInt(id, 10);

  if (isNaN(profileId)) {
    return Response.json({ error: 'Invalid profile ID' }, { status: 400 });
  }

  const date = '1990-01-15';
  const time = '10:30';
  const latitude = 19.076;
  const longitude = 72.8777;
  const timezone = 'Asia/Kolkata';

  try {
    const params = new URLSearchParams({
      Date: `${date}T${time}:00`,
      Latitude: String(latitude),
      Longitude: String(longitude),
      Timezone: timezone,
    });

    const response = await fetch(`${VEDASTRO_API}/api/PlanetPosition/${params.toString()}`, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`VedAstro returned ${response.status}`);
    }

    const data = await response.json();
    const planets = Array.isArray(data) ? data.map((p: Record<string, unknown>) => ({
      name: p.PlanetName || p.Name || '',
      sign: p.Rashi || p.Sign || '',
      degree: Number(p.Degree || p.Longitude || 0),
      house: Number(p.House || 1),
      retrograde: Boolean(p.IsRetrograde || p.Retrograde || false),
      nakshatra: p.Nakshatra || '',
    })) : [];

    return Response.json({ planets, source: 'vedastro' });
  } catch {
    return Response.json({ error: 'Chart service unavailable' }, { status: 502 });
  }
}
