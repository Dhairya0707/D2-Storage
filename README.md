<div align="center">
  <h1>✦ D2 Storage</h1>
  <p><strong>Zero-config, project-scoped cloud asset storage — a secure gateway on top of Cloudinary.</strong></p>
  <p>
    Part of the <a href="https://github.com/TheDreamBitLabs">TheDreamBitLabs</a> open-source ecosystem ·
    Built by <a href="https://www.linkedin.com/in/dhairya-darji-072428284/?skipRedirect=true">Dhairya Darji</a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Cloudinary-free_10GB-3448C5?style=flat-square&logo=cloudinary" alt="Cloudinary" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/AI--Ready-Copilot_Prompt-cc785c?style=flat-square" alt="AI Ready" />
    <img src="https://img.shields.io/badge/License-MIT-22c55e?style=flat-square" alt="MIT" />
  </p>

  <p>
    <a href="#-why-d2-storage-and-not-cloudinary-directly">Why D2 Storage?</a> ·
    <a href="#-quick-start">Quick Start</a> ·
    <a href="#-cloudinary-setup-free-10-gb">Cloudinary Setup</a> ·
    <a href="#-api-reference">API Reference</a> ·
    <a href="#-ai-integration-copilot">AI Integration</a> ·
    <a href="#-deployment">Deployment</a>
  </p>
</div>

---

## What Is D2 Storage?

**D2 Storage** is a self-hosted storage microservice that sits in front of Cloudinary. You deploy it once on your own server, create isolated project workspaces with their own API keys and CORS rules, and upload files with a single `fetch()` call — from any app, any framework, any language.

No SDK needed. No Cloudinary account exposed to the client. Just a clean, secure REST API.

---

## ❓ Why D2 Storage and Not Cloudinary Directly?

> *"I already have Cloudinary — why would I use this?"*

Great question. Here's what D2 Storage adds that raw Cloudinary cannot:

| Problem with raw Cloudinary | What D2 Storage solves |
|---|---|
| 🔴 API Key/Secret must stay server-side — you can't use it from a browser safely | ✅ D2 issues per-project **bearer tokens** — safe to embed in any client app |
| 🔴 One global bucket — all projects share the same namespace | ✅ Every project gets its own **isolated root folder** under `dreambit/<your-root>/` |
| 🔴 No origin restriction — any server can upload to your account if they get the key | ✅ **Project-level CORS** whitelist — only approved origins can upload |
| 🔴 Integrating Cloudinary in every new project means re-reading docs every time | ✅ Once deployed, every new project is just `POST /api/upload` with a bearer token — **done in 2 minutes** |
| 🔴 Explaining Cloudinary SDK setup to an AI assistant is slow and error-prone | ✅ Built-in **AI Integration Copilot** — copy a pre-built system prompt and get working SDK code instantly |
| 🔴 File naming conflicts in shared buckets | ✅ **Timestamp-appended filenames** prevent collisions automatically |
| 🔴 `.zip`, `.pdf`, `.csv` are uploaded as the wrong resource type | ✅ Automatic `raw` type routing so downloads work correctly in-browser |

**The philosophy**: *"A 500-line storage service that removes 30 minutes of setup from every future project."*

---

## ✨ Features

