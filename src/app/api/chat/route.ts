export const runtime = 'edge';

import { streamChat, VEDAI_SYSTEM_PROMPT } from '@/lib/ai';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const clientIP = getClientIP(request);
  const { allowed, remaining } = checkRateLimit(`chat:${clientIP}`, 20, 60000);

  if (!allowed) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a minute.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json', 'X-RateLimit-Remaining': '0' },
    });
  }

  try {
    const { message, chartData } = await request.json();

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing message' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const stream = streamChat(message, VEDAI_SYSTEM_PROMPT, chartData);

    const encoder = new TextEncoder();
    const responseStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const { chunk, provider } of stream) {
            controller.enqueue(encoder.encode(chunk));
          }
        } catch (err) {
          console.error('[VedAI] Stream error:', err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(responseStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'X-RateLimit-Remaining': String(remaining),
      },
    });

  } catch (err) {
    console.error('[VedAI] Critical error:', err);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('Namaste! Something went wrong. Please try again in a moment.'));
        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  }
}
