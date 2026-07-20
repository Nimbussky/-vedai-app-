# VedAI — AI-Native Vedic Astrology Platform

Open-source Vedic astrology platform with a **Hybrid AI Brain Engine** — 8+ AI providers that never crash.

## Quick Start

```bash
cp .env.local.example .env.local   # Add your API keys
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), go through onboarding → see your birth chart → chat with AI.

## Architecture

```
src/
├── app/          # Next.js 15 App Router (pages + API routes)
│   ├── api/
│   │   ├── chat/          # Hybrid AI chat with 8-provider fallback
│   │   ├── astrology/     # Birth chart calculations (VedAstro)
│   │   ├── panchang/      # Astronomical panchang (real VSOP87 math)
│   │   ├── compatibility/ # Kundli Milan scoring
│   │   ├── profiles/      # User birth profiles (D1 database)
│   │   └── reports/       # AI-generated birth chart readings
│   ├── dashboard/         # Main user dashboard
│   ├── onboarding/        # Birth data collection + geocoding
│   ├── chart/             # Detailed chart view with tabs
│   ├── chat/              # Full-page AI chat
│   └── panchang/          # Detailed panchang calendar
├── components/    # React components
│   ├── Chart/     # Natal chart SVG renderer
│   ├── Chat/      # AI chat interface with streaming
│   └── Dashboard/ # Panchang + Transits widgets
├── lib/
│   ├── ai/        # Hybrid AI engine
│   │   ├── providers/  # Plugin architecture (add any AI in 1 file)
│   │   ├── engine.ts   # Fallback chain + stream parsers
│   │   └── prompts.ts  # System prompt + multi-language
│   └── db/        # D1 database schema (Drizzle ORM)
└── hooks/         # Shared React hooks
```

## AI Providers (8 total)

| Provider | Key Needed | Priority | Notes |
|----------|-----------|----------|-------|
| GLM (Zhipu) | ✅ | 1 | Primary backbone, generous free tier |
| Groq | ❌ | 2 | Ultra-fast Llama inference |
| Cerebras | ✅ | 3 | Fast free tier |
| DeepSeek | ❌ | 4 | Strong reasoning |
| Gemini | ✅ | 5 | Google AI, free |
| Mistral | ✅ | 6 | Good quality backup |
| OpenRouter | ❌ | 7 | 100+ model gateway |
| Ollama | No key | 8 | Local Llama, zero cost |

**Only providers with API keys are used.** Never crashes — even if all fail, returns static response.

## Deploy

```bash
npm run build           # Build for Cloudflare Pages
npx wrangler pages deploy .vercel/output/static
```

Or deploy to Vercel: `vercel --prod`

## License

MIT — Free for everyone. Built with Lal Kitab, Parashari Jyotish, and love.
