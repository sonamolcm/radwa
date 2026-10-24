import json
from django.db import models
from django.contrib.auth.models import User


def _ensure_json_object(val):
    if not val:
        return None
    if isinstance(val, (dict, list)):
        return val
    if isinstance(val, str):
        try:
            parsed = json.loads(val)
            if isinstance(parsed, str):
                try:
                    return json.loads(parsed)
                except Exception:
                    return parsed
            return parsed
        except Exception:
            return val
    return val


class Client(models.Model):
    """
    Client Directory entity for Radwa ERP
    """
    company_name = models.CharField(max_length=200)
    short_code = models.CharField(max_length=50, blank=True, default="")
    cr_number = models.CharField(max_length=50, blank=True, default="")
    vat_number = models.CharField(max_length=50, blank=True, default="")
    contact_person = models.CharField(max_length=150, blank=True, default="")
    contact_email = models.EmailField(blank=True, default="")
    contact_phone = models.CharField(max_length=50, blank=True, default="")
    city = models.CharField(max_length=100, blank=True, default="Jubail")
    headquarters = models.CharField(max_length=150, blank=True, default="Eastern Province, KSA")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["company_name"]

    def __str__(self):
        return f"{self.company_name} ({self.short_code})" if self.short_code else self.company_name

    def to_dict(self):
        return {
            "id": str(self.id),
            "companyName": self.company_name,
            "shortCode": self.short_code,
            "crNumber": self.cr_number,
            "vatNumber": self.vat_number,
            "contactPerson": self.contact_person,
            "contactEmail": self.contact_email,
            "contactPhone": self.contact_phone,
            "city": self.city,
            "headquarters": self.headquarters,
            "createdAt": self.created_at.isoformat(),
        }


class Estimator(models.Model):
    """
    Staff Allocation entity for Estimators
    """
    SPECIALTY_CHOICES = [
        ("Civil & Infrastructure", "Civil & Infrastructure"),
        ("Pipeline Engineering", "Pipeline Engineering"),
        ("Mechanical & MEP", "Mechanical & MEP"),
        ("Electrical & Instrumentation", "Electrical & Instrumentation"),
    ]

    CAPACITY_CHOICES = [
        ("Optimal Capacity", "Optimal Capacity"),
        ("Near Limit", "Near Limit"),
        ("Moderate", "Moderate"),
        ("Over Capacity", "Over Capacity"),
        ("Full Capacity", "Full Capacity"),
    ]

    name = models.CharField(max_length=150)
    initials = models.CharField(max_length=10)
    email = models.EmailField(blank=True, default="")
    phone = models.CharField(max_length=50, blank=True, default="")
    role = models.CharField(max_length=100, default="Estimating Engineer")
    specialty = models.CharField(max_length=100, choices=SPECIALTY_CHOICES, default="Civil & Infrastructure")
    active_tenders = models.PositiveIntegerField(default=0)
    capacity_status = models.CharField(max_length=50, choices=CAPACITY_CHOICES, default="Optimal Capacity")
    avatar_bg = models.CharField(max_length=150, default="bg-emerald-100 text-emerald-700")

    class Meta:
        ordering = ["active_tenders", "name"]

    def __str__(self):
        return f"{self.name} ({self.active_tenders} active)"

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "initials": self.initials,
            "email": self.email,
            "phone": self.phone,
            "role": self.role,
            "specialty": self.specialty,
            "activeTenders": self.active_tenders,
            "capacityStatus": self.capacity_status,
            "avatarBg": self.avatar_bg,
        }


