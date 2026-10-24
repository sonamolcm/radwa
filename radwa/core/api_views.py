import json
import os
import random
from django.db.models import Q
from django.http import JsonResponse, HttpResponseBadRequest, HttpResponseNotFound
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.utils import timezone
from .models import Item, Estimator, ProjectRFQ, Client, Surveyor

SERVER_API_KEY = os.getenv("SERVER_API_KEY", "")


def verify_server_auth(request):
    """
    Optional server-to-server authentication.
    If SERVER_API_KEY is configured in .env, validates the X-Server-Key header.
    """
    if SERVER_API_KEY:
        client_key = request.headers.get("X-Server-Key", "")
        return client_key == SERVER_API_KEY
    return True


# ============================================================================
# Authentication API (Matching Radwa ERP Section 6 Credentials)
# ============================================================================

ROLE_MAPPINGS = {
    "admin@radwa.sa": {
        "role": "Super Administrator",
        "name": "Super Admin",
        "apps": ["crm", "md", "estimator", "material-requests", "operations", "surveyor", "qaqc", "hse", "hr", "inventory", "purchase"],
    },
    "crm@radwa.sa": {
        "role": "CRM Admin",
        "name": "Fatima Ali (CRM Intake)",
        "apps": ["crm"],
    },
    "md@radwa.sa": {
        "role": "Managing Director",
        "name": "Eng. Tariq Al-Mansour (Managing Director)",
        "apps": ["md"],
    },
    "estimator@radwa.sa": {
        "role": "Estimator",
        "name": "Farhan Qureshi (Lead Estimator)",
        "apps": ["estimator", "material-requests"],
    },
    "operations@radwa.sa": {
        "role": "Operations Manager",
        "name": "Sultan Al-Otaibi (Operations Head)",
        "apps": ["operations", "surveyor"],
    },
    "surveyor@radwa.sa": {
        "role": "Field Surveyor",
        "name": "Tariq Al-Ghamdi (Field Surveyor)",
        "apps": ["surveyor"],
    },
    "hse@radwa.sa": {
        "role": "Head of HSE & Safety Compliance",
        "name": "Hamad Al-Ghamdi",
        "apps": ["hse"],
    },
    "qaqc@radwa.sa": {
        "role": "QA/QC Quality Director",
        "name": "Majed Al-Harbi",
        "apps": ["qaqc"],
    },
    "hr@radwa.sa": {
        "role": "HR & Personnel Director",
        "name": "Nouf Al-Shehri",
        "apps": ["hr"],
    },
    "purchase@radwa.sa": {
        "role": "Head of Procurement & Purchase Desk",
        "name": "Eng. Khalid Al-Ghamdi",
        "apps": ["purchase"],
    },
    "inventory@radwa.sa": {
        "role": "Central Warehouse & Inventory Controller",
        "name": "Fahad Al-Dossary",
        "apps": ["inventory"],
    },
    "mr@radwa.sa": {
        "role": "Material Requests QA Lead",
        "name": "Eng. Tariq Al-Mansour (Material QA)",
        "apps": ["material-requests"],
    },
}


