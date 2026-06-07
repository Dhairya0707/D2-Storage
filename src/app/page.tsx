"use client";

import Link from "next/link";
import { ArrowRight, Database, Key, Shield, Zap, Folder, Terminal, CheckCircle2, Brain, Cpu } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function LandingPage() {
  const [origin, setOrigin] = useState("https://storage.dreambit.run");
  const creatorLink = "https://www.linkedin.com/in/dhairya-darji-072428284/?skipRedirect=true";
  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);
  return (
    <div className="min-h-screen bg-canvas text-ink-dark flex flex-col justify-between selection:bg-primary/10 selection:text-primary">
      {/* Header */}
      <header className="border-b border-border bg-canvas/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="text-primary text-xl font-serif">✦</span>
          <span className="font-serif text-xl font-normal tracking-tight text-ink-dark">D2 Storage</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/docs" className="text-xs font-semibold uppercase tracking-wider text-ink-medium hover:text-ink-dark transition-colors">
            Docs
          </Link>
          <Link href="/dashboard">
            <Button className="bg-primary hover:bg-primary-active text-white text-xs font-semibold uppercase tracking-wider h-9 px-4 rounded-xl transition-all">
              Launch Console
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="max-w-4xl mx-auto px-6 pt-16 pb-12 text-center space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-card border border-border text-xs font-mono text-ink-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Version 1.0 Release
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-normal text-ink-dark tracking-tight leading-tight max-w-3xl mx-auto">
            Zero-Config Asset Storage <br className="hidden sm:inline" />
            <span className="italic font-serif text-primary font-light">for Modern Developers</span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-ink-medium max-w-2xl mx-auto leading-relaxed font-sans font-light">
            Deploy secure, project-wise storage containers on top of Cloudinary. Restrict origins via CORS, isolate folders automatically, and manage assets with simple API calls.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/dashboard">
              <Button className="w-full sm:w-auto bg-primary hover:bg-primary-active text-white font-medium h-11 px-8 rounded-xl shadow-sm text-sm transition-all group flex items-center justify-center gap-2">
                Get Started 
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <a href="#features">
              <Button variant="outline" className="w-full sm:w-auto border-border text-ink-medium hover:bg-surface-card hover:text-ink-dark h-11 px-8 rounded-xl text-sm transition-all">
                Learn More
              </Button>
            </a>
          </div>
        </section>

        {/* Feature Visual Preview */}
        <section className="max-w-5xl mx-auto px-6 py-6">
          <Card className="border border-border bg-surface-card/20 p-6 sm:p-10 rounded-2xl shadow-sm overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent pointer-events-none"></div>
            
            {/* Simulation UI panel */}
            <div className="grid md:grid-cols-5 gap-8 items-center relative z-10">
              <div className="md:col-span-2 space-y-4">
                <h3 className="font-serif text-2xl text-ink-dark leading-tight">Developer-First Control Panel</h3>
                <p className="text-xs sm:text-sm text-ink-medium leading-relaxed font-light">
                  A simple workflow to organize your project assets. Generate unique credentials, configure CORS origins, and view analytics in real-time.
                </p>
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center gap-2 text-xs text-ink-muted">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <span>Project-wise CORS origins whitelist</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-ink-muted">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <span>Automatic folder isolation prefix</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-ink-muted">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <span>Hashed API tokens for backend security</span>
                  </div>
                </div>
              </div>

              {/* Code Snippet Card */}
              <div className="md:col-span-3 bg-[#1c1917] border border-surface-dark-elevated rounded-xl overflow-hidden shadow-md text-ink-soft">
                <div className="bg-surface-dark-elevated px-4 py-2 border-b border-surface-dark-elevated flex items-center justify-between text-[11px] font-mono">
                  <span className="flex items-center gap-1.5 font-sans">
                    <Terminal className="h-3 w-3 text-primary" /> upload-asset.sh
                  </span>
                  <span className="text-primary">cURL</span>
                </div>
                <pre className="p-4 font-mono text-[10px] sm:text-xs text-[#efe9de] overflow-x-auto leading-relaxed">
{`curl -X POST "${origin}/api/upload" \\
  -H "Authorization: Bearer sk_proj_live_8f3d9a..." \\
  -F "file=@landscape.jpg" \\
  -F "folder=blog-assets"`}
                </pre>
              </div>
            </div>
          </Card>
        </section>

        {/* Feature Grid */}
        <section id="features" className="max-w-5xl mx-auto px-6 py-20">
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-3xl font-serif text-ink-dark">Engineered for Reliability</h2>
            <p className="text-sm text-ink-muted max-w-md mx-auto">Everything you need to deliver assets at scale without the developer overhead.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 border border-border bg-surface-card/30 rounded-xl space-y-4">
              <div className="w-10 h-10 rounded-lg bg-surface-card flex items-center justify-center text-primary">
                <Database className="h-5 w-5" />
              </div>
              <h4 className="font-serif text-lg text-ink-dark font-medium">Cloudinary Backend</h4>
              <p className="text-xs text-ink-muted leading-relaxed font-light">
                Utilize Cloudinary's high-performance edge networks. Optimize, crop, and deliver images seamlessly.
              </p>
            </Card>

            <Card className="p-6 border border-border bg-surface-card/30 rounded-xl space-y-4">
              <div className="w-10 h-10 rounded-lg bg-surface-card flex items-center justify-center text-primary">
                <Shield className="h-5 w-5" />
              </div>
              <h4 className="font-serif text-lg text-ink-dark font-medium">Project CORS</h4>
              <p className="text-xs text-ink-muted leading-relaxed font-light">
                Restrict origin access on a project level. Prevent client-side token leakage and unauthorized access.
              </p>
            </Card>

            <Card className="p-6 border border-border bg-surface-card/30 rounded-xl space-y-4">
              <div className="w-10 h-10 rounded-lg bg-surface-card flex items-center justify-center text-primary">
                <Key className="h-5 w-5" />
              </div>
              <h4 className="font-serif text-lg text-ink-dark font-medium">Token Guard</h4>
              <p className="text-xs text-ink-muted leading-relaxed font-light">
                Generate hashed, cryptographically secure project API keys. Manage access and permissions directly.
              </p>
            </Card>

            <Card className="p-6 border border-border bg-surface-card/30 rounded-xl space-y-4">
              <div className="w-10 h-10 rounded-lg bg-surface-card flex items-center justify-center text-primary">
                <Folder className="h-5 w-5" />
              </div>
              <h4 className="font-serif text-lg text-ink-dark font-medium">Folder Isolation</h4>
              <p className="text-xs text-ink-muted leading-relaxed font-light">
                Keep project uploads cleanly segregated under unique root namespaces with zero directory overlap.
              </p>
            </Card>

            <Card className="p-6 border border-border bg-surface-card/30 rounded-xl space-y-4">
              <div className="w-10 h-10 rounded-lg bg-surface-card flex items-center justify-center text-primary">
                <Brain className="h-5 w-5" />
              </div>
              <h4 className="font-serif text-lg text-ink-dark font-medium">AI-Ready Prompts</h4>
              <p className="text-xs text-ink-muted leading-relaxed font-light">
                Generate master helper injection prompts dynamically. Copy specs instantly so Cursor or Claude can write correct API integrations.
              </p>
            </Card>

            <Card className="p-6 border border-border bg-surface-card/30 rounded-xl space-y-4">
              <div className="w-10 h-10 rounded-lg bg-surface-card flex items-center justify-center text-primary">
                <Cpu className="h-5 w-5" />
              </div>
              <h4 className="font-serif text-lg text-ink-dark font-medium">Stateless Gateway</h4>
              <p className="text-xs text-ink-muted leading-relaxed font-light">
                Stateless design ensures lightning-fast proxying. No heavy database sync or backend queue delays.
              </p>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-card/30 border-t border-border py-8 text-ink-muted text-xs">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-primary text-lg font-serif">✦</span>
            <span className="font-serif text-ink-dark tracking-normal text-sm md:text-base font-semibold">The DreamBit Labs</span>
          </div>
          <div>© {new Date().getFullYear()} D2 Storage. Built in style by <a href={creatorLink} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors underline font-medium">Dhairya Darji</a>.</div>
        </div>
      </footer>
    </div>
  );
}
