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

  try {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().slice(0, 5);

    const vedParams = new URLSearchParams({
      Date: `${dateStr}T${timeStr}:00`,
      Latitude: '28.6139',
      Longitude: '77.2090',
      Timezone: 'Asia/Kolkata',
    });

    const response = await fetch(`${VEDASTRO_API}/api/PlanetPosition/${vedParams.toString()}`, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`VedAstro returned ${response.status}`);
    }

    const data = await response.json();

    const transits = Array.isArray(data) ? data.map((p: Record<string, unknown>) => ({
      planet: p.PlanetName || p.Name || '',
      currentSign: p.Rashi || p.Sign || '',
      degree: Number(p.Degree || p.Longitude || 0),
      house: Number(p.House || 1),
      retrograde: Boolean(p.IsRetrograde || p.Retrograde || false),
    })) : [];

    return Response.json({
      profileId,
      date: dateStr,
      time: timeStr,
      transits,
      source: 'vedastro',
    });
  } catch {
    return Response.json({ error: 'Failed to fetch transits' }, { status: 500 });
  }
}
