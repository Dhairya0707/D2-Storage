import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryFile {
  id: string;
  name: string;
  folder: string;
  url: string;
  size: number;
  type: string;
  resource_type: string;
  provider_id: string;
  created_at: string;
}

export interface ListResult {
  files: CloudinaryFile[];
  nextCursor: string | null;
}

function forceRawDownloadUrl(url: string, resourceType: string): string {
  return url;
}

export async function uploadFile(
  file: File,
  rootFolder: string,
  subfolder?: string
): Promise<CloudinaryFile> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");
  const dataUri = `data:${file.type};base64,${base64}`;
  const folder = subfolder ? `${rootFolder}/${subfolder}` : rootFolder;

  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");
  const isRaw = !isImage && !isVideo;

  // Extract base name and extension to append milliseconds timestamp
  const lastDot = file.name.lastIndexOf(".");
  const baseName = lastDot !== -1 ? file.name.slice(0, lastDot) : file.name;
  const ext = lastDot !== -1 ? file.name.slice(lastDot + 1) : "";
  const cleanBase = baseName.replace(/[^a-zA-Z0-9\-_]/g, "_");
  const finalName = ext ? `${cleanBase}_${Date.now()}.${ext}` : `${cleanBase}_${Date.now()}`;

  const options: any = {
    folder,
    resource_type: isRaw ? "raw" : "auto",
  };

  if (isRaw) {
    options.public_id = finalName;
  } else {
    // Cloudinary automatically appends extension for media types if not present in public_id
    options.public_id = ext ? `${cleanBase}_${Date.now()}` : `${cleanBase}_${Date.now()}`;
  }

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      dataUri,
      options,
      (err, result) => {
        if (err || !result) reject(err || new Error("Upload failed"));
        else
          resolve({
            id: result.public_id,
            name: finalName,
            folder,
            url: forceRawDownloadUrl(result.secure_url, result.resource_type),
            size: file.size,
            type: file.type,
            resource_type: result.resource_type,
            provider_id: result.public_id,
            created_at: result.created_at,
          });
      }
    );
  });
}

export async function deleteFile(
  providerId: string,
  resourceType?: string
): Promise<any> {
  const rType = resourceType || "image";
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(
      providerId,
      { resource_type: rType as any },
      (error, result) => {
        console.log(`Cloudinary destroy attempt: providerId=${providerId}, resourceType=${rType}`);
        if (error) {
          console.error("Cloudinary destroy error:", error);
          reject(error);
        } else {
          console.log("Cloudinary destroy result:", result);
          resolve(result);
        }
      }
    );
  });
}

export async function listFiles(
  rootFolder: string,
  subfolder?: string,
  cursor?: string,
  limit: number = 20
): Promise<ListResult> {
  const folderPath = subfolder ? `${rootFolder}/${subfolder}` : rootFolder;
  const expression = `folder="${folderPath}"`;

  const result = await cloudinary.search
    .expression(expression)
    .max_results(limit)
    .next_cursor(cursor)
    .execute();

  return {
    files: result.resources.map((r: any) => ({
      id: r.public_id,
      name: r.filename,
      folder: r.folder || "",
      url: forceRawDownloadUrl(r.secure_url, r.resource_type),
      size: r.bytes,
      type: r.resource_type,
      resource_type: r.resource_type,
      provider_id: r.public_id,
      created_at: r.created_at,
    })),
    nextCursor: result.next_cursor || null,
  };
}

export async function listFolders(rootFolder: string): Promise<string[]> {
  try {
    const result = await cloudinary.api.sub_folders(rootFolder);
    return result.folders.map((f: any) => f.name);
  } catch {
    return [];
  }
}

export async function createFolder(
  rootFolder: string,
  folderName: string
): Promise<void> {
  const folderPath = `${rootFolder}/${folderName}`;
  await cloudinary.api.create_folder(folderPath);
}

export async function deleteProjectFolder(rootFolder: string): Promise<void> {
  const prefix = `${rootFolder}/`;
  
  // 1. Delete all assets of any resource type (image, video, raw)
  for (const type of ["image", "video", "raw"]) {
    try {
      await cloudinary.api.delete_resources_by_prefix(prefix, {
        resource_type: type,
      });
    } catch (err) {
      console.error(`Failed to delete prefix resources for type ${type}:`, err);
    }
  }

  // 2. Fetch and delete empty subfolders
  try {
    const subfolders = await listFolders(rootFolder);
    for (const sub of subfolders) {
      const subPath = `${rootFolder}/${sub}`;
      try {
        await cloudinary.api.delete_folder(subPath);
      } catch (err) {
        console.error(`Failed to delete subfolder ${subPath}:`, err);
      }
    }
  } catch (err) {
    console.error(`Failed to list/delete subfolders for ${rootFolder}:`, err);
  }

  // 3. Delete the root project folder itself
  try {
    await cloudinary.api.delete_folder(rootFolder);
  } catch (err) {
    console.error(`Failed to delete root folder ${rootFolder}:`, err);
  }
}

export async function deleteSubfolder(rootFolder: string, folderName: string): Promise<void> {
  const folderPath = `${rootFolder}/${folderName}`;
  const prefix = `${folderPath}/`;

  // 1. Delete all assets of any resource type (image, video, raw) in this subfolder
  for (const type of ["image", "video", "raw"]) {
    try {
      await cloudinary.api.delete_resources_by_prefix(prefix, {
        resource_type: type,
      });
    } catch (err) {
      console.error(`Failed to delete subfolder resources for type ${type}:`, err);
    }
  }

  // 2. Delete the empty subfolder itself
  try {
    await cloudinary.api.delete_folder(folderPath);
  } catch (err) {
    console.error(`Failed to delete subfolder ${folderPath}:`, err);
  }
}
