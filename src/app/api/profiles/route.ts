export const runtime = 'edge';

import { getDb } from '@/lib/db';
import { birthProfiles, chartCache } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// In-memory fallback for local dev without D1
const memoryProfiles: Array<{
  id: number;
  name: string;
  date: string;
  time: string;
  place: string;
  latitude: number;
  longitude: number;
  timezone: string;
}> = [];
let nextId = 1;

export async function GET() {
  const db = getDb();
  if (db) {
    try {
      const profiles = await db.select().from(birthProfiles);
      return Response.json(profiles);
    } catch (err) {
      console.error('[VedAI] DB read error:', err);
    }
  }
  return Response.json({ error: 'Database connection failed' }, { status: 500 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, date, time, place, latitude, longitude, timezone } = body;

    if (!name || !date) {
      return Response.json(
        { error: 'Missing required fields: name, date' },
        { status: 400 }
      );
    }

    const db = getDb();
    if (db) {
      try {
        const result = await db.insert(birthProfiles).values({
          name,
          date,
          time: time || '12:00',
          place: place || '',
          latitude: latitude || 0,
          longitude: longitude || 0,
          timezone: timezone || 'UTC',
        }).returning();

        return Response.json(result[0], { status: 201 });
      } catch (err) {
        console.error('[VedAI] DB insert error:', err);
      }
    }

    return Response.json(
      { error: 'Failed to create profile' },
      { status: 500 }
    );

  } catch {
    return Response.json(
      { error: 'Failed to create profile' },
      { status: 500 }
    );
  }
}
