# AGENTS.md — Master Plan for Cozy Calendar

## Project Overview & Stack
**App:** Cozy Calendar
**Overview:** A scrapbook-style digital calendar and journal. It solves the "boredom of productivity" for creative youth and young adults by offering deep tactile customization (stickers, colors, textures) while keeping the core scheduling and journaling functions simple and intuitive.
**Stack:** Next.js (App Router), Tailwind CSS, Framer Motion, Supabase (PostgreSQL, Auth, RLS), Lucide-React.
**Critical Constraints:** MVP must launch in 14 days. Must maintain a soft, cozy, and tactile aesthetic (paper textures, soft shadows, handwritten typography—no harsh blues/grays). Zero-tutorial intuitive mapping required.

## Setup & Commands
Execute these commands for standard development workflows. Do not invent new package manager commands.
- **Setup:** `npm install`
- **Development:** `npm run dev`
- **Testing:** Start the dev server and use browser-based testing for visual verification of Framer Motion and scrapbook features.
- **Linting & Formatting:** `npm run lint`
- **Build:** `npm run build`

## Protected Areas
Do NOT modify these areas without explicit human approval:
- **Infrastructure:** Vercel deployment configurations.
- **Database Architecture:** Supabase RLS policies and core schema structure.
- **Core Aesthetic Variables:** The foundational CSS variables establishing the "Cozy" scrapbook theme.

## Coding Conventions
- **Formatting:** Enforce required ESLint/Prettier rules strictly. No warnings allowed in new code.
- **Architecture rules:** Use Next.js App Router conventions. Business logic and database calls should be isolated from presentation components.
- **Aesthetics First:** Always prefer manual Tailwind configurations that match the "Creative Organizer" aesthetic over generic UI libraries.
- **Type Safety:** Use strict TypeScript. Avoid `any` types; define precise interfaces.

## Agent Behaviors
These rules apply across all AI coding assistants (Cursor, Copilot, Claude, Gemini, Antigravity):
1. **Plan Before Execution:** ALWAYS propose a brief step-by-step plan before changing more than one file.
2. **Refactor Over Rewrite:** Prefer refactoring existing functions incrementally rather than completely rewriting large blocks of code.
3. **Context Compaction:** Write states to `MEMORY.md` or `agent_docs` instead of filling context history during long sessions.
4. **Iterative Verification:** Run visual tests in the browser after each logic or aesthetic change. Fix errors before proceeding (See `REVIEW-CHECKLIST.md`).
5. **No Apologies:** Fix errors immediately without generating filler text. Ask specific clarifying questions if stuck.
