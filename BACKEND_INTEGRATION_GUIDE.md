# Radwa ERP - Next.js Frontend Handover & Django Integration Guide

## 1. Executive Summary
This Next.js application serves as the **Radwa Enterprise Applications Portal** with role-gated access:
- **CRM Admin Portal**: Client intake, tender/RFQ registration, SOW scopes, estimator assignment, work order tracking.
- **Managing Director Console**: Executive tender approvals, risk analysis, win probabilities, margin reviews.
- **Estimator Workspace**: BOQ line estimations, site review checklists, AI BOQ calculations, quote submissions.
- **Super Administrator**: Full unified access to all 3 workspaces.

---

## 2. Standalone Mode (No API Required to Run)
The frontend is built to run **100% standalone out-of-the-box**:
- All actions (Registering clients, assigning estimators, advancing statuses, switching roles) work in-memory and persist in browser `localStorage`.
- The backend team can run the frontend immediately using:
  ```bash
  npm install
  npm run dev
  ```
  Open `http://localhost:3000` to interact with all screens and workflows.

---

## 3. How to Connect Your Python / Django Backend

### A. Environment Configuration
Create a `.env.local` file in the project root:
```env
NEXT_PUBLIC_BACKEND_API_URL=http://127.0.0.1:8000
```

### B. Django CORS Configuration
Install and configure `django-cors-headers` in your Django `settings.py`:
```python
INSTALLED_APPS = [
    ...,
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    ...,
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
CORS_ALLOW_CREDENTIALS = True
```

---

## 4. Key Data Entities & Schema Mapping

All TypeScript interfaces are documented in [`src/types/crm.ts`](./src/types/crm.ts) and [`src/types/auth.ts`](./src/types/auth.ts).

### 1. `ProjectRFQ` (Tender Pipeline / Work Order)
Matches a Django model for RFQ / Tender:
- `id` (string / UUID)
- `enquirySerialNo` (e.g. `RFQ-2026-0891`)
- `workOrderNo` (e.g. `WO-RADWA-1092`)
- `clientName` & `clientShortName`
- `proposedProjectName`
- `siteName` & `projectLocation`
- `natureOfWork` (`Pipelines`, `Civil & Infra`, `Mechanical`, `Electrical`)
- `scopeOfWork` (Array of items: `{ id, description, unit, quantity, isIncluded }`)
- `submissionDeadline` (Date string)
- `status` (`New RFQ`, `Pending MD Approval`, `Approved for Bidding`, `Estimator Assigned`, `Under BOQ Estimation`, `Bid Submitted`, `Won - In Handover`, `Rejected / Withdrawn`)
- `assignedEstimatorId` & `assignedEstimatorName`
- `estimatedValue` & `currency` (`SAR`)
- `bidSecurityRequired` (Boolean) & `bidBondAmount`

### 2. `Estimator` (Staff Allocation)
- `id` (string / UUID)
- `name`, `email`, `phone`
- `specialty` (`Civil & Infrastructure`, `Pipeline Engineering`, `Mechanical & MEP`)
- `activeTenders` (Integer count of current assignments)
- `capacityStatus` (`Optimal Capacity`, `Near Limit`, `Over Capacity`)

### 3. `Client` (Client Directory)
- `id` (string / UUID)
- `companyName`, `shortCode`
- `crNumber`, `vatNumber`
- `contactPerson`, `contactEmail`, `contactPhone`
- `city`, `headquarters`

---

## 5. Frontend Architecture & Folder Structure

```
src/
├── app/
│   ├── layout.tsx              # Root HTML & fonts
│   └── page.tsx                # App state, role routing & persistent stores
├── components/
│   ├── crm/                    # CRM Desk application
│   │   ├── CrmAdminDashboardView.tsx   # Main tender table & pipeline metrics
│   │   ├── RegisterClientModal.tsx     # Full modal for new client & RFQ registration
│   │   ├── AssignEstimatorModal.tsx    # Modal to allocate tender to estimator
│   │   └── ProjectDetailModal.tsx      # Comprehensive tender inspection modal
│   ├── estimator/              # Estimator Workspace
│   ├── md/                     # Managing Director Console
│   └── menu/
│       └── OdooMainMenu.tsx    # Odoo-style light mode application launcher
├── data/
│   └── mockCrmData.ts          # Default mock dataset
├── services/
│   └── authService.ts          # Authentication service (with fallback & API hooks)
└── types/
    ├── auth.ts                 # Role definitions & preset users
    └── crm.ts                  # Domain models (Projects, Estimators, Scopes, BOQ)
```

---

## 6. Default Test Credentials
- **Super Administrator**: `admin@radwa.sa` / `radwa123` (sees all 3 apps)
- **CRM Admin**: `crm@radwa.sa` / `radwa123` (sees CRM Admin Portal, centered in launcher)
- **Managing Director**: `md@radwa.sa` / `radwa123` (sees MD Console)
- **Estimator**: `estimator@radwa.sa` / `radwa123` (sees Estimator Workspace)
