# Testing Strategy

- **Manual UI/UX Checks (Primary):** Since the app prioritizes a "Scrapbook aesthetic", visual browser testing using the Antigravity agent is REQUIRED. Check drag-and-drop sticker mechanics and page flipping animations manually.
- **Unit/Integration Tests:** Required for Supabase Data actions (e.g., verifying `saveJournalEntry` properly handles Auth states).
- **Pre-commit Hooks:** Run `npm run lint` before committing to avoid sloppy code pile-up.
- **Security Check:** RLS policies in Supabase must be verified. Attempt database reads/writes from the browser while logged out to ensure they are blocked.
- **Verification Loop:** Run visual checks and console log checks after completing any logic feature (like implementing sticker dragging or calendar state toggling).
