# RADWA CONSTRUCTION ERP - CRM, MD & ESTIMATOR MODULES
## Complete Python Django Backend Architecture & REST API Master Specification

> **Document Version**: 2.0.0  
> **Target Framework**: Python 3.11+ / Django 5.x / Django REST Framework (DRF)  
> **Database**: PostgreSQL 15+  
> **Authentication**: JSON Web Token (JWT) via `djangorestframework-simplejwt`  
> **Frontend Consumer**: Next.js 15 (React 19) ERP Client running at `http://localhost:3000`

---

## Table of Contents
1. [System Architecture & 3-Role Pipeline](#1-system-architecture--3-role-pipeline)
2. [Authentication & Role-Based Access Control (RBAC)](#2-authentication--role-based-access-control-rbac)
3. [Django Database Models (`models.py`)](#3-django-database-models-modelspy)
4. [Serializers Specification (`serializers.py`)](#4-serializers-specification-serializerspy)
5. [Complete REST API Endpoints Specification](#5-complete-rest-api-endpoints-specification)
   - [5.1 Auth Endpoints](#51-auth-endpoints)
   - [5.2 CRM Admin Register Endpoints](#52-crm-admin-register-endpoints)
   - [5.3 MD Executive Review Endpoints](#53-md-executive-review-endpoints)
   - [5.4 Estimator Workspace Endpoints](#54-estimator-workspace-endpoints)
   - [5.5 AI BOQ & Resources Takeoff Engine](#55-ai-boq--resources-takeoff-engine)
6. [Business Logic, Auto-Generators & State Machines (`services.py`)](#6-business-logic-auto-generators--state-machines-servicespy)
7. [File Storage & Attachments Handling](#7-file-storage--attachments-handling)
8. [Django Project Configuration & CORS Settings](#8-django-project-configuration--cors-settings)
9. [Step-by-Step Backend Developer Implementation Checklist](#9-step-by-step-backend-developer-implementation-checklist)

---

## 1. System Architecture & 3-Role Pipeline

The Radwa Construction ERP frontend is built around a **strict 3-stage role pipeline**. No user has cross-access without logging into their designated portal:

```
┌─────────────────────────────────┐
│       1. CRM Admin Portal       │
│  - Inbound Client RFQ Intake    │
│  - Auto Serial/WO Generation    │
│  - SOW Checklist & Attachments  │
│  - Initial Estimator Allocation │
└────────────────┬────────────────┘
                 │
                 ▼  (Status: "Pending MD Approval")
┌─────────────────────────────────┐
│     2. MD Executive Console     │
│  - Tender Dossier Inspection    │
│  - Workload Capacity Balancing  │
│  - Reassign Estimator if needed │
│  - Click "Approve for Bidding"  │
└────────────────┬────────────────┘
                 │
                 ▼  (Status: "Approved for Bidding" / Unlocked for Estimator)
┌─────────────────────────────────┐
│      3. Estimator Workspace     │
│  - Site Review Determination    │
│  - Step 1: Document BOQ Takeoff │
│  - Step 2: Prompt Resource Calc │
│    (Manpower, HSE, QA/QC, Eq.)  │
│  - Commercial Markup & Pricing  │
│  - Formal Proposal Submission   │
└─────────────────────────────────┘
```

> [!IMPORTANT]
> **Strict Gate Requirement**: Tenders in `Pending MD Approval` state **MUST NEVER** be returned in the Estimator Workspace queue (`GET /api/v1/estimator/queue/`). Only tenders that have `status = 'approved_bidding'` or subsequent stages (`boq_estimation`, `bid_submitted`, `won`) are visible to estimators.

---

## 2. Authentication & Role-Based Access Control (RBAC)

The system requires three separate role logins. The backend must enforce role-based permissions using DRF permissions.

### User Roles & Default Accounts
| Role | User Name | Email | Default Password | Assigned Role Title |
|:---|:---|:---|:---|:---|
| **`crm`** | Fatima Ali | `crm@radwa.sa` | `radwa123` | CRM & Tendering Administrator |
| **`md`** | Eng. Tariq Al-Mansour | `md@radwa.sa` | `radwa123` | Managing Director |
| **`estimator`** | Farhan Qureshi | `estimator@radwa.sa` | `radwa123` | Lead Piping & EPC Estimator |

### Custom DRF Permissions (`permissions.py`)
```python
from rest_framework import permissions

class IsCrmAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'crm'

class IsManagingDirector(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'md'

class IsEstimator(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'estimator'
```

---

## 3. Django Database Models (`models.py`)

### Model 1: `User` (Custom User Model)
```python
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = [
        ('crm', 'CRM Administrator'),
        ('md', 'Managing Director'),
        ('estimator', 'Estimator / Quantity Surveyor'),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='crm')
    role_title = models.CharField(max_length=150, blank=True)
    department = models.CharField(max_length=150, blank=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    avatar_initials = models.CharField(max_length=5, blank=True)

    def save(self, *args, **kwargs):
        if not self.avatar_initials and self.first_name:
            self.avatar_initials = (self.first_name[0] + (self.last_name[0] if self.last_name else '')).upper()
        super().save(*args, **kwargs)
```

---

### Model 2: `Estimator` (Engineering Pool Profile)
```python
class Estimator(models.Model):
    CAPACITY_STATUS_CHOICES = [
        ('optimal', 'Optimal Capacity'),
        ('moderate', 'Moderate'),
        ('heavy', 'Heavy Workload'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='estimator_profile', null=True, blank=True)
    name = models.CharField(max_length=150)
    initials = models.CharField(max_length=10) # e.g. "FA", "TA", "AH"
    role = models.CharField(max_length=150) # e.g. "Lead Piping & EPC Estimator"
    specialty = models.CharField(max_length=255, blank=True, null=True)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    active_tenders = models.PositiveIntegerField(default=0)
    capacity_status = models.CharField(max_length=20, choices=CAPACITY_STATUS_CHOICES, default='optimal')
    avatar_bg = models.CharField(max_length=100, default='bg-emerald-100 text-emerald-700')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def update_capacity_status(self):
        """Recalculate capacity based on active tender count."""
        count = self.assigned_tenders.filter(status__in=['approved_bidding', 'boq_estimation']).count()
        self.active_tenders = count
        if count == 0:
            self.capacity_status = 'optimal'
        elif count >= 15:
            self.capacity_status = 'heavy'
        else:
            self.capacity_status = 'moderate'
        self.save()

    def __str__(self):
        return f"{self.name} ({self.role}) - {self.active_tenders} Active"
```

---

### Model 3: `ProjectRFQ` (Master Tender Dossier)
```python
class ProjectRFQ(models.Model):
    STATUS_CHOICES = [
        ('new_rfq', 'New RFQ'),
        ('pending_md', 'Pending MD Approval'),
        ('approved_bidding', 'Approved for Bidding'),
        ('estimator_assigned', 'Estimator Assigned'),
        ('boq_estimation', 'Under BOQ Estimation'),
        ('bid_submitted', 'Bid Submitted'),
        ('negotiation', 'Under Negotiation'),
        ('won', 'Won / Active Project'),
        ('declined', 'Declined / Lost'),
    ]

    MD_STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('approved', 'Approved for Bidding'),
        ('declined', 'Declined'),
    ]

    SUBMISSION_TYPE_CHOICES = [
        ('email', 'Email Submission'),
        ('portal', 'Portal Upload'),
        ('hard_copy', 'Hard Copy / Courier'),
        ('hand_delivery', 'Hand Delivery'),
    ]

    # Identifiers
    enquiry_serial_no = models.CharField(max_length=100, unique=True, db_index=True) # e.g. RGC-RFQ-2026-0145
    work_order_no = models.CharField(max_length=100, unique=True, db_index=True)     # e.g. WO-2026-0145
    client_rfq_no = models.CharField(max_length=100, blank=True, null=True)        # e.g. ghj12345

    # Client & Project Info
    client_name = models.CharField(max_length=255)
    client_short_name = models.CharField(max_length=100, blank=True, null=True)     # e.g. ARAMCO
    site_name = models.CharField(max_length=255)                                    # e.g. Haradh Gas Plant
    proposed_project_name = models.CharField(max_length=255)                        # e.g. Haradh Pipeline & Station
    client_sender_contact = models.CharField(max_length=255, blank=True, null=True)
    project_location = models.CharField(max_length=255)                            # e.g. Eastern Province, KSA
    rfq_came_to_whose_name = models.CharField(max_length=150, default='Central Tendering Desk')
    rfq_received_through = models.CharField(max_length=100, default='Email')
    project_work_description = models.TextField(blank=True, null=True)

    # Scope of Work (SOW) - JSON Array: ["Civil", "Mechanical", "Structural"]
    sow_scopes = models.JSONField(default=list) 
    sow_caveats_notes = models.TextField(blank=True, null=True)

    # Key Dates & Submission Mode
    received_date = models.DateField()
    bid_extension_date = models.DateField(blank=True, null=True)
    bid_close_date = models.DateField()
    bid_submission_type = models.CharField(max_length=50, choices=SUBMISSION_TYPE_CHOICES, default='email')

    # Estimator Allocation
    assigned_estimator = models.ForeignKey(
        Estimator, 
        on_delete=models.SET_NULL, 
        related_name='assigned_tenders',
        blank=True, 
        null=True
    )

    # Management Reviewers (JSON List of strings)
    management_reviewers = models.JSONField(default=list)

    # Status & Valuation
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='pending_md')
    estimated_value = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)

    # Managing Director (MD) Executive Decision Fields
    md_status = models.CharField(max_length=20, choices=MD_STATUS_CHOICES, default='pending')
    md_approved_at = models.DateTimeField(blank=True, null=True)
    md_remarks = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.work_order_no} ({self.enquiry_serial_no}) - {self.proposed_project_name}"
```

---

### Model 4: `TenderAttachment` (Tender Drawings & Specs)
```python
class TenderAttachment(models.Model):
    tender = models.ForeignKey(ProjectRFQ, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='tender_docs/%Y/%m/')
    original_filename = models.CharField(max_length=255)
    file_size_display = models.CharField(max_length=50) # e.g. "12.4 MB"
    file_type = models.CharField(max_length=100)        # e.g. "application/pdf"
    uploaded_at = models.DateTimeField(auto_now_add=True)
```

---

### Model 5: `SiteReview` (Estimator Site Inspection Decision)
```python
class SiteReview(models.Model):
    STATUS_CHOICES = [
        ('Pending Determination', 'Pending Determination'),
        ('Visit Scheduled', 'Visit Scheduled'),
        ('Completed', 'Completed'),
        ('Desk Study Cleared', 'Desk Study Cleared'),
    ]

    tender = models.OneToOneField(ProjectRFQ, on_delete=models.CASCADE, related_name='site_review')
    required = models.BooleanField(default=False)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Pending Determination')
    scheduled_date = models.DateField(blank=True, null=True)
    inspector_name = models.CharField(max_length=150, blank=True, null=True)
    site_access_notes = models.TextField(blank=True, null=True)
    soil_terrain_findings = models.TextField(blank=True, null=True)
    clearance_remarks = models.TextField(blank=True, null=True)
    reviewed_at = models.DateTimeField(auto_now=True)
```

---

### Model 6: `AiBoqCalculation` (Itemized BOQ & Resource Takeoff)
```python
class AiBoqCalculation(models.Model):
    tender = models.OneToOneField(ProjectRFQ, on_delete=models.CASCADE, related_name='ai_boq_calculation')
    prompt_used = models.TextField(blank=True, null=True)
    project_summary = models.TextField(blank=True, null=True)
    estimated_duration_months = models.PositiveIntegerField(default=12)

    # Granular Resource Breakdowns stored as JSON structures
    manpower = models.JSONField(default=list)          # [{ role, trade, count, durationMonths, monthlyRate, totalCost }]
    hse = models.JSONField(default=list)               # [{ role, count, requirements, monthlyCost, totalCost }]
    qaqc = models.JSONField(default=list)              # [{ role, count, testingScope, monthlyCost, totalCost }]
    equipment_rentals = models.JSONField(default=list) # [{ equipmentName, type, quantity, durationMonths, monthlyRental, totalCost }]
    boq_line_items = models.JSONField(default=list)    # [{ itemNo, package, description, unit, quantity, unitRate, totalAmount }]

    # Commercial Valuation Rollup
    direct_material_cost = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    manpower_cost = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    equipment_cost = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    hse_cost = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    qaqc_cost = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    overheads_preliminaries = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    margin_pct = models.DecimalField(max_digits=5, decimal_places=2, default=16.50)
    margin_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    total_commercial_bid_price = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)

    generated_at = models.DateTimeField(auto_now=True)
```

---

## 4. Serializers Specification (`serializers.py`)

All Django Serializers should map between Python snake_case and frontend camelCase where needed, or provide clean standardized JSON.

### Key Serializers:
```python
from rest_framework import serializers
from .models import User, Estimator, ProjectRFQ, TenderAttachment, SiteReview, AiBoqCalculation

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'role_title', 'department', 'avatar_initials']

class EstimatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estimator
        fields = '__all__'

class TenderAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TenderAttachment
        fields = ['id', 'original_filename', 'file_size_display', 'file_type', 'file', 'uploaded_at']

class SiteReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteReview
        fields = '__all__'

class AiBoqCalculationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AiBoqCalculation
        fields = '__all__'

class ProjectRFQDetailSerializer(serializers.ModelSerializer):
    assigned_estimator = EstimatorSerializer(read_only=True)
    attachments = TenderAttachmentSerializer(many=True, read_only=True)
    site_review = SiteReviewSerializer(read_only=True)
    ai_boq_calculation = AiBoqCalculationSerializer(read_only=True)

    class Meta:
        model = ProjectRFQ
        fields = '__all__'
```

---

## 5. Complete REST API Endpoints Specification

### 5.1 Auth Endpoints (`/api/auth/`)

| Method | Endpoint | Permission | Description |
|:---|:---|:---|:---|
| `POST` | `/api/auth/login/` | AllowAny | Authenticates user with email & password, returns JWT tokens and user profile |
| `GET` | `/api/auth/me/` | IsAuthenticated | Returns profile of currently logged-in user |
| `POST` | `/api/auth/logout/` | IsAuthenticated | Blacklists refresh token / terminates session |
| `POST` | `/api/auth/token/refresh/` | AllowAny | Generates fresh access token from refresh token |

#### `POST /api/auth/login/` Payload:
```json
// Request
{
  "email": "md@radwa.sa",
  "password": "radwa123"
}

// Response (200 OK)
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "name": "Eng. Tariq Al-Mansour",
    "email": "md@radwa.sa",
    "role": "md",
    "role_title": "Managing Director",
    "department": "Executive Governance & Bidding Authorization",
    "avatar_initials": "TM"
  }
}
```

---

### 5.2 CRM Admin Register Endpoints (`/api/v1/crm/`)

| Method | Endpoint | Permission | Description |
|:---|:---|:---|:---|
| `GET` | `/api/v1/crm/tenders/` | `IsCrmAdmin` or `IsManagingDirector` | List all project RFQs with status tabs & search |
| `POST` | `/api/v1/crm/tenders/register/` | `IsCrmAdmin` | Register new tender dossier with attachments (Multipart Form) |
| `GET` | `/api/v1/crm/tenders/{id}/` | Authenticated | Retrieve complete dossier details |
| `PATCH` | `/api/v1/crm/tenders/{id}/assign-estimator/` | `IsCrmAdmin` or `IsManagingDirector` | Allocate or reassign estimator |
| `GET` | `/api/v1/crm/estimators/pool-capacity/` | Authenticated | Get capacity status & active tenders of all 5 estimators |
| `GET` | `/api/v1/crm/estimators/auto-assign/` | `IsCrmAdmin` | Suggest estimator with lowest active tender workload |

#### `POST /api/v1/crm/tenders/register/` Payload:
```json
// Multipart Form-Data
{
  "client_name": "Saudi Aramco Gas Operations",
  "client_short_name": "ARAMCO",
  "site_name": "Haradh Gas Compression Plant",
  "proposed_project_name": "Haradh Pipeline & Valve Station EPC Package",
  "client_sender_contact": "procurement@aramco.com",
  "project_location": "Eastern Province, Saudi Arabia",
  "rfq_came_to_whose_name": "Central Tendering Desk",
  "rfq_received_through": "Email",
  "project_work_description": "EPC installation of 10km cross-country gas pipeline...",
  "sow_scopes": ["Civil", "Mechanical", "Structural"],
  "sow_caveats_notes": "Aramco SAEP-310 welding specs mandatory.",
  "received_date": "2026-10-16",
  "bid_close_date": "2026-10-30",
  "bid_submission_type": "email",
  "assigned_estimator_id": 2,
  "management_reviewers": ["Managing Director (MD)"],
  "files": ["(Binary Drawing PDF 1)", "(Binary SOW Spec 2)"]
}

// Response (201 Created)
{
  "id": 145,
  "enquiry_serial_no": "RGC-RFQ-2026-0145",
  "work_order_no": "WO-2026-0145",
  "status": "pending_md",
  "md_status": "pending",
  "message": "Tender registered successfully and submitted for MD Executive Review."
}
```

---

### 5.3 MD Executive Review Endpoints (`/api/v1/crm/md/`)

| Method | Endpoint | Permission | Description |
|:---|:---|:---|:---|
| `GET` | `/api/v1/crm/md/review-queue/` | `IsManagingDirector` | List tenders where `status='pending_md'` |
| `POST` | `/api/v1/crm/md/tenders/{id}/approve/` | `IsManagingDirector` | Authorize tender for bidding (unlocks for Estimator) |
| `POST` | `/api/v1/crm/md/tenders/{id}/decline/` | `IsManagingDirector` | Decline tender opportunity |
| `PATCH` | `/api/v1/crm/md/tenders/{id}/reassign/` | `IsManagingDirector` | Rebalance estimator allocation before sign-off |

#### `POST /api/v1/crm/md/tenders/{id}/approve/` Payload:
```json
// Request
{
  "md_remarks": "Authorized. Ensure Aramco-certified welders and heavy trenchers are factored in."
}

// Response (200 OK)
{
  "id": 145,
  "status": "approved_bidding",
  "md_status": "approved",
  "md_approved_at": "2026-10-16T14:30:00Z",
  "message": "Tender officially approved for bidding and dispatched to Estimator queue."
}
```

---

### 5.4 Estimator Workspace Endpoints (`/api/v1/estimator/`)

| Method | Endpoint | Permission | Description |
|:---|:---|:---|:---|
| `GET` | `/api/v1/estimator/queue/` | `IsEstimator` | **Strict Filter**: Returns only MD-approved tenders (`status in ['approved_bidding', 'boq_estimation', 'bid_submitted']`) assigned to this estimator (or all if senior) |
| `POST` | `/api/v1/estimator/tenders/{id}/site-review/` | `IsEstimator` | Record Site Review determination (Scheduled Visit vs Desk Study Cleared) |
| `PUT` | `/api/v1/estimator/tenders/{id}/save-estimation/` | `IsEstimator` | Save final BOQ line items, resources, and commercial markups |
| `GET` | `/api/v1/estimator/tenders/{id}/proposal-sheet/` | `IsEstimator` | Generate commercial bid proposal sheet rollup |
| `POST` | `/api/v1/estimator/tenders/{id}/submit-bid/` | `IsEstimator` | Submit commercial proposal (sets `status='bid_submitted'`) |

#### `POST /api/v1/estimator/tenders/{id}/site-review/` Payload:
```json
// Request
{
  "required": true,
  "status": "Visit Scheduled",
  "scheduled_date": "2026-10-20",
  "inspector_name": "Eng. Farhan Qureshi",
  "site_access_notes": "Security gate pass required from Aramco security office 48h prior.",
  "soil_terrain_findings": "High water table between KM 4 and KM 7; requires dewatering pumps."
}

// Response (200 OK)
{
  "success": true,
  "message": "Site review scheduled successfully."
}
```

---

### 5.5 AI BOQ & Resources Takeoff Engine (`POST /api/v1/estimator/tenders/{id}/generate-boq/`)

This endpoint executes the 2-step AI takeoff calculation.

**Request Body:**
```json
{
  "step": 2, // 1 for initial drawing takeoff, 2 for operational prompt takeoff
  "prompt": "Lay 10 kilometer pipeline with trenching, dewatering in marshy soil, HDPE encasement, 2 valve stations, and 24/7 crew shifts"
}
```

**Response Body (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "promptUsed": "Lay 10 kilometer pipeline with trenching, dewatering in marshy soil...",
    "projectSummary": "10 km cross-country pipeline with marsh dewatering and continuous shift execution.",
    "estimatedDurationMonths": 10,
    "manpower": [
      { "id": "mp-1", "role": "Site Construction Manager", "trade": "Supervision", "count": 1, "durationMonths": 10, "monthlyRate": 9500, "totalCost": 95000 },
      { "id": "mp-2", "role": "Certified 6G Pipe Welders (Aramco Standard)", "trade": "Mechanical", "count": 12, "durationMonths": 8, "monthlyRate": 3400, "totalCost": 326400 },
      { "id": "mp-3", "role": "Dewatering & Trenching Crew Operators", "trade": "Civil", "count": 16, "durationMonths": 6, "monthlyRate": 2600, "totalCost": 249600 }
    ],
    "hse": [
      { "id": "hse-1", "role": "Lead HSE Officer (NEBOSH IGC Certified)", "count": 2, "requirements": "Confined space & deep trench safety monitoring", "monthlyCost": 4800, "totalCost": 96000 },
      { "id": "hse-2", "role": "Paramedic & On-Site Emergency Rescue Unit", "count": 2, "requirements": "24/7 medical standby and heat-stress hydration points", "monthlyCost": 3200, "totalCost": 64000 }
    ],
    "qaqc": [
      { "id": "qa-1", "role": "Senior Welding Inspector (CSWIP 3.1)", "count": 2, "testingScope": "100% Visual and Radiographic Testing (RT) on pressure joints", "monthlyCost": 5800, "totalCost": 116000 },
      { "id": "qa-2", "role": "NDT Level II Ultrasonic & Magnetic Particle Technician", "count": 2, "testingScope": "UT flaw detection on tie-in field welds", "monthlyCost": 4400, "totalCost": 88000 }
    ],
    "equipmentRentals": [
      { "id": "eq-1", "equipmentName": "CAT 336 Heavy Excavator (With Rock Breaker)", "type": "Earthmoving", "quantity": 4, "durationMonths": 6, "monthlyRental": 8500, "totalCost": 204000 },
      { "id": "eq-2", "equipmentName": "High-Capacity Diesel Dewatering Pump Units (6-inch)", "type": "Dewatering", "quantity": 6, "durationMonths": 5, "monthlyRental": 3200, "totalCost": 96000 },
      { "id": "eq-3", "equipmentName": "CAT 583T Pipelayer Sideboom (70 Ton)", "type": "Lifting", "quantity": 2, "durationMonths": 6, "monthlyRental": 14000, "totalCost": 168000 }
    ],
    "boqLineItems": [
      { "id": "b-1", "itemNo": "1.01", "package": "Civil", "description": "Trench excavation in rocky & marshy soil depth up to 3.5m", "unit": "m³", "quantity": 42000, "unitRate": 18.5, "totalAmount": 777000 },
      { "id": "b-2", "itemNo": "1.02", "package": "Civil", "description": "Continuous deep dewatering and stabilization of trench bed", "unit": "LS", "quantity": 1, "unitRate": 125000, "totalAmount": 125000 },
      { "id": "b-3", "itemNo": "2.01", "package": "Piping", "description": "Stringing, beveling, fit-up and 6G welding of carbon steel pipe", "unit": "LM", "quantity": 10000, "unitRate": 145, "totalAmount": 1450000 }
    ],
    "totals": {
      "directMaterialCost": 2352000,
      "manpowerCost": 671000,
      "equipmentCost": 468000,
      "hseCost": 160000,
      "qaqcCost": 204000,
      "overheadsAndPreliminaries": 308400,
      "marginPct": 16.5,
      "marginAmount": 686946,
      "totalCommercialBidPrice": 4850346
    }
  }
}
```

---

## 6. Business Logic, Auto-Generators & State Machines (`services.py`)

### 6.1 Sequential Serial Number Generator
```python
import datetime
from django.db.models import Max
from .models import ProjectRFQ

def generate_enquiry_serial():
    """Generates unique sequential Enquiry Serial: RGC-RFQ-YYYY-XXXX"""
    year = datetime.date.today().year
    prefix = f"RGC-RFQ-{year}-"
    last_record = ProjectRFQ.objects.filter(enquiry_serial_no__startswith=prefix).aggregate(Max('enquiry_serial_no'))
    last_serial = last_record['enquiry_serial_no__max']
    seq = int(last_serial.split('-')[-1]) + 1 if last_serial else 101
    return f"{prefix}{str(seq).zfill(4)}"

def generate_work_order_no():
    """Generates unique sequential Work Order Number: WO-YYYY-XXXX"""
    year = datetime.date.today().year
    prefix = f"WO-{year}-"
    last_record = ProjectRFQ.objects.filter(work_order_no__startswith=prefix).aggregate(Max('work_order_no'))
    last_wo = last_record['work_order_no__max']
    seq = int(last_wo.split('-')[-1]) + 1 if last_wo else 101
    return f"{prefix}{str(seq).zfill(4)}"
```

### 6.2 Auto-Assign Optimal Estimator by Workload
```python
from .models import Estimator

def get_optimal_estimator():
    """Picks the active estimator who has the lowest active tender load."""
    return Estimator.objects.filter(is_active=True).order_by('active_tenders').first()
```

### 6.3 State Transition Matrix
```
[New RFQ / Intake] 
       │ (Auto)
       ▼
[Pending MD Approval]
       │ (MD Action: POST /api/v1/crm/md/{id}/approve/)
       ▼
[Approved for Bidding]  ◄── Unlocks in Estimator Queue
       │ (Estimator Action: PUT /save-estimation/)
       ▼
[Under BOQ Estimation]
       │ (Estimator Action: POST /submit-bid/)
       ▼
[Bid Submitted]
       │
       ├─► [Under Negotiation] ──► [Won / Active Project]
       └─► [Declined / Lost]
```

---

## 7. File Storage & Attachments Handling

### Supported File Types
- Drawings: `.dwg`, `.dxf`, `.pdf`
- Specifications: `.pdf`, `.docx`, `.doc`
- BOQ Schedules: `.xlsx`, `.xls`, `.csv`
- Compressed Archives: `.zip`, `.rar`
- Max upload limit: **50 MB** per file.

### Django Settings (`settings.py`)
```python
import os

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

DATA_UPLOAD_MAX_MEMORY_SIZE = 52428800 # 50 MB
FILE_UPLOAD_MAX_MEMORY_SIZE = 52428800
```

---

## 8. Django Project Configuration & CORS Settings

To ensure seamless communication with the Next.js frontend, install `django-cors-headers` and configure `settings.py`:

```python
INSTALLED_APPS = [
    # Django apps...
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party packages
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',

    # Radwa ERP apps
    'apps.authentication',
    'apps.crm',
    'apps.estimator',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', # MUST be at top
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    # ...
]

# Allow Next.js frontend
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

CORS_ALLOW_CREDENTIALS = True

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 25,
}

# SimpleJWT Settings
from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=8),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}
```

---

## 9. Step-by-Step Backend Developer Implementation Checklist

### Phase 1: Environment & Authentication
- [ ] Initialize Python virtual environment (`python -m venv venv`).
- [ ] Install dependencies: `pip install django djangorestframework djangorestframework-simplejwt django-cors-headers psycopg2-binary openai`.
- [ ] Implement custom `User` model with `role` field (`crm`, `md`, `estimator`).
- [ ] Create seed management command (`python manage.py seed_users`) to create default accounts:
  - `crm@radwa.sa` / `radwa123`
  - `md@radwa.sa` / `radwa123`
  - `estimator@radwa.sa` / `radwa123`
- [ ] Implement `POST /api/auth/login/` returning JWT access/refresh tokens and user profile.

### Phase 2: CRM & Estimator Pool Models
- [ ] Create `Estimator` model and seed the 5 standard quantity surveyors (Ahmed Mansoor, Farhan Qureshi, Rajesh Kumar, Salman Al-Dosari, Tariq Al-Ghamdi).
- [ ] Create `ProjectRFQ` and `TenderAttachment` models with auto serial generator signals.
- [ ] Implement `POST /api/v1/crm/tenders/register/` accepting multipart form data and files.
- [ ] Implement `GET /api/v1/crm/tenders/` with search and status filters.

### Phase 3: MD Executive Review Console
- [ ] Implement `GET /api/v1/crm/md/review-queue/` filtering for `status='pending_md'`.
- [ ] Implement `POST /api/v1/crm/md/tenders/{id}/approve/` which updates status to `approved_bidding`, sets `md_approved_at`, and triggers an update signal.
- [ ] Implement `POST /api/v1/crm/md/tenders/{id}/decline/`.

### Phase 4: Estimator Workspace & AI BOQ Engine
- [ ] Implement `GET /api/v1/estimator/queue/` strictly returning only MD-approved tenders.
- [ ] Implement `SiteReview` model and `POST /api/v1/estimator/tenders/{id}/site-review/`.
- [ ] Implement `AiBoqCalculation` model and `POST /api/v1/estimator/tenders/{id}/generate-boq/` (integrating OpenAI `gpt-4o-mini` with fallback heuristics).
- [ ] Implement `PUT /api/v1/estimator/tenders/{id}/save-estimation/` saving all items and updated valuation.
- [ ] Implement `POST /api/v1/estimator/tenders/{id}/submit-bid/` setting `status='bid_submitted'`.

### Phase 5: Verification & Integration
- [ ] Verify CORS headers allow requests from `http://localhost:3000`.
- [ ] Run Django test suite verifying that an unapproved tender cannot be accessed by the estimator endpoint.
- [ ] Set `NEXT_PUBLIC_BACKEND_API_URL=http://localhost:8000` in the Next.js `.env.local` to execute full end-to-end integration!
