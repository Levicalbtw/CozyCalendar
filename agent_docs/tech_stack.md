# Tech Stack & Tools

- **Frontend:** Next.js (App Router)
- **Backend:** Next.js Server Actions (API routes if necessary)
- **Database:** Supabase (PostgreSQL with Row Level Security)
- **Authentication:** Supabase Auth
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion (for page-flipping / stickers)
- **Icons:** Lucide-React
- **Image Generation (Assets):** Nano Banana (via Antigravity)
- **Deployment:** Vercel

## Error Handling
```javascript
// Preferred pattern for Server Actions handling database interactions
export async function createEntry(data) {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: result, error } = await supabase
    .from('journal_entries')
    .insert(data)
    
  if (error) {
    console.error('[Database Error]', error.message);
    return { error: 'Failed to save entry.' };
  }
  return { data: result };
}
```

## Architecture Boundaries
- Routes (`app/`) handle only presentation and invoking server actions.
- Business Logic should be kept in specific utility or action files (`actions.ts`).
- No direct database fetches from Client Components.

## Naming Conventions
- React Components: PascalCase (e.g., `ScrapbookCanvas.tsx`)
- Server Actions: camelCase (e.g., `saveStickerPosition`)
- Database Tables: snake_case (e.g., `journal_entries`)
- Tailwind Colors: Use semantic names mapped to CSS variables (`bg-paper`, `text-ink`)