class Surveyor(models.Model):
    """
    Staff Allocation entity for Certified Field Surveyors (Radwa Operations)
    """
    name = models.CharField(max_length=150)
    initials = models.CharField(max_length=10)
    email = models.EmailField(blank=True, default="")
    phone = models.CharField(max_length=50, blank=True, default="")
    role = models.CharField(max_length=100, default="Certified Field Surveyor")
    assigned_zone = models.CharField(max_length=100, default="Jubail & Eastern Province")
    active_surveys = models.PositiveIntegerField(default=0)
    capacity_status = models.CharField(max_length=50, default="Available")
    avatar_bg = models.CharField(max_length=150, default="bg-teal-100 text-teal-800")
    specialty = models.CharField(max_length=150, blank=True, default="GPS RTK Topography & GPR Utility Scanning")

    class Meta:
        ordering = ["active_surveys", "name"]

    def __str__(self):
        return f"{self.name} ({self.assigned_zone})"

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "initials": self.initials,
            "email": self.email,
            "phone": self.phone,
            "role": self.role,
            "assignedZone": self.assigned_zone,
            "activeSurveys": self.active_surveys,
            "capacityStatus": self.capacity_status,
            "avatarBg": self.avatar_bg,
            "specialty": self.specialty,
        }


class ProjectRFQ(models.Model):
    """
    Tender Pipeline / Work Order Registry entity for Radwa ERP
    """
    STATUS_CHOICES = [
        ("New RFQ", "New RFQ"),
        ("Pending MD Approval", "Pending MD Approval"),
        ("Approved for Bidding", "Approved for Bidding"),
        ("Estimator Assigned", "Estimator Assigned"),
        ("Under BOQ Estimation", "Under BOQ Estimation"),
        ("Survey In Progress", "Survey In Progress"),
        ("Bid Submitted", "Bid Submitted"),
        ("Under Negotiation", "Under Negotiation"),
        ("Won - In Handover", "Won - In Handover"),
        ("Won / Active Project", "Won / Active Project"),
        ("Rejected / Withdrawn", "Rejected / Withdrawn"),
        ("Declined / Lost", "Declined / Lost"),
    ]

    NATURE_OF_WORK_CHOICES = [
        ("Pipelines", "Pipelines"),
        ("Civil & Infra", "Civil & Infra"),
        ("Mechanical", "Mechanical"),
        ("Electrical", "Electrical"),
        ("Turnkey EPC", "Turnkey EPC"),
    ]

    enquiry_serial_no = models.CharField(max_length=100)
    work_order_no = models.CharField(max_length=100, unique=True)
    client_rfq_no = models.CharField(max_length=150, blank=True, default="")
    received_date = models.CharField(max_length=50)
    client_name = models.CharField(max_length=200)
    client_short_name = models.CharField(max_length=50, blank=True, default="")
    site_name = models.CharField(max_length=200, blank=True, default="")
    proposed_project_name = models.CharField(max_length=300)
    client_sender_contact = models.CharField(max_length=200, blank=True, default="")
    project_location = models.CharField(max_length=200, blank=True, default="")
    rfq_came_to_whose_name = models.CharField(max_length=200, blank=True, default="")
    rfq_received_through = models.CharField(max_length=100, default="Email")
    project_work_description = models.TextField(blank=True, default="")
    
    # Work & Scope fields
    nature_of_work = models.CharField(max_length=50, choices=NATURE_OF_WORK_CHOICES, default="Civil & Infra")
    scope_of_work = models.JSONField(default=list, blank=True)
    sow_scopes = models.JSONField(default=list, blank=True)
    sow_caveats_notes = models.TextField(blank=True, default="")
    
    # Dates
    submission_deadline = models.CharField(max_length=50, blank=True, default="")
    bid_close_date = models.CharField(max_length=50)
    bid_extension_date = models.CharField(max_length=50, blank=True, null=True)
    bid_submission_type = models.CharField(max_length=100, default="Email Submission")
    attached_files = models.JSONField(default=list, blank=True)
    
    # Allocation & Status
    assigned_estimator = models.ForeignKey(
        Estimator, on_delete=models.SET_NULL, null=True, blank=True, related_name="projects"
    )
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default="Pending MD Approval")
    md_status = models.CharField(max_length=50, default="Pending Review")
    management_reviewers = models.JSONField(default=list, blank=True)
    
    # Financials & Tender Bonds (Radwa ERP Section 4)
    estimated_value = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    currency = models.CharField(max_length=10, default="SAR")
    bid_security_required = models.BooleanField(default=False)
    bid_bond_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    
    # MD Console fields
    win_probability = models.PositiveIntegerField(default=75)
    target_margin = models.DecimalField(max_digits=5, decimal_places=2, default=18.5)
    risk_level = models.CharField(max_length=20, default="Low")
    md_remarks = models.TextField(blank=True, default="")
    md_approved_at = models.DateTimeField(blank=True, null=True)

    # Estimator details
    site_review = models.JSONField(default=dict, blank=True)
    ai_boq_calculation = models.JSONField(default=dict, blank=True)
    survey_request = models.JSONField(default=dict, blank=True)
    bid_package = models.JSONField(default=dict, blank=True)
    boq_comparison = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.work_order_no} - {self.proposed_project_name}"

    @property
    def workOrderNo(self):
        return self.work_order_no

    @property
    def proposedProjectName(self):
        return self.proposed_project_name

    @property
    def clientName(self):
        return self.client_name

    @property
    def estimatedValue(self):
        return float(self.estimated_value)

    def to_dict(self):
        return {
            "id": str(self.id),
            "enquirySerialNo": self.enquiry_serial_no,
            "workOrderNo": self.work_order_no,
            "clientRfqNo": self.client_rfq_no,
            "receivedDate": self.received_date,
            "clientName": self.client_name,
            "clientShortName": self.client_short_name,
            "siteName": self.site_name,
            "proposedProjectName": self.proposed_project_name,
            "clientSenderContact": self.client_sender_contact,
            "projectLocation": self.project_location,
            "rfqCameToWhoseName": self.rfq_came_to_whose_name,
            "rfqReceivedThrough": self.rfq_received_through,
            "projectWorkDescription": self.project_work_description,
            "natureOfWork": self.nature_of_work,
            "scopeOfWork": _ensure_json_object(self.scope_of_work) or [],
            "sowScopes": _ensure_json_object(self.sow_scopes) or [],
            "sowCaveatsNotes": self.sow_caveats_notes or "",
            "submissionDeadline": self.submission_deadline or self.bid_close_date,
            "bidCloseDate": self.bid_close_date,
            "bidExtensionDate": self.bid_extension_date,
            "bidSubmissionType": self.bid_submission_type,
            "attachedFiles": _ensure_json_object(self.attached_files) or [],
            "assignedEstimatorId": str(self.assigned_estimator.id) if self.assigned_estimator else None,
            "assignedEstimatorName": self.assigned_estimator.name if self.assigned_estimator else None,
            "assignedEstimatorRole": self.assigned_estimator.role if self.assigned_estimator else None,
            "status": self.status,
            "mdStatus": self.md_status,
            "mdRemarks": self.md_remarks,
            "mdApprovedAt": self.md_approved_at.isoformat() if self.md_approved_at else None,
            "managementReviewers": _ensure_json_object(self.management_reviewers) or [],
            "siteReview": _ensure_json_object(self.site_review),
            "aiBoqCalculation": _ensure_json_object(self.ai_boq_calculation),
            "surveyRequest": _ensure_json_object(self.survey_request),
            "bidPackage": _ensure_json_object(self.bid_package),
            "boqComparison": _ensure_json_object(self.boq_comparison),
            "estimatedValue": float(self.estimated_value),
            "currency": self.currency,
            "bidSecurityRequired": self.bid_security_required,
            "bidBondAmount": float(self.bid_bond_amount),
            "winProbability": self.win_probability,
            "targetMargin": float(self.target_margin),
            "riskLevel": self.risk_level,
            "createdAt": self.created_at.isoformat(),
        }


# Legacy Item model
class Item(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
    ]
    PRIORITY_CHOICES = [
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
    ]
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default="")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default="medium")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "status": self.status,
            "priority": self.priority,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
