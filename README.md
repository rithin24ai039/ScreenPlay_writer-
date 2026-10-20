# ScreenPlay

A friendly screenplay-writing workspace built with HTML, CSS, and vanilla JavaScript. Supabase adds optional accounts and private cloud sync; local drafts work without an account.

## Features

- Multiple screenplay projects and sample script.
- Scene headings, action, character cues, dialogue, parentheticals, and transitions.
- Scene navigation, word/page estimates, character list, logline, genre, and notes.
- Local autosave, dark/light theme, focus mode, and keyboard shortcuts.
- Fountain export and browser print-to-PDF.
- Optional Supabase email/password authentication and owner-protected cloud sync.

## Run locally

Serve the repository root with any static HTTP server, such as VS Code Live Server. The app loads Supabase JS as an ES module from a CDN.

## Configure Supabase

1. Create a Supabase project.
2. Run the SQL in supabase/schema.sql using Supabase SQL Editor.
3. Copy the project URL and publishable key (or legacy anon key) from the project's API settings.
4. Put those public values in config.js.
5. In Supabase Authentication URL Configuration, add the deployed Vercel URL to the allowed redirect URLs.
6. Do not use a service_role or secret key in this browser application.

Without configuration, local writing and local autosave still work. Signed-in users can sync to their own Supabase rows, protected by row-level security.

## Deploy to Vercel

Import rithin24ai039/ScreenPlay_writer- from GitHub. Select the Other framework preset, no build command, and the repository root as the output. Vercel can automatically deploy each push to the connected production branch.

## Privacy and current limitations

Guest drafts stay in browser local storage. Browser data can be cleared, so export backups. Signed-in projects sync to Supabase and RLS restricts access to the owner. This version does not send scripts to an AI provider. PDF export uses the browser print dialog and page count is an estimate. Final Draft FDX, collaboration, and AI tools are not included yet.

## License

No license is included yet. Add one after confirming rights to all code and assets in the repository.
