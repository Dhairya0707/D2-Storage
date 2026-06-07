# D2 Storage - API Specification

All endpoints are hosted relative to the server origin (e.g. `http://localhost:3001/api`). Every endpoint requires standard HTTP Bearer authentication using the project API key created for the workspace.

```http
Authorization: Bearer sk_your_project_api_key
```

---

## 1. Upload Asset

Uploads a file directly to the active project workspace. If the folder name specified does not exist yet, the API automatically provisions it on-the-fly.

- **Endpoint**: `POST /api/upload?projectId=<PROJECT_ID>`
- **Content-Type**: `multipart/form-data`
- **Request Body**:
  - `file`: (Required, File Binary) The file asset to upload. Max size: 10MB.
  - `folder`: (Optional, String) Name of the folder path (e.g. `avatars` or `docs/images`) to store the file inside.

### Success Response (`200 OK`)
```json
{
  "success": true,
  "file": {
    "id": "dreambit/project_id/folder_name/logo_1717711234567",
    "name": "logo_1717711234567.png",
    "url": "https://res.cloudinary.com/.../dreambit/project_id/folder_name/logo_1717711234567.png",
    "size": 45120,
    "type": "image/png",
    "resource_type": "image",
    "provider_id": "dreambit/project_id/folder_name/logo_1717711234567",
    "created_at": "2026-06-06T18:00:00Z"
  }
}
```

### Error Response (`413 Payload Too Large`)
If a file exceeds the 10MB direct server upload limit:
```json
{
  "error": "Payload Too Large",
  "message": "Direct server uploads are limited to 10MB. To upload larger assets (up to 1GB/2GB), implement direct client-to-Cloudinary signed uploads to bypass server memory and timeout restrictions."
}
```

---

## 2. List Assets

Retrieves a list of files matching the folder location inside the workspace.

- **Endpoint**: `GET /api/files?projectId=<PROJECT_ID>&folder=<FOLDER_PATH>&cursor=<CURSOR>&limit=<LIMIT>`
- **Query Parameters**:
  - `projectId`: (Required, String) The workspace project ID.
  - `folder`: (Optional, String) Filter files inside a specific directory. Defaults to root folder.
  - `cursor`: (Optional, String) Pagination cursor returned in previous responses.
  - `limit`: (Optional, Integer) Max number of files to return. Defaults to 20, max 100.

### Success Response (`200 OK`)
```json
{
  "files": [
    {
      "id": "dreambit/project_id/document_1717711234567",
      "name": "document_1717711234567.pdf",
      "url": "https://res.cloudinary.com/.../dreambit/project_id/document_1717711234567.pdf",
      "size": 1054300,
      "type": "raw",
      "resource_type": "raw",
      "provider_id": "dreambit/project_id/document_1717711234567",
      "created_at": "2026-06-06T18:01:00Z"
    }
  ],
  "nextCursor": "abc123nextcursorhash"
}
```

---

## 3. Delete Asset

Removes an asset from the workspace bucket and Cloudinary CDN storage.

- **Endpoint**: `DELETE /api/files/[...provider_id]?type=<RESOURCE_TYPE>`
- **Path Parameters**:
  - `provider_id`: (Required) Slashed public id of the file (e.g. `dreambit/project_id/logo_1717711234567`).
- **Query Parameters**:
  - `type`: (Optional, String) Resource type of the file (`image`, `video`, `raw`). Defaults to `image`.

### Success Response (`200 OK`)
```json
{
  "success": true
}
```

---

## 4. List Subfolders

Retrieves a list of folders provisioned inside the workspace.

- **Endpoint**: `GET /api/folders?projectId=<PROJECT_ID>`
- **Query Parameters**:
  - `projectId`: (Required, String) The workspace project ID.

### Success Response (`200 OK`)
```json
{
  "folders": [
    "avatars",
    "docs",
    "profile_photos"
  ]
}
```

---

## 5. Create Subfolder

Manually provisions a subfolder inside the active workspace.

- **Endpoint**: `POST /api/folders?projectId=<PROJECT_ID>`
- **Request Body**:
  - `name`: (Required, String) Subfolder name (e.g. `avatars`).

### Success Response (`200 OK`)
```json
{
  "success": true
}
```
