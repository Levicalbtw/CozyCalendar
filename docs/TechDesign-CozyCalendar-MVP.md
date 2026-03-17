{\rtf1\ansi\ansicpg1252\cocoartf2868
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 # Technical Design Document: Cozy Calendar MVP\
\
## 1. How We'll Build It: The "Hybrid Agent" Approach\
\
Based on your familiarity with **Antigravity**, **Claude Code**, **Vercel**, and **Supabase**, we will use a workflow that maximizes aesthetic control while keeping costs at zero.\
\
### Core Tools\
* **Antigravity (The Architect & Tester):** Use for initial planning, asset generation (stickers/textures), and browser-based testing.\
* **Claude Code (The Senior Engineer):** Use for high-precision coding tasks. Claude is excellent at interpreting design vibes into clean Tailwind CSS.\
* **Vercel (The Host):** Handles instant deployment via the free tier.\
* **Supabase (The Vault):** Manages user accounts and your journal/calendar data with built-in security.\
\
---\
\
## 2. Technical Stack (Aesthetic & Security Focus)\
\
* **Frontend Framework:** **Next.js** (App Router) with **Tailwind CSS**.\
* **Animations:** **Framer Motion** for tactile page-flipping and smooth sticker dragging.\
* **Database & Auth:** **Supabase PostgreSQL** with **Row Level Security (RLS)** to ensure journal privacy.\
* **Icons:** **Lucide-React** for minimalist, cozy iconography.\
* **Image Generation:** **Nano Banana** (inside Antigravity) for creating custom transparent scrapbook stickers.\
\
---\
\
## 3. 14-Day Implementation Plan\
\
### Phase 1: Foundation & "The Look" (Days 1-7)\
* **Planning:** Start in Antigravity. Prompt: *"Plan a Next.js app for 'Cozy Calendar'. I need a Supabase backend. The UI should feel like a physical scrapbook with paper textures."*\
* **UI Construction:** Use Claude Code to build the main dashboard. Focus on a warm color palette (creams, soft browns, pastels).\
* **Asset Creation:** Use Nano Banana to generate "sticker packs" (e.g., "cozy coffee shop," "botanical leaves").\
\
### Phase 2: Logic & Security (Days 8-14)\
* **Data Integration:** Connect Supabase tables for `events` and `journal_entries`.\
* **Scrapbook Engine:** Implement the drag-and-drop sticker feature using Claude Code. Ensure sticker positions are saved to the database per user.\
* **Security Audit:** Use Antigravity\'92s browser agent to attempt to access data without being logged in to verify your RLS policies.\
* **Deployment:** Connect your GitHub repo to Vercel for a live URL.\
\
---\
\
## 4. Cost Breakdown (MVP Phase)\
\
| Service | Cost | Note |\
| :--- | :--- | :--- |\
| **Antigravity** | **$0** | Free during public preview. |\
| **Claude Code** | **$0 - $20** | Free tier available; Pro recommended for high-volume coding. |\
| **Supabase** | **$0** | Free tier includes 500MB storage and unlimited API requests. |\
| **Vercel** | **$0** | Free tier for non-commercial projects. |\
| **Total** | **~$0 - $20** | |\
\
---\
\
## 5. Security & Maintenance Guardrails\
\
* **Data Privacy:** Every database table must have `ENABLE ROW LEVEL SECURITY` checked in Supabase.\
* **Aesthetic Consistency:** When prompting Claude, always use the prefix: *"Maintain the 'Creative Organizer' aesthetic: soft shadows, rounded corners, and handwritten-style typography."*\
* **Scaling:** While this is a web app, Next.js makes it easy to wrap into a mobile app (PWA) later.\
\
---\
*Technical Design for: Cozy Calendar*\
*Approach: Hybrid AI-Agent Build (Antigravity + Claude)*\
*Target Launch: 2 Weeks*}