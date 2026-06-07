"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ToastContainer, Toast } from "@/components/ui/custom-toast";
import { Key, Plus, FolderKanban, LogOut, Copy, Loader2, Check } from "lucide-react";

/* ─── Types ─── */
interface Project {
  id: string;
  name: string;
  rootFolder: string;
  createdAt: string;
}

/* ─── Main ─── */
export default function DashboardPage() {
  const creatorLink = "https://www.linkedin.com/in/dhairya-darji-072428284/?skipRedirect=true";
  const router = useRouter();
  const [masterKey, setMasterKey] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  // Success state for newly created project key display
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [createdProjectName, setCreatedProjectName] = useState("");
  const [showKeyCopied, setShowKeyCopied] = useState(false);

  // Custom Toast State
  const [toasts, setToasts] = useState<Toast[]>([]);
  const addToast = useCallback((message: string, type: "success" | "error" | "info" = "info") => {
    const newToast: Toast = { id: `toast_${Date.now()}_${Math.random()}`, message, type };
    setToasts(prev => [...prev, newToast]);
  }, []);
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("master_key_session");
    if (saved) {
      try {
        const item = JSON.parse(saved);
        if (item.expiresAt > Date.now()) {
          setMasterKey(item.key);
          setAuthenticated(true);
        } else {
          localStorage.removeItem("master_key_session");
        }
      } catch (e) {
        localStorage.removeItem("master_key_session");
      }
    }
  }, []);

  const handleLogin = (keyToUse = masterKey) => {
    if (!keyToUse.trim()) return;
    const session = {
      key: keyToUse.trim(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 1 day TTL
    };
    localStorage.setItem("master_key_session", JSON.stringify(session));
    setMasterKey(keyToUse.trim());
    setAuthenticated(true);
    addToast("Successfully authenticated session.", "success");
  };

  const handleLogout = () => {
    localStorage.removeItem("master_key_session");
    setMasterKey("");
    setAuthenticated(false);
    window.location.reload();
  };

  const headers = useCallback(() => ({ Authorization: `Bearer ${masterKey}` }), [masterKey]);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects", { headers: headers() });
      if (res.ok) setProjects((await res.json()).projects);
    } catch (err) {
      console.error(err);
      addToast("Failed to retrieve projects.", "error");
    } finally {
      setLoading(false);
    }
  }, [headers, addToast]);

  useEffect(() => { if (authenticated) fetchProjects(); }, [authenticated, fetchProjects]);

  /* ── Login ── */
  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
        <Card className="w-full max-w-md p-8 border border-border bg-canvas shadow-none space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface-card text-primary mb-2">
              <Key className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-serif text-ink-dark font-normal tracking-tight">D2 Storage</h1>
            <p className="text-ink-medium text-sm leading-relaxed max-w-xs mx-auto">
              Access your warm, reliable, and zero-setup cloud asset library.
            </p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="master-key" className="text-xs font-semibold text-ink-muted uppercase tracking-wider block">Master Password</label>
              <Input
                id="master-key"
                type="password"
                placeholder="••••••••"
                value={masterKey}
                onChange={e => setMasterKey(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                className="bg-canvas border-border focus:border-primary focus:ring-1 focus:ring-primary text-sm h-11"
              />
            </div>
            <Button
              onClick={() => handleLogin()}
              className="w-full bg-primary hover:bg-primary-active text-white font-medium h-11 transition-colors"
            >
              Sign In
            </Button>
            <p className="text-[11px] text-ink-soft text-center pt-2">
              Session expires automatically after 24 hours.
            </p>
          </div>
        </Card>
        <ToastContainer toasts={toasts} onClose={removeToast} />
      </div>
    );
  }

  /* ── Projects list ── */
  return (
    <div className="min-h-screen bg-canvas text-ink-dark flex flex-col justify-between">
      <div>
        <header className="border-b border-border bg-canvas px-6 py-4 flex items-center justify-between sticky top-0 z-50">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-primary font-serif text-xl">✦</span>
            <h1 className="font-serif text-2xl font-normal tracking-tight text-ink-dark">D2 Storage</h1>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="border-border text-ink-medium hover:bg-surface-card hover:text-ink-dark transition-colors gap-1.5"
          >
            <LogOut className="h-4 w-4" /> Disconnect
          </Button>
        </header>

        <main className="max-w-4xl mx-auto p-6 md:p-10 space-y-8">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-3xl font-serif text-ink-dark tracking-tight">Your Projects</h2>
              <p className="text-sm text-ink-muted mt-1">Select an existing workspace or spin up a new container.</p>
            </div>
            <CreateProjectDialog
              onCreated={(projectName, key, projectId) => {
                fetchProjects();
                setCreatedProjectName(projectName);
                setNewlyCreatedKey(key);
                addToast(`Project "${projectName}" created!`, "success");
                
                // Store project key locally so client dashboard can prefill snippets automatically
                try {
                  const savedKeys = JSON.parse(localStorage.getItem("d2_project_keys") || "{}");
                  savedKeys[projectId] = key;
                  localStorage.setItem("d2_project_keys", JSON.stringify(savedKeys));
                } catch (err) {
                  console.error(err);
                }
              }}
              masterKey={masterKey}
            />
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-ink-muted">Fetching projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <Card className="text-center py-20 border-2 border-dashed border-border bg-canvas rounded-xl shadow-none">
              <FolderKanban className="h-12 w-12 mx-auto mb-4 text-primary opacity-50" />
              <h3 className="text-lg font-serif text-ink-dark">No active projects</h3>
              <p className="text-sm text-ink-muted max-w-xs mx-auto mt-2">
                Create a project to provision folders, manage assets, and generate authorization credentials.
              </p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {projects.map(p => (
                <Card
                  key={p.id}
                  className="p-6 border border-border bg-surface-card/30 hover:bg-surface-card/60 transition-all cursor-pointer shadow-none flex flex-col justify-between group rounded-xl"
                  onClick={() => router.push(`/dashboard/${p.id}`)}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-4 min-w-0">
                      <h3 className="font-serif text-xl text-ink-dark tracking-tight group-hover:text-primary transition-colors truncate max-w-[220px]" title={p.name}>{p.name}</h3>
                      <Badge className="bg-primary hover:bg-primary text-white rounded-md text-[10px] uppercase font-semibold px-2 py-0.5 tracking-wider shrink-0">Active</Badge>
                    </div>
                    <div className="text-xs text-ink-muted font-mono pt-1 flex flex-col gap-1 min-w-0">
                      <span className="truncate" title={p.rootFolder}>Folder: {p.rootFolder}</span>
                      <span>Created: {new Date(p.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-between items-center text-xs font-semibold uppercase text-primary tracking-wider">
                    <span>Open Dashboard</span>
                    <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Newly Created Key Modal */}
      <Dialog open={!!newlyCreatedKey} onOpenChange={(open) => { if (!open) setNewlyCreatedKey(null); }}>
        <DialogContent className="max-w-md border border-border bg-canvas text-ink-dark">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl font-normal text-ink-dark">
              Project Credentials Created!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <p className="text-sm text-ink-medium">
              The default API key for your new project <span className="font-semibold">{createdProjectName}</span> has been generated. 
            </p>
            <div className="bg-ink-dark p-4 rounded-lg text-canvas font-mono text-xs space-y-2 relative overflow-hidden">
              <span className="text-[10px] text-ink-soft uppercase font-sans font-semibold tracking-wider">API KEY (Copy now)</span>
              <div className="break-all select-all font-mono text-primary text-sm pr-10">{newlyCreatedKey}</div>
              <button 
                onClick={() => {
                  if (newlyCreatedKey) {
                    navigator.clipboard.writeText(newlyCreatedKey);
                    setShowKeyCopied(true);
                    addToast("API key copied to clipboard!", "success");
                    setTimeout(() => setShowKeyCopied(false), 2000);
                  }
                }}
                className="absolute top-4 right-4 text-ink-soft hover:text-canvas transition-colors"
                title="Copy Key"
              >
                {showKeyCopied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs leading-relaxed">
              ⚠️ <span className="font-semibold">Credentials Info</span>: This key is saved in your local session and can be accessed or managed anytime inside the project dashboard settings.
            </div>
          </div>
          <DialogFooter>
            <Button 
              className="bg-primary hover:bg-primary-active text-white" 
              onClick={() => setNewlyCreatedKey(null)}
            >
              Done, I saved it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ToastContainer toasts={toasts} onClose={removeToast} />

      <footer className="bg-surface-card/30 border-t border-border py-8 text-ink-muted text-xs">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-primary text-lg font-serif">✦</span>
            <span className="font-serif text-ink-dark tracking-normal text-sm md:text-base font-semibold">The DreamBit Labs</span>
          </Link>
          <div>© {new Date().getFullYear()} D2 Storage. Built in style by <a href={creatorLink} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors underline font-medium">Dhairya Darji</a>.</div>
        </div>
      </footer>
    </div>
  );
}

/* ─── Create Project Dialog ─── */
function CreateProjectDialog({ onCreated, masterKey }: { onCreated: (name: string, key: string, id: string) => void; masterKey: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [rootFolder, setRootFolder] = useState("");
  const [creating, setCreating] = useState(false);

  const create = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${masterKey}` },
        body: JSON.stringify({ 
          name: name.trim(),
          rootFolder: rootFolder.trim() || undefined
        }),
      });
      if (res.ok) {
        const data = await res.json();
        onCreated(name.trim(), data.apiKey, data.id);
        setName("");
        setRootFolder("");
        setOpen(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button className="bg-primary hover:bg-primary-active text-white flex items-center gap-1.5 transition-colors">
          <Plus className="h-4 w-4" /> New Project
        </Button>
      } />
      <DialogContent className="border border-border bg-canvas text-ink-dark">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-normal text-ink-dark">Create Project</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Project Name</label>
            <Input 
              placeholder="e.g. My Website App" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="bg-canvas border-border focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-ink-muted uppercase tracking-wider flex items-center justify-between">
              <span>Cloudinary Root Folder (Optional)</span>
              <span className="text-[10px] text-ink-soft capitalize font-normal">Prefixes with dreambit/</span>
            </label>
            <Input 
              placeholder="e.g. hackathon-assets" 
              value={rootFolder} 
              onChange={e => setRootFolder(e.target.value)} 
              className="bg-canvas border-border focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <Button 
            className="w-full bg-primary hover:bg-primary-active text-white mt-2" 
            onClick={create} 
            disabled={creating || !name.trim()}
          >
            {creating ? "Creating workspace & API key..." : "Create Project"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
