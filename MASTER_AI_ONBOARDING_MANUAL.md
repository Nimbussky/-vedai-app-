# 🪐 VEDIC AI: MASTER AI ONBOARDING MANUAL

> **ATTENTION ALL AI AGENTS:** If you have been deployed to work on this repository, you MUST read and obey every rule in this document. This document acts as the absolute source of truth for the project's architecture, constraints, and development workflow. 

---

## 1. Project Overview & Architecture
This is a **Vedic Astrology Web Application** designed for high-performance, real-time astrological calculations and AI-driven chart readings.

### Tech Stack
*   **Framework:** Next.js 15.0.0 (App Router)
*   **UI/Styling:** React 18, Tailwind CSS v4, Framer Motion, Lucide React
*   **Deployment Target:** Cloudflare Pages (Edge Runtime)
*   **Backend Philosophy:** Serverless Edge API Routes

### The Provider-Agnostic Enterprise Architecture
The current APIs (Mistral AI and VedAstro) are strictly being used as **Open Source MVP (Minimum Viable Product)** engines. Because open-source APIs can be unreliable, not up-to-date, or hit rate limits, this codebase is deliberately designed to be **Provider Agnostic**.
*   The React UI frontend has *no idea* what LLM or Math engine is running in the background. It only talks to our internal `/api/chat` and `/api/astrology` routes.
*   **Future Scaling:** When the project is ready for enterprise-level trust, you can effortlessly swap out the open-source engines for paid, bulletproof alternatives (e.g., swapping Mistral for OpenAI GPT-4, or swapping VedAstro for a dedicated AWS Swiss Ephemeris microservice) simply by changing the API keys and the fetch URL in the backend, without rewriting a single line of UI code.

---

## 2. 🛑 CRITICAL CLOUDFARE DEPLOYMENT RULES
This project is strictly bound to **Cloudflare Pages**. Cloudflare uses a proprietary Edge runtime that is significantly more restrictive than standard Node.js environments. **If you break these rules, the deployment will crash.**

1.  **Strict Edge Runtime:** All API Routes (`src/app/api/.../route.ts`) MUST begin with:
    ```typescript
    export const runtime = 'edge';
    ```
2.  **No Node.js Built-ins:** You CANNOT import `fs`, `path`, `crypto`, `child_process`, or any Node-specific modules in API routes. Cloudflare Edge does not support them.
3.  **Strict Dependency Management:** We are locked to `next@15.0.0` and `react@18.2.0` because `@cloudflare/next-on-pages` cannot compile Next.js 16. **DO NOT upgrade Next.js or React.**
4.  **No Static Exporting:** Do NOT add `output: 'export'` to `next.config.ts`. Cloudflare Pages requires dynamic server rendering to execute the Edge API routes.
5.  **ESLint Bypass:** `next.config.ts` has `eslint: { ignoreDuringBuilds: true }` enabled to prevent flat-config ESM resolution crashes during Cloudflare's strict CI checks. Leave this alone.

---

## 3. UI/UX Design System
The user demands a **"WOW Factor"** aesthetic. Do not build minimal viable products.
*   **Aesthetic:** Dark Mode by default, Glassmorphism, deep space gradients, glowing accents.
*   **Interactivity:** Every button and card must have hover effects and micro-animations using `framer-motion` or Tailwind transitions.
*   **Client vs Server:** 
    *   Pages (`page.tsx`) should be Server Components by default.
    *   Interactive UI elements (ChatBox, Charts, Forms) MUST have `"use client";` at the very top.

---

## 4. The AI Orchestrator Partition
To prevent context-pollution and build-crashing, the AI management tools and Python scripts (like `free_ai_worker.py` or the OpenCode Swarm) have been permanently banished from this folder.
*   **DO NOT** write Python scripts, AI task files (`.txt`), or agent dispatcher logic inside the `Vedic_AI_Project` directory. 
*   All orchestrator logic lives in the entirely separate `Desktop/AI_Orchestrator/` folder. This ensures Cloudflare only compiles pure Next.js code.

---

## 5. Current Project Status (As of Master Reset)

### ✅ Completed
*   **Foundation:** Cloudflare Next-on-Pages Edge environment is stable and deploying green.
*   **Dashboard UI:** Sidebar, Header, and responsive layout are built.
*   **ChatBox UI:** The React component for the AI Astrologer is built (handles state, auto-scrolling, typing effects).
*   **NatalChart UI:** The visual SVG representation of the Kundli chart is built (currently using mock UI layout).

---

## 6. Internal API Architecture (Edge Routes)

Any future AI must conform to the following API contracts when building or modifying the backend:

### A. The Chat API (`/api/chat`)
*   **File Path:** `src/app/api/chat/route.ts`
*   **Method:** `POST`
*   **Runtime:** `export const runtime = 'edge';`
*   **Request Body:** `JSON { "messages": [{ "sender": "User" | "AI", "text": "string" }] }`
*   **Response:** Streaming Text Response (Server-Sent Events) or standard JSON containing the generated astrological reading.
*   **Purpose:** Connects the React UI to the offline local LLM (Qwen/Ollama) or HuggingFace API.

### B. The Astrology Math API (`/api/astrology`)
*   **File Path:** `src/app/api/astrology/route.ts`
*   **Method:** `POST`
*   **Runtime:** `export const runtime = 'edge';`
*   **Request Body:** `JSON { "date": "YYYY-MM-DD", "time": "HH:MM", "location": { "lat": number, "lng": number } }`
*   **Response:** `JSON` array of planetary positions (Planet, Sign, Degree, House, Retrograde status).
*   **Purpose:** The mathematical calculation engine for the Kundli Chart.

---

## 7. DevOps & Infrastructure APIs (Cloudflare & GitHub)

Future AIs assisting with deployment or infrastructure management must know the following parameters for our CI/CD pipeline:

### A. GitHub Syncing
*   **Repository:** `Nimbussky/-vedai-app-`
*   **Branch:** `main`
*   **Rule:** AIs must NEVER force push (`git push -f`). Always `git add .`, `git commit -m "..."`, and `git push` normally to trigger Cloudflare's webhook safely.
*   **GitHub API Usage:** If an AI is using the GitHub REST API to manage this project, they must target the `main` branch and ensure `.env.local` files are NEVER committed.

### B. Cloudflare Pages Deployment API
*   **Build Trigger:** Pushing to the GitHub `main` branch automatically triggers the Cloudflare build webhook.
*   **Build Command:** `npm run build` (This runs Next.js build).
*   **Deploy Command (Under the hood):** `npx @cloudflare/next-on-pages@1`
*   **Cloudflare API Integration:** If an AI is interacting with the Cloudflare API directly to manage deployments or clear cache, they must respect the Edge Runtime limits (no Node built-ins).

---

## 8. ⏳ Pending Integration (Your Jobs)
1.  **The AI Brain API:** The `src/app/api/chat/route.ts` needs to be fully wired up to actually ping the external LLM according to the API contract above.
2.  **The Astrophysics Engine:** The `api/astrology/route.ts` needs to replace its mock mathematical data with a real ephemeris calculator (like `swisseph`) that is fully compatible with the Cloudflare Edge runtime.

---
*End of Manual. Execute flawlessly.*