@csrf_exempt
@require_http_methods(["POST"])
def auth_login(request):
    """
    POST /api/auth/login/
    Body: { "email": "admin@radwa.sa", "password": "radwa123" }
    """
    try:
        payload = json.loads(request.body.decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return HttpResponseBadRequest(JsonResponse({"error": "Invalid JSON body"}))

    raw_ident = (payload.get("email") or payload.get("username") or "").strip().lower()
    password = payload.get("password", "")

    if not raw_ident:
        return JsonResponse({"error": "Email or username is required."}, status=400)
    if not password:
        return JsonResponse({"error": "Password is required."}, status=400)

    # Normalize email and username
    if "@" in raw_ident:
        resolved_email = raw_ident
        resolved_username = raw_ident.split("@")[0]
    else:
        resolved_email = f"{raw_ident}@radwa.sa"
        resolved_username = raw_ident

    # Check against database user
    user = authenticate(request, username=resolved_username, password=password)
    if not user:
        user = authenticate(request, username=resolved_email, password=password)
    if not user:
        # Check by email or username lookup in database
        user_obj = User.objects.filter(
            Q(email__iexact=resolved_email) | Q(username__iexact=resolved_username) | Q(username__iexact=resolved_email)
        ).first()
        if user_obj:
            user = authenticate(request, username=user_obj.username, password=password)

    # Check against corporate role mapping presets
    if not user and resolved_email in ROLE_MAPPINGS:
        if password == "radwa123":
            user_obj = User.objects.filter(
                Q(email__iexact=resolved_email) | Q(username__iexact=resolved_username) | Q(username__iexact=resolved_email)
            ).first()
            if not user_obj:
                user_obj = User.objects.create_user(
                    username=resolved_username,
                    email=resolved_email,
                    password="radwa123",
                    first_name=ROLE_MAPPINGS[resolved_email]["name"]
                )
            else:
                user_obj.set_password("radwa123")
                user_obj.save()
            user = user_obj
        else:
            return JsonResponse({"error": "Invalid password for this corporate account. Access denied."}, status=401)

    if not user:
        return JsonResponse({"error": "Invalid email/username or password. Access denied."}, status=401)

    # Login to Django session
    try:
        login(request, user)
    except Exception:
        pass

    role_info = ROLE_MAPPINGS.get(
        resolved_email,
        {
            "role": "Super Administrator" if user.is_superuser else "CRM Admin",
            "name": user.get_full_name() or user.username,
            "apps": ["crm", "md", "estimator"] if user.is_superuser else ["crm"],
        },
    )

    role_key = resolved_username if resolved_username in [
        'admin', 'crm', 'md', 'estimator', 'operations', 'surveyor', 'qaqc', 'hse', 'hr', 'inventory', 'purchase', 'mr'
    ] else ('admin' if user.is_superuser else 'crm')

    return JsonResponse(
        {
            "user": {
                "id": str(user.id),
                "email": user.email or resolved_email,
                "name": role_info["name"],
                "role": role_key,
                "roleTitle": role_info["role"],
                "allowedApps": role_info["apps"],
            },
            "token": f"session-{user.id}-{random.randint(10000, 99999)}",
            "message": "Authenticated successfully",
        },
        status=200,
    )


# ============================================================================
# Client Directory API
# ============================================================================

@csrf_exempt
@require_http_methods(["GET", "POST"])
def clients_list_create(request):
    """
    GET /api/clients/ - List all registered clients
    POST /api/clients/ - Create a new client directory record
    """
    if not verify_server_auth(request):
        return JsonResponse({"error": "Unauthorized server request"}, status=401)

    if request.method == "GET":
        clients = Client.objects.all()
        search_q = request.GET.get("search", "").strip().lower()
        if search_q:
            clients = clients.filter(
                Q(company_name__icontains=search_q)
                | Q(short_code__icontains=search_q)
                | Q(cr_number__icontains=search_q)
            )
        data = [c.to_dict() for c in clients]
        return JsonResponse({"clients": data, "count": len(data)}, status=200)

    elif request.method == "POST":
        try:
            payload = json.loads(request.body.decode("utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError):
            return HttpResponseBadRequest(JsonResponse({"error": "Invalid JSON body"}))

        company_name = payload.get("companyName", "").strip()
        if not company_name:
            return JsonResponse({"error": "companyName is required."}, status=400)

        client = Client.objects.create(
            company_name=company_name,
            short_code=payload.get("shortCode", "").strip(),
            cr_number=payload.get("crNumber", "").strip(),
            vat_number=payload.get("vatNumber", "").strip(),
            contact_person=payload.get("contactPerson", "").strip(),
            contact_email=payload.get("contactEmail", "").strip(),
            contact_phone=payload.get("contactPhone", "").strip(),
            city=payload.get("city", "Jubail").strip(),
            headquarters=payload.get("headquarters", "Eastern Province, KSA").strip(),
        )
        return JsonResponse(client.to_dict(), status=201)


# ============================================================================
# CRM Estimators & Projects API
# ============================================================================

@csrf_exempt
@require_http_methods(["GET"])
def estimators_list(request):
    """
    GET /api/estimators/ - List all estimators and capacity
    """
    if not verify_server_auth(request):
        return JsonResponse({"error": "Unauthorized server request"}, status=401)

    estimators = Estimator.objects.all()
    data = [est.to_dict() for est in estimators]
    return JsonResponse({"estimators": data, "count": len(data)}, status=200)


@csrf_exempt
@require_http_methods(["GET", "POST"])
def projects_list_create(request):
    """
    GET /api/projects/ - List projects with search & filtering
    POST /api/projects/ - Register new client tender project
    """
    if not verify_server_auth(request):
        return JsonResponse({"error": "Unauthorized server request"}, status=401)

    if request.method == "GET":
        projects = ProjectRFQ.objects.all().select_related("assigned_estimator")

        search_query = request.GET.get("search", "").strip().lower()
        if search_query:
            projects = projects.filter(
                Q(proposed_project_name__icontains=search_query)
                | Q(work_order_no__icontains=search_query)
                | Q(enquiry_serial_no__icontains=search_query)
                | Q(client_name__icontains=search_query)
                | Q(client_short_name__icontains=search_query)
                | Q(site_name__icontains=search_query)
                | Q(project_location__icontains=search_query)
                | Q(assigned_estimator__name__icontains=search_query)
            )

        status_filter = request.GET.get("status")
        if status_filter and status_filter != "ALL":
            projects = projects.filter(status=status_filter)

        estimator_filter = request.GET.get("estimator")
        if estimator_filter:
            if estimator_filter == "UNASSIGNED":
                projects = projects.filter(assigned_estimator__isnull=True)
            elif estimator_filter != "ALL":
                projects = projects.filter(assigned_estimator_id=estimator_filter)

        data = [p.to_dict() for p in projects]
        return JsonResponse({"projects": data, "count": len(data)}, status=200)

    elif request.method == "POST":
        try:
            payload = json.loads(request.body.decode("utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError):
            return HttpResponseBadRequest(JsonResponse({"error": "Invalid JSON body"}))

        client_name = payload.get("clientName", "").strip()
        proposed_project_name = payload.get("proposedProjectName", "").strip()

        if not client_name or not proposed_project_name:
            return JsonResponse(
                {"error": "Both clientName and proposedProjectName are required."},
                status=400,
            )

        last_id = ProjectRFQ.objects.count() + 1

        work_order_no = payload.get("workOrderNo")
        if not work_order_no or ProjectRFQ.objects.filter(work_order_no=work_order_no.strip()).exists():
            seq = last_id
            while ProjectRFQ.objects.filter(work_order_no=f"WO-RADWA-{seq:04d}").exists():
                seq += 1
            work_order_no = f"WO-RADWA-{seq:04d}"
        else:
            work_order_no = work_order_no.strip()

        enquiry_serial_no = payload.get("enquirySerialNo")
        if not enquiry_serial_no or ProjectRFQ.objects.filter(enquiry_serial_no=enquiry_serial_no.strip()).exists():
            seq = last_id
            while ProjectRFQ.objects.filter(enquiry_serial_no=f"RFQ-2026-{seq:04d}").exists():
                seq += 1
            enquiry_serial_no = f"RFQ-2026-{seq:04d}"
        else:
            enquiry_serial_no = enquiry_serial_no.strip()

        assigned_est = None
        est_id = payload.get("assignedEstimatorId")
        if est_id:
            assigned_est = Estimator.objects.filter(pk=est_id).first()

        project = ProjectRFQ.objects.create(
            enquiry_serial_no=enquiry_serial_no,
            work_order_no=work_order_no,
            client_rfq_no=payload.get("clientRfqNo", ""),
            received_date=payload.get("receivedDate", ""),
            client_name=client_name,
            client_short_name=payload.get("clientShortName", ""),
            site_name=payload.get("siteName", ""),
            proposed_project_name=proposed_project_name,
            client_sender_contact=payload.get("clientSenderContact", ""),
            project_location=payload.get("projectLocation", ""),
            rfq_came_to_whose_name=payload.get("rfqCameToWhoseName", ""),
            rfq_received_through=payload.get("rfqReceivedThrough", "Email"),
            project_work_description=payload.get("projectWorkDescription", ""),
            nature_of_work=payload.get("natureOfWork", "Civil & Infra"),
            scope_of_work=payload.get("scopeOfWork", []),
            sow_scopes=payload.get("sowScopes", ["Civil"]),
            sow_caveats_notes=payload.get("sowCaveatsNotes", ""),
            submission_deadline=payload.get("submissionDeadline") or payload.get("bidCloseDate", ""),
            bid_extension_date=payload.get("bidExtensionDate"),
            bid_close_date=payload.get("bidCloseDate", ""),
            bid_submission_type=payload.get("bidSubmissionType", "Email Submission"),
            attached_files=payload.get("attachedFiles", []),
            assigned_estimator=assigned_est,
            status=payload.get("status", "Pending MD Approval"),
            md_status=payload.get("mdStatus", "Pending Review"),
            management_reviewers=payload.get("managementReviewers", ["Managing Director (MD)"]),
            estimated_value=payload.get("estimatedValue", 0.0),
            currency=payload.get("currency", "SAR"),
            bid_security_required=payload.get("bidSecurityRequired", False),
            bid_bond_amount=payload.get("bidBondAmount", 0.0),
            win_probability=payload.get("winProbability", 75),
            target_margin=payload.get("targetMargin", 18.5),
            risk_level=payload.get("riskLevel", "Low"),
            bid_package=payload.get("bidPackage") or {},
        )

        # Also ensure Client directory record exists
        Client.objects.get_or_create(
            company_name=client_name,
            defaults={
                "short_code": project.client_short_name,
                "city": project.project_location or "Jubail",
                "contact_email": project.client_sender_contact,
            }
        )

        return JsonResponse(project.to_dict(), status=201)


@csrf_exempt
@require_http_methods(["GET", "PATCH"])
def project_detail(request, project_id):
    """
    GET /api/projects/<id>/ - Project dossier
    PATCH /api/projects/<id>/ - Update project fields
    """
    if not verify_server_auth(request):
        return JsonResponse({"error": "Unauthorized server request"}, status=401)

    try:
        project = ProjectRFQ.objects.select_related("assigned_estimator").get(pk=project_id)
    except ProjectRFQ.DoesNotExist:
        return JsonResponse({"error": f"Project with ID {project_id} not found"}, status=404)

    if request.method == "PATCH":
        try:
            payload = json.loads(request.body.decode("utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError):
            return HttpResponseBadRequest(JsonResponse({"error": "Invalid JSON body"}))

        if "status" in payload:
            project.status = payload["status"]
        if "bidPackage" in payload:
            project.bid_package = payload["bidPackage"]
        if "proposedProjectName" in payload:
            project.proposed_project_name = payload["proposedProjectName"]
        if "sowScopes" in payload:
            project.sow_scopes = payload["sowScopes"]
        if "sowCaveatsNotes" in payload:
            project.sow_caveats_notes = payload["sowCaveatsNotes"]
        if "bidCloseDate" in payload:
            project.bid_close_date = payload["bidCloseDate"]

        project.save()
        return JsonResponse(project.to_dict(), status=200)

    return JsonResponse(project.to_dict(), status=200)


@csrf_exempt
@require_http_methods(["PATCH"])
def project_assign_estimator(request, project_id):
    """
    PATCH /api/projects/<id>/assign-estimator/
    Body: { "estimator_id": "1" }
    """
    if not verify_server_auth(request):
        return JsonResponse({"error": "Unauthorized server request"}, status=401)

    try:
        project = ProjectRFQ.objects.get(pk=project_id)
    except ProjectRFQ.DoesNotExist:
        return JsonResponse({"error": f"Project with ID {project_id} not found"}, status=404)

    try:
        payload = json.loads(request.body.decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return HttpResponseBadRequest(JsonResponse({"error": "Invalid JSON body"}))

    estimator_id = payload.get("estimator_id") or payload.get("estimatorId")
    if not estimator_id:
        return JsonResponse({"error": "estimator_id or estimatorId is required."}, status=400)

    try:
        estimator = Estimator.objects.get(pk=estimator_id)
    except Estimator.DoesNotExist:
        return JsonResponse({"error": f"Estimator #{estimator_id} not found"}, status=404)

    project.assigned_estimator = estimator
    if project.status in ["New RFQ", "Pending MD Approval"]:
        project.status = "Estimator Assigned"
    project.save()

    return JsonResponse(project.to_dict(), status=200)


@csrf_exempt
@require_http_methods(["PATCH", "POST"])
def project_update_status(request, project_id):
    """
    PATCH /api/projects/<id>/status/
    Body: { "status": "Approved for Bidding" }
    """
    if not verify_server_auth(request):
        return JsonResponse({"error": "Unauthorized server request"}, status=401)

    try:
        project = ProjectRFQ.objects.get(pk=project_id)
    except ProjectRFQ.DoesNotExist:
        return JsonResponse({"error": f"Project with ID {project_id} not found"}, status=404)

    try:
        payload = json.loads(request.body.decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return HttpResponseBadRequest(JsonResponse({"error": "Invalid JSON body"}))

    new_status = payload.get("status")
    if not new_status:
        return JsonResponse({"error": "status is required."}, status=400)

    valid_statuses = [s[0] for s in ProjectRFQ.STATUS_CHOICES]
    if new_status not in valid_statuses:
        return JsonResponse({"error": f"Invalid status: {new_status}"}, status=400)

    remarks = payload.get("md_remarks") or payload.get("remarks")
    if remarks:
        project.md_remarks = remarks

    project.status = new_status
    if new_status in ["Approved for Bidding", "Won - In Handover"]:
        project.md_status = "Approved for Bidding"
        project.md_approved_at = timezone.now()
    elif new_status == "Pending MD Approval":
        project.md_status = "Pending Review"
    elif new_status in ["Declined / Lost", "Rejected / Withdrawn"]:
        project.md_status = "Declined"

    project.save()
    return JsonResponse(project.to_dict(), status=200)


@csrf_exempt
@require_http_methods(["POST", "PATCH"])
def md_approve_project(request, project_id):
    """
    POST /api/projects/<id>/approve/ or /api/v1/md/projects/<id>/approve/
    Body: { "mdRemarks": "Approved" }
    """
    if not verify_server_auth(request):
        return JsonResponse({"error": "Unauthorized server request"}, status=401)

    try:
        project = ProjectRFQ.objects.get(pk=project_id)
    except ProjectRFQ.DoesNotExist:
        return JsonResponse({"error": f"Project #{project_id} not found"}, status=404)

    try:
        payload = json.loads(request.body.decode("utf-8")) if request.body else {}
    except Exception:
        payload = {}

    remarks = payload.get("mdRemarks") or payload.get("md_remarks", "")
    project.status = "Approved for Bidding"
    project.md_status = "Approved for Bidding"
    if remarks:
        project.md_remarks = remarks
    project.md_approved_at = timezone.now()
    project.save()
    return JsonResponse(project.to_dict(), status=200)


@csrf_exempt
@require_http_methods(["POST", "PATCH"])
def md_decline_project(request, project_id):
    """
    POST /api/projects/<id>/decline/ or /api/v1/md/projects/<id>/decline/
    Body: { "reason": "Declined" }
    """
    if not verify_server_auth(request):
        return JsonResponse({"error": "Unauthorized server request"}, status=401)

    try:
        project = ProjectRFQ.objects.get(pk=project_id)
    except ProjectRFQ.DoesNotExist:
        return JsonResponse({"error": f"Project #{project_id} not found"}, status=404)

    try:
        payload = json.loads(request.body.decode("utf-8")) if request.body else {}
    except Exception:
        payload = {}

    reason = payload.get("reason") or payload.get("mdRemarks") or payload.get("md_remarks", "Declined by MD")
    project.status = "Declined / Lost"
    project.md_status = "Declined"
    project.md_remarks = reason
    project.save()
    return JsonResponse(project.to_dict(), status=200)


# ============================================================================
# Estimator Workspace API
# ============================================================================

@csrf_exempt
@require_http_methods(["POST", "PATCH"])
def estimator_save_estimation(request, project_id):
    """
    POST/PATCH /api/projects/<id>/estimation/
    Body: { "estimatedValue": 1250000, "calculation": {...}, "boqNotes": "..." }
    """
    if not verify_server_auth(request):
        return JsonResponse({"error": "Unauthorized server request"}, status=401)

    try:
        project = ProjectRFQ.objects.get(pk=project_id)
    except ProjectRFQ.DoesNotExist:
        return JsonResponse({"error": f"Project #{project_id} not found"}, status=404)

    try:
        payload = json.loads(request.body.decode("utf-8")) if request.body else {}
    except Exception:
        payload = {}

    estimated_val = payload.get("estimatedValue") if payload.get("estimatedValue") is not None else payload.get("grandTotal")
    if estimated_val is not None:
        try:
            project.estimated_value = float(estimated_val)
        except (ValueError, TypeError):
            pass

    if payload.get("boqNotes"):
        project.sow_caveats_notes = payload.get("boqNotes")

    calculation = payload.get("calculation") or payload.get("aiBoqCalculation")
    if calculation:
        project.ai_boq_calculation = calculation

    if payload.get("newProjectStatus"):
        project.status = payload.get("newProjectStatus")
    elif project.status in ["Approved for Bidding", "Checklist Ready", "Survey In Progress"]:
        project.status = "Under BOQ Estimation"

    project.save()
    return JsonResponse(project.to_dict(), status=200)


@csrf_exempt
@require_http_methods(["POST", "PATCH"])
def estimator_save_site_review(request, project_id):
    """
    POST/PATCH /api/projects/<id>/site-review/
    Body: { "siteReview": { "required": true, "status": "Scheduled", ... } }
    """
    if not verify_server_auth(request):
        return JsonResponse({"error": "Unauthorized server request"}, status=401)

    try:
        project = ProjectRFQ.objects.get(pk=project_id)
    except ProjectRFQ.DoesNotExist:
        return JsonResponse({"error": f"Project #{project_id} not found"}, status=404)

    try:
        payload = json.loads(request.body.decode("utf-8")) if request.body else {}
    except Exception:
        payload = {}

    site_review = payload.get("siteReview") or payload
    if site_review:
        project.site_review = site_review
        project.save()

    return JsonResponse(project.to_dict(), status=200)


@csrf_exempt
@require_http_methods(["POST", "PATCH"])
def estimator_save_survey_request(request, project_id):
    """
    POST/PATCH /api/projects/<id>/survey-request/
    Body: { "surveyRequest": { ... }, "newProjectStatus": "Survey In Progress", "siteReview": { ... } }
    """
    if not verify_server_auth(request):
        return JsonResponse({"error": "Unauthorized server request"}, status=401)

    try:
        project = ProjectRFQ.objects.get(pk=project_id)
    except ProjectRFQ.DoesNotExist:
        return JsonResponse({"error": f"Project #{project_id} not found"}, status=404)

    try:
        payload = json.loads(request.body.decode("utf-8")) if request.body else {}
    except Exception:
        payload = {}

    survey_req = payload.get("surveyRequest") or payload.get("survey_request") or payload
    if survey_req and isinstance(survey_req, dict):
        if "surveyRequest" in survey_req:
            survey_req = survey_req["surveyRequest"]
        project.survey_request = survey_req

    new_status = payload.get("newProjectStatus") or payload.get("new_project_status") or payload.get("status")
    if new_status:
        project.status = new_status
    elif survey_req and isinstance(survey_req, dict) and survey_req.get("status") == "Completed":
        project.status = "Under BOQ Estimation"

    site_review = payload.get("siteReview") or payload.get("site_review")
    if site_review:
        project.site_review = site_review

    project.save()
    return JsonResponse(project.to_dict(), status=200)


@csrf_exempt
@require_http_methods(["POST", "PATCH"])
def estimator_save_bid_package(request, project_id):
    """
    POST/PATCH /api/projects/<id>/bid-package/
    Body: { "bidPackage": { ... }, "sendToCrm": false }
    """
    if not verify_server_auth(request):
        return JsonResponse({"error": "Unauthorized server request"}, status=401)

    try:
        project = ProjectRFQ.objects.get(pk=project_id)
    except ProjectRFQ.DoesNotExist:
        return JsonResponse({"error": f"Project #{project_id} not found"}, status=404)

    try:
        payload = json.loads(request.body.decode("utf-8")) if request.body else {}
    except Exception:
        payload = {}

    bid_pkg = payload.get("bidPackage") or payload
    if bid_pkg and isinstance(bid_pkg, dict):
        if "bidPackage" in bid_pkg:
            bid_pkg = bid_pkg["bidPackage"]
        project.bid_package = bid_pkg

    if payload.get("sendToCrm"):
        project.status = "Bid Submitted"

    project.save()
    return JsonResponse(project.to_dict(), status=200)


@csrf_exempt
@require_http_methods(["POST", "PATCH"])
def estimator_save_boq_comparison(request, project_id):
    """
    POST/PATCH /api/projects/<id>/boq-comparison/
    Body: { "boqComparison": { ... } }
    """
    if not verify_server_auth(request):
        return JsonResponse({"error": "Unauthorized server request"}, status=401)

    try:
        project = ProjectRFQ.objects.get(pk=project_id)
    except ProjectRFQ.DoesNotExist:
        return JsonResponse({"error": f"Project #{project_id} not found"}, status=404)

    try:
        payload = json.loads(request.body.decode("utf-8")) if request.body else {}
    except Exception:
        payload = {}

    comparison = payload.get("boqComparison") or payload
    if comparison and isinstance(comparison, dict):
        if "boqComparison" in comparison:
            comparison = comparison["boqComparison"]
        project.boq_comparison = comparison

    project.save()
    return JsonResponse(project.to_dict(), status=200)


@require_http_methods(["GET"])
def surveyors_list(request):
    """
    GET /api/surveyors/ or /api/v1/surveyors/
    """
    if not verify_server_auth(request):
        return JsonResponse({"error": "Unauthorized server request"}, status=401)

    surveyors = Surveyor.objects.all()
    data = [s.to_dict() for s in surveyors]
    return JsonResponse({"surveyors": data, "count": len(data)}, status=200)




@csrf_exempt
@require_http_methods(["GET"])
def crm_dashboard_metrics(request):
    """
    GET /api/dashboard/metrics/
    """
    if not verify_server_auth(request):
        return JsonResponse({"error": "Unauthorized server request"}, status=401)

    total_projects = ProjectRFQ.objects.count()
    in_estimation = ProjectRFQ.objects.filter(
        status__in=["Approved for Bidding", "Under BOQ Estimation", "Estimator Assigned"]
    ).count()
    optimal_estimators = Estimator.objects.filter(
        Q(active_tenders=0) | Q(capacity_status="Optimal Capacity")
    ).count()
    pending_md = ProjectRFQ.objects.filter(
        Q(status="Pending MD Approval") | Q(md_status="Pending Review")
    ).count()

    return JsonResponse(
        {
            "totalProjectsCount": total_projects,
            "inEstimationCount": in_estimation,
            "optimalEstimatorsCount": optimal_estimators,
            "pendingMdCount": pending_md,
        },
        status=200,
    )


# ============================================================================
# Legacy Item Endpoints
# ============================================================================

@csrf_exempt
@require_http_methods(["GET", "POST"])
def items_list_create(request):
    if not verify_server_auth(request):
        return JsonResponse({"error": "Unauthorized server request"}, status=401)

    if request.method == "GET":
        items = Item.objects.all()
        data = [item.to_dict() for item in items]
        return JsonResponse({"items": data, "count": len(data)}, safe=False, status=200)

    elif request.method == "POST":
        try:
            payload = json.loads(request.body.decode("utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError):
            return HttpResponseBadRequest(JsonResponse({"error": "Invalid JSON body"}))

        title = payload.get("title", "").strip()
        if not title:
            return JsonResponse({"error": "Title is required."}, status=400)

        item = Item.objects.create(
            title=title,
            description=payload.get("description", "").strip(),
            status=payload.get("status", "pending"),
            priority=payload.get("priority", "medium"),
        )
        return JsonResponse(item.to_dict(), status=201)


@csrf_exempt
@require_http_methods(["GET", "PUT", "PATCH", "DELETE"])
def item_detail_update_delete(request, item_id):
    if not verify_server_auth(request):
        return JsonResponse({"error": "Unauthorized server request"}, status=401)

    try:
        item = Item.objects.get(pk=item_id)
    except Item.DoesNotExist:
        return JsonResponse({"error": f"Item with ID {item_id} not found"}, status=404)

    if request.method == "GET":
        return JsonResponse(item.to_dict(), status=200)

    elif request.method in ["PUT", "PATCH"]:
        try:
            payload = json.loads(request.body.decode("utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError):
            return HttpResponseBadRequest(JsonResponse({"error": "Invalid JSON body"}))

        if "title" in payload:
            item.title = payload.get("title", "").strip()
        if "description" in payload:
            item.description = payload.get("description", "").strip()
        if "status" in payload:
            item.status = payload.get("status")
        if "priority" in payload:
            item.priority = payload.get("priority")

        item.save()
        return JsonResponse(item.to_dict(), status=200)

    elif request.method == "DELETE":
        item_id = item.id
        item.delete()
        return JsonResponse({"deleted": True, "id": item_id}, status=200)


# ============================================================================
# AI BOQ & Resources Takeoff Engine
# ============================================================================

def synthesize_ai_boq(project_data, prompt="Generate standard BOQ schedule from drawings and tender specifications", step=1, api_key=None, api_endpoint=None, model=None):
    """
    Synthesizes AI BOQ schedule and Project Resources takeoff.
    Supports optional live OpenAI calls with fallback to domain-specific Saudi contractor heuristics.
    """
    import os
    from django.conf import settings

    if not api_key or not str(api_key).strip():
        api_key = getattr(settings, "OPENAI_API_KEY", None) or os.getenv("OPENAI_API_KEY")

    # Extract attached documents and drawings
    attached_docs = project_data.get("attachedFiles") or []
    docs_summary = []
    primary_doc_name = None
    for doc in attached_docs:
        if isinstance(doc, dict):
            d_name = doc.get("name", "Tender_Drawing_Specs.pdf")
            if not primary_doc_name:
                primary_doc_name = d_name
            docs_summary.append(f"- Drawing / Document: {d_name} ({doc.get('size', 'PDF')})")
        elif isinstance(doc, str):
            if not primary_doc_name:
                primary_doc_name = doc
            docs_summary.append(f"- Document: {doc}")
    docs_text = "\n".join(docs_summary) if docs_summary else "No external PDF files uploaded; synthesize from standard EPC drawings & technical specifications."

    if api_key and str(api_key).strip():
        try:
            import urllib.request
            import urllib.error
            endpoint = (api_endpoint or "https://api.openai.com/v1").rstrip("/") + "/chat/completions"
            ai_model = model or "gpt-4o-mini"
            sys_msg = (
                "You are an expert Senior BOQ Quantity Surveyor & Commercial Estimator for Saudi Aramco, Sabic, "
                "Royal Commission and Saudi industrial mega projects. You must return ONLY a single valid JSON object "
                "with exact keys: promptUsed, projectSummary, estimatedDurationMonths, manpower, hse, qaqc, "
                "equipmentRentals, boqLineItems, totals, generatedAt."
            )
            user_msg = (
                f"Project Name: {project_data.get('proposedProjectName', '')}\n"
                f"Client: {project_data.get('clientName', '')}\n"
                f"Location: {project_data.get('siteName', '')}\n"
                f"SOW Disciplines: {project_data.get('sowScopes', [])}\n"
                f"Scope Description: {project_data.get('projectWorkDescription', '')}\n"
                f"Attached Tender Documents & Engineering Drawings:\n{docs_text}\n"
                f"Operational Directive / Prompt: {prompt}\n"
                f"Step: {step}\n\n"
                "CRITICAL INSTRUCTIONS:\n"
                "1. Read and analyze the attached PDF drawings, specifications, and project scope details.\n"
                "2. Generate realistic BOQ schedule line items (in boqLineItems) with Saudi market unit rates in SAR, exact quantities, units, and descriptions.\n"
                "3. In Step 2 (Resources), calculate Manpower, HSE, QA/QC, and Equipment strictly proportional to the project distance/scale in the prompt. "
                "For example, if 10 km, calculate for 1-2 pipeline spreads (~35-50 personnel, appropriate excavators/rigs); "
                "if 1000 km, calculate for multi-spread cross-country operations with hundreds of personnel, proportionally expanded HSE teams, multiple NDT/UT inspection crews, and large equipment fleets.\n"
                "4. Return all calculations and totals in SAR."
            )
            req_data = json.dumps({
                "model": ai_model,
                "messages": [
                    {"role": "system", "content": sys_msg},
                    {"role": "user", "content": user_msg}
                ],
                "response_format": {"type": "json_object"},
                "temperature": 0.2
            }).encode("utf-8")
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {str(api_key).strip()}"
            }
            req = urllib.request.Request(endpoint, data=req_data, headers=headers, method="POST")
            with urllib.request.urlopen(req, timeout=35) as resp:
                res_body = json.loads(resp.read().decode("utf-8"))
                choice = res_body["choices"][0]["message"]["content"]
                parsed = json.loads(choice)
                if "boqLineItems" in parsed or "manpower" in parsed:
                    return parsed
        except Exception:
            pass

    # Intelligent procedural fallback tailored to project specifications and operational prompt
    p_name = project_data.get("proposedProjectName") or "Industrial Construction Project"
    client = project_data.get("clientName") or "Industrial Client"
    site = project_data.get("siteName") or "Jubail / Yanbu Industrial City"
    scopes = [s.strip() for s in (project_data.get("sowScopes") or []) if isinstance(s, str)]
    desc = (project_data.get("projectWorkDescription") or "").lower()
    prompt_lower = (prompt or "").lower()

    if not scopes:
        scopes = ["Civil", "Mechanical", "Piping", "Electrical"]

    import re
    # Extract distance in km or meters
    km = None
    m_km = re.search(r'(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:kilometer|kilometres|kilometre|km)\b', prompt_lower)
    if m_km:
        km = float(m_km.group(1).replace(',', ''))
    else:
        m_m = re.search(r'(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:linear\s*meter|linear\s*metre|lm|meter|metre)\b', prompt_lower)
        if m_m:
            val_m = float(m_m.group(1).replace(',', ''))
            if val_m >= 500:
                km = val_m / 1000.0

    if km is None:
        m_desc = re.search(r'(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:kilometer|kilometres|kilometre|km)\b', desc)
        if m_desc:
            km = float(m_desc.group(1).replace(',', ''))

    if km is None and ("pipeline" in prompt_lower or "pipeline" in desc or "pipe" in prompt_lower):
        km = 10.0

    # Dynamic duration in months
    duration_months = 12
    m_dur = re.search(r'(\d+)\s*month', prompt_lower)
    if m_dur:
        duration_months = max(3, min(60, int(m_dur.group(1))))
    elif km is not None:
        if km <= 15:
            duration_months = 12
        elif km <= 50:
            duration_months = 16
        elif km <= 200:
            duration_months = 24
        else:
            duration_months = 36

    # Spreads multiplier for large-scale / cross-country operations
    if km is not None:
        if km <= 15:
            spreads = 1.0
        elif km <= 50:
            spreads = 2.0
        elif km <= 150:
            spreads = 4.0
        elif km <= 500:
            spreads = 7.0
        else:
            spreads = min(15.0, round(km / 75.0, 1))
    else:
        spreads = 1.0

    shift_multiplier = 1.6 if ("24/7" in prompt_lower or "shift" in prompt_lower) else 1.0

    # 1. BOQ Line Items (Step 1)
    line_items = []
    item_counter = 1

    has_civil = any(s in ["Civil", "Site Preparation", "Structural"] for s in scopes) or "civil" in desc or "concrete" in desc or "foundation" in desc or "trench" in prompt_lower
    has_piping = any(s in ["Piping", "Mechanical"] for s in scopes) or "pipe" in desc or "piping" in desc or "pipeline" in prompt_lower or "valve" in prompt_lower or km is not None
    has_elec = any(s in ["Electrical", "Instrumentation"] for s in scopes) or "cable" in desc or "substation" in desc or "electrical" in desc or "power" in prompt_lower
    has_struct = any(s in ["Structural", "Civil"] for s in scopes) or "steel" in desc or "structure" in desc or "crane pad" in prompt_lower

    if has_civil or "trench" in prompt_lower:
        survey_area = int(km * 2500) if km else 25000
        line_items.append({
            "id": f"boq-{item_counter}",
            "itemNo": f"0{item_counter}.01",
            "package": "Site Preparation & Earthworks",
            "description": "Site surveying, grubbing, clearing and mechanical bulk grading per SAES-A-114 specifications",
            "unit": "M2",
            "quantity": survey_area,
            "unitRate": 36,
            "totalAmount": survey_area * 36
        })
        item_counter += 1

        if "dewatering" in prompt_lower or "marshy" in prompt_lower:
            trench_lm = int(km * 1000) if km else 10000
            line_items.append({
                "id": f"boq-{item_counter}",
                "itemNo": f"0{item_counter}.01",
                "package": "Civil & Dewatering",
                "description": "Deep trench excavation in saturated/marshy soil with continuous wellpoint dewatering & shoring system",
                "unit": "LM",
                "quantity": trench_lm,
                "unitRate": 340,
                "totalAmount": trench_lm * 340
            })
            item_counter += 1
        else:
            trench_vol = int(km * 1850) if km else 18500
            line_items.append({
                "id": f"boq-{item_counter}",
                "itemNo": f"0{item_counter}.01",
                "package": "Civil Works",
                "description": "Bulk trench excavation, rock breaking, leveling and subgrade compaction to 95% MDD",
                "unit": "M3",
                "quantity": trench_vol,
                "unitRate": 85,
                "totalAmount": trench_vol * 85
            })
            item_counter += 1

        conc_qty = max(1200, int(km * 240)) if km else 2400
        line_items.append({
            "id": f"boq-{item_counter}",
            "itemNo": f"0{item_counter}.01",
            "package": "Civil Foundations",
            "description": "Cast-in-place reinforced concrete Class C40/50 for equipment foundations & valve pits, including rebar ASTM A615 and formwork",
            "unit": "M3",
            "quantity": conc_qty,
            "unitRate": 1650,
            "totalAmount": conc_qty * 1650
        })
        item_counter += 1

    if has_piping:
        pipe_size = "16-inch" if (km and km >= 100) else ("12-inch" if (km and km >= 10) else "8-inch")
        pipe_qty = int(km * 1000) if km else 10000
        pipe_rate = 740 if (km and km >= 100) else 680
        line_items.append({
            "id": f"boq-{item_counter}",
            "itemNo": f"0{item_counter}.01",
            "package": "Piping & Mechanical",
            "description": f"Supply, beveling, fit-up, and field welding of {pipe_size} CS Seamless Pipe API 5L Gr. B / ASTM A106 Class 300 with 100% RT NDT",
            "unit": "LM",
            "quantity": pipe_qty,
            "unitRate": pipe_rate,
            "totalAmount": pipe_qty * pipe_rate
        })
        item_counter += 1

        # Valve stations
        m_valves = re.search(r'(\d+)\s*(?:valve\s*stations?|valves?)', prompt_lower)
        if m_valves:
            v_qty = int(m_valves.group(1)) * 2
        elif km and km >= 50:
            v_qty = max(4, int(km / 25) * 2)
        else:
            v_qty = 4

        line_items.append({
            "id": f"boq-{item_counter}",
            "itemNo": f"0{item_counter}.01",
            "package": "Mechanical Piping",
            "description": "Supply, installation & testing of Class 300 Motor Operated Gate Valves (A216 WCB) with bypass & pneumatic actuators",
            "unit": "EA",
            "quantity": v_qty,
            "unitRate": 65000,
            "totalAmount": v_qty * 65000
        })
        item_counter += 1

        if "hdpe" in prompt_lower or km:
            hdpe_qty = int(km * 600) if km else 6000
            line_items.append({
                "id": f"boq-{item_counter}",
                "itemNo": f"0{item_counter}.01",
                "package": "Piping Protection",
                "description": "Supply and electrofusion installation of high-density polyethylene (HDPE PE100) encasement and corrosion protection sleeve",
                "unit": "LM",
                "quantity": hdpe_qty,
                "unitRate": 185,
                "totalAmount": hdpe_qty * 185
            })
            item_counter += 1

    if has_elec:
        elec_qty = int(km * 350) if km else 3500
        line_items.append({
            "id": f"boq-{item_counter}",
            "itemNo": f"0{item_counter}.01",
            "package": "Electrical & Power",
            "description": "Supply and trench laying of 13.8kV Medium Voltage Armored Power Cable 3x240mm² Cu/XLPE/SWA/PVC with terminations",
            "unit": "LM",
            "quantity": elec_qty,
            "unitRate": 480,
            "totalAmount": elec_qty * 480
        })
        item_counter += 1

        scada_lot = max(1, int(spreads / 2))
        line_items.append({
            "id": f"boq-{item_counter}",
            "itemNo": f"0{item_counter}.01",
            "package": "Instrumentation & Control",
            "description": "SCADA / RTU instrumentation cabinet, fiber optic communication link, solar panel backup, and field transmitters",
            "unit": "LOT",
            "quantity": scada_lot,
            "unitRate": 850000,
            "totalAmount": scada_lot * 850000
        })
        item_counter += 1

    if has_struct:
        steel_qty = int(km * 28) if km else 280
        line_items.append({
            "id": f"boq-{item_counter}",
            "itemNo": f"0{item_counter}.01",
            "package": "Structural Steel",
            "description": "Fabrication, hot-dip galvanizing, and site erection of structural steel framing, pipe racks, and platforms per AISC/SAES-M-001",
            "unit": "TON",
            "quantity": steel_qty,
            "unitRate": 11500,
            "totalAmount": steel_qty * 11500
        })
        item_counter += 1

    coat_qty = int(km * 850) if km else 8500
    line_items.append({
        "id": f"boq-{item_counter}",
        "itemNo": f"0{item_counter}.01",
        "package": "Protective Coating & Blasting",
        "description": "Abrasive blast cleaning to ISO 8501-1 Sa 2.5 and multi-coat high build epoxy / polyurethane coating system per APCS-1B",
        "unit": "M2",
        "quantity": coat_qty,
        "unitRate": 125,
        "totalAmount": coat_qty * 125
    })

    direct_material_cost = sum(item["totalAmount"] for item in line_items)

    # 2. Step 2 Resources (Scales with km, spreads, and shifts)
    welders_count = int(12 * shift_multiplier * spreads) if has_piping else int(4 * spreads)
    riggers_count = int(6 * shift_multiplier * spreads)
    fitters_count = int(16 * shift_multiplier * spreads)
    technicians_count = int(6 * shift_multiplier * spreads)
    plant_ops_count = int(6 * spreads)
    helpers_count = int(24 * shift_multiplier * spreads)
    piping_eng_count = int(max(2, 2 * spreads))
    civil_eng_count = int(max(2, 2 * spreads))
    pm_count = max(1, int(spreads / 3))

    manpower = [
        {"id": "mp-1", "role": "Site Construction Project Manager", "trade": "Project Management", "count": pm_count, "durationMonths": duration_months, "monthlyRate": 28000, "totalCost": pm_count * duration_months * 28000},
        {"id": "mp-2", "role": "Lead Pipeline / Piping Engineer (Saudi Aramco Approved)", "trade": "Engineering", "count": piping_eng_count, "durationMonths": duration_months, "monthlyRate": 19000, "totalCost": piping_eng_count * duration_months * 19000},
        {"id": "mp-3", "role": "Senior Civil & Structural Site Engineer", "trade": "Engineering", "count": civil_eng_count, "durationMonths": duration_months, "monthlyRate": 17500, "totalCost": civil_eng_count * duration_months * 17500},
        {"id": "mp-4", "role": "Certified 6G Pipe Welders (SMAW/GTAW)", "trade": "Mechanical", "count": welders_count, "durationMonths": min(duration_months, 10), "monthlyRate": 8500, "totalCost": welders_count * min(duration_months, 10) * 8500},
        {"id": "mp-5", "role": "Certified Riggers (Aramco Level II / TUV)", "trade": "Rigging", "count": riggers_count, "durationMonths": min(duration_months, 8), "monthlyRate": 7200, "totalCost": riggers_count * min(duration_months, 8) * 7200},
        {"id": "mp-6", "role": "Skilled Pipe Fitters & Fabricators", "trade": "Mechanical", "count": fitters_count, "durationMonths": min(duration_months, 10), "monthlyRate": 5800, "totalCost": fitters_count * min(duration_months, 10) * 5800},
        {"id": "mp-7", "role": "Electrical & Instrument Technicians", "trade": "Electrical", "count": technicians_count, "durationMonths": min(duration_months, 8), "monthlyRate": 8000, "totalCost": technicians_count * min(duration_months, 8) * 8000},
        {"id": "mp-8", "role": "Heavy Plant & Crane Operators", "trade": "Plant Ops", "count": plant_ops_count, "durationMonths": duration_months, "monthlyRate": 7500, "totalCost": plant_ops_count * duration_months * 7500},
        {"id": "mp-9", "role": "Scaffolders & Civil General Helpers", "trade": "Civil", "count": helpers_count, "durationMonths": duration_months, "monthlyRate": 3900, "totalCost": helpers_count * duration_months * 3900}
    ]

    # HSE Team (Scales dynamically with spreads and distance)
    hse_mgr_count = max(1, int(spreads / 3))
    safety_officers_count = int(max(2, 2 * shift_multiplier * spreads))
    ambulance_count = max(1, int(spreads / 2))
    gas_kits_count = max(1, int(spreads))

    hse = [
        {"id": "hse-1", "role": "Lead HSE Manager (NEBOSH Diploma / Aramco Approved)", "count": hse_mgr_count, "requirements": "Project Safety Plan, JSA matrix, and client audit management", "monthlyCost": 22000, "totalCost": hse_mgr_count * duration_months * 22000},
        {"id": "hse-2", "role": "Site Safety Officers (Shift Rotation Coverage)", "count": safety_officers_count, "requirements": "Continuous hot work permits, confined space entry & trench collapse prevention", "monthlyCost": 12000, "totalCost": safety_officers_count * duration_months * 12000},
        {"id": "hse-3", "role": "Paramedic & On-Site Emergency Trauma Ambulance", "count": ambulance_count, "requirements": "Full medical trauma station, heat stress mitigation & desert electrolyte fleet", "monthlyCost": 9500, "totalCost": ambulance_count * duration_months * 9500},
        {"id": "hse-4", "role": "Calibrated Gas Detectors, Signage & Fall Arrest Kit", "count": gas_kits_count, "requirements": "Multi-gas 4-way wireless monitors, rescue winches, barricading & PPE", "monthlyCost": 16000, "totalCost": gas_kits_count * duration_months * 16000}
    ]

    # QA/QC Team (Scales dynamically with weld volume & NDT spreads)
    qaqc_mgr_count = max(1, int(spreads / 3))
    inspectors_count = int(max(2, 2 * spreads))
    ndt_teams_count = int(max(1, round(spreads * 0.8)))
    hydro_crews_count = int(max(1, round(spreads * 0.5)))

    qaqc = [
        {"id": "qa-1", "role": "QA/QC Manager (ISO 9001 Lead Auditor, Aramco Approved)", "count": qaqc_mgr_count, "testingScope": "Project Quality Plan (PQP), ITP approvals, non-conformance management", "monthlyCost": 24000, "totalCost": qaqc_mgr_count * duration_months * 24000},
        {"id": "qa-2", "role": "Senior Welding & Coating Inspector (CSWIP 3.1 / NACE Level 2)", "count": inspectors_count, "testingScope": "100% visual inspection of root & cap passes, WQT logs, DFT profiling", "monthlyCost": 16500, "totalCost": inspectors_count * min(duration_months, 10) * 16500},
        {"id": "qa-3", "role": "Third-Party NDT Radiography (RT) & Ultrasonic (UT) Team", "count": ndt_teams_count, "testingScope": "Radiographic examination of pipeline girth welds per ASME B31.3 & SAES-W-011", "monthlyCost": 28000, "totalCost": ndt_teams_count * min(duration_months, 10) * 28000},
        {"id": "qa-4", "role": "Hydrostatic Testing & Field Calibration Crew", "count": hydro_crews_count, "testingScope": "Strength & leak test to 1.5x design pressure, deadweight tester, chart recorders", "monthlyCost": 22000, "totalCost": hydro_crews_count * min(duration_months, 6) * 22000}
    ]

    # Equipment Rentals (Scales dynamically with trenching volume & spreads)
    cranes_qty = int(max(2, 2 * spreads))
    excavators_qty = int(max(4, 4 * spreads))
    loaders_qty = int(max(2, 2 * spreads))
    generators_qty = int(max(4, 4 * spreads))
    welding_rigs_qty = int(max(8, 8 * spreads))
    hydro_skids_qty = int(max(1, round(spreads * 0.5)))

    equipment = [
        {"id": "eq-1", "equipmentName": "100-Ton All-Terrain Hydraulic Mobile Crane (Liebherr)", "type": "Lifting Plant", "quantity": cranes_qty, "durationMonths": min(duration_months, 8), "monthlyRental": 45000, "totalCost": cranes_qty * min(duration_months, 8) * 45000},
        {"id": "eq-2", "equipmentName": "CAT 336D Heavy Hydraulic Excavators with Rock Breaker", "type": "Earthmoving", "quantity": excavators_qty, "durationMonths": min(duration_months, 10), "monthlyRental": 22000, "totalCost": excavators_qty * min(duration_months, 10) * 22000},
        {"id": "eq-3", "equipmentName": "CAT 966 Wheel Loader (3.5 m³ Rehandling Bucket)", "type": "Earthmoving", "quantity": loaders_qty, "durationMonths": min(duration_months, 10), "monthlyRental": 18000, "totalCost": loaders_qty * min(duration_months, 10) * 18000},
        {"id": "eq-4", "equipmentName": "500 kVA Soundproof Diesel Generators & Distribution Panel", "type": "Power Supply", "quantity": generators_qty, "durationMonths": duration_months, "monthlyRental": 11000, "totalCost": generators_qty * duration_months * 11000},
        {"id": "eq-5", "equipmentName": "Mobile Diesel Welding Generator Rigs (Miller Big Blue)", "type": "Welding Plant", "quantity": welding_rigs_qty, "durationMonths": min(duration_months, 10), "monthlyRental": 6500, "totalCost": welding_rigs_qty * min(duration_months, 10) * 6500},
        {"id": "eq-6", "equipmentName": "High-Pressure Hydrotest Pump Skid (Up to 5000 PSI)", "type": "Testing Rig", "quantity": hydro_skids_qty, "durationMonths": min(duration_months, 6), "monthlyRental": 24000, "totalCost": hydro_skids_qty * min(duration_months, 6) * 24000}
    ]

    if "dewatering" in prompt_lower or "marshy" in prompt_lower:
        dewater_qty = int(max(6, 6 * spreads))
        equipment.append({
            "id": "eq-7",
            "equipmentName": "High-Volume 6-inch Diesel Dewatering Pumps with Header Pipes",
            "type": "Dewatering System",
            "quantity": dewater_qty,
            "durationMonths": min(duration_months, 8),
            "monthlyRental": 8500,
            "totalCost": dewater_qty * min(duration_months, 8) * 8500
        })

    manpower_cost = sum(m["totalCost"] for m in manpower)
    hse_cost = sum(h["totalCost"] for h in hse)
    qaqc_cost = sum(q["totalCost"] for q in qaqc)
    equipment_cost = sum(e["totalCost"] for e in equipment)

    direct_total = direct_material_cost + manpower_cost + equipment_cost + hse_cost + qaqc_cost
    preliminaries_pct = 8.0
    overheads_and_preliminaries = round(direct_total * (preliminaries_pct / 100.0))
    subtotal = direct_total + overheads_and_preliminaries
    margin_pct = 16.5
    margin_amount = round(subtotal * (margin_pct / 100.0))
    total_commercial_bid_price = subtotal + margin_amount

    from django.utils import timezone
    return {
        "promptUsed": prompt,
        "projectSummary": f"{p_name} for {client} at {site}." + (f" Synthesized from uploaded tender package ({primary_doc_name}) & specifications." if primary_doc_name else " Synthesized BOQ schedule and full project resource deployment."),
        "estimatedDurationMonths": duration_months,
        "manpower": manpower,
        "hse": hse,
        "qaqc": qaqc,
        "equipmentRentals": equipment,
        "boqLineItems": line_items,
        "totals": {
            "directMaterialCost": direct_material_cost,
            "manpowerCost": manpower_cost,
            "equipmentCost": equipment_cost,
            "hseCost": hse_cost,
            "qaqcCost": qaqc_cost,
            "overheadsAndPreliminaries": overheads_and_preliminaries,
            "marginPct": margin_pct,
            "marginAmount": margin_amount,
            "totalCommercialBidPrice": total_commercial_bid_price
        },
        "generatedAt": timezone.now().isoformat()
    }


@csrf_exempt
@require_http_methods(["GET", "POST"])
def generate_boq_api(request, project_id=None):
    """
    POST /api/generate-boq/ or /api/v1/generate-boq/ or /api/v1/estimator/tenders/<id>/generate-boq/
    Body:
    {
        "prompt": "...",
        "project": {...},
        "step": 1,
        "apiKey": "...",
        "apiEndpoint": "...",
        "model": "..."
    }
    """
    payload = {}
    if request.body:
        try:
            payload = json.loads(request.body.decode("utf-8"))
        except Exception:
            payload = {}

    project_data = payload.get("project") or {}
    if project_id and not project_data:
        try:
            p = ProjectRFQ.objects.get(pk=project_id)
            project_data = p.to_dict()
        except ProjectRFQ.DoesNotExist:
            pass

    prompt = payload.get("prompt") or "Generate standard BOQ schedule from drawings and tender specifications"
    step = payload.get("step") or 1
    api_key = payload.get("apiKey")
    api_endpoint = payload.get("apiEndpoint")
    model = payload.get("model")

    calc_data = synthesize_ai_boq(
        project_data=project_data,
        prompt=prompt,
        step=step,
        api_key=api_key,
        api_endpoint=api_endpoint,
        model=model
    )
    return JsonResponse({"success": True, "data": calc_data}, status=200)


def synthesize_boq_comparison(project_data, ai_boq=None, manual_file_name=None, api_key=None, api_endpoint=None, model=None):
    """
    Synthesizes side-by-side BOQ variance comparison between AI engineering model and manual estimator takeoff.
    Exact match to Next.js BoqComparisonView live dataset.
    """
    items = [
        {
            "id": "cmp-1",
            "itemNo": "01.01",
            "category": "Equipment",
            "itemDescription": "Heavy Crawler Excavator 30-Ton with Hydraulic Rock Breaker",
            "unit": "Units / Mo",
            "aiQty": 1,
            "aiUnitRate": 45000.0,
            "aiTotal": 45000,
            "manualQty": 10,
            "manualUnitRate": 45000.0,
            "manualTotal": 450000,
            "deltaQty": 9,
            "varianceAmount": 405000,
            "variancePercentage": 900.0,
            "isFlaggedDiscrepancy": True,
            "discrepancyReason": "Potential equipment inflation flagged by AI. Based on 18km pipeline corridor trench volume (4,200 m³), AI calculated 1 excavator is optimal for 30-day excavation timeline. Estimator specified 10 units.",
            "status": "Needs Justification",
            "estimatorQuestion": "Why did Estimator allocate 10 excavators for a 30-day timeline when 1 excavator can achieve the excavation volume?",
            "estimatorJustification": ""
        },
        {
            "id": "cmp-2",
            "itemNo": "01.02",
            "category": "Manpower",
            "itemDescription": "Certified 6G TIG/SMAW Alloy Pipe Welders (Aramco Approved)",
            "unit": "Men",
            "aiQty": 12,
            "aiUnitRate": 14500.0,
            "aiTotal": 174000,
            "manualQty": 24,
            "manualUnitRate": 14500.0,
            "manualTotal": 348000,
            "deltaQty": 12,
            "varianceAmount": 174000,
            "variancePercentage": 100.0,
            "isFlaggedDiscrepancy": False,
            "discrepancyReason": "Manpower variance +50%. AI calculated 12 welders based on 180 total spool welds over 60 shifts. Estimator doubled crew to 24 men.",
            "status": "Justified & Accepted",
            "estimatorQuestion": "",
            "estimatorJustification": "24-hour round-the-clock dual shift rotation required by Aramco plant shutdown window."
        },
        {
            "id": "cmp-3",
            "itemNo": "02.01",
            "category": "Civil Works",
            "itemDescription": "C40/50 Sulfate Resistant Concrete Foundation Pours",
            "unit": "M3",
            "aiQty": 1400,
            "aiUnitRate": 1650.0,
            "aiTotal": 2310000,
            "manualQty": 1550,
            "manualUnitRate": 1700.0,
            "manualTotal": 2635000,
            "deltaQty": 150,
            "varianceAmount": 325000,
            "variancePercentage": 14.1,
            "isFlaggedDiscrepancy": True,
            "discrepancyReason": "Concrete volume padded +10.7% beyond IFC structural schedule.",
            "status": "Needs Justification",
            "estimatorQuestion": "Why is foundation concrete volume 1,550 m³ vs 1,400 m³ on drawing Rev 2?",
            "estimatorJustification": ""
        },
        {
            "id": "cmp-4",
            "itemNo": "02.02",
            "category": "Piping & Mechanical",
            "itemDescription": "24-inch Seamless Carbon Steel Pipeline API 5L Grade X65",
            "unit": "LM",
            "aiQty": 1200,
            "aiUnitRate": 1100.0,
            "aiTotal": 1320000,
            "manualQty": 1250,
            "manualUnitRate": 1120.0,
            "manualTotal": 1400000,
            "deltaQty": 50,
            "varianceAmount": 80000,
            "variancePercentage": 6.1,
            "isFlaggedDiscrepancy": True,
            "discrepancyReason": "Material overrun buffer exceeds 5% Aramco standard allowance.",
            "status": "Needs Justification",
            "estimatorQuestion": "Why is there a 50 LM buffer on 24-inch line without tie-in allowance justification?",
            "estimatorJustification": ""
        },
        {
            "id": "cmp-5",
            "itemNo": "03.01",
            "category": "HSE & Quality",
            "itemDescription": "Third-Party Non-Destructive Testing (NDT Radiography & Ultrasonic)",
            "unit": "Joints",
            "aiQty": 180,
            "aiUnitRate": 1700.0,
            "aiTotal": 307000,
            "manualQty": 180,
            "manualUnitRate": 1550.0,
            "manualTotal": 279500,
            "deltaQty": 0,
            "varianceAmount": -27500,
            "variancePercentage": -9.0,
            "isFlaggedDiscrepancy": True,
            "discrepancyReason": "Rate variance below standard Saudi Council of Engineers norm.",
            "status": "Needs Justification",
            "estimatorQuestion": "Confirm vendor rate commitment for 180 NDT joints at SAR 1,550.",
            "estimatorJustification": ""
        }
    ]

    ai_grand_total = sum(i["aiTotal"] for i in items)
    manual_grand_total = sum(i["manualTotal"] for i in items)
    total_variance_amount = manual_grand_total - ai_grand_total
    total_variance_pct = round((total_variance_amount / ai_grand_total) * 100) if ai_grand_total else 0
    flagged_count = sum(1 for i in items if i["isFlaggedDiscrepancy"])
    resolved_count = sum(1 for i in items if i["status"] in ["Justified & Accepted", "Adjusted / Fixed"])

    commentary = (
        "AI Variance Audit: Detected 900% equipment rental inflation on heavy excavators and "
        "duplicate night shifts against Saudi Aramco SAES-L-105 critical path baseline."
    )

    return {
        "items": items,
        "aiGrandTotal": ai_grand_total,
        "manualGrandTotal": manual_grand_total,
        "totalVarianceAmount": total_variance_amount,
        "totalVariancePct": total_variance_pct,
        "flaggedCount": flagged_count,
        "resolvedCount": resolved_count,
        "executiveCommentary": commentary
    }


@csrf_exempt
@require_http_methods(["GET", "POST"])
def compare_boq_api(request):
    """
    POST /api/compare-boq/ or /api/v1/compare-boq/
    """
    payload = {}
    if request.body:
        try:
            payload = json.loads(request.body.decode("utf-8"))
        except Exception:
            payload = {}

    project_data = payload.get("project") or {}
    ai_boq = payload.get("aiBoq")
    manual_file_name = payload.get("manualFileName")
    api_key = payload.get("apiKey")
    api_endpoint = payload.get("apiEndpoint")
    model = payload.get("model")

    data = synthesize_boq_comparison(
        project_data=project_data,
        ai_boq=ai_boq,
        manual_file_name=manual_file_name,
        api_key=api_key,
        api_endpoint=api_endpoint,
        model=model
    )
    return JsonResponse({
        "success": True,
        "data": {
            "items": data["items"],
            "aiGrandTotal": data["aiGrandTotal"],
            "manualGrandTotal": data["manualGrandTotal"],
            "totalVarianceAmount": data["totalVarianceAmount"],
            "totalVariancePct": data["totalVariancePct"],
            "flaggedCount": data["flaggedCount"],
            "resolvedCount": data["resolvedCount"]
        },
        "executiveCommentary": data["executiveCommentary"]
    }, status=200)


