# 🔗 Next.js &bull; Python Django Server-to-Server Architecture Guide

This guide explains how to connect your **Next.js** frontend to your **Python Django** backend using a secure **Server-to-Server architecture** (Server Components + Server Actions).

---

## 🏛️ Architecture Overview

```
┌─────────────────┐
│ User's Browser  │
└────────┬────────┘
         │ 1. HTML / Streaming Form Submissions (No direct Django API requests)
         ▼
┌────────────────────────────────────────────────────────┐
│ Next.js Server (Node.js SSR Runtime)                   │
│                                                        │
│  • Server Component: fetchItemsServer() [cache: no-store]
│  • Server Action:    createItemAction() ['use server'] │
│  • Private Env:      DJANGO_API_URL=http://localhost:8000
└────────────────────────┬───────────────────────────────┘
                         │ 2. Direct Server-to-Server HTTP
                         ▼
┌────────────────────────────────────────────────────────┐
│ Python Django Backend (myproject &bull; core)          │
│                                                        │
│  • Endpoints:   /api/items/ & /api/items/<id>/         │
│  • Middleware:  corsheaders.middleware.CorsMiddleware  │
│  • Database:    SQLite / PostgreSQL / MySQL            │
└────────────────────────────────────────────────────────┘
```

### 🔒 Key Architectural Advantages
1. **Zero Browser-to-Django Exposure**: The user's browser never directly queries `http://localhost:8000`. Private endpoints and API keys are completely shielded inside Next.js server runtime.
2. **No Browser CORS Headaches**: Because Server-to-Server requests occur between backend processes (Node.js & Python), browser origin restrictions and preflight OPTIONS are bypassed.
3. **Instant Cache Revalidation**: Mutations in Server Actions trigger `revalidatePath('/')`, automatically re-rendering fresh data without client-side state boilerplate (`useEffect`, `useState`, or third-party fetching libraries).

---

## 📁 Source Files Created in this Project

All frontend source files are available in the [`nextjs-frontend/`](./nextjs-frontend/) directory:

| File | Type | Purpose |
|---|---|---|
| [`src/lib/django-api.ts`](./nextjs-frontend/src/lib/django-api.ts) | Server API Client | Handles direct `fetch` calls to Django on the Next.js server. |
| [`src/actions/items.ts`](./nextjs-frontend/src/actions/items.ts) | Server Actions | `'use server'` mutations for `createItemAction`, `toggleItemStatusAction`, `deleteItemAction`. |
| [`src/app/page.tsx`](./nextjs-frontend/src/app/page.tsx) | Server Component | Direct server-side data fetching and initial page render. |
| [`src/components/CreateItemForm.tsx`](./nextjs-frontend/src/components/CreateItemForm.tsx) | UI Form | Form submitting to the Server Action with pending feedback. |
| [`src/components/ItemCard.tsx`](./nextjs-frontend/src/components/ItemCard.tsx) | UI Component | Item card with status toggle and deletion using `useTransition`. |
| [`src/components/ItemList.tsx`](./nextjs-frontend/src/components/ItemList.tsx) | Server Component | List wrapper rendering task cards. |
| [`src/types/item.ts`](./nextjs-frontend/src/types/item.ts) | TypeScript | Type definitions for Items and Responses. |
| [`.env.local`](./nextjs-frontend/.env.local) | Config | Private server environment variable `DJANGO_API_URL`. |

---

## 🛠️ Step-by-Step Integration into Your Next.js System

If your Next.js project is on another system or folder, copy the files as follows:

### Step 1: Copy TypeScript types & API Client
Copy [`src/types/item.ts`](./nextjs-frontend/src/types/item.ts) and [`src/lib/django-api.ts`](./nextjs-frontend/src/lib/django-api.ts) into your Next.js project.

### Step 2: Configure Environment Variables
In your Next.js project's `.env.local`:
```env
# Do NOT prefix with NEXT_PUBLIC_! Keep it private to the Next.js server.
DJANGO_API_URL=http://localhost:8000
SERVER_API_KEY=
```

### Step 3: Implement Server-Side Fetching (Server Component)
In any Next.js Server Component (e.g., `app/page.tsx` or `app/tasks/page.tsx`):
```tsx
import { fetchItemsServer } from "@/lib/django-api";
import ItemList from "@/components/ItemList";

export default async function Page() {
  // Fetch directly from Django on the Next.js server
  const data = await fetchItemsServer();

  return (
    <div>
      <h1>Tasks</h1>
      <ItemList items={data.items} />
    </div>
  );
}
```

### Step 4: Implement Server Actions for Mutations
In [`src/actions/items.ts`](./nextjs-frontend/src/actions/items.ts):
```tsx
"use server";

import { revalidatePath } from "next/cache";
import { createItemServer } from "@/lib/django-api";

export async function createItemAction(prevState: any, formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;

  await createItemServer({ title, description });

  // Instructs Next.js to immediately re-render Server Components with fresh data
  revalidatePath("/");

  return { success: true };
}
```

---

## 🐍 Django Backend Endpoints Reference

The Django backend (`myproject` with app `core`) provides:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/items/` | List items (supports `?status=`, `?priority=`, `?search=`) |
| `POST` | `/api/items/` | Create a new item (JSON payload) |
| `GET` | `/api/items/<id>/` | Get single item detail |
| `PATCH` | `/api/items/<id>/` | Update item status or fields |
| `DELETE` | `/api/items/<id>/` | Delete an item |

### Starting Django Backend:
```powershell
.\.venv\Scripts\python.exe manage.py runserver
```
The server will run at `http://127.0.0.1:8000/`.