- 🗂️ **Project Workspaces** — spin up isolated storage containers with unique API keys
- 🔑 **Hashed API Keys** — cryptographically hashed bearer tokens, never stored in plaintext
- 🌐 **Per-Project CORS** — restrict uploads to your approved origins only
- 📁 **Auto Folders** — upload to a folder that doesn't exist yet and it's provisioned automatically
- 🤖 **AI-Ready Copilot** — generate a master integration prompt per project, paste into any LLM
- 💅 **Admin Dashboard** — beautiful UI at `/dashboard` with 24-hour session management
- 📖 **In-App API Docs** — full interactive reference at `/docs`, no external site needed
- 📜 **Format Integrity** — raw/video/image types routed correctly for proper download behavior

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18
- A free [Cloudinary account](https://cloudinary.com/users/register/free) (10 GB free)
- A server with a **persistent filesystem** — Railway, Render, VPS, or Docker (see [Deployment](#-deployment))

### 1. Clone

```bash
git clone https://github.com/TheDreamBitLabs/d2-storage.git
cd d2-storage
```

### 2. Install

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your values:

```env
# Cloudinary (required) — from cloudinary.com → Settings → API Keys
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Master admin password (required) — protects the /dashboard panel
# This is NOT a Cloudinary key — pick any strong passphrase you want
API_KEYS=your_master_password

# Your deployment URL (recommended)
# The AI Integration Prompt and /docs page use this as the base URL.
# Change this when you go to production!
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### 4. Run

```bash
npm run dev
```

App starts on **http://localhost:3001** · Dashboard at **/dashboard** · Docs at **/docs**

---

## ☁️ Cloudinary Setup (Free 10 GB)

Cloudinary's free tier gives you **10 GB storage + 25 GB bandwidth/month** — plenty for hackathons and indie projects.

### Step 1 — Create a free account

Go to [cloudinary.com/users/register/free](https://cloudinary.com/users/register/free) — no credit card required.

### Step 2 — Get your API credentials

1. Log in → **Settings** → **API Keys**
2. Copy three values into your `.env.local`:

| Env Variable | Where to find it |
|---|---|
| `CLOUDINARY_CLOUD_NAME` | Settings → Account → Cloud name |
| `CLOUDINARY_API_KEY` | Settings → API Keys → API Key |
| `CLOUDINARY_API_SECRET` | Settings → API Keys → API Secret (click reveal) |

### Step 3 — Set the API key role

When Cloudinary asks you to select a role for a new API key, choose **Master** or **Full Access**. D2 Storage needs permission to upload, delete, and list assets across folders.

### Step 4 — Folder structure (zero manual setup)

D2 Storage manages Cloudinary folders automatically. When you create a project workspace, folders are provisioned on first upload:

```
cloudinary-bucket/
  dreambit/
    your-project-root/
      avatars/         ← auto-created on first upload
      docs/
      uploads/
      ...
```

You never need to touch the Cloudinary dashboard for folder management.

### Free tier limits

| Resource | Free tier |
|---|---|
| Storage | **10 GB** |
| Bandwidth / month | **25 GB** |
| Transformations / month | 25,000 credits |

---

## 🔐 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `CLOUDINARY_CLOUD_NAME` | ✅ | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | ✅ | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | ✅ | Your Cloudinary API secret |
| `API_KEYS` | ✅ | Master admin password(s). Comma-separate for multiple: `pass1,pass2` |
| `NEXT_PUBLIC_APP_URL` | Recommended | Your public deployment URL — used in AI prompt + docs. Defaults to `window.location.origin` on client. **Update this when you host on a custom domain.** |

---

## 📡 API Reference

All requests need a project-scoped bearer token in the header:

```http
Authorization: Bearer sk_your_project_api_key
```

### Upload a file

```http
POST /api/upload?projectId=<PROJECT_ID>
Content-Type: multipart/form-data
```

| Field | Required | Description |
|---|---|---|
| `file` | ✅ | The file to upload. Max 10 MB via server. |
| `folder` | optional | Subfolder path. Auto-provisioned if it doesn't exist. |

```bash
curl -X POST "https://your-app.railway.app/api/upload?projectId=proj_abc123" \
  -H "Authorization: Bearer sk_proj_live_8f3d9a..." \
  -F "file=@logo.png" \
  -F "folder=brand-assets"
```

**Response:**
```json
{
  "success": true,
  "file": {
    "id": "dreambit/my-app/brand-assets/logo_1717711234567",
    "name": "logo_1717711234567.png",
    "url": "https://res.cloudinary.com/.../logo_1717711234567.png",
    "size": 45120,
    "type": "image/png",
    "created_at": "2026-06-06T18:00:00Z"
  }
}
```

### List files

```http
GET /api/files?projectId=<PROJECT_ID>&folder=<FOLDER>&cursor=<CURSOR>&limit=<LIMIT>
```

### Delete a file

```http
DELETE /api/files/<PROVIDER_ID>?type=<image|video|raw>
```

### List subfolders

```http
GET /api/folders?projectId=<PROJECT_ID>
```

### Create a subfolder

```http
POST /api/folders?projectId=<PROJECT_ID>
Content-Type: application/json

{ "name": "avatars" }
```

> For the full interactive reference, go to **`/docs`** in your running app.

---

## 🤖 AI Integration Copilot

D2 Storage has an **AI-Ready Copilot** built into every project dashboard. This is one of its most powerful features.

### How it works

1. Open your project at `/dashboard/<project-id>`
2. Click **"AI Integration Prompt"**
3. A complete system prompt is generated with:
   - Your Project ID and API key pre-filled
   - Your deployment base URL (from `NEXT_PUBLIC_APP_URL`)
   - All endpoint specs in the correct format
4. Paste it into **Claude**, **ChatGPT**, **Gemini**, **Cursor**, or any AI tool
5. Ask *"Write me a JavaScript helper to upload files"* — get working code in seconds

> **Note on the base URL**: The AI prompt reads from `NEXT_PUBLIC_APP_URL`. If it shows `localhost:3001` after deployment, update that env variable to your real domain and redeploy.

---

## 🏗️ Project Structure

```
d2-storage/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── upload/         # POST /api/upload
│   │   │   ├── files/          # GET + DELETE /api/files
│   │   │   ├── folders/        # GET + POST /api/folders
│   │   │   └── projects/       # GET + POST /api/projects
│   │   ├── dashboard/
│   │   │   ├── page.tsx        # Project list + session auth
│   │   │   └── [id]/           # Per-project workspace
│   │   ├── docs/               # In-app API documentation
│   │   ├── globals.css         # All design tokens + theme
│   │   └── page.tsx            # Public landing page
│   ├── components/ui/          # Custom UI components
│   ├── lib/
│   │   ├── auth.ts             # Master key validation
│   │   ├── cloudinary.ts       # Cloudinary SDK wrapper
│   │   ├── cors.ts             # Project-scoped CORS enforcement
│   │   ├── crypto.ts           # API key hashing utilities
│   │   ├── db.ts               # JSON flat-file database layer
│   │   └── utils.ts            # Shared utilities
│   └── sdk/                    # Embeddable client SDK (WIP)
├── data/                       # Runtime data — gitignored
│   ├── projects.json           # Project registry
│   └── api_keys.json           # Hashed API key store
├── convex/                     # Convex schema (reserved for future hosted version)
│   └── schema.ts
├── docs/                       # Internal design docs
├── .env.example                # Environment variable template
└── package.json
```

### About the database

D2 Storage uses a **local JSON flat-file database** (`data/projects.json` and `data/api_keys.json`) — no PostgreSQL, no Redis, no external database required. This is intentional: it keeps setup to zero.

> ⚠️ **The `data/` folder must persist between restarts.** This means:
> - ✅ Works great on **Railway, Render, VPS, Docker** (persistent filesystem)
> - ❌ Will lose data on **Vercel, Netlify, AWS Lambda** (ephemeral serverless filesystem)
>
> If you want to deploy to Vercel/serverless, swap `src/lib/db.ts` for any key-value store (Vercel KV, Upstash Redis, PlanetScale, etc.). The interface is straightforward to replace.

> **Note on Convex**: The `convex/` directory and `convex` npm package are present but not yet active in this version. The schema is defined and ready — Convex is planned for a future multi-tenant hosted version of D2 Storage. It is **not required** for self-hosting.

---

## 🎨 Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) App Router |
| Language | [TypeScript 5](https://www.typescriptlang.org/) |
| UI | [React 19](https://react.dev/) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/) + [Base UI](https://base-ui.com/) |
| Storage Driver | [Cloudinary Node SDK v2](https://cloudinary.com/documentation/node_integration) |
| Database | Local JSON flat-file — zero external dependencies |
| Auth | Native Node.js `crypto` module — hashed bearer tokens |
| Icons | [Lucide React](https://lucide.dev/) |

---

## 🚀 Deployment

> **Important**: D2 Storage needs a **persistent filesystem** to store `data/projects.json` and `data/api_keys.json`. Choose a platform that supports this.

### ✅ Railway (Recommended — easiest)

1. Push your fork to GitHub
2. Go to [railway.app](https://railway.app) → **New Project → Deploy from GitHub**
3. Select your repo
4. Add environment variables in Railway dashboard:
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `API_KEYS`
   - `NEXT_PUBLIC_APP_URL` → set to your Railway-generated URL (e.g. `https://d2-storage.up.railway.app`)
5. Deploy — Railway handles the persistent volume automatically ✅

### ✅ Render

1. New Web Service → connect your repo
2. Build command: `npm install && npm run build`
3. Start command: `npm start`
4. Add the same environment variables
5. Set `NEXT_PUBLIC_APP_URL` to your Render URL

### ✅ VPS / Docker

```bash
npm run build
npm start     # runs on port 3001
```

Or with Docker:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci && npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

Mount a persistent volume at `/app/data` to survive container restarts.

### ⚠️ Vercel (Not recommended without DB swap)

Vercel's serverless functions have an **ephemeral filesystem** — your `data/` folder will be wiped on each cold start. If you still want to use Vercel, replace `src/lib/db.ts` with [Vercel KV](https://vercel.com/docs/storage/vercel-kv) or [Upstash Redis](https://upstash.com/). The `db.ts` interface is minimal and straightforward to swap out.

---

## 🛡️ Security

- **Master password** (`API_KEYS`) is validated server-side only, never returned to the client
- **Project API keys** are stored as one-way hashes — the plaintext is shown exactly once, at creation time
- **CORS enforcement** runs on every API request before any Cloudinary call
- **`data/` is gitignored** — your project registry and key hashes never get committed
- **Dashboard sessions** expire after 24 hours automatically via localStorage TTL

---

## 📦 Roadmap

- [ ] **Signed upload URLs** — client-to-Cloudinary direct uploads for files > 10 MB
- [ ] **Image transformations** — proxy Cloudinary transform params (`?w=300&h=300`)
- [ ] **Usage analytics** — storage used, monthly bandwidth, uploads today
- [ ] **Multi-key support** — multiple admin keys with role separation
- [ ] **SDK package** — publish `@dreambitlabs/storage` to npm
- [ ] **Convex backend** — multi-tenant hosted version with user accounts

---

## 🤝 Contributing

Contributions are welcome. Keep PRs focused and scoped — this project is intentionally minimal.

```bash
git checkout -b feat/my-feature
git commit -m "feat: add my feature"
# open a PR against main
```

Open an issue first for anything major.

---

## 📄 License

MIT — use it, fork it, ship it. Attribution appreciated but not required.

---

<div align="center">
  <p>
    Built with ☕ by
    <a href="https://www.linkedin.com/in/dhairya-darji-072428284/?skipRedirect=true">Dhairya Darji</a>
    &nbsp;·&nbsp;
    <strong>TheDreamBitLabs</strong> open-source ecosystem
  </p>
</div>
