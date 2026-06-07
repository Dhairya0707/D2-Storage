const BASE_URL = typeof window !== "undefined" ? window.location.origin : "";

interface StorageConfig {
  apiKey: string;
  baseUrl?: string;
}

interface UploadOptions {
  folder?: string;
}

interface FileResult {
  id: string;
  name: string;
  url: string;
}

interface ListResult {
  files: FileResult[];
  nextCursor: string | null;
}

interface ProjectResult {
  id: string;
  name: string;
  rootFolder: string;
  createdAt: string;
}

export function createStorage(config: StorageConfig) {
  const base = config.baseUrl || BASE_URL;
  const headers = () => ({ Authorization: `Bearer ${config.apiKey}` });

  return {
    async upload(file: File, options?: UploadOptions): Promise<FileResult> {
      const formData = new FormData();
      formData.append("file", file);
      if (options?.folder) formData.append("folder", options.folder);

      const res = await fetch(`${base}/api/upload`, {
        method: "POST",
        headers: headers(),
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(err.error);
      }

      return res.json();
    },

    async list(folder?: string, cursor?: string): Promise<ListResult> {
      const params = new URLSearchParams();
      if (folder) params.set("folder", folder);
      if (cursor) params.set("cursor", cursor);

      const url = `${base}/api/files${params.toString() ? `?${params}` : ""}`;
      const res = await fetch(url, { headers: headers() });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "List failed" }));
        throw new Error(err.error);
      }

      return res.json();
    },

    async delete(id: string, type?: string): Promise<void> {
      const params = type ? `?type=${type}` : "";
      const res = await fetch(`${base}/api/files/${id}${params}`, {
        method: "DELETE",
        headers: headers(),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Delete failed" }));
        throw new Error(err.error);
      }
    },

    async createProject(name: string): Promise<ProjectResult> {
      const res = await fetch(`${base}/api/projects`, {
        method: "POST",
        headers: { ...headers(), "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Create project failed" }));
        throw new Error(err.error);
      }

      return res.json();
    },

    async listProjects(): Promise<ProjectResult[]> {
      const res = await fetch(`${base}/api/projects`, { headers: headers() });
      if (!res.ok) throw new Error("List projects failed");
      const data = await res.json();
      return data.projects;
    },
  };
}

export type StorageClient = ReturnType<typeof createStorage>;
