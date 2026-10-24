# 🏗️ Radwa CRM &bull; Next.js & Django Full-Stack Integration Guide

This guide details the complete **Server-to-Server** integration between your **Next.js** frontend and **Python Django** backend (`radwa`) for the **Inbound Tender Intake & Work Order Registry** CRM module.

---

## 🏛️ End-to-End Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ Next.js Client Browser                                      │
│                                                             │
│  • CrmAdminDashboardView.tsx (Filter tabs, search, metrics) │
│  • RegisterClientModal.tsx   (Intake & SOW checkboxes)      │
│  • AssignEstimatorModal.tsx  (Estimator capacity & Zap auto)│
│  • ProjectDetailModal.tsx    (Full dossier & status dropdown)
└──────────────────────────────┬──────────────────────────────┘
                               │
               (1) Invokes Server Actions & Page Navigation
               (NO direct browser requests to Django!)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Next.js Server (Node.js SSR Runtime)                        │
│                                                             │
│  • Server Component: page.tsx                               │
│      -> fetchProjectsServer()                               │
│      -> fetchEstimatorsServer()                             │
│                                                             │
│  • Server Actions:   actions/crm.ts                         │
│      -> registerClientAction(projectData)                   │
│      -> assignEstimatorAction(projectId, estimatorId)       │
│      -> updateProjectStatusAction(projectId, newStatus)     │
│                                                             │
│  • Private Config:   DJANGO_API_URL=http://localhost:8000   │
└──────────────────────────────┬──────────────────────────────┘
                               │
               (2) Direct Server-to-Server HTTP
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Python Django Backend (radwa / myproject)                   │
│                                                             │
│  • Models:     Estimator, ProjectRFQ                        │
│  • Endpoints:  /api/projects/                               │
│                /api/projects/<id>/assign-estimator/         │
│                /api/projects/<id>/status/                   │
│                /api/estimators/                             │
│                /api/dashboard/metrics/                      │
│  • Database:   SQLite (Seeded with 4 estimators, 3 projects)│
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Integrated Files Created in Workspace

All frontend and backend files are organized and ready:

### 1. Frontend Files in `nextjs-frontend/`
- [`src/types/crm.ts`](file:///c:/Users/SONA/OneDrive/Desktop/Empire/radwa/nextjs-frontend/src/types/crm.ts): Types for `ProjectRFQ`, `Estimator`, `ProjectStatus`, `SowDiscipline`.
- [`src/lib/crm-api.ts`](file:///c:/Users/SONA/OneDrive/Desktop/Empire/radwa/nextjs-frontend/src/lib/crm-api.ts): Server-only fetcher functions for Django CRM endpoints.
- [`src/actions/crm.ts`](file:///c:/Users/SONA/OneDrive/Desktop/Empire/radwa/nextjs-frontend/src/actions/crm.ts): Next.js `'use server'` Server Actions with `revalidatePath('/')`.
- [`src/components/crm/CrmAdminDashboardView.tsx`](file:///c:/Users/SONA/OneDrive/Desktop/Empire/radwa/nextjs-frontend/src/components/crm/CrmAdminDashboardView.tsx): Main dashboard view.
- [`src/components/crm/RegisterClientModal.tsx`](file:///c:/Users/SONA/OneDrive/Desktop/Empire/radwa/nextjs-frontend/src/components/crm/RegisterClientModal.tsx): Inbound tender registration modal.
- [`src/components/crm/AssignEstimatorModal.tsx`](file:///c:/Users/SONA/OneDrive/Desktop/Empire/radwa/nextjs-frontend/src/components/crm/AssignEstimatorModal.tsx): Workload capacity allocation modal.
- [`src/components/crm/ProjectDetailModal.tsx`](file:///c:/Users/SONA/OneDrive/Desktop/Empire/radwa/nextjs-frontend/src/components/crm/ProjectDetailModal.tsx): Full tender dossier modal.
- [`src/components/crm/CrmDashboardContainer.tsx`](file:///c:/Users/SONA/OneDrive/Desktop/Empire/radwa/nextjs-frontend/src/components/crm/CrmDashboardContainer.tsx): Interactive state container wired to Server Actions.
- [`src/app/page.tsx`](file:///c:/Users/SONA/OneDrive/Desktop/Empire/radwa/nextjs-frontend/src/app/page.tsx): Root Server Component fetching live data on server render.

### 2. Backend Files in `core/`
- [`core/models.py`](file:///c:/Users/SONA/OneDrive/Desktop/Empire/radwa/core/models.py): `Estimator` and `ProjectRFQ` models with JSON fields and `to_dict()`.
- [`core/api_views.py`](file:///c:/Users/SONA/OneDrive/Desktop/Empire/radwa/core/api_views.py): REST views for projects, estimators, assignment, status update, and metrics.
- [`core/urls.py`](file:///c:/Users/SONA/OneDrive/Desktop/Empire/radwa/core/urls.py): URL routing for the API.
- [`core/admin.py`](file:///c:/Users/SONA/OneDrive/Desktop/Empire/radwa/core/admin.py): Admin interface for managing Estimators and Projects.
- [`core/tests.py`](file:///c:/Users/SONA/OneDrive/Desktop/Empire/radwa/core/tests.py): Automated test suite (6 tests passing).

---

## 📡 Django API Endpoints

| Method | URL | Description |
|---|---|---|
| `GET` | `/api/projects/` | List projects (query parameters: `?search=`, `?status=`, `?estimator=`) |
| `POST` | `/api/projects/` | Create a new project (auto-generates WO# and Serial# if omitted) |
| `GET` | `/api/projects/<id>/` | Get single project dossier |
| `PATCH` | `/api/projects/<id>/assign-estimator/` | Assign or reallocate estimator (`{ "estimator_id": "1" }`) |
| `PATCH` | `/api/projects/<id>/status/` | Update status (`{ "status": "Approved for Bidding" }`) |
| `GET` | `/api/estimators/` | List all estimators with active tender count & capacity |
| `GET` | `/api/dashboard/metrics/` | Aggregated dashboard metrics |

---

## ⚡ How to Copy to Your Existing Next.js Project

If your Next.js project is located in another folder or system, copy the following into your Next.js directory:

1. Copy [`src/types/crm.ts`](file:///c:/Users/SONA/OneDrive/Desktop/Empire/radwa/nextjs-frontend/src/types/crm.ts) into your project's `types/crm.ts`.
2. Copy [`src/lib/crm-api.ts`](file:///c:/Users/SONA/OneDrive/Desktop/Empire/radwa/nextjs-frontend/src/lib/crm-api.ts) into your project's `lib/crm-api.ts`.
3. Copy [`src/actions/crm.ts`](file:///c:/Users/SONA/OneDrive/Desktop/Empire/radwa/nextjs-frontend/src/actions/crm.ts) into your project's `actions/crm.ts`.
4. Copy [`src/components/crm/`](file:///c:/Users/SONA/OneDrive/Desktop/Empire/radwa/nextjs-frontend/src/components/crm/) into your `components/crm/`.
5. In your `.env.local`, set:
   ```env
   DJANGO_API_URL=http://localhost:8000
   ```
6. In any Server Component (`app/page.tsx` or `app/crm/page.tsx`):
   ```tsx
   import { fetchProjectsServer, fetchEstimatorsServer } from "@/lib/crm-api";
   import CrmDashboardContainer from "@/components/crm/CrmDashboardContainer";

   export const dynamic = "force-dynamic";

   export default async function Page() {
     const [projects, estimators] = await Promise.all([
       fetchProjectsServer(),
       fetchEstimatorsServer(),
     ]);

     return <CrmDashboardContainer initialProjects={projects} estimators={estimators} />;
   }
   ```
