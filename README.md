# ScreenPlay

A friendly screenplay-writing workspace built with HTML, CSS, and vanilla JavaScript. Supabase provides email/password accounts, JWT-backed sessions, and private cloud sync; guest drafts remain on this device.

## Features

- Multiple screenplay projects and sample script.
- Scene headings, action, character cues, dialogue, parentheticals, and transitions.
- Scene navigation, word/page estimates, character list, logline, genre, and notes.
- Local autosave, dark/light theme, focus mode, and keyboard shortcuts.
- Fountain export and browser print-to-PDF.
- Supabase email/password authentication and owner-protected cloud sync.

## Run locally

Serve the repository root with any static HTTP server, such as VS Code Live Server. The app loads Supabase JS as an ES module from a CDN.

## Database and authentication

The live database is hosted in the Supabase project **screenplay-writer**. The `public.screenplays` table, indexes, and row-level security policies have been applied directly to Supabase; the database SQL is intentionally not stored in this GitHub repository.

The browser uses the Supabase project URL and **publishable** key in `config.js`. Publishable keys are designed for browser use; never put a Supabase secret or `service_role` key in client-side code. Supabase Auth manages password verification, sessions, and JWT access tokens. Row Level Security restricts each signed-in user to their own screenplay rows.

In Supabase Dashboard, set **Authentication → URL Configuration → Site URL** to the deployed Vercel URL and add that URL to **Redirect URLs**. If email confirmation is enabled, users must confirm the address before signing in. These settings may need to be completed in the dashboard.

## Deploy to Vercel

The static site is deployed to Vercel at https://screenplay-writer-psi.vercel.app. The repository is `rithin24ai039/ScreenPlay_writer-`. To enable automatic deployment on every push, connect the repository to the Vercel project through Vercel's Git settings.

## Privacy and limitations

Guest drafts stay in browser local storage. Browser data can be cleared, so export backups. Signed-in projects sync to Supabase and RLS restricts access to the owner. This version does not send scripts to an AI provider. PDF export uses the browser print dialog and page count is an estimate. Final Draft FDX, collaboration, and AI tools are not included yet.

## License

No license is included yet. Add one after confirming rights to all code and assets in the repository.
