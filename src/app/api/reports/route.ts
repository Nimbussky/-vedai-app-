export const runtime = 'edge';

import { getDb } from '@/lib/db';
import { chartCache } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const VEDASTRO_API = process.env.VEDASTRO_API_URL || 'https://api.vedastro.org';

function getFallbackReport(type: string, date: string, time: string, place: string, planetSummary: string): string {
  return `# Vedic Astrology Report

## Overview

A ${type || 'full'} analysis based on birth data: ${date} at ${time || '12:00'} in ${place || 'unknown'}.

## Planetary Positions

${planetSummary || 'No planet data available.'}

## Analysis

Each planet's placement in the chart reveals specific life themes and karmic patterns.

## Recommendations

1. Focus on the current dasha period for timing of events
2. Observe transits for short-term influences
3. Regular spiritual practice can help balance planetary energies
4. Consult a qualified astrologer for personalized guidance`;
}

async function getChartData(profile: { date: string; time?: string; latitude: number; longitude: number; timezone?: string }) {
  const params = new URLSearchParams({
    Date: `${profile.date}T${profile.time || '12:00'}:00`,
    Latitude: String(profile.latitude),
    Longitude: String(profile.longitude),
    Timezone: profile.timezone || 'UTC',
  });

  const cacheKey = `chart:${profile.date}:${profile.time}:${profile.latitude}:${profile.longitude}`;

  // Check D1 cache first
  const db = getDb();
  if (db) {
    try {
      const cached = await db.select().from(chartCache).where(eq(chartCache.cacheKey, cacheKey)).limit(1);
      if (cached.length > 0) {
        return JSON.parse(cached[0].data);
      }
    } catch { /* cache miss */ }
  }

  // Fetch from VedAstro
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  
  let res;
  try {
    res = await fetch(`${VEDASTRO_API}/api/PlanetPosition/${params.toString()}`, {
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeout);
    throw new Error('Chart fetch timeout or network error');
  }
  clearTimeout(timeout);
  if (!res.ok) throw new Error('Chart fetch failed');
  const data = await res.json();

  // Cache in D1
  if (db) {
    try {
      await db.insert(chartCache).values({
        cacheKey,
        data: JSON.stringify(data),
        source: 'vedastro',
        fetchedAt: new Date().toISOString(),
      }).catch(() => {}); // ignore duplicate cache errors
    } catch { /* cache write failed, non-critical */ }
  }

  return data;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { profile, type } = body;

    if (!profile) {
      return Response.json({ error: 'Profile required' }, { status: 400 });
    }

    const chartData = await getChartData(profile);
    const planets = Array.isArray(chartData) ? chartData : [];

    const planetSummary = planets.map((p: Record<string, unknown>) =>
      `${p.PlanetName || p.Name} in ${p.Rashi || ''} (House ${p.House || '?'}) ${p.Nakshatra ? `Nakshatra: ${p.Nakshatra}` : ''}${p.IsRetrograde ? ' (Retrograde)' : ''}`
    ).join('\n');

    const reportPrompt = `You are an expert Vedic astrologer generating a ${type || 'full'} birth chart reading. Write in clear, accessible language.

Planetary Positions:
${planetSummary}

Birth: ${profile.date} ${profile.time || '12:00'} ${profile.place || 'unknown'}

Generate a complete ${type || 'full'} report with these sections:
1. Overview of the chart
2. Key planetary placements and significance
3. House analysis
4. Career and finance outlook
5. Relationships and family
6. Health and wellbeing
7. Current dasha period analysis
8. Key recommendations and remedies`;

    const { glmProvider } = await import('@/lib/ai/providers/glm');
    let report: string;
    const glmKey = glmProvider.getApiKey();
    if (glmKey) {
      let timeout: ReturnType<typeof setTimeout> | undefined;
      try {
        const controller = new AbortController();
        timeout = setTimeout(() => controller.abort(), 15000);
        const response = await fetch(glmProvider.url, {
          method: 'POST',
          headers: glmProvider.buildHeaders(glmKey),
          body: (() => {
            const bodyObj = JSON.parse(glmProvider.buildBody('Generate the report now.', reportPrompt));
            bodyObj.stream = false;
            return JSON.stringify(bodyObj);
          })(),
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (response.ok) {
          const data = await response.json();
          report = data?.choices?.[0]?.message?.content || 'Report generation failed.';
        } else {
          throw new Error('GLM report failed');
        }
      } catch {
        if (timeout) clearTimeout(timeout);
        report = getFallbackReport(type, profile.date, profile.time, profile.place, planetSummary);
      }
    } else {
      report = getFallbackReport(type, profile.date, profile.time, profile.place, planetSummary);
    }

    return Response.json({
      report,
      type: type || 'full',
      source: 'vedai-hybrid',
      generated: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[VedAI] Report error:', err);
    return Response.json({ error: 'Report generation failed' }, { status: 500 });
  }
}
