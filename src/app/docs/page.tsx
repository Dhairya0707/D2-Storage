"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Terminal, Shield, Key, Folder, Check, Copy, BookOpen, Settings, Code, Server, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type TabSection = "getting-started" | "env-setup" | "api-endpoints" | "client-integration" | "self-hosting";

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<TabSection>("getting-started");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Dynamic values
  const [origin, setOrigin] = useState("http://localhost:3000");
  const githubRepo = "https://github.com/dreambitlabs/storage.git";
  const creatorLink = "https://www.linkedin.com/in/dhairya-darji-072428284/?skipRedirect=true";

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="min-h-screen bg-canvas text-ink-dark flex flex-col justify-between selection:bg-primary/10 selection:text-primary">
      {/* Header */}
      <header className="border-b border-border bg-canvas/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-primary text-xl font-serif">✦</span>
            <span className="font-serif text-xl font-normal tracking-tight text-ink-dark">D2 Storage</span>
          </Link>
          <span className="text-xs bg-surface-card border border-border text-ink-muted px-2 py-0.5 rounded-full font-mono">Docs</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="border-border text-ink-medium hover:bg-surface-card text-xs font-semibold uppercase tracking-wider h-9 rounded-xl">
              Console
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto w-full px-6 py-10 flex-1 grid md:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <aside className="md:col-span-1 space-y-2">
          <div className="sticky top-24">
            <div className="text-xs font-bold text-ink-muted uppercase tracking-wider px-3 mb-3 flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" /> Documentation
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab("getting-started")}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
                  activeTab === "getting-started"
                    ? "bg-surface-card text-ink-dark font-semibold border-l-2 border-primary"
                    : "text-ink-medium hover:bg-surface-card/50 hover:text-ink-dark"
                }`}
              >
                Getting Started
              </button>
              <button
                onClick={() => setActiveTab("env-setup")}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
                  activeTab === "env-setup"
                    ? "bg-surface-card text-ink-dark font-semibold border-l-2 border-primary"
                    : "text-ink-medium hover:bg-surface-card/50 hover:text-ink-dark"
                }`}
              >
                Environment Setup
              </button>
              <button
                onClick={() => setActiveTab("api-endpoints")}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
                  activeTab === "api-endpoints"
                    ? "bg-surface-card text-ink-dark font-semibold border-l-2 border-primary"
                    : "text-ink-medium hover:bg-surface-card/50 hover:text-ink-dark"
                }`}
              >
                API Endpoints
              </button>
              <button
                onClick={() => setActiveTab("client-integration")}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
                  activeTab === "client-integration"
                    ? "bg-surface-card text-ink-dark font-semibold border-l-2 border-primary"
                    : "text-ink-medium hover:bg-surface-card/50 hover:text-ink-dark"
                }`}
              >
                Client Integration
              </button>
              <button
                onClick={() => setActiveTab("self-hosting")}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
                  activeTab === "self-hosting"
                    ? "bg-surface-card text-ink-dark font-semibold border-l-2 border-primary"
                    : "text-ink-medium hover:bg-surface-card/50 hover:text-ink-dark"
                }`}
              >
                Self-Hosting Setup
              </button>
            </nav>
          </div>
        </aside>

        {/* Content Area */}
        <main className="md:col-span-3 space-y-10">
          {/* GETTING STARTED */}
          {activeTab === "getting-started" && (
            <section className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-serif font-normal text-ink-dark tracking-tight">Getting Started</h1>
                <p className="text-sm text-ink-medium leading-relaxed font-light">
                  Welcome to <strong>D2 Storage</strong>, a lightweight, self-hosted, proxy asset storage server designed to sit securely in front of Cloudinary. D2 Storage provides automatic namespace segregation, origin CORS validations, and api-key client protections to keep your root Cloudinary credentials completely hidden.
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <Card className="p-4 border border-border bg-surface-card/30 space-y-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold text-xs text-ink-dark uppercase tracking-wider">CORS Origin Control</h4>
                  <p className="text-[11px] text-ink-muted leading-relaxed font-light">
                    Apply dynamic origins whitelists per-project. Intercept OPTIONS preflights automatically.
                  </p>
                </Card>
                <Card className="p-4 border border-border bg-surface-card/30 space-y-2">
                  <Folder className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold text-xs text-ink-dark uppercase tracking-wider">Namespace Isolation</h4>
                  <p className="text-[11px] text-ink-muted leading-relaxed font-light">
                    Every workspace isolates assets under prefix-locked directories (`dreambit/project-folder-name/...`).
                  </p>
                </Card>
                <Card className="p-4 border border-border bg-surface-card/30 space-y-2">
                  <Key className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold text-xs text-ink-dark uppercase tracking-wider">Secure Access API</h4>
                  <p className="text-[11px] text-ink-muted leading-relaxed font-light">
                    Clients upload and list assets using custom, hashed API tokens instead of core master API secrets.
                  </p>
                </Card>
              </div>

              <div className="space-y-3">
                <h3 className="font-serif text-xl text-ink-dark">Why D2 Storage and not Cloudinary directly?</h3>
                <p className="text-xs sm:text-sm text-ink-medium leading-relaxed font-light">
                  This is the most common question. Here is the honest answer:
                </p>
                <div className="border border-border rounded-xl overflow-hidden divide-y divide-border text-xs">
                  <div className="grid grid-cols-2 gap-4 px-4 py-2 bg-surface-card/50 font-semibold text-ink-dark uppercase tracking-wider text-[10px]">
                    <span>Raw Cloudinary problem</span>
                    <span>D2 Storage solution</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-surface-card/10">
                    <span className="text-ink-muted font-light">Your API Secret must stay server-side — you cannot use it safely from a browser or mobile app</span>
                    <span className="text-ink-medium">D2 issues per-project <strong>bearer tokens</strong> that are safe to embed in any client app</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-surface-card/10">
                    <span className="text-ink-muted font-light">One global bucket — all your projects share the same Cloudinary namespace</span>
                    <span className="text-ink-medium">Every project gets its own <strong>isolated root folder</strong> under <code className="font-mono text-[10px] bg-surface-card px-1 rounded">dreambit/your-root/</code></span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-surface-card/10">
                    <span className="text-ink-muted font-light">No origin restriction — any server that gets your key can upload to your account</span>
                    <span className="text-ink-medium"><strong>Per-project CORS whitelist</strong> — only your approved origins are allowed to upload</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-surface-card/10">
                    <span className="text-ink-muted font-light">Re-reading Cloudinary docs and re-wiring the SDK for every new project takes time</span>
                    <span className="text-ink-medium">Once deployed, every new project is just <code className="font-mono text-[10px] bg-surface-card px-1 rounded">POST /api/upload</code> with a token — done in 2 minutes</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-surface-card/10">
                    <span className="text-ink-muted font-light">Explaining Cloudinary to an AI assistant requires extra context every time</span>
                    <span className="text-ink-medium">Built-in <strong>AI Integration Copilot</strong> — copy the system prompt, paste into any LLM, get working code instantly</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-serif text-xl text-ink-dark">Open Source & Creator</h3>
                <p className="text-xs sm:text-sm text-ink-medium leading-relaxed font-light">
                  D2 Storage is open source and built by <a href={creatorLink} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors underline font-medium">Dhairya Darji</a> as part of the <strong>TheDreamBitLabs</strong> ecosystem — a collection of tiny, self-hostable developer tools that remove repetitive setup from every project. Clone the repo, add your <code className="font-mono text-[10px] bg-surface-card px-1 rounded">.env.local</code>, and deploy it on your own infrastructure.
                </p>
              </div>
            </section>
          )}

          {/* ENVIRONMENT SETUP */}
          {activeTab === "env-setup" && (
            <section className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-serif font-normal text-ink-dark tracking-tight">Environment Setup</h1>
                <p className="text-sm text-ink-medium leading-relaxed font-light">
                  D2 Storage requires standard backend settings to link to your Cloudinary storage container and authenticate your administrative master dashboard access.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-serif text-xl text-ink-dark">Required Keys</h3>
                <div className="border border-border rounded-xl overflow-hidden divide-y divide-border">
                  <div className="p-4 bg-surface-card/10 grid grid-cols-3 gap-4 text-xs">
                    <span className="font-mono font-semibold text-primary col-span-1">CLOUDINARY_CLOUD_NAME</span>
                    <span className="text-ink-medium col-span-2 font-light">Your Cloudinary dashboard cloud name. Mapped under folders and resource references.</span>
                  </div>
                  <div className="p-4 bg-surface-card/10 grid grid-cols-3 gap-4 text-xs">
                    <span className="font-mono font-semibold text-primary col-span-1">CLOUDINARY_API_KEY</span>
                    <span className="text-ink-medium col-span-2 font-light">Master authentication access key provided by Cloudinary.</span>
                  </div>
                  <div className="p-4 bg-surface-card/10 grid grid-cols-3 gap-4 text-xs">
                    <span className="font-mono font-semibold text-primary col-span-1">CLOUDINARY_API_SECRET</span>
                    <span className="text-ink-medium col-span-2 font-light">Master authorization secret. Kept strictly on the backend proxy server.</span>
                  </div>
                  <div className="p-4 bg-surface-card/10 grid grid-cols-3 gap-4 text-xs">
                    <span className="font-mono font-semibold text-primary col-span-1">API_KEYS</span>
                    <span className="text-ink-medium col-span-2 font-light">The master admin password(s) required to sign in to the D2 Storage dashboard. Comma-separate multiple passwords: <code className="font-mono text-[10px] bg-surface-card px-1 rounded">pass1,pass2</code>.</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <h3 className="font-serif text-xl text-ink-dark">Cloudinary Credentials Guide</h3>
                <p className="text-xs sm:text-sm text-ink-medium leading-relaxed font-light">
                  To get your free environment keys, follow these simple steps:
                </p>
                <ol className="list-decimal pl-5 text-xs text-ink-muted space-y-2 font-light">
                  <li>Go to the <a href="https://cloudinary.com/users/register/free" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">Cloudinary Free Registration page</a> and create a free developer account. Cloudinary provides a generous free tier of up to 25 monthly credits (representing ~25 GB of storage / monthly edge bandwidth).</li>
                  <li>Once registered, log into your new Cloudinary Management Console.</li>
                  <li>In the top section of your <strong>Dashboard</strong> under the <strong>Product Environment Credentials</strong> panel, you will see your <strong>Cloud Name</strong>, <strong>API Key</strong>, and <strong>API Secret</strong>.</li>
                  <li>Copy these values directly and save them in your `.env.local` configuration variables.</li>
                </ol>
              </div>

              <div className="space-y-4 pt-2">
                <h3 className="font-serif text-xl text-ink-dark">Access Control & Roles</h3>
                <p className="text-xs sm:text-sm text-ink-medium leading-relaxed font-light">
                  D2 Storage utilizes a dual-tier authentication strategy to segregate administration from technical execution:
                </p>
                <ul className="list-disc pl-5 text-xs text-ink-muted space-y-2 font-light">
                  <li><strong>Master Password (Admin/Founder Role)</strong>: Configured inside the environment variable <code className="font-mono text-[10px] bg-surface-card px-1 rounded">API_KEYS</code>. This provides full access to the /dashboard to create project workspaces, configure CORS origins, and manage API keys. Keep this password private.</li>
                  <li><strong>Project API Keys (Developer/Client Role)</strong>: Generated on a per-project basis inside the console. These keys are used by client integrations or developers (e.g. backend apps, file-upload hooks) to post and retrieve files under namespaced folder paths. Origin CORS checking restricts where these keys can be executed client-side.</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="font-serif text-xl text-ink-dark">Optional Variables</h3>
                <div className="border border-border rounded-xl overflow-hidden divide-y divide-border">
                  <div className="p-4 bg-surface-card/10 grid grid-cols-3 gap-4 text-xs">
                    <span className="font-mono font-semibold text-primary col-span-1">NEXT_PUBLIC_APP_URL</span>
                    <span className="text-ink-medium col-span-2 font-light">Your public deployment URL (e.g. <code className="font-mono text-[10px] bg-surface-card px-1 rounded">https://storage.myapp.com</code>). Used by the AI Integration Prompt and the in-app docs to display the correct base URL. Defaults to <code className="font-mono text-[10px] bg-surface-card px-1 rounded">window.location.origin</code> on the client. <strong>Update this when you deploy to a custom domain.</strong></span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-serif text-xl text-ink-dark">Example `.env.local` File</h3>
                <div className="bg-[#1c1917] border border-surface-dark-elevated rounded-xl overflow-hidden relative group text-ink-soft">
                  <div className="bg-surface-dark-elevated px-4 py-2 border-b border-surface-dark-elevated flex items-center justify-between text-[11px] font-mono">
                    <span>.env.local</span>
                    <button 
                      onClick={() => copyToClipboard(`CLOUDINARY_CLOUD_NAME=your_cloud_name\nCLOUDINARY_API_KEY=your_api_key\nCLOUDINARY_API_SECRET=your_api_secret\nAPI_KEYS=your_secure_master_password\nNEXT_PUBLIC_APP_URL=http://localhost:3001`, "env")}
                      className="text-ink-soft hover:text-canvas transition-colors flex items-center gap-1"
                    >
                      {copiedText === "env" ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedText === "env" ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                  <pre className="p-4 font-mono text-xs text-[#efe9de] leading-relaxed">
{`# Cloudinary — get from cloudinary.com → Settings → API Keys
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Master admin password — protects the /dashboard panel
API_KEYS=your_secure_master_password

# Your deployment URL — update this when hosting on a custom domain!
# Used by the AI prompt and docs to show the correct base URL.
NEXT_PUBLIC_APP_URL=http://localhost:3001`}
                  </pre>
                </div>
              </div>
            </section>
          )}

          {/* API ENDPOINTS */}
          {activeTab === "api-endpoints" && (
            <section className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-serif font-normal text-ink-dark tracking-tight">API Endpoints</h1>
                <p className="text-sm text-ink-medium leading-relaxed font-light">
                  Use standard HTTP requests to upload, retrieve, list, and purge assets inside your isolated container storage.
                </p>
              </div>

              {/* Upload Asset */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-500/10 text-emerald-600 font-mono text-[10px] font-bold px-2 py-0.5 rounded-md">POST</span>
                  <span className="font-mono text-xs font-semibold text-ink-dark">/api/upload</span>
                </div>
                <p className="text-xs text-ink-medium leading-relaxed font-light">
                  Upload binary data (images, videos, documents) straight to Cloudinary. Max file size is 10 MB per request. Namespacing prefixes are appended automatically.
                </p>
                <div className="bg-[#1c1917] border border-surface-dark-elevated rounded-xl overflow-hidden relative text-ink-soft">
                  <div className="bg-surface-dark-elevated px-4 py-2 border-b border-surface-dark-elevated flex items-center justify-between text-[11px] font-mono">
                    <span>Headers & Form-Data params</span>
                  </div>
                  <div className="p-4 font-mono text-xs space-y-2 text-[#efe9de]">
                    <div><span className="text-primary">Authorization:</span> Bearer &lt;project_api_key&gt;</div>
                    <div><span className="text-primary">file:</span> Binary stream (File form, max 10 MB)</div>
                    <div><span className="text-primary">folder:</span> (Optional) Subdirectory mapping</div>
                  </div>
                </div>
              </div>

              {/* List Assets */}
              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-500/10 text-blue-600 font-mono text-[10px] font-bold px-2 py-0.5 rounded-md">GET</span>
                  <span className="font-mono text-xs font-semibold text-ink-dark">/api/files</span>
                </div>
                <p className="text-xs text-ink-medium leading-relaxed font-light">
                  List all assets metadata (URLs, width, format) tracked under the project's root folder prefix.
                </p>
                <div className="bg-[#1c1917] border border-surface-dark-elevated rounded-xl overflow-hidden relative text-ink-soft">
                  <div className="bg-surface-dark-elevated px-4 py-2 border-b border-surface-dark-elevated flex items-center justify-between text-[11px] font-mono">
                    <span>Query Parameters</span>
                  </div>
                  <div className="p-4 font-mono text-xs space-y-1 text-[#efe9de]">
                    <div><span className="text-primary">folder:</span> (Optional) Target subfolder list query</div>
                  </div>
                </div>
              </div>

              {/* Delete Asset */}
              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <span className="bg-red-500/10 text-red-600 font-mono text-[10px] font-bold px-2 py-0.5 rounded-md">DELETE</span>
                  <span className="font-mono text-xs font-semibold text-ink-dark">/api/files/[...publicId]</span>
                </div>
                <p className="text-xs text-ink-medium leading-relaxed font-light">
                  Purge a single file from Cloudinary matching the requested namespaced `publicId`.
                </p>
              </div>
            </section>
          )}

          {/* CLIENT INTEGRATION */}
          {activeTab === "client-integration" && (
            <section className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-serif font-normal text-ink-dark tracking-tight">Client Integration</h1>
                <p className="text-sm text-ink-medium leading-relaxed font-light">
                  Standard fetch examples to link frontend forms, upload states, or script pipes directly to your self-hosted proxy.
                </p>
              </div>

              {/* JS implementation */}
              <div className="space-y-3">
                <h3 className="font-serif text-xl text-ink-dark">JavaScript Fetch Example</h3>
                <div className="bg-[#1c1917] border border-surface-dark-elevated rounded-xl overflow-hidden relative text-ink-soft">
                  <div className="bg-surface-dark-elevated px-4 py-2 border-b border-surface-dark-elevated flex items-center justify-between text-[11px] font-mono">
                    <span>upload.js</span>
                    <button 
                      onClick={() => copyToClipboard(`const formData = new FormData();\nformData.append("file", fileInput.files[0]);\nformData.append("folder", "user-profile-photos");\n\nconst response = await fetch("${origin}/api/upload", {\n  method: "POST",\n  headers: {\n    "Authorization": "Bearer sk_proj_live_..."\n  },\n  body: formData\n});\nconst result = await response.json();`, "js")}
                      className="text-ink-soft hover:text-canvas transition-colors flex items-center gap-1"
                    >
                      {copiedText === "js" ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedText === "js" ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                  <pre className="p-4 font-mono text-[10px] sm:text-xs text-[#efe9de] overflow-x-auto leading-relaxed">
{`const formData = new FormData();
formData.append("file", fileInput.files[0]);
formData.append("folder", "user-profile-photos");

const response = await fetch("${origin}/api/upload", {
  method: "POST",
  headers: {
    "Authorization": "Bearer sk_proj_live_..."
  },
  body: formData
});
const result = await response.json();`}
                  </pre>
                </div>
              </div>

              {/* Curl implementation */}
              <div className="space-y-3 pt-4 border-t border-border">
                <h3 className="font-serif text-xl text-ink-dark">cURL Command Line</h3>
                <div className="bg-[#1c1917] border border-surface-dark-elevated rounded-xl overflow-hidden relative text-ink-soft">
                  <div className="bg-surface-dark-elevated px-4 py-2 border-b border-surface-dark-elevated flex items-center justify-between text-[11px] font-mono">
                    <span>command.sh</span>
                    <button 
                      onClick={() => copyToClipboard(`curl -X POST "${origin}/api/upload" \\\n  -H "Authorization: Bearer sk_proj_live_..." \\\n  -F "file=@/path/to/my-image.jpg" \\\n  -F "folder=uploads"`, "curl")}
                      className="text-ink-soft hover:text-canvas transition-colors flex items-center gap-1"
                    >
                      {copiedText === "curl" ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedText === "curl" ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                  <pre className="p-4 font-mono text-[10px] sm:text-xs text-[#efe9de] overflow-x-auto leading-relaxed">
{`curl -X POST "${origin}/api/upload" \\
  -H "Authorization: Bearer sk_proj_live_..." \\
  -F "file=@/path/to/my-image.jpg" \\
  -F "folder=uploads"`}
                  </pre>
                </div>
              </div>
            </section>
          )}

          {/* SELF HOSTING */}
          {activeTab === "self-hosting" && (
            <section className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-serif font-normal text-ink-dark tracking-tight">Self-Hosting Setup</h1>
                <p className="text-sm text-ink-medium leading-relaxed font-light">
                  D2 Storage is designed to run self-hosted on any platform with a <strong>persistent filesystem</strong>. Follow the steps below.
                </p>
              </div>

              {/* Important warning */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs leading-relaxed space-y-1">
                <p className="font-semibold">⚠️ Persistent Filesystem Required</p>
                <p>D2 Storage saves project data in <code className="font-mono bg-amber-100 px-1 rounded">data/projects.json</code> and <code className="font-mono bg-amber-100 px-1 rounded">data/api_keys.json</code>. These files <strong>must survive restarts</strong>.</p>
                <p>✅ Works on: <strong>Railway, Render, VPS, Docker</strong> (persistent volume)</p>
                <p>❌ Will lose data on: <strong>Vercel, Netlify, AWS Lambda</strong> (ephemeral serverless filesystem)</p>
                <p>If you want to use Vercel, replace <code className="font-mono bg-amber-100 px-1 rounded">src/lib/db.ts</code> with Vercel KV or any external database — the interface is minimal and easy to swap.</p>
              </div>

              <div className="space-y-4">
                <h3 className="font-serif text-xl text-ink-dark">Step 1 — Clone & Run Locally</h3>
                <div className="bg-[#1c1917] border border-surface-dark-elevated rounded-xl overflow-hidden relative text-ink-soft">
                  <div className="bg-surface-dark-elevated px-4 py-2 border-b border-surface-dark-elevated flex items-center justify-between text-[11px] font-mono">
                    <span>terminal</span>
                    <button 
                      onClick={() => copyToClipboard(`git clone ${githubRepo}\ncd ${(githubRepo.split("/").pop() || "").replace(".git", "")}\nnpm install\ncp .env.example .env.local\nnpm run dev`, "terminal")}
                      className="text-ink-soft hover:text-canvas transition-colors flex items-center gap-1"
                    >
                      {copiedText === "terminal" ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedText === "terminal" ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                  <pre className="p-4 font-mono text-[10px] sm:text-xs text-[#efe9de] overflow-x-auto leading-relaxed">
{`# 1. Clone the repository
git clone ${githubRepo}
cd ${(githubRepo.split("/").pop() || "").replace(".git", "")}

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env.local
# → Open .env.local and fill in your Cloudinary keys + master password

# 4. Start the dev server (runs on port 3001)
npm run dev`}
                  </pre>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-serif text-xl text-ink-dark flex items-center gap-1.5"><Server className="h-5 w-5 text-primary" /> Step 2 — Deploy to Railway (Recommended)</h3>
                <p className="text-xs sm:text-sm text-ink-medium leading-relaxed font-light">
                  Railway is the easiest platform for D2 Storage — it provides a persistent filesystem out of the box, no extra configuration needed.
                </p>
                <ol className="list-decimal pl-5 text-xs text-ink-muted space-y-2 font-light">
                  <li>Push your fork to GitHub.</li>
                  <li>Go to <a href="https://railway.app" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">railway.app</a> → <strong>New Project → Deploy from GitHub repo</strong>.</li>
                  <li>Select your repository. Railway auto-detects Next.js.</li>
                  <li>Go to <strong>Variables</strong> and add: <code className="font-mono text-[10px] bg-surface-card px-1 rounded">CLOUDINARY_CLOUD_NAME</code>, <code className="font-mono text-[10px] bg-surface-card px-1 rounded">CLOUDINARY_API_KEY</code>, <code className="font-mono text-[10px] bg-surface-card px-1 rounded">CLOUDINARY_API_SECRET</code>, <code className="font-mono text-[10px] bg-surface-card px-1 rounded">API_KEYS</code>.</li>
                  <li>Set <code className="font-mono text-[10px] bg-surface-card px-1 rounded">NEXT_PUBLIC_APP_URL</code> to your Railway-generated URL (e.g. <code className="font-mono text-[10px] bg-surface-card px-1 rounded">https://d2-storage.up.railway.app</code>). <strong>This is important</strong> — the AI Integration Prompt uses this value as the base URL.</li>
                  <li>Click <strong>Deploy</strong>. Done ✅</li>
                </ol>
              </div>

              <div className="space-y-3">
                <h3 className="font-serif text-xl text-ink-dark">Step 3 — After Deployment</h3>
                <ul className="list-disc pl-5 text-xs text-ink-muted space-y-2 font-light">
                  <li>Visit <code className="font-mono text-[10px] bg-surface-card px-1 rounded">/dashboard</code> and sign in with your <code className="font-mono text-[10px] bg-surface-card px-1 rounded">API_KEYS</code> master password.</li>
                  <li>Create a project workspace — an API key is provisioned automatically.</li>
                  <li>Copy the API key (shown once) and use it in your client apps via <code className="font-mono text-[10px] bg-surface-card px-1 rounded">Authorization: Bearer sk_...</code>.</li>
                  <li>Use the <strong>AI Integration Prompt</strong> inside the project dashboard to get an LLM-generated SDK for your framework in seconds.</li>
                </ul>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-surface-card/30 border-t border-border py-8 text-ink-muted text-xs">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-primary text-lg font-serif">✦</span>
            <span className="font-serif text-ink-dark tracking-normal text-sm md:text-base font-semibold">The DreamBit Labs</span>
          </Link>
          <div className="flex items-center gap-1">
            <span>© {new Date().getFullYear()} D2 Storage. Built with</span>
            <Heart className="h-3.5 w-3.5 text-primary fill-primary shrink-0" />
            <span>in style by <a href={creatorLink} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors underline font-medium">Dhairya Darji</a>.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
