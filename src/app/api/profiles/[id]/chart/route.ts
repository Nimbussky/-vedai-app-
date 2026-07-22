export const runtime = 'edge';

import { getDb } from '@/lib/db';
import { birthProfiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

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

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${VEDASTRO_API}/api/PlanetPosition/${vedParams.toString()}`, {
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeout);

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
