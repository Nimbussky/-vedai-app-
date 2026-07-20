export const runtime = 'edge';

import { streamChat, VEDAI_SYSTEM_PROMPT } from '@/lib/ai';

export async function POST(request: Request) {
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
