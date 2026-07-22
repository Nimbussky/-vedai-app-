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

  // Fetch profile from database for coordinates
  const db = getDb();
  let latitude = 28.6139; // default Delhi
  let longitude = 77.2090;
  let timezone = 'Asia/Kolkata';

  if (db) {
    try {
      const profile = await db.select().from(birthProfiles).where(eq(birthProfiles.id, profileId)).limit(1);
      if (profile.length > 0) {
        latitude = profile[0].latitude || latitude;
        longitude = profile[0].longitude || longitude;
        timezone = profile[0].timezone || timezone;
      }
    } catch {
      // use defaults
    }
  }

  try {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().slice(0, 5);

    const vedParams = new URLSearchParams({
      Date: `${dateStr}T${timeStr}:00`,
      Latitude: String(latitude),
      Longitude: String(longitude),
      Timezone: timezone,
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
