export const runtime = 'edge';

import { getDb } from '@/lib/db';
import { birthProfiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// In-memory fallback
const memoryProfiles: Record<number, {
  id: number;
  name: string;
  date: string;
  time: string;
  place: string;
  latitude: number;
  longitude: number;
  timezone: string;
}> = {};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const profileId = parseInt(id, 10);

  if (isNaN(profileId)) {
    return Response.json({ error: 'Invalid profile ID' }, { status: 400 });
  }

  const db = getDb();
  if (db) {
    try {
      const profile = await db.select().from(birthProfiles).where(eq(birthProfiles.id, profileId)).limit(1);
      if (profile.length > 0) {
        return Response.json(profile[0]);
      }
    } catch (err) {
      console.error('[VedAI] DB read error:', err);
    }
  }

  return Response.json({ error: 'Profile not found' }, { status: 404 });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const profileId = parseInt(id, 10);

  if (isNaN(profileId)) {
    return Response.json({ error: 'Invalid profile ID' }, { status: 400 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const { name, date, time, place, latitude, longitude, timezone } = body;

  const db = getDb();
  if (db) {
    try {
      const result = await db.update(birthProfiles)
        .set({
          ...(name && { name }),
          ...(date && { date }),
          ...(time && { time }),
          ...(place && { place }),
          ...(latitude && { latitude }),
          ...(longitude && { longitude }),
          ...(timezone && { timezone }),
        })
        .where(eq(birthProfiles.id, profileId))
        .returning();

      if (result.length > 0) return Response.json(result[0]);
    } catch (err) {
      console.error('[VedAI] DB update error:', err);
    }
  }

  return Response.json({ error: 'Profile not found' }, { status: 404 });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const profileId = parseInt(id, 10);

  if (isNaN(profileId)) {
    return Response.json({ error: 'Invalid profile ID' }, { status: 400 });
  }

  const db = getDb();
  if (db) {
    try {
      await db.delete(birthProfiles).where(eq(birthProfiles.id, profileId));
      return Response.json({ deleted: true });
    } catch (err) {
      console.error('[VedAI] DB delete error:', err);
    }
  }

  return Response.json({ error: 'Profile not found' }, { status: 404 });
}
