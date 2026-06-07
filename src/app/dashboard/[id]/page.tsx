"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ToastContainer, Toast } from "@/components/ui/custom-toast";
import { Key, Plus, LogOut, Copy, Eye, Trash2, Loader2, Upload, ChevronRight, File, Image, FileText, Video, Folder, Terminal, Code, ArrowLeft, FolderPlus, Check } from "lucide-react";

/* ─── Types ─── */
interface Project {
  id: string;
  name: string;
  rootFolder: string;
  createdAt: string;
  corsAllowedOrigins?: string[];
}
interface FileItem {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  resource_type: string;
  provider_id: string;
}

/* ─── Helpers ─── */
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ type }: { type: string }) {
  if (type === "image") return <Image className="h-8 w-8 text-primary" />;
  if (type === "video") return <Video className="h-8 w-8 text-indigo-500" />;
  if (type === "raw") return <FileText className="h-8 w-8 text-ink-muted" />;
  return <File className="h-8 w-8 text-ink-muted" />;
}

function canPreview(type: string): boolean {
  return type === "image" || type === "video";
}

/* ─── Project Detail Page ─── */
export default function ProjectPage() {
  const creatorLink = "https://www.linkedin.com/in/dhairya-darji-072428284/?skipRedirect=true";
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [masterKey, setMasterKey] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [projectLoading, setProjectLoading] = useState(true);

  // File system states
  const [activeTab, setActiveTab] = useState<"assets" | "integration" | "settings">("assets");
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [subfolder, setSubfolder] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showAiPromptModal, setShowAiPromptModal] = useState(false);
  const [showPromptCopied, setShowPromptCopied] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<FileItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [projectApiKey, setProjectApiKey] = useState<string | null>(null);

  // Settings states
  const [corsWildcard, setCorsWildcard] = useState(true);
  const [allowedOriginsList, setAllowedOriginsList] = useState<string[]>([]);
  const [newOriginInput, setNewOriginInput] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);
  const [showDeleteProjectModal, setShowDeleteProjectModal] = useState(false);
  const [deletingProject, setDeletingProject] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);
  const [deletingFolder, setDeletingFolder] = useState(false);

  // Load project API key from localStorage
  const apiBase = (process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "")) + "/api";

  useEffect(() => {
    if (!projectId) return;
    try {
      const savedKeys = JSON.parse(localStorage.getItem("d2_project_keys") || "{}");
      if (savedKeys[projectId]) {
        setProjectApiKey(savedKeys[projectId]);
      }
    } catch (err) {
      console.error("Failed to load project api key", err);
    }
  }, [projectId]);

  // Custom Toast State
  const [toasts, setToasts] = useState<Toast[]>([]);
  const addToast = useCallback((message: string, type: "success" | "error" | "info" = "info") => {
    const newToast: Toast = { id: `toast_${Date.now()}_${Math.random()}`, message, type };
    setToasts(prev => [...prev, newToast]);
  }, []);
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Check login
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
          router.push("/dashboard");
        }
      } catch (e) {
        localStorage.removeItem("master_key_session");
        router.push("/dashboard");
      }
    } else {
      router.push("/dashboard");
    }
  }, [router]);

  const headers = useCallback(() => ({ Authorization: `Bearer ${masterKey}` }), [masterKey]);

  // Fetch Project metadata
  useEffect(() => {
    if (!authenticated || !projectId) return;
    const loadProject = async () => {
      setProjectLoading(true);
      try {
        const res = await fetch("/api/projects", { headers: headers() });
        if (res.ok) {
          const data = await res.json();
          const match = data.projects.find((p: Project) => p.id === projectId);
          if (match) {
            setProject(match);
            const allowed = match.corsAllowedOrigins || ["*"];
            const isWildcard = allowed.includes("*");
            setCorsWildcard(isWildcard);
            setAllowedOriginsList(allowed.filter((x: string) => x !== "*"));
          } else {
            addToast("Project not found.", "error");
            setTimeout(() => router.push("/dashboard"), 2000);
          }
        } else if (res.status === 401) {
          addToast("Session expired or invalid. Please log in again.", "error");
          localStorage.removeItem("master_key_session");
          router.push("/dashboard");
        } else {
          addToast(`Server error (${res.status}). Check server logs.`, "error");
        }
      } catch (err) {
        console.error(err);
        addToast("Error fetching project.", "error");
      } finally {
        setProjectLoading(false);
      }
    };
    loadProject();
  }, [authenticated, projectId, headers, router, addToast]);

  const projectHeaders = useCallback(() => ({
    Authorization: `Bearer ${masterKey}`,
  }), [masterKey]);

  // Fetch folders list
  const fetchFolders = useCallback(async () => {
    if (!project) return;
    try {
      const res = await fetch(`/api/folders?projectId=${project.id}`, { headers: projectHeaders() });
      if (res.ok) {
        const data = await res.json();
        setFolders(data.folders || []);
      }
    } catch (err) {
      console.error(err);
    }
  }, [project, projectHeaders]);

  // Fetch files list
  const fetchFiles = useCallback(async (cursor?: string) => {
    if (!project) return;
    setLoadingFiles(true);
    const params = new URLSearchParams();
    params.set("projectId", project.id);
    if (subfolder) params.set("folder", subfolder);
    if (cursor) params.set("cursor", cursor);
    try {
      const res = await fetch(`/api/files?${params}`, { headers: projectHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (cursor) setFiles(prev => [...prev, ...data.files]);
        else setFiles(data.files);
        setNextCursor(data.nextCursor);
      }
    } catch (err) {
      console.error(err);
      addToast("Failed to retrieve files.", "error");
    } finally {
      setLoadingFiles(false);
    }
  }, [project, projectHeaders, subfolder, addToast]);

  useEffect(() => { 
    if (project) {
      fetchFiles(); 
      fetchFolders(); 
    }
  }, [project, fetchFiles, fetchFolders]);

  const deleteAFile = async (file: FileItem) => {
    setFileToDelete(file);
  };

  const confirmDeleteAction = async () => {
    if (!fileToDelete) return;
    setDeleting(true);
    const type = fileToDelete.resource_type || "";
    try {
      const res = await fetch(`/api/files/${fileToDelete.provider_id}?type=${type}`, {
        method: "DELETE", headers: projectHeaders(),
      });
      if (res.ok) {
        setFiles(prev => prev.filter(f => f.id !== fileToDelete.id));
        addToast("Asset deleted successfully.", "success");
      } else {
        addToast("Failed to delete asset.", "error");
      }
    } catch (e) {
      console.error(e);
      addToast("Error deleting asset.", "error");
    } finally {
      setDeleting(false);
      setFileToDelete(null);
    }
  };

  const createNewFolder = async () => {
    if (!newFolderName.trim() || !project) return;
    setCreatingFolder(true);
    try {
      const res = await fetch(`/api/folders?projectId=${project.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...projectHeaders() },
        body: JSON.stringify({ name: newFolderName.trim() }),
      });
      if (res.ok) {
        addToast(`Folder "${newFolderName}" created!`, "success");
        setNewFolderName("");
        setShowNewFolderModal(false);
        fetchFolders();
      } else {
        addToast("Failed to create folder.", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Error creating folder.", "error");
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleAddOrigin = () => {
    const trimmed = newOriginInput.trim();
    if (!trimmed) return;

    if (!/^https?:\/\//i.test(trimmed)) {
      addToast("Origin must begin with http:// or https://", "error");
      return;
    }

    try {
      const url = new URL(trimmed);
      const origin = url.origin;
      
      if (allowedOriginsList.includes(origin)) {
        addToast("Origin already exists in the list.", "info");
        return;
      }

      setAllowedOriginsList(prev => [...prev, origin]);
      setNewOriginInput("");
      addToast(`Added origin: ${origin}`, "success");
    } catch {
      addToast("Invalid URL or origin format.", "error");
    }
  };

  const handleRemoveOrigin = (origin: string) => {
    setAllowedOriginsList(prev => prev.filter(o => o !== origin));
    addToast(`Removed origin: ${origin}`, "info");
  };

  const handleSaveSettings = async () => {
    if (!project) return;
    setSavingSettings(true);
    try {
      const allowed = corsWildcard 
        ? ["*"] 
        : allowedOriginsList;

      if (allowed.length === 0 && !corsWildcard) {
        addToast("Please specify at least one origin or allow public access.", "error");
        setSavingSettings(false);
        return;
      }

      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${masterKey}`,
        },
        body: JSON.stringify({
          corsAllowedOrigins: allowed,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setProject(data.project);
        addToast("CORS settings updated successfully.", "success");
      } else {
        addToast("Failed to save CORS settings.", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Error updating settings.", "error");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!project) return;
    setDeletingProject(true);
    try {
      const res = await fetch(`/api/projects?id=${project.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${masterKey}`,
        },
      });

      if (res.ok) {
        addToast(`Project "${project.name}" deleted successfully.`, "success");
        setShowDeleteProjectModal(false);
        router.push("/dashboard");
      } else {
        addToast("Failed to delete project.", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Error deleting project.", "error");
    } finally {
      setDeletingProject(false);
    }
  };

  const confirmDeleteFolder = async () => {
    if (!folderToDelete || !project) return;
    setDeletingFolder(true);
    try {
      const res = await fetch(`/api/folders?projectId=${project.id}&name=${encodeURIComponent(folderToDelete)}`, {
        method: "DELETE",
        headers: projectHeaders(),
      });
      if (res.ok) {
        addToast(`Folder "${folderToDelete}" and all its assets deleted successfully.`, "success");
        if (subfolder === folderToDelete) {
          setSubfolder("");
        }
        fetchFolders();
        fetchFiles();
      } else {
        addToast("Failed to delete folder.", "error");
      }
    } catch (e) {
      console.error(e);
      addToast("Error deleting folder.", "error");
    } finally {
      setDeletingFolder(false);
      setFolderToDelete(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("master_key_session");
    router.push("/dashboard");
    setTimeout(() => window.location.reload(), 100);
  };

  // Build breadcrumbs
  const renderBreadcrumbs = () => {
    return (
      <div className="flex items-center gap-1.5 text-xs text-ink-muted font-mono bg-surface-card/50 px-3 py-1.5 rounded-lg border border-border w-fit">
        <button 
          onClick={() => setSubfolder("")}
          className={`hover:text-primary font-semibold transition-colors`}
        >
          Root
        </button>
        {subfolder && (
          <>
            <span className="text-ink-soft">/</span>
            <span className="text-ink-dark">{subfolder}</span>
          </>
        )}
      </div>
    );
  };

  if (projectLoading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-canvas">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
        <p className="text-sm font-medium text-ink-muted">Loading workspace...</p>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="min-h-screen bg-canvas text-ink-dark flex flex-col justify-between">
      <div>
        <header className="border-b border-border bg-canvas px-6 py-4 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-3 min-w-0">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push("/dashboard")}
              className="text-ink-muted hover:bg-surface-card hover:text-ink-dark shrink-0"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Projects
            </Button>
            <div className="h-4 w-[1px] bg-[#e6dfd8] shrink-0"></div>
            <h1 className="text-xl font-serif text-ink-dark font-normal tracking-tight truncate max-w-[150px] sm:max-w-[300px]" title={project.name}>{project.name}</h1>
            <span className="text-xs font-mono text-ink-muted hidden md:inline-block bg-surface-card px-2 py-0.5 rounded border border-border truncate max-w-[150px] sm:max-w-[250px]" title={project.rootFolder}>
              {project.rootFolder}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="border-border hover:bg-surface-card shrink-0">
            <LogOut className="h-4 w-4" />
          </Button>
        </header>

        <div className="max-w-5xl mx-auto p-6 space-y-6">
          {/* Tab selectors */}
          <div className="flex border-b border-border gap-2">
            <button
              onClick={() => setActiveTab("assets")}
              className={`px-4 py-2 text-sm font-medium tracking-tight border-b-2 transition-all ${
                activeTab === "assets" 
                  ? "border-primary text-primary" 
                  : "border-transparent text-ink-muted hover:text-ink-dark"
              }`}
            >
              Assets & Folders
            </button>
            <button
              onClick={() => setActiveTab("integration")}
              className={`px-4 py-2 text-sm font-medium tracking-tight border-b-2 transition-all ${
                activeTab === "integration" 
                  ? "border-primary text-primary" 
                  : "border-transparent text-ink-muted hover:text-ink-dark"
              }`}
            >
              Integration Guide
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`px-4 py-2 text-sm font-medium tracking-tight border-b-2 transition-all ${
                activeTab === "settings" 
                  ? "border-primary text-primary" 
                  : "border-transparent text-ink-muted hover:text-ink-dark"
              }`}
            >
              CORS & Settings
            </button>
          </div>

          {activeTab === "assets" && (
            <div className="grid md:grid-cols-[260px_1fr] gap-8">
              {/* Sidebar: Subfolders, Upload and create folder */}
              <aside className="space-y-6">
                <Card className="p-5 border border-border bg-surface-card/10 shadow-none space-y-4 rounded-xl">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <h3 className="text-xs font-bold text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
                      <Folder className="h-4.5 w-4.5 text-primary" /> Folders
                    </h3>
                    <Dialog open={showNewFolderModal} onOpenChange={setShowNewFolderModal}>
                      <DialogTrigger render={
                        <button className="text-primary hover:text-primary-active" title="Create Folder">
                          <FolderPlus className="h-4 w-4" />
                        </button>
                      } />
                      <DialogContent className="border border-border bg-canvas text-ink-dark">
                        <DialogHeader>
                          <DialogTitle className="font-serif text-xl">Create Subfolder</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3 pt-2">
                          <Input 
                            placeholder="e.g. avatars" 
                            value={newFolderName} 
                            onChange={e => setNewFolderName(e.target.value)} 
                            className="bg-canvas border-border focus:border-primary"
                          />
                          <Button 
                            className="w-full bg-primary hover:bg-primary-active text-white"
                            onClick={createNewFolder}
                            disabled={creatingFolder || !newFolderName.trim()}
                          >
                            {creatingFolder ? "Creating..." : "Create Folder"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="space-y-1 max-h-[220px] overflow-y-auto">
                    <button
                      onClick={() => setSubfolder("")}
                      className={`w-full text-left px-3 py-2 text-xs rounded-lg font-mono transition-colors border flex items-center gap-2 ${
                        !subfolder 
                          ? "bg-surface-card text-ink-dark border-border" 
                          : "border-transparent hover:bg-surface-card/50 text-ink-medium"
                      }`}
                    >
                      <Folder className="h-3.5 w-3.5 shrink-0" /> [Root]
                    </button>
                    {folders.map(f => (
                      <div 
                        key={f} 
                        className={`group/folder flex items-center justify-between rounded-lg border transition-colors ${
                          subfolder === f 
                            ? "bg-surface-card border-border" 
                            : "border-transparent hover:bg-surface-card/50"
                        }`}
                      >
                        <button
                          onClick={() => setSubfolder(f)}
                          className="flex-1 text-left px-3 py-2 text-xs font-mono flex items-center gap-2 truncate text-ink-medium hover:text-ink-dark cursor-pointer"
                        >
                          <Folder className="h-3.5 w-3.5 shrink-0 text-primary" /> {f}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFolderToDelete(f);
                          }}
                          className="p-1.5 mr-1 text-ink-soft hover:text-red-600 rounded opacity-0 group-hover/folder:opacity-100 focus:opacity-100 transition-opacity cursor-pointer"
                          title="Delete folder and all assets inside"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    {folders.length === 0 && (
                      <p className="text-[11px] text-ink-soft text-center py-4">No folders created yet.</p>
                    )}
                  </div>
                </Card>

                <UploadCard 
                  projectId={project.id} 
                  masterKey={masterKey} 
                  subfolder={subfolder} 
                  onUploaded={(newFile) => {
                    if (newFile) {
                      setFiles(prev => [newFile, ...prev]);
                      addToast(`File uploaded successfully.`, "success");
                    } else {
                      addToast(`File uploaded!`, "success");
                    }
                    setTimeout(() => {
                      fetchFiles();
                      fetchFolders();
                    }, 2000);
                  }} 
                />
              </aside>

              {/* Main files grid */}
              <main className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
                  <div className="space-y-1">
                    {renderBreadcrumbs()}
                  </div>
                  <Badge variant="outline" className="border-border text-ink-muted w-fit font-mono font-normal">
                    {files.length} {files.length === 1 ? "File" : "Files"}
                  </Badge>
                </div>

                {loadingFiles && files.length === 0 ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : files.length === 0 ? (
                  <div className="text-center py-20 border border-dashed border-border rounded-xl bg-canvas">
                    <Upload className="h-10 w-10 mx-auto mb-3 text-primary opacity-40" />
                    <p className="text-sm font-serif text-ink-dark">No files in this folder</p>
                    <p className="text-xs text-ink-muted mt-1">Upload a file to start serving assets.</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {files.map(f => (
                      <div 
                        key={f.id} 
                        className="p-4 border border-border bg-canvas hover:bg-surface-card/20 transition-all rounded-xl shadow-none flex flex-row items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="p-2 bg-surface-card/50 rounded-lg shrink-0 border border-border">
                            <FileIcon type={f.resource_type} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-medium truncate text-ink-dark" title={f.name}>{f.name}</h4>
                            <p className="text-xs text-ink-muted font-mono mt-0.5">{formatSize(f.size)}</p>
                          </div>
                        </div>

                        <div className="flex shrink-0">
                          {canPreview(f.resource_type) && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => setPreviewFile(f)} 
                              className="h-8 w-8 text-ink-muted hover:text-ink-dark hover:bg-surface-card"
                              title="Preview"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => {
                              const absUrl = f.url.startsWith("/") 
                                ? `${window.location.origin}${f.url}` 
                                : f.url;
                              navigator.clipboard.writeText(absUrl);
                              addToast("Asset link copied to clipboard!", "success");
                            }} 
                            className="h-8 w-8 text-ink-muted hover:text-ink-dark hover:bg-surface-card"
                            title="Copy URL"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => deleteAFile(f)} 
                            className="h-8 w-8 text-ink-muted hover:text-red-600 hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {nextCursor && (
                  <Button 
                    variant="outline" 
                    className="w-full border-border text-ink-medium hover:bg-surface-card mt-4" 
                    onClick={() => fetchFiles(nextCursor)} 
                    disabled={loadingFiles}
                  >
                    {loadingFiles ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
                    Load More
                  </Button>
                )}
              </main>
            </div>
          )}

          {activeTab === "integration" && (
            /* Integration Guide Tab */
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                  <h3 className="text-lg font-serif text-ink-dark tracking-tight">API Integration</h3>
                  <p className="text-sm text-ink-muted mt-1">Connect your code directly using our endpoints and standard authorization.</p>
                </div>
                <Button 
                  onClick={() => setShowAiPromptModal(true)}
                  className="bg-primary hover:bg-primary-active text-white shrink-0 text-xs font-semibold uppercase tracking-wider h-9 px-4 rounded-xl flex items-center gap-1.5"
                >
                  ✨ AI Integration Prompt
                </Button>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Integration Credentials card */}
                <Card className="p-6 border border-border bg-surface-card/20 shadow-none space-y-4 rounded-xl">
                  <h4 className="text-xs font-bold text-ink-muted uppercase tracking-wider">Workspace Parameters</h4>
                  <div className="space-y-3 text-xs">
                    <div className="flex flex-col gap-1 border-b border-border pb-2.5">
                      <span className="text-ink-soft uppercase font-semibold tracking-wider text-[10px]">Project ID</span>
                      <span className="font-mono text-ink-dark select-all">{project.id}</span>
                    </div>
                    <div className="flex flex-col gap-1 border-b border-border pb-2.5">
                      <span className="text-ink-soft uppercase font-semibold tracking-wider text-[10px]">Active Root Folder</span>
                      <span className="font-mono text-ink-dark">{project.rootFolder}{subfolder ? `/${subfolder}` : ""}</span>
                    </div>
                    <div className="flex flex-col gap-1 border-b border-border pb-2.5">
                      <span className="text-ink-soft uppercase font-semibold tracking-wider text-[10px]">Base API URL</span>
                      <span className="font-mono text-ink-dark">{typeof window !== "undefined" ? window.location.origin : ""}/api</span>
                    </div>
                    {projectApiKey && (
                      <div className="flex flex-col gap-1 pt-1">
                        <span className="text-ink-soft uppercase font-semibold tracking-wider text-[10px] flex items-center justify-between">
                          <span>Project API Key</span>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(projectApiKey);
                              addToast("API Key copied to clipboard!", "success");
                            }}
                            className="hover:text-primary text-[10px] text-primary flex items-center gap-1 font-sans font-normal uppercase"
                          >
                            <Copy className="h-3 w-3" /> Copy
                          </button>
                        </span>
                        <span className="font-mono text-primary break-all select-all font-semibold text-[11px]">{projectApiKey}</span>
                      </div>
                    )}
                  </div>
                </Card>

                {/* API Auth Notice */}
                <Card className="p-6 border border-l-4 border-l-primary border-border bg-surface-card/10 shadow-none space-y-3 rounded-xl flex flex-col justify-between">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Authentication Protocol</h4>
                    <p className="text-xs text-ink-medium leading-relaxed">
                      All endpoints require standard HTTP Bearer authorization headers using the project API key created for this workspace:
                    </p>
                    <code className="block bg-surface-card/50 p-2 border border-border font-mono text-[11px] rounded-lg text-primary break-all">
                      Authorization: Bearer {projectApiKey || "<YOUR_PROJECT_API_KEY>"}
                    </code>
                  </div>
                  <p className="text-[10px] text-ink-soft leading-tight mt-3">
                    If you did not copy the key upon creation, generate another by using the project's keys endpoint or recreate the workspace.
                  </p>
                </Card>

                {/* Folder upload parameter notice */}
                <Card className="p-6 border border-border bg-surface-card/20 shadow-none space-y-3 rounded-xl flex flex-col justify-between">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-ink-muted uppercase tracking-wider">Targeting Folders</h4>
                    <p className="text-xs text-ink-medium leading-relaxed">
                      To upload files directly into a specific folder path (e.g. `avatars` or `docs/images`), add a `folder` field to your upload `FormData` request:
                    </p>
                    <code className="block bg-surface-card/50 p-2 border border-border font-mono text-[11px] rounded-lg text-primary">
                      folder: "folder_name"
                    </code>
                  </div>
                  <p className="text-[10px] text-ink-soft leading-tight mt-3">
                    Files will be stored and served under: <br />
                    <span className="font-mono text-[9px] text-primary">{project.rootFolder}/folder_name</span>
                  </p>
                </Card>
              </div>

              {/* Concrete Folder Example panel */}
              <div className="bg-surface-card/30 p-5 rounded-xl border border-border space-y-3">
                <h4 className="text-xs font-bold text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Folder className="h-4 w-4 text-primary" /> Concrete Example: Targeting folder "xyz"
                </h4>
                <p className="text-xs text-ink-medium leading-relaxed">
                  If you want to manage assets inside a specific folder named <code className="bg-surface-card px-1.5 py-0.5 rounded font-mono text-xs text-primary">xyz</code>, the API requests are constructed as follows:
                </p>
                <div className="grid md:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <span className="text-[10px] text-ink-soft font-semibold uppercase tracking-wider">1. Uploading to "xyz"</span>
                    <pre className="p-3 bg-ink-dark text-[#efe9de] font-mono text-[10px] rounded-lg overflow-x-auto leading-relaxed">
{`POST ${typeof window !== "undefined" ? window.location.origin : ""}/api/upload?projectId=${project.id}
Headers:
  Authorization: Bearer ${projectApiKey || "<YOUR_API_KEY>"}
Body (FormData):
  file: [binary]
  folder: "xyz"`}
                    </pre>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-ink-soft font-semibold uppercase tracking-wider">2. Listing files in "xyz"</span>
                    <pre className="p-3 bg-ink-dark text-[#efe9de] font-mono text-[10px] rounded-lg overflow-x-auto leading-relaxed">
{`GET ${typeof window !== "undefined" ? window.location.origin : ""}/api/files?projectId=${project.id}&folder=xyz
Headers:
  Authorization: Bearer ${projectApiKey || "<YOUR_API_KEY>"}`}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Code Panel */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Code className="h-4 w-4" /> Implementation Examples
                </h4>

                <div className="bg-ink-dark rounded-xl text-canvas border border-surface-dark-elevated overflow-hidden">
                  <div className="bg-surface-dark-elevated px-4 py-3 border-b border-surface-dark-elevated flex items-center justify-between text-xs text-ink-soft">
                    <div className="flex items-center gap-2 font-mono">
                      <Terminal className="h-3.5 w-3.5 text-primary" /> cURL — Upload Asset
                    </div>
                    <button 
                      onClick={() => {
                        const code = `curl -X POST \\\n  -H "Authorization: Bearer ${projectApiKey || "<YOUR_PROJECT_API_KEY>"}" \\\n  -F "file=@/path/to/file.png" \\\n  ${subfolder ? `-F "folder=${subfolder}" \\\n  ` : ""}"${typeof window !== "undefined" ? window.location.origin : ""}/api/upload?projectId=${project.id}"`;
                        navigator.clipboard.writeText(code);
                        addToast("cURL command copied to clipboard!", "success");
                      }}
                      className="hover:text-canvas flex items-center gap-1 transition-colors"
                    >
                      <Copy className="h-3 w-3" /> Copy
                    </button>
                  </div>
                  <pre className="p-4 font-mono text-[11px] md:text-xs overflow-x-auto text-[#efe9de] leading-relaxed">
                    {`curl -X POST \\\n  -H "Authorization: Bearer ${projectApiKey || "<YOUR_PROJECT_API_KEY>"}" \\\n  -F "file=@/path/to/file.png" \\`}
                    {subfolder ? `\n  -F "folder=${subfolder}" \\` : ""}
                    {`\n  "${typeof window !== "undefined" ? window.location.origin : ""}/api/upload?projectId=${project.id}"`}
                  </pre>
                </div>

                <div className="bg-ink-dark rounded-xl text-canvas border border-surface-dark-elevated overflow-hidden">
                  <div className="bg-surface-dark-elevated px-4 py-3 border-b border-surface-dark-elevated flex items-center justify-between text-xs text-ink-soft">
                    <div className="flex items-center gap-2 font-mono">
                      <Code className="h-3.5 w-3.5 text-primary" /> JS / Fetch — List Assets
                    </div>
                    <button 
                      onClick={() => {
                        const code = `fetch("${typeof window !== "undefined" ? window.location.origin : ""}/api/files?projectId=${project.id}${subfolder ? `&folder=${subfolder}` : ""}", {\n  headers: {\n    "Authorization": "Bearer ${projectApiKey || "<YOUR_PROJECT_API_KEY>"}"\n  }\n})\n.then(res => res.json())\n.then(data => console.log(data.files));`;
                        navigator.clipboard.writeText(code);
                        addToast("JS Fetch code copied to clipboard!", "success");
                      }}
                      className="hover:text-canvas flex items-center gap-1 transition-colors"
                    >
                      <Copy className="h-3 w-3" /> Copy
                    </button>
                  </div>
                  <pre className="p-4 font-mono text-[11px] md:text-xs overflow-x-auto text-[#efe9de] leading-relaxed">
{`fetch("${typeof window !== "undefined" ? window.location.origin : ""}/api/files?projectId=${project.id}${subfolder ? `&folder=${subfolder}` : ""}", {
  headers: {
    "Authorization": "Bearer ${projectApiKey || "<YOUR_PROJECT_API_KEY>"}"
  }
})
.then(res => res.json())
.then(data => console.log(data.files));`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <h3 className="text-lg font-serif text-ink-dark tracking-tight">CORS Configuration</h3>
                <p className="text-sm text-ink-muted mt-1">Restrict which client-side domains or origins are allowed to request resources directly from this project.</p>
              </div>

              <Card className="p-6 border border-border bg-surface-card/10 shadow-none space-y-6 rounded-xl max-w-2xl">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox"
                      id="cors-wildcard"
                      checked={corsWildcard}
                      onChange={e => setCorsWildcard(e.target.checked)}
                      className="h-4.5 w-4.5 rounded border-border text-primary focus:ring-primary cursor-pointer"
                    />
                    <label htmlFor="cors-wildcard" className="text-sm font-medium text-ink-dark cursor-pointer select-none">
                      Allow Public Access (<code className="bg-surface-card px-1 py-0.5 rounded font-mono text-xs text-primary font-semibold">*</code>)
                    </label>
                  </div>
                  <p className="text-xs text-ink-muted leading-relaxed pl-7.5">
                    When checked, any client-side website can fetch assets or upload files using your project credentials. Recommended for early development, testing, and public demos.
                  </p>
                </div>

                {!corsWildcard && (
                  <div className="space-y-4 pt-2 pl-0 sm:pl-7.5">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-ink-muted uppercase tracking-wider block">Add Allowed Origin</label>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="e.g. http://localhost:3000 or https://myapp.com"
                          value={newOriginInput}
                          onChange={e => setNewOriginInput(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && handleAddOrigin()}
                          className="bg-canvas border-border focus:border-primary focus:ring-1 focus:ring-primary text-sm"
                        />
                        <Button 
                          type="button"
                          onClick={handleAddOrigin}
                          className="bg-primary hover:bg-primary-active text-white shrink-0 font-medium px-4 rounded-xl text-xs uppercase tracking-wider"
                        >
                          Add
                        </Button>
                      </div>
                      <p className="text-[10px] text-ink-soft leading-normal">
                        Enter any valid URL. D2 will parse it and add the clean origin schema.
                      </p>
                    </div>

                    <div className="space-y-2 pt-2">
                      <label className="text-xs font-semibold text-ink-muted uppercase tracking-wider block">Allowed Origins ({allowedOriginsList.length})</label>
                      {allowedOriginsList.length === 0 ? (
                        <div className="p-4 text-center border border-dashed border-border rounded-xl text-xs text-ink-soft">
                          No domains configured. Access will be blocked until you add at least one origin.
                        </div>
                      ) : (
                        <div className="border border-border rounded-xl overflow-hidden divide-y divide-border bg-canvas">
                          {allowedOriginsList.map(origin => (
                            <div key={origin} className="flex justify-between items-center py-2.5 px-4 text-xs font-mono text-ink-medium">
                              <span>{origin}</span>
                              <button 
                                type="button"
                                onClick={() => handleRemoveOrigin(origin)}
                                className="text-red-500 hover:text-red-700 transition-colors p-1"
                                title="Remove origin"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-2 flex justify-end pl-0 sm:pl-7.5">
                  <Button 
                    onClick={handleSaveSettings}
                    disabled={savingSettings}
                    className="bg-primary hover:bg-primary-active text-white px-6 rounded-xl transition-all font-medium text-sm"
                  >
                    {savingSettings ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Save CORS Rules
                  </Button>
                </div>
              </Card>

              <Card className="p-6 border border-red-200 bg-red-50/20 shadow-none space-y-4 rounded-xl max-w-2xl mt-8">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-red-800 uppercase tracking-wider">Danger Zone</h4>
                  <p className="text-xs text-ink-muted leading-relaxed">
                    Permanently delete this project workspace. All files stored in this container will be deleted from D2 Storage and Cloudinary. This action is irreversible.
                  </p>
                </div>
                <div className="pt-2 flex justify-start">
                  <Button 
                    onClick={() => setShowDeleteProjectModal(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-5 rounded-xl transition-all font-medium text-xs uppercase tracking-wider h-9"
                  >
                    Delete Project
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="max-w-3xl border border-border bg-canvas text-ink-dark">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-serif text-lg">
              {previewFile?.name}
              <Badge className="bg-primary hover:bg-primary text-white text-[10px] uppercase font-mono tracking-wider">{previewFile?.resource_type}</Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center bg-surface-card/30 rounded-xl border border-border overflow-hidden max-h-[60vh] p-4">
            {previewFile?.resource_type === "image" ? (
              <img src={previewFile.url} alt={previewFile.name} className="max-w-full max-h-[55vh] object-contain rounded-lg shadow-sm" />
            ) : previewFile?.resource_type === "video" ? (
              <video controls className="max-w-full max-h-[55vh] rounded-lg shadow-sm">
                <source src={previewFile.url} />
              </video>
            ) : (
              <div className="py-16 text-muted-foreground text-sm">Preview not available</div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Prompt Dialog */}
      <Dialog open={showAiPromptModal} onOpenChange={setShowAiPromptModal}>
        <DialogContent className="max-w-2xl border border-border bg-canvas text-ink-dark max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl font-normal text-ink-dark">
              LLM/AI System Prompt Guide
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <p className="text-xs text-ink-medium">
              Copy this system prompt and paste it into Claude, ChatGPT, or any other LLM. It contains the exact schemas, active endpoints, and workspace contexts required to build a drop-in storage helper class in less than 5 minutes.
            </p>
            <div className="bg-ink-dark p-4 rounded-xl text-[#efe9de] font-mono text-xs relative overflow-hidden">
              <span className="text-[10px] text-ink-soft uppercase font-sans font-semibold tracking-wider block mb-2">INTEGRATION PROMPT</span>
              <textarea
                readOnly
                className="w-full bg-surface-dark-elevated border border-surface-dark-elevated text-[#efe9de] p-3 rounded-lg font-mono text-[10px] h-[300px] focus:outline-none resize-none"
                value={`You are helping me integrate a file storage manager into my application.

API Base URL: ${apiBase} (Note: If hosted in production, replace this with your hosted API URL)
Project ID: ${project.id}
Default Active Folder: "${subfolder || "root"}"

Important Guidelines for implementation:
1. API Credentials: The API requires a project API key (Authorization: Bearer ${projectApiKey || "<YOUR_PROJECT_API_KEY>"}). Provide a way to supply this key (e.g. via constructor parameter, environment variable like DREAMBIT_STORAGE_API_KEY, or config initialization). Tell the developer to add this variable in their project setup.
2. Folder Logic:
   - Root Folder: By default, if no folder is specified, assets are uploaded to the project root folder.
   - Dynamic Folder Creation: If the user uploads to a folder name that does not exist yet (e.g. a brand new folder), the backend API automatically creates it on-the-fly. No need to pre-create folders!
   - Parameter structure: The upload API expects the folder name in a field named "folder" within the FormData body.

API Specification:

1. POST /api/upload?projectId=${project.id}
- Headers:
  Authorization: Bearer ${projectApiKey || "<YOUR_PROJECT_API_KEY>"}
- Body (FormData):
  file: [The File object to upload]
  folder: [Optional, string, folder name to upload into]
- Returns:
  {
    "success": true,
    "file": {
      "id": "file_public_id",
      "name": "file_name_with_timestamp.ext",
      "url": "https://...",
      "size": 12345,
      "type": "image/png",
      "resource_type": "image"
    }
  }

2. GET /api/files?projectId=${project.id}&folder=[folder_name]&cursor=[cursor]
- Headers:
  Authorization: Bearer ${projectApiKey || "<YOUR_PROJECT_API_KEY>"}
- Returns:
  {
    "files": [...],
    "nextCursor": "string | null"
  }

3. DELETE /api/files/[provider_id]?type=[resource_type]
- Headers:
  Authorization: Bearer ${projectApiKey || "<YOUR_PROJECT_API_KEY>"}
- Returns:
  { "success": true }

Write a clean, ready-to-use JS/TS helper class or helper functions that I can paste into my project. Implement:
1. uploadAsset(file, folder) - handles multipart uploads. Ensure it appends the folder parameter to FormData if provided.
2. listAssets(folder, cursor) - lists assets inside a folder (optional) with cursor support.
3. deleteAsset(providerId, resourceType) - deletes a file using its provider ID and resource type.

Include clear comments, typescript types, environment variable setup advice, and an usage example code for the helper showing how to upload a file to the active folder "${subfolder || "xyz"}".`}
              />
              <button 
                onClick={() => {
                  const promptText = `You are helping me integrate a file storage manager into my application.\n\nAPI Base URL: ${apiBase} (Note: If hosted in production, replace this with your hosted API URL)\nProject ID: ${project.id}\nDefault Active Folder: "${subfolder || "root"}"\n\nImportant Guidelines for implementation:\n1. API Credentials: The API requires a project API key (Authorization: Bearer ${projectApiKey || "<YOUR_PROJECT_API_KEY>"}). Provide a way to supply this key (e.g. via constructor parameter, environment variable like DREAMBIT_STORAGE_API_KEY, or config initialization). Tell the developer to add this variable in their project setup.\n2. Folder Logic:\n   - Root Folder: By default, if no folder is specified, assets are uploaded to the project root folder.\n   - Dynamic Folder Creation: If the user uploads to a folder name that does not exist yet (e.g. a brand new folder), the backend API automatically creates it on-the-fly. No need to pre-create folders!\n   - Parameter structure: The upload API expects the folder name in a field named "folder" within the FormData body.\n\nAPI Specification:\n\n1. POST /api/upload?projectId=${project.id}\n- Headers:\n  Authorization: Bearer ${projectApiKey || "<YOUR_PROJECT_API_KEY>"}\n- Body (FormData):\n  file: [The File object to upload]\n  folder: [Optional, string, folder name to upload into]\n- Returns:\n  {\n    "success": true,\n    "file": {\n      "id": "file_public_id",\n      "name": "file_name_with_timestamp.ext",\n      "url": "https://...",\n      "size": 12345,\n      "type": "image/png",\n      "resource_type": "image"\n    }\n  }\n\n2. GET /api/files?projectId=${project.id}&folder=[folder_name]&cursor=[cursor]\n- Headers:\n  Authorization: Bearer ${projectApiKey || "<YOUR_PROJECT_API_KEY>"}\n- Returns:\n  {\n    "files": [...],\n    "nextCursor": "string | null"\n  }\n\n3. DELETE /api/files/[provider_id]?type=[resource_type]\n- Headers:\n  Authorization: Bearer ${projectApiKey || "<YOUR_PROJECT_API_KEY>"}\n- Returns:\n  { "success": true }\n\nWrite a clean, ready-to-use JS/TS helper class or helper functions that I can paste into my project. Implement:\n1. uploadAsset(file, folder) - handles multipart uploads. Ensure it appends the folder parameter to FormData if provided.\n2. listAssets(folder, cursor) - lists assets inside a folder (optional) with cursor support.\n3. deleteAsset(providerId, resourceType) - deletes a file using its provider ID and resource type.\n\nInclude clear comments, typescript types, environment variable setup advice, and an usage example code for the helper showing how to upload a file to the active folder "${subfolder || "xyz"}".`;
                  navigator.clipboard.writeText(promptText);
                  setShowPromptCopied(true);
                  addToast("AI prompt copied to clipboard!", "success");
                  setTimeout(() => setShowPromptCopied(false), 2000);
                }}
                className="absolute top-4 right-4 text-ink-soft hover:text-canvas transition-colors"
                title="Copy Prompt"
              >
                {showPromptCopied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <DialogFooter>
            <Button 
              className="bg-primary hover:bg-primary-active text-white" 
              onClick={() => setShowAiPromptModal(false)}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!fileToDelete} onOpenChange={(open) => { if (!open) setFileToDelete(null); }}>
        <DialogContent className="max-w-md border border-border bg-canvas text-ink-dark">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-normal text-ink-dark">
              Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          <div className="py-3 text-sm text-ink-medium space-y-2">
            <p>Are you sure you want to permanently delete this asset?</p>
            <p className="font-mono text-xs bg-surface-card/50 p-2.5 rounded-lg border border-border break-all">
              {fileToDelete?.name}
            </p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              className="border-border text-ink-medium hover:bg-surface-card" 
              onClick={() => setFileToDelete(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white" 
              onClick={confirmDeleteAction}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete Asset"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Project Confirmation Dialog */}
      <Dialog open={showDeleteProjectModal} onOpenChange={setShowDeleteProjectModal}>
        <DialogContent className="max-w-md border border-border bg-canvas text-ink-dark">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-normal text-ink-dark">
              Confirm Project Deletion
            </DialogTitle>
          </DialogHeader>
          <div className="py-3 text-sm text-ink-medium space-y-3">
            <p>
              Are you sure you want to permanently delete the project <span className="font-semibold">{project.name}</span>?
            </p>
            <p className="text-xs text-red-650 bg-red-50 p-2.5 rounded-lg border border-red-200 leading-normal">
              ⚠️ <span className="font-semibold">Warning</span>: All folders and assets associated with this project will be deleted from D2 Storage and your Cloudinary bucket. There is no way to retrieve them.
            </p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              className="border-border text-ink-medium hover:bg-surface-card" 
              onClick={() => setShowDeleteProjectModal(false)}
              disabled={deletingProject}
            >
              Cancel
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white" 
              onClick={handleDeleteProject}
              disabled={deletingProject}
            >
              {deletingProject ? "Deleting..." : "Permanently Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Folder Confirmation Dialog */}
      <Dialog open={!!folderToDelete} onOpenChange={(open) => { if (!open) setFolderToDelete(null); }}>
        <DialogContent className="max-w-md border border-border bg-canvas text-ink-dark">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-normal text-ink-dark">
              Confirm Folder Deletion
            </DialogTitle>
          </DialogHeader>
          <div className="py-3 text-sm text-ink-medium space-y-3">
            <p>
              Are you sure you want to delete the folder <span className="font-semibold">{folderToDelete}</span>?
            </p>
            <p className="text-xs text-red-650 bg-red-50 p-2.5 rounded-lg border border-red-200 leading-normal">
              ⚠️ <span className="font-semibold">Warning</span>: This will permanently delete the folder and <span className="font-semibold">all files stored inside it</span> from both D2 Storage and Cloudinary. This action is irreversible.
            </p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              className="border-border text-ink-medium hover:bg-surface-card" 
              onClick={() => setFolderToDelete(null)}
              disabled={deletingFolder}
            >
              Cancel
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white" 
              onClick={confirmDeleteFolder}
              disabled={deletingFolder}
            >
              {deletingFolder ? "Deleting..." : "Delete Folder & Assets"}
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

/* ─── Upload Card ─── */
function UploadCard({ projectId, masterKey, subfolder, onUploaded }: {
  projectId: string;
  masterKey: string;
  subfolder: string;
  onUploaded: (newFile?: FileItem) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    if (subfolder) fd.append("folder", subfolder);
    try {
      const res = await fetch(`/api/upload?projectId=${projectId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${masterKey}` },
        body: fd,
      });
      if (res.ok) {
        const data = await res.json();
        onUploaded(data.file);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="p-5 border border-border bg-surface-card/10 shadow-none space-y-3 rounded-xl">
      <h3 className="text-xs font-bold text-ink-muted uppercase tracking-wider">Upload File</h3>
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) upload(f); }}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer
          ${dragging ? "border-primary bg-primary/5" : "border-border bg-canvas"} 
          ${uploading ? "opacity-50" : ""}`}
      >
        <input type="file" id="proj-upload" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); }} />
        <label htmlFor="proj-upload" className="cursor-pointer space-y-1 block">
          <Upload className={`mx-auto h-6 w-6 ${uploading ? "animate-bounce text-primary" : "text-ink-muted"}`} />
          <p className="text-xs text-ink-dark font-medium">{uploading ? "Uploading..." : "Click or drag file"}</p>
          <p className="text-[10px] text-ink-soft">Supports all formats (JSON, images, PDF, code, video)</p>
        </label>
      </div>
    </Card>
  );
}
