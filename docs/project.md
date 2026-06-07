# D2 Storage - Project Overview

D2 Storage (Dhairya Darji Storage) is a lightweight, warm-cream themed, developer-focused storage service built as a thin, secure adapter layer around Cloudinary. It is designed to get a storage backend up and running for hackathons and client applications in under 5 minutes.

## Features

1. **Brand Aesthetics (Claude/Anthropic Inspired)**:
   - Tinted cream canvas (`#faf9f5`) paired with coral accents (`#cc785c`).
   - Humanist typography (Inter sans for body, Cormorant Garamond serif for display headlines).
   - Modern dark navy components (`#181715`) for the footers, integration panels, and AI prompt modals.

2. **Workspaces & API Keys**:
   - Create projects with custom folder paths.
   - Automatically provisions a default project-scoped API key upon creation.
   - Credentials are saved locally in the browser's `localStorage` for seamless copy-pasting, while their hashes are securely verified in the database.
   - **Project-scoped CORS rules**: Allow public access (`*`) or restrict access to a list of allowed origins (e.g. `http://localhost:3000`, `https://myapp.com`) per project.

3. **Subfolder Navigation & Management**:
   - Dynamic folder tree sidebar.
   - Create folders dynamically. If an asset is uploaded to a non-existent folder via the API, the backend creates it on-the-fly.
   - Breadcrumb navigation for directory browsing.

4. **Optimistic Asset Serving**:
   - Filename timestamping (`filename_timestamp.ext`) prevents bucket naming conflicts.
   - Formats (like `.zip`, `.csv`, `.json`, etc.) maintain extension integrity so they download correctly when pasted in the browser.

5. **AI Integration Copilot**:
   - Pre-fills a detailed developer integration prompt containing the active project parameters.
   - Copy-pasting this prompt into LLMs (like Claude or ChatGPT) outputs a client-side SDK helper in less than a minute.

## Tech Stack
- **Core**: Next.js App Router (React), TypeScript.
- **Database**: Local File JSON Database (`data/projects.json` & `data/api_keys.json`).
- **Storage Driver**: Cloudinary SDK (with `raw` type routing for documents).
- **Styling**: Tailwind CSS, Shadcn UI, Base UI.
- **CORS Handling**: Project-scoped `src/lib/cors.ts` validator.
