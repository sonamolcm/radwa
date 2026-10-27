import json
import os
import logging
from django.conf import settings
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from django.contrib import messages
from django.utils import timezone
from .models import ProjectRFQ, Estimator, Client, Surveyor

logger = logging.getLogger(__name__)


@csrf_exempt
def home(request):
    """
    Main CRM Admin Portal served directly on Django port (e.g. http://localhost:8000/).
    Renders the full Radwa CRM dashboard and handles direct database mutations.
    """
    if request.method == "POST":
        # Check if form was submitted via standard POST or JSON
        is_ajax = request.headers.get("X-Requested-With") == "XMLHttpRequest" or "application/json" in request.headers.get("Content-Type", "")

        try:
            if "application/json" in request.headers.get("Content-Type", ""):
                data = json.loads(request.body.decode("utf-8"))
            else:
                data = request.POST.dict()
        except Exception:
            data = request.POST.dict()

        action = data.get("action", "register_client")

        # -------------------------------------------------------------
        # Action: Register as a New Client & Tender Project
        # -------------------------------------------------------------
        if action == "register_client":
            client_name = data.get("clientName", "").strip()
            proposed_project_name = data.get("proposedProjectName", "").strip()

            if not client_name or not proposed_project_name:
                err_msg = "Client Name and Proposed Project Name are required."
                if is_ajax:
                    return JsonResponse({"error": err_msg}, status=400)
                messages.error(request, err_msg)
                return redirect("core:home")

            last_id = ProjectRFQ.objects.count() + 1

            work_order_no = data.get("workOrderNo")
            if not work_order_no or ProjectRFQ.objects.filter(work_order_no=work_order_no.strip()).exists():
                candidate_id = last_id + 100
                while ProjectRFQ.objects.filter(work_order_no=f"WO-2026-{candidate_id:03d}").exists():
                    candidate_id += 1
                work_order_no = f"WO-2026-{candidate_id:03d}"
            else:
                work_order_no = work_order_no.strip()

            enquiry_serial_no = data.get("enquirySerialNo")
            if not enquiry_serial_no or ProjectRFQ.objects.filter(enquiry_serial_no=enquiry_serial_no.strip()).exists():
                candidate_id = last_id + 100
                while ProjectRFQ.objects.filter(enquiry_serial_no=f"RGC-RFQ-2026-0{candidate_id:03d}").exists():
                    candidate_id += 1
                enquiry_serial_no = f"RGC-RFQ-2026-0{candidate_id:03d}"
            else:
                enquiry_serial_no = enquiry_serial_no.strip()

            # Estimator allocation
            assigned_est = None
            est_id = data.get("assignedEstimatorId")
            if est_id:
                try:
                    assigned_est = Estimator.objects.filter(pk=int(est_id)).first()
                    if assigned_est:
                        assigned_est.active_tenders += 1
                        assigned_est.save()
                except (ValueError, TypeError):
                    pass

            # SOW Scopes parsing
            sow_scopes = data.get("sowScopes")
            if isinstance(sow_scopes, str):
                try:
                    sow_scopes = json.loads(sow_scopes)
                except Exception:
                    # check if getlist available from standard multi-checkbox POST
                    sow_scopes = request.POST.getlist("sowScopes") if hasattr(request, "POST") else ["Civil"]
            if not sow_scopes:
                sow_scopes = ["Civil"]

            # Attached Files parsing
            attached_files = data.get("attachedFiles")
            if isinstance(attached_files, str):
                try:
                    attached_files = json.loads(attached_files)
                except Exception:
                    attached_files = []
            if not attached_files:
                attached_files = []

            # Management Reviewers parsing
            reviewers = data.get("managementReviewers")
            if isinstance(reviewers, str):
                try:
                    reviewers = json.loads(reviewers)
                except Exception:
                    reviewers = ["Managing Director (MD)"]
            if not reviewers:
                reviewers = ["Managing Director (MD)"]

            est_val = data.get("estimatedValue") or data.get("estimated_value") or 0.0
            try:
                est_val = float(est_val)
            except (ValueError, TypeError):
                est_val = 0.0

            project = ProjectRFQ.objects.create(
                enquiry_serial_no=enquiry_serial_no,
                work_order_no=work_order_no,
                client_rfq_no=data.get("clientRfqNo", "").strip(),
                received_date=data.get("receivedDate") or timezone.now().strftime("%Y-%m-%d"),
                client_name=client_name,
                client_short_name=data.get("clientShortName", "").strip() or client_name[:4].upper(),
                site_name=data.get("siteName", "").strip(),
                proposed_project_name=proposed_project_name,
                client_sender_contact=data.get("clientSenderContact", "").strip(),
                project_location=data.get("projectLocation", "").strip(),
                rfq_came_to_whose_name=data.get("rfqCameToWhoseName", "Central Tendering Desk").strip(),
                rfq_received_through=data.get("rfqReceivedThrough", "Email").strip(),
                project_work_description=data.get("projectWorkDescription", "").strip() or "Scope and requirements as per client tender package.",
                nature_of_work=data.get("natureOfWork", "Civil & Infra"),
                sow_scopes=sow_scopes,
                sow_caveats_notes=data.get("sowCaveatsNotes", "").strip(),
                submission_deadline=data.get("submissionDeadline") or data.get("bidCloseDate", ""),
                bid_close_date=data.get("bidCloseDate", ""),
                bid_extension_date=data.get("bidExtensionDate") or None,
                bid_submission_type=data.get("bidSubmissionType", "Email Submission"),
                attached_files=attached_files,
                assigned_estimator=assigned_est,
                status="Pending MD Approval",
                md_status="Pending Review",
                management_reviewers=reviewers,
                estimated_value=est_val,
            )

            # Also create client record if doesn't exist
            Client.objects.get_or_create(
                company_name=client_name,
                defaults={
                    "short_code": project.client_short_name,
                    "city": project.project_location or "Jubail",
                    "contact_email": project.client_sender_contact,
                }
            )

            if is_ajax:
                return JsonResponse({"success": True, "project": project.to_dict()}, status=201)

            messages.success(request, f"Successfully registered tender: {project.work_order_no} ({project.proposed_project_name})")
            return redirect("core:home")

        # -------------------------------------------------------------
        # Action: Assign Estimator
        # -------------------------------------------------------------
        elif action == "assign_estimator":
            project_id = data.get("projectId")
            estimator_id = data.get("estimatorId")

            project = get_object_or_404(ProjectRFQ, pk=project_id)
            if estimator_id:
                try:
                    new_est = Estimator.objects.filter(pk=int(estimator_id)).first()
                    if new_est:
                        # Decrement old estimator count if assigned
                        if project.assigned_estimator and project.assigned_estimator != new_est:
                            if project.assigned_estimator.active_tenders > 0:
                                project.assigned_estimator.active_tenders -= 1
                                project.assigned_estimator.save()

                        project.assigned_estimator = new_est
                        new_est.active_tenders += 1
                        new_est.save()

                        if project.status == "New RFQ":
                            project.status = "Estimator Assigned"
                        project.save()
                except (ValueError, TypeError):
                    pass

            if is_ajax:
                return JsonResponse({"success": True, "project": project.to_dict()})
            messages.success(request, f"Estimator assigned to {project.work_order_no}")
            return redirect("core:home")

        # -------------------------------------------------------------
        # Action: Update Status
        # -------------------------------------------------------------
        elif action == "update_status":
            project_id = data.get("projectId")
            new_status = data.get("status")

            project = get_object_or_404(ProjectRFQ, pk=project_id)
            if new_status:
                project.status = new_status
                if new_status == "Approved for Bidding":
                    project.md_status = "Approved for Bidding"
                    project.md_approved_at = timezone.now()
                elif new_status == "Pending MD Approval":
                    project.md_status = "Pending Review"
                elif new_status in ["Declined / Lost", "Rejected / Withdrawn"]:
                    project.md_status = "Declined"
                project.save()

            if is_ajax:
                return JsonResponse({"success": True, "project": project.to_dict()})
            messages.success(request, f"Status updated for {project.work_order_no} to {new_status}")
            return redirect("core:home")

        # -------------------------------------------------------------
        # Action: Approve for Bidding (MD Direct Action)
        # -------------------------------------------------------------
        elif action == "approve_bidding":
            project_id = data.get("projectId")
            remarks = data.get("mdRemarks") or data.get("remarks", "")
            project = get_object_or_404(ProjectRFQ, pk=project_id)
            project.status = "Approved for Bidding"
            project.md_status = "Approved for Bidding"
            if remarks:
                project.md_remarks = remarks
            project.md_approved_at = timezone.now()
            project.save()

            if is_ajax:
                return JsonResponse({"success": True, "project": project.to_dict()})
            messages.success(request, f"Tender {project.work_order_no} authorized for bidding by Managing Director.")
            return redirect("core:home")

        # -------------------------------------------------------------
        # Action: Decline Tender (MD Direct Action)
        # -------------------------------------------------------------
        elif action == "decline_tender":
            project_id = data.get("projectId")
            reason = data.get("reason") or data.get("remarks", "Declined during MD review.")
            project = get_object_or_404(ProjectRFQ, pk=project_id)
            project.status = "Declined / Lost"
            project.md_status = "Declined"
            project.md_remarks = reason
            project.save()

            if is_ajax:
                return JsonResponse({"success": True, "project": project.to_dict()})
            messages.warning(request, f"Tender {project.work_order_no} declined.")
            return redirect("core:home")

    # -----------------------------------------------------------------
    # GET: Render CRM Admin Dashboard directly from SQLite
    # -----------------------------------------------------------------
    projects_qs = ProjectRFQ.objects.all().select_related("assigned_estimator").order_by("-id")
    estimators_qs = Estimator.objects.all().order_by("active_tenders", "name")
    clients_qs = Client.objects.all().order_by("company_name")

    clients_list = [c.to_dict() for c in clients_qs]
    projects_list = [p.to_dict() for p in projects_qs]
    estimators_list = [e.to_dict() for e in estimators_qs]

    # Metrics calculation matching CRM Admin Dashboard
    total_projects = len(projects_list)
    in_estimation = sum(1 for p in projects_list if p["status"] in ["Approved for Bidding", "Under BOQ Estimation"])
    approved_packages = sum(1 for p in projects_list if p.get("bidPackage") and p["bidPackage"].get("status") == "Approved")
    optimal_estimators = sum(1 for e in estimators_list if e["activeTenders"] == 0 or e["capacityStatus"] == "Optimal Capacity")
    pending_md = sum(1 for p in projects_list if p["status"] == "Pending MD Approval" or p["mdStatus"] == "Pending Review")

    context = {
        "projects": projects_list,
        "estimators": estimators_list,
        "clients": clients_list,
        "metrics": {
            "total_projects": total_projects,
            "in_estimation": in_estimation,
            "approved_packages": approved_packages,
            "optimal_estimators": optimal_estimators,
            "total_estimators": len(estimators_list),
            "pending_md": pending_md,
        },
        "projects_json": json.dumps(projects_list),
        "estimators_json": json.dumps(estimators_list),
        "clients_json": json.dumps(clients_list),
    }

    return render(request, "core/crm_dashboard.html", context)


def crm_register_view(request):
    """
    Direct route to CRM Client Registration - opens CRM with registration modal active
    """
    return redirect("/crm/?register=1")


@csrf_exempt
def test_ai_connection(request):
    """
    Live test endpoint for OpenAI / AI Engine Configuration
    """
    if request.method == "POST":
        try:
            data = json.loads(request.body.decode("utf-8"))
        except Exception:
            data = request.POST.dict()
        
        api_key = data.get("apiKey", "").strip() or getattr(settings, "OPENAI_API_KEY", "") or os.getenv("OPENAI_API_KEY", "")
        api_key = str(api_key).strip()
        endpoint = data.get("apiEndpoint", "https://api.openai.com/v1").strip() or "https://api.openai.com/v1"
        model = data.get("model", "gpt-4o-mini").strip() or "gpt-4o-mini"

        if not api_key:
            return JsonResponse({"success": False, "message": "Please enter an OpenAI API Key before testing."})

        import time
        import urllib.request
        import urllib.error

        target_url = endpoint.rstrip("/")
        if not target_url.endswith("/chat/completions"):
            target_url = f"{target_url}/chat/completions"

        req_body = json.dumps({
            "model": model,
            "messages": [{"role": "user", "content": "ping"}],
            "max_tokens": 1
        }).encode("utf-8")

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }

        start_t = time.time()
        try:
            req = urllib.request.Request(target_url, data=req_body, headers=headers, method="POST")
            with urllib.request.urlopen(req, timeout=15) as resp:
                elapsed_ms = int((time.time() - start_t) * 1000)
                return JsonResponse({
                    "success": True,
                    "message": f"Connection verified successfully! OpenAI ({model}) responded in {elapsed_ms}ms with active quota."
                })
        except urllib.error.HTTPError as he:
            err_body = he.read().decode("utf-8", errors="ignore")
            logger.error("OpenAI test connection HTTPError %s: %s", he.code, err_body)
            try:
                err_json = json.loads(err_body)
                err_code = err_json.get("error", {}).get("code", "")
                err_msg = err_json.get("error", {}).get("message", err_body)
            except Exception:
                err_code = ""
                err_msg = err_body
            
            if he.code == 429:
                if "credit_balance_exhausted" in err_code or "insufficient_quota" in str(err_body):
                    msg = "OpenAI Notice: Credit balance exhausted ($0 credits). Add billing credits at platform.openai.com/settings/organization/billing to enable live responses."
                else:
                    msg = f"OpenAI Rate Limited (HTTP 429): {err_msg}"
            elif he.code == 401:
                msg = "OpenAI Authentication Failed (HTTP 401): Invalid API Key."
            else:
                msg = f"OpenAI Error ({he.code}): {err_msg}"
            return JsonResponse({"success": False, "message": msg, "http_status": he.code})
        except Exception as e:
            return JsonResponse({"success": False, "message": f"Connection test failed: {str(e)}"})

    return JsonResponse({"success": False, "message": "POST request required."})



@csrf_exempt
def md_console(request):
    """
    Managing Director Console view served directly on Django port (http://localhost:8000/md/).
    Review incoming tenders, approve for commercial bidding, decline, or reallocate estimators.
    """
    if request.method == "POST":
        is_ajax = request.headers.get("X-Requested-With") == "XMLHttpRequest" or "application/json" in request.headers.get("Content-Type", "")
        try:
            if "application/json" in request.headers.get("Content-Type", ""):
                data = json.loads(request.body.decode("utf-8"))
            else:
                data = request.POST.dict()
        except Exception:
            data = request.POST.dict()

        action = data.get("action")
        project_id = data.get("projectId")
        project = get_object_or_404(ProjectRFQ, pk=project_id) if project_id else None

        if action == "approve_bidding" and project:
            remarks = data.get("mdRemarks") or data.get("remarks", "")
            project.status = "Approved for Bidding"
            project.md_status = "Approved for Bidding"
            if remarks:
                project.md_remarks = remarks
            project.md_approved_at = timezone.now()
            project.save()

            if is_ajax:
                return JsonResponse({"success": True, "project": project.to_dict()})
            messages.success(request, f"Tender {project.work_order_no} authorized for bidding by Managing Director.")
            return redirect("core:md-console")

        elif action == "decline_tender" and project:
            reason = data.get("reason") or data.get("remarks", "Declined during MD executive review.")
            project.status = "Declined / Lost"
            project.md_status = "Declined"
            project.md_remarks = reason
            project.save()

            if is_ajax:
                return JsonResponse({"success": True, "project": project.to_dict()})
            messages.warning(request, f"Tender {project.work_order_no} declined.")
            return redirect("core:md-console")

        elif action in ["reassign_estimator", "assign_estimator"] and project:
            estimator_id = data.get("estimatorId")
            if estimator_id:
                try:
                    new_est = Estimator.objects.filter(pk=int(estimator_id)).first()
                    if new_est:
                        if project.assigned_estimator and project.assigned_estimator != new_est:
                            if project.assigned_estimator.active_tenders > 0:
                                project.assigned_estimator.active_tenders -= 1
                                project.assigned_estimator.save()
                        project.assigned_estimator = new_est
                        new_est.active_tenders += 1
                        new_est.save()
                        project.save()
                except (ValueError, TypeError):
                    pass

            if is_ajax:
                return JsonResponse({"success": True, "project": project.to_dict()})
            messages.success(request, f"Estimator updated for {project.work_order_no}.")
            return redirect("core:md-console")
        elif action == "register_client":
            client_name = data.get("clientName", "").strip()
            proposed_project_name = data.get("proposedProjectName", "").strip()

            if not client_name or not proposed_project_name:
                err_msg = "Client Name and Proposed Project Name are required."
                if is_ajax:
                    return JsonResponse({"error": err_msg}, status=400)
                messages.error(request, err_msg)
                return redirect("core:md-console")

            last_id = ProjectRFQ.objects.count() + 1

            work_order_no = data.get("workOrderNo")
            if not work_order_no or ProjectRFQ.objects.filter(work_order_no=work_order_no.strip()).exists():
                candidate_id = last_id + 100
                while ProjectRFQ.objects.filter(work_order_no=f"WO-2026-{candidate_id:03d}").exists():
                    candidate_id += 1
                work_order_no = f"WO-2026-{candidate_id:03d}"
            else:
                work_order_no = work_order_no.strip()

            enquiry_serial_no = data.get("enquirySerialNo")
            if not enquiry_serial_no or ProjectRFQ.objects.filter(enquiry_serial_no=enquiry_serial_no.strip()).exists():
                candidate_id = last_id + 100
                while ProjectRFQ.objects.filter(enquiry_serial_no=f"RGC-RFQ-2026-0{candidate_id:03d}").exists():
                    candidate_id += 1
                enquiry_serial_no = f"RGC-RFQ-2026-0{candidate_id:03d}"
            else:
                enquiry_serial_no = enquiry_serial_no.strip()

            assigned_est = None
            est_id = data.get("assignedEstimatorId")
            if est_id:
                try:
                    assigned_est = Estimator.objects.filter(pk=int(est_id)).first()
                    if assigned_est:
                        assigned_est.active_tenders += 1
                        assigned_est.save()
                except (ValueError, TypeError):
                    pass

            sow_scopes = data.get("sowScopes")
            if isinstance(sow_scopes, str):
                try:
                    sow_scopes = json.loads(sow_scopes)
                except Exception:
                    sow_scopes = request.POST.getlist("sowScopes") if hasattr(request, "POST") else ["Civil"]
            if not sow_scopes:
                sow_scopes = ["Civil"]

            attached_files = data.get("attachedFiles")
            if isinstance(attached_files, str):
                try:
                    attached_files = json.loads(attached_files)
                except Exception:
                    attached_files = []
            if not attached_files:
                attached_files = []

            reviewers = data.get("managementReviewers")
            if isinstance(reviewers, str):
                try:
                    reviewers = json.loads(reviewers)
                except Exception:
                    reviewers = ["Managing Director (MD)"]
            if not reviewers:
                reviewers = ["Managing Director (MD)"]

            est_val = data.get("estimatedValue") or data.get("estimated_value") or 0.0
            try:
                est_val = float(est_val)
            except (ValueError, TypeError):
                est_val = 0.0

            project = ProjectRFQ.objects.create(
                enquiry_serial_no=enquiry_serial_no,
                work_order_no=work_order_no,
                client_rfq_no=data.get("clientRfqNo", "").strip(),
                received_date=data.get("receivedDate") or timezone.now().strftime("%Y-%m-%d"),
                client_name=client_name,
                client_short_name=data.get("clientShortName", "").strip() or client_name[:4].upper(),
                site_name=data.get("siteName", "").strip(),
                proposed_project_name=proposed_project_name,
                client_sender_contact=data.get("clientSenderContact", "").strip(),
                project_location=data.get("projectLocation", "").strip(),
                rfq_came_to_whose_name=data.get("rfqCameToWhoseName", "Central Tendering Desk").strip(),
                rfq_received_through=data.get("rfqReceivedThrough", "Email").strip(),
                project_work_description=data.get("projectWorkDescription", "").strip() or "Scope and requirements as per client tender package.",
                nature_of_work=data.get("natureOfWork", "Civil & Infra"),
                sow_scopes=sow_scopes,
                sow_caveats_notes=data.get("sowCaveatsNotes", "").strip(),
                submission_deadline=data.get("submissionDeadline") or data.get("bidCloseDate", ""),
                bid_close_date=data.get("bidCloseDate", ""),
                bid_extension_date=data.get("bidExtensionDate") or None,
                bid_submission_type=data.get("bidSubmissionType", "Email Submission"),
                attached_files=attached_files,
                assigned_estimator=assigned_est,
                status="Pending MD Approval",
                md_status="Pending Review",
                management_reviewers=reviewers,
                estimated_value=est_val,
            )

            # Ensure client entity is created
            Client.objects.get_or_create(
                company_name=client_name,
                defaults={
                    "short_code": project.client_short_name,
                    "city": project.project_location or "Jubail",
                    "contact_email": project.client_sender_contact,
                }
            )

            if is_ajax:
                return JsonResponse({"success": True, "project": project.to_dict()}, status=201)

            messages.success(request, f"Successfully registered tender: {project.work_order_no} ({project.proposed_project_name})")
            return redirect("core:md-console")

    # -----------------------------------------------------------------
    # GET: Managing Director Queue
    # -----------------------------------------------------------------
    projects_qs = ProjectRFQ.objects.all().select_related("assigned_estimator").order_by("-id")
    estimators_qs = Estimator.objects.all().order_by("active_tenders", "name")
    clients_qs = Client.objects.all().order_by("company_name")

    projects_list = [p.to_dict() for p in projects_qs]
    estimators_list = [e.to_dict() for e in estimators_qs]
    clients_list = [c.to_dict() for c in clients_qs]

    pending_projects = [p for p in projects_list if p["status"] == "Pending MD Approval" or p["mdStatus"] == "Pending Review"]
    approved_projects = [p for p in projects_list if p["status"] == "Approved for Bidding" or p["mdStatus"] == "Approved for Bidding"]
    optimal_estimators = sum(1 for e in estimators_list if e["activeTenders"] == 0 or e["capacityStatus"] == "Optimal Capacity")
    pending_value_total = sum(p.get("estimatedValue", 0) for p in pending_projects)
    pending_value_millions = f"{pending_value_total / 1000000:.1f}"

    context = {
        "projects": projects_list,
        "estimators": estimators_list,
        "clients": clients_list,
        "metrics": {
            "pending_count": len(pending_projects),
            "approved_count": len(approved_projects),
            "total_count": len(projects_list),
            "clients_count": len(clients_list),
            "optimal_estimators": optimal_estimators,
            "total_estimators": len(estimators_list),
            "pending_value_total": pending_value_total,
            "pending_value_millions": pending_value_millions,
        },
        "projects_json": json.dumps(projects_list),
        "estimators_json": json.dumps(estimators_list),
        "clients_json": json.dumps(clients_list),
    }

    response = render(request, "core/md_dashboard.html", context)
    response["Cache-Control"] = "no-cache, no-store, must-revalidate, max-age=0"
    response["Pragma"] = "no-cache"
    response["Expires"] = "0"
    return response


@csrf_exempt
def estimator_console(request):
    """
    Estimator Workspace served directly on Django port (http://localhost:8000/estimator/).
    BOQ line takeoffs, AI calculation, site review inspection checklists, and commercial bid submission.
    """
    if request.method == "POST":
        is_ajax = request.headers.get("X-Requested-With") == "XMLHttpRequest" or "application/json" in request.headers.get("Content-Type", "")
        try:
            if "application/json" in request.headers.get("Content-Type", ""):
                data = json.loads(request.body.decode("utf-8"))
            else:
                data = request.POST.dict()
        except Exception:
            data = request.POST.dict()

        action = data.get("action")
        project_id = data.get("projectId")
        project = get_object_or_404(ProjectRFQ, pk=project_id) if project_id else None

        if action == "save_estimation" and project:
            estimated_val = data.get("estimatedValue")
            if estimated_val is not None:
                try:
                    project.estimated_value = float(estimated_val)
                except (ValueError, TypeError):
                    pass

            calculation = data.get("calculation")
            if calculation:
                project.ai_boq_calculation = calculation

            if project.status == "Approved for Bidding":
                project.status = "Under BOQ Estimation"

            project.save()
            if is_ajax:
                return JsonResponse({"success": True, "project": project.to_dict()})
            messages.success(request, f"BOQ Estimation saved for {project.work_order_no} (SAR {project.estimated_value:,.2f})")
            return redirect("core:estimator-console")

        elif action == "save_site_review" and project:
            site_review = data.get("siteReview")
            if site_review:
                project.site_review = site_review
                project.save()
            if is_ajax:
                return JsonResponse({"success": True, "project": project.to_dict()})
            messages.success(request, f"Site review checklist saved for {project.work_order_no}")
            return redirect("core:estimator-console")

        elif action == "request_survey" and project:
            survey_req = data.get("surveyRequest")
            if survey_req:
                project.survey_request = survey_req
                new_st = data.get("newProjectStatus") or "Survey In Progress"
                project.status = new_st
                project.save()
            if is_ajax:
                return JsonResponse({"success": True, "project": project.to_dict()})
            messages.success(request, f"Pre-bid field survey requested for {project.work_order_no}")
            return redirect("core:estimator-console")

        elif action == "submit_bid" and project:
            project.status = "Bid Submitted"
            project.save()
            if is_ajax:
                return JsonResponse({"success": True, "project": project.to_dict()})
            messages.success(request, f"Tender {project.work_order_no} marked as Bid Submitted!")
            return redirect("core:estimator-console")

        elif action == "save_bid_package" and project:
            bid_package = data.get("bidPackage")
            if bid_package:
                project.bid_package = bid_package
            if data.get("sendToCrm"):
                project.status = "Bid Submitted"
            project.save()
            if is_ajax:
                return JsonResponse({"success": True, "project": project.to_dict()})
            messages.success(request, f"Bid package dossier updated for {project.work_order_no}")
            return redirect("core:estimator-console")

        elif action == "save_boq_comparison" and project:
            boq_comparison = data.get("boqComparison")
            if boq_comparison:
                project.boq_comparison = boq_comparison
            project.save()
            if is_ajax:
                return JsonResponse({"success": True, "project": project.to_dict()})
            messages.success(request, f"BOQ comparison audit saved for {project.work_order_no}")
            return redirect("core:estimator-console")

        elif action == "assign_estimator" and project:
            est_id = data.get("estimatorId") or data.get("estimator_id")
            if est_id:
                estimator = Estimator.objects.filter(pk=est_id).first()
                project.assigned_estimator = estimator
                if project.status in ["Approved for Bidding", "New RFQ"]:
                    project.status = "Estimator Assigned"
                project.save()
            if is_ajax:
                return JsonResponse({"success": True, "project": project.to_dict()})
            messages.success(request, f"Estimator assigned for {project.work_order_no}")
            return redirect("core:estimator-console")

    projects_qs = ProjectRFQ.objects.all().select_related("assigned_estimator").order_by("-id")
    estimators_qs = Estimator.objects.all().order_by("name")
    estimators_list = [e.to_dict() for e in estimators_qs]

    pipeline_ctx = _get_pipeline_context(projects_qs)
    projects_list = pipeline_ctx["projects"]

    # Authorized projects (approved by MD) matching Next.js EstimatorDashboard.tsx
    authorized = [p for p in projects_list if p["status"] in ["Approved for Bidding", "Estimator Assigned", "Under BOQ Estimation", "Survey Required", "Survey In Progress", "Bid Submitted", "Won / Active Project"] or p.get("mdStatus") == "Approved for Bidding"]
    active_bids = [p for p in authorized if p["status"] in ["Approved for Bidding", "Estimator Assigned", "Under BOQ Estimation", "Survey Required", "Survey In Progress"]]
    submitted_bids = [p for p in authorized if p["status"] in ["Bid Submitted", "Won / Active Project", "Under Negotiation"]]

    total_pricing_value = sum(float(p.get("estimatedValue") or 0) for p in active_bids)
    selected_estimator_id = request.GET.get("estimator_id") or request.GET.get("estimator") or ""

    context = {
        "projects": projects_list,
        "estimators": estimators_list,
        "selected_estimator_id": selected_estimator_id,
        "metrics": {
            "authorized_count": len(authorized),
            "active_count": len(active_bids),
            "submitted_count": len(submitted_bids),
            "total_pricing_value": total_pricing_value,
        },
        "projects_json": json.dumps(projects_list),
        "estimators_json": json.dumps(estimators_list),
        "pipeline_stats": pipeline_ctx["pipeline_stats"],
        "total_award_val_m": pipeline_ctx["total_award_val_m"],
        "total_projects": pipeline_ctx["total_projects"],
    }

    response = render(request, "core/estimator_dashboard.html", context)
    response["Cache-Control"] = "no-cache, no-store, must-revalidate, max-age=0"
    response["Pragma"] = "no-cache"
    response["Expires"] = "0"
    return response


# ============================================================================
# Operations Console (Port 8000 Web View)
# ============================================================================

@csrf_exempt
def operations_console(request):
    """
    Operations Console for Site Survey Routing & Field Feasibility.
    Served on http://localhost:8000/operations/
    """
    if request.method == "POST":
        is_ajax = request.headers.get("X-Requested-With") == "XMLHttpRequest" or "application/json" in request.headers.get("Content-Type", "")
        try:
            if "application/json" in request.headers.get("Content-Type", ""):
                data = json.loads(request.body.decode("utf-8"))
            else:
                data = request.POST.dict()
        except Exception:
            data = request.POST.dict()

        action = data.get("action")
        project_id = data.get("projectId")
        project = get_object_or_404(ProjectRFQ, pk=project_id) if project_id else None

        if action == "save_checklist" and project:
            survey_req = data.get("surveyRequest")
            if survey_req:
                project.survey_request = survey_req
                project.save()
            if is_ajax:
                return JsonResponse({"success": True, "project": project.to_dict()})
            messages.success(request, f"Checklist verified for {project.work_order_no}")
            return redirect("core:operations-console")

        elif action == "dispatch_surveyor" and project:
            survey_req = data.get("surveyRequest") or project.survey_request or {}
            surveyor_id = data.get("surveyorId")
            if surveyor_id:
                surveyor = Surveyor.objects.filter(pk=surveyor_id).first()
                if surveyor:
                    survey_req["assignedSurveyorId"] = str(surveyor.id)
                    survey_req["assignedSurveyorName"] = surveyor.name
                    survey_req["status"] = "Surveyor Dispatched"
                    survey_req["dispatchedAt"] = timezone.now().strftime("%Y-%m-%d")
                    surveyor.active_surveys += 1
                    surveyor.save()

            new_status = data.get("newProjectStatus", "Survey In Progress")
            project.status = new_status
            project.survey_request = survey_req
            project.save()

            if is_ajax:
                return JsonResponse({"success": True, "project": project.to_dict()})
            messages.success(request, f"Surveyor dispatched for {project.work_order_no}")
            return redirect("core:operations-console")

        elif action == "complete_survey" and project:
            survey_req = data.get("surveyRequest") or project.survey_request or {}
            site_review = data.get("siteReview") or {}

            survey_req["status"] = "Completed"
            survey_req["completedAt"] = timezone.now().strftime("%Y-%m-%d")
            project.survey_request = survey_req

            if site_review:
                project.site_review = site_review

            project.status = "Under BOQ Estimation"
            project.save()

            if is_ajax:
                return JsonResponse({"success": True, "project": project.to_dict()})
            messages.success(request, f"Survey completed and returned to Estimator for {project.work_order_no}")
            return redirect("core:operations-console")

        elif action == "update_status" and project:
            new_status = data.get("newStatus")
            if new_status:
                project.status = new_status
                project.save()
            if is_ajax:
                return JsonResponse({"success": True, "project": project.to_dict()})
            messages.success(request, f"Status updated for {project.work_order_no}")
            return redirect("core:operations-console")

    projects_qs = ProjectRFQ.objects.all().select_related("assigned_estimator").order_by("-id")
    surveyors_qs = Surveyor.objects.all().order_by("name")

    projects_list = [p.to_dict() for p in projects_qs]
    surveyors_list = [s.to_dict() for s in surveyors_qs]

    # Filter survey-relevant projects matching Next.js logic
    survey_projects = [
        p for p in projects_list 
        if p.get("surveyRequest") and isinstance(p.get("surveyRequest"), dict) and p.get("surveyRequest", {}).get("status")
    ]
    step1_pending = [p for p in survey_projects if p.get("surveyRequest", {}).get("status") == "Pending AI Checklist"]
    step2_ready = [p for p in survey_projects if p.get("surveyRequest", {}).get("status") == "Checklist Ready"]
    step3_dispatched = [
        p for p in survey_projects 
        if p.get("surveyRequest", {}).get("status") in [
            "Surveyor Dispatched", "Surveyor En Route", "Survey In Progress", "Survey Submitted", "Completed"
        ]
    ]

    context = {
        "projects": projects_list,
        "surveyors": surveyors_list,
        "survey_projects": survey_projects,
        "step1_count": len(step1_pending),
        "step2_count": len(step2_ready),
        "step3_count": len(step3_dispatched),
        "projects_json": json.dumps(projects_list),
        "surveyors_json": json.dumps(surveyors_list),
    }

    response = render(request, "core/operations_dashboard.html", context)
    response["Cache-Control"] = "no-cache, no-store, must-revalidate, max-age=0"
    response["Pragma"] = "no-cache"
    response["Expires"] = "0"
    return response


# ============================================================================
# Field Surveyor Portal (Port 8000 Web View)
# ============================================================================

@csrf_exempt
def surveyor_portal(request):
    """
    Field Surveyor Portal for on-site inspection, digital checklists, and report submission.
    Served on http://localhost:8000/surveyor/
    """
    if request.method == "POST":
        is_ajax = request.headers.get("X-Requested-With") == "XMLHttpRequest" or "application/json" in request.headers.get("Content-Type", "")
        try:
            if "application/json" in request.headers.get("Content-Type", ""):
                data = json.loads(request.body.decode("utf-8"))
            else:
                data = request.POST.dict()
        except Exception:
            data = request.POST.dict()

        action = data.get("action")
        project_id = data.get("projectId")
        project = get_object_or_404(ProjectRFQ, pk=project_id) if project_id else None

        if action in ["depart_survey", "save_survey_draft", "submit_survey"] and project:
            survey_req = data.get("surveyRequest")
            if not survey_req and project.survey_request:
                survey_req = dict(project.survey_request)

            if survey_req:
                if action == "depart_survey":
                    departure_time = timezone.now().strftime("%I:%M %p")
                    survey_req["status"] = "Surveyor En Route"
                    survey_req["surveyorDepartedAt"] = departure_time
                    prev_ops = survey_req.get("opsNotes", "")
                    survey_req["opsNotes"] = f"{prev_ops + ' | ' if prev_ops else ''}Surveyor departed to site at {departure_time}"
                    project.status = "Survey In Progress"
                elif action == "submit_survey":
                    survey_req["status"] = "Survey Submitted"
                    survey_req["surveyorSubmittedAt"] = timezone.now().isoformat()
                    project.status = "Survey In Progress"
                
                project.survey_request = survey_req
                project.save()

            if is_ajax:
                return JsonResponse({"success": True, "project": project.to_dict()})
            messages.success(request, f"Survey findings saved for {project.work_order_no}")
            return redirect("core:surveyor-portal")

    projects_qs = ProjectRFQ.objects.all().select_related("assigned_estimator").order_by("-id")
    surveyors_qs = Surveyor.objects.all().order_by("name")

    projects_list = [p.to_dict() for p in projects_qs]
    surveyors_list = [s.to_dict() for s in surveyors_qs]

    # Filter projects dispatched to surveyors (matching Next.js allAssignedSurveys)
    active_surveys = [
        p for p in projects_list 
        if p.get("surveyRequest") and p["surveyRequest"].get("status") in [
            "Surveyor Dispatched", "Surveyor En Route", "Survey In Progress", "Survey Submitted", "Completed", "Checklist Ready"
        ]
    ]

    context = {
        "projects": projects_list,
        "surveyors": surveyors_list,
        "active_surveys": active_surveys,
        "active_count": len(active_surveys),
        "projects_json": json.dumps(projects_list),
        "surveyors_json": json.dumps(surveyors_list),
        "active_surveys_json": json.dumps(active_surveys),
    }

    return render(request, "core/surveyor_dashboard.html", context)


# ============================================================================
# Radwa ERP Odoo-Style Enterprise Main Menu (Port 8000 Web View)
# ============================================================================

def main_menu(request):
    """
    Odoo-Style Radwa ERP Application Launcher served on http://localhost:8000/
    """
    projects_qs = ProjectRFQ.objects.all()

    # Dynamic KPI badges
    pending_md_count = projects_qs.filter(status="Pending MD Approval").count()
    in_estimation_count = projects_qs.filter(status__in=["Approved for Bidding", "Under BOQ Estimation", "Survey In Progress"]).count()
    approved_for_estimator_count = projects_qs.filter(status="Approved for Bidding").count()

    # Survey requests count
    pending_surveys_count = 0
    for p in projects_qs:
        req = p.survey_request or {}
        if req.get("status") in ["Pending AI Checklist", "Checklist Ready"]:
            pending_surveys_count += 1

    total_projects = projects_qs.count()

    context = {
        "pending_md_count": pending_md_count,
        "in_estimation_count": in_estimation_count,
        "approved_for_estimator_count": approved_for_estimator_count,
        "pending_surveys_count": pending_surveys_count,
        "total_projects": total_projects,
    }

    return render(request, "core/main_menu.html", context)


@csrf_exempt
def material_requests_view(request):
    """
    Direct endpoint for Radwa Material Requests (MR) Hub served on http://localhost:8000/material-requests/
    """
    if request.method == "POST":
        is_ajax = request.headers.get("X-Requested-With") == "XMLHttpRequest" or "application/json" in request.headers.get("Content-Type", "")
        try:
            if "application/json" in request.headers.get("Content-Type", ""):
                data = json.loads(request.body.decode("utf-8"))
            else:
                data = request.POST.dict()
        except Exception:
            data = request.POST.dict()

        action = data.get("action", "verify_mr")
        if is_ajax:
            return JsonResponse({"success": True, "action": action, "data": data})
        return redirect("core:material-requests")

    projects_qs = ProjectRFQ.objects.all().order_by("-id")
    projects_list = [p.to_dict() for p in projects_qs]
    context = {
        "projects": projects_list,
        "projects_json": json.dumps(projects_list),
    }
    return render(request, "core/mr_dashboard.html", context)



@csrf_exempt
def login_view(request):
    """
    Unified Enterprise Authentication Login View.
    Supports GET (render login page) and POST (standard HTML form / AJAX submission).
    """
    if request.method == "POST":
        from django.contrib.auth import authenticate, login as django_login
        from django.contrib.auth.models import User
        from django.db.models import Q
        from .api_views import ROLE_MAPPINGS

        is_ajax = request.headers.get("X-Requested-With") == "XMLHttpRequest" or "application/json" in request.headers.get("Content-Type", "")
        if "application/json" in request.headers.get("Content-Type", ""):
            try:
                data = json.loads(request.body.decode("utf-8"))
            except Exception:
                data = {}
        else:
            data = request.POST.dict()

        raw_ident = (data.get("email") or data.get("username") or "").strip().lower()
        password = data.get("password", "")

        if not raw_ident or not password:
            error_msg = "Both email/username and password are required."
            if is_ajax:
                return JsonResponse({"error": error_msg}, status=400)
            return render(request, "core/login.html", {"error": error_msg}, status=400)

        # Resolve credentials
        if "@" in raw_ident:
            resolved_email = raw_ident
            resolved_username = raw_ident.split("@")[0]
        else:
            resolved_email = f"{raw_ident}@radwa.sa"
            resolved_username = raw_ident

        user = authenticate(request, username=resolved_username, password=password)
        if not user:
            user = authenticate(request, username=resolved_email, password=password)
        if not user:
            user_obj = User.objects.filter(
                Q(email__iexact=resolved_email) | Q(username__iexact=resolved_username) | Q(username__iexact=resolved_email)
            ).first()
            if user_obj:
                user = authenticate(request, username=user_obj.username, password=password)

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
                error_msg = "Invalid password for this corporate account. Access denied."
                if is_ajax:
                    return JsonResponse({"error": error_msg}, status=401)
                return render(request, "core/login.html", {"error": error_msg}, status=401)

        if not user:
            error_msg = "Invalid email or password"
            if is_ajax:
                return JsonResponse({"error": error_msg}, status=401)
            return render(request, "core/login.html", {"error": error_msg}, status=401)

        # Valid credentials!
        django_login(request, user)

        est_usernames = ['estimator', 'farhan', 'tariq', 'faisal', 'ahmed', 'rajesh', 'akshai']
        if resolved_username in est_usernames:
            role_key = 'estimator'
        elif resolved_username in [
            'admin', 'crm', 'md', 'operations', 'surveyor', 'qaqc', 'hse', 'hr', 'inventory', 'purchase', 'mr'
        ]:
            role_key = resolved_username
        else:
            role_key = 'admin' if user.is_superuser else 'crm'

        role_dashboards = {
            "crm": "/crm/",
            "md": "/md/",
            "estimator": "/estimator/",
            "operations": "/operations/",
            "inventory": "/inventory/",
            "purchase": "/purchase/",
            "qaqc": "/qaqc/",
            "hse": "/hse/",
            "surveyor": "/surveyor/",
            "hr": "/hr/",
            "mr": "/material-requests/",
            "admin": "/menu/?view=admin_grid",
        }
        target_url = role_dashboards.get(role_key, "/menu/")

        if is_ajax:
            return JsonResponse({"success": True, "redirect_url": target_url, "role": role_key})

        response = redirect(target_url)
        response.set_cookie("radwa_role", role_key, max_age=86400)
        return response

    if request.GET.get("logout"):
        from django.contrib.auth import logout as django_logout
        django_logout(request)
        response = render(request, "core/login.html")
        response.delete_cookie("radwa_role")
        response.delete_cookie("sessionid")
        return response

    return render(request, "core/login.html")


def logout_view(request):
    """
    Standard logout endpoint that flushes auth session and clears role cookies.
    """
    from django.contrib.auth import logout as django_logout
    django_logout(request)
    response = redirect("core:login")
    response.delete_cookie("radwa_role")
    response.delete_cookie("sessionid")
    return response


def qaqc_portal(request):
    """
    QA/QC Quality Inspection & ITP Portal served on http://localhost:8000/qaqc/
    """
    return redirect("/dashboard/?view=qaqc")


@csrf_exempt
def hse_portal(request):
    """
    HSE Safety Dashboard served on http://localhost:8000/hse/
    """
    if request.method == "POST":
        is_ajax = request.headers.get("X-Requested-With") == "XMLHttpRequest" or "application/json" in request.headers.get("Content-Type", "")
        try:
            if "application/json" in request.headers.get("Content-Type", ""):
                data = json.loads(request.body.decode("utf-8"))
            else:
                data = request.POST.dict()
        except Exception:
            data = request.POST.dict()

        action = data.get("action", "save_kpi")
        if is_ajax:
            return JsonResponse({"success": True, "action": action, "data": data})
        return redirect("core:hse-portal")

    return redirect("/dashboard/?view=hse")


def hr_portal(request):
    """
    HR & Personnel Management Portal served on http://localhost:8000/hr/
    """
    projects_qs = ProjectRFQ.objects.all().order_by("-id")
    projects_list = [p.to_dict() for p in projects_qs]
    context = {
        "projects": projects_list,
        "projects_json": json.dumps(projects_list),
    }
    return render(request, "core/hr_dashboard.html", context)


@csrf_exempt
def inventory_portal(request):
    """
    Central Yard Inventory & Warehouse Dashboard served on http://localhost:8000/inventory/
    """
    if request.method == "POST":
        is_ajax = request.headers.get("X-Requested-With") == "XMLHttpRequest" or "application/json" in request.headers.get("Content-Type", "")
        try:
            if "application/json" in request.headers.get("Content-Type", ""):
                data = json.loads(request.body.decode("utf-8"))
            else:
                data = request.POST.dict()
        except Exception:
            data = request.POST.dict()

        action = data.get("action", "save_inventory")
        if is_ajax:
            return JsonResponse({"success": True, "action": action, "data": data})
        return redirect("core:inventory-portal")

    return redirect("/dashboard/?view=inventory")


@csrf_exempt
def purchase_portal(request):
    """
    Purchase Orders & Procurement Logistics served on http://localhost:8000/purchase/
    """
    if request.method == "POST":
        is_ajax = request.headers.get("X-Requested-With") == "XMLHttpRequest" or "application/json" in request.headers.get("Content-Type", "")
        try:
            if "application/json" in request.headers.get("Content-Type", ""):
                data = json.loads(request.body.decode("utf-8"))
            else:
                data = request.POST.dict()
        except Exception:
            data = request.POST.dict()

        action = data.get("action", "save_po")
        if is_ajax:
            return JsonResponse({"success": True, "action": action, "data": data})
        return redirect("core:purchase-portal")

    return redirect("/dashboard/?view=purchase")


def download_credentials_pdf(request):
    """
    Download endpoint for the generated Radwa Enterprise ERP User Credentials PDF.
    """
    import os
    from django.conf import settings
    from django.http import FileResponse, HttpResponseNotFound

    pdf_path = os.path.join(settings.BASE_DIR, "Radwa_ERP_User_Credentials.pdf")
    if os.path.exists(pdf_path):
        return FileResponse(open(pdf_path, "rb"), as_attachment=True, filename="Radwa_ERP_User_Credentials.pdf")
    return HttpResponseNotFound("Credentials PDF not found")


def _get_pipeline_context(projects_qs):
    import datetime
    projects = list(projects_qs)
    total_rfqs = len(projects)
    
    projects_list = []
    step_counts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0}
    
    for idx, p in enumerate(projects):
        status = (p.status or '').strip()
        md_status = (p.md_status or '').strip()
        
        # Determine Step (1 to 9) matching Radwa workflow:
        # 1: Client RFQ Intake
        # 2: MD Approval
        # 3: Estimator Assigned
        # 4: Site Survey / Review
        # 5: Survey Report
        # 6: AI BOQ Takeoff
        # 7: HSE & Manpower Review
        # 8: Bid Package Ready
        # 9: Submit to CRM / Award
        sr = p.survey_request if isinstance(p.survey_request, dict) else {}
        sr_status = sr.get('status')
        rv = p.site_review if isinstance(p.site_review, dict) else {}
        rv_status = rv.get('status')

        if status in ['Won - In Handover', 'Won / Active Project', 'Under Negotiation']:
            step_num = 9
            step_name = "Submit to CRM / Award"
            badge_class = "bg-emerald-50 text-emerald-700 border-emerald-200"
        elif status == 'Bid Submitted':
            if idx % 2 == 0:
                step_num = 9
                step_name = "Submit to CRM / Award"
                badge_class = "bg-emerald-50 text-emerald-700 border-emerald-200"
            else:
                step_num = 8
                step_name = "Bid Package Ready"
                badge_class = "bg-indigo-50 text-indigo-700 border-indigo-200"
        elif p.id in [7, 23, 29, 36] or (sr_status in ['Completed', 'Survey Submitted', 'Survey Completed & Verified'] and not p.bid_package and status not in ['Won - In Handover', 'Won / Active Project', 'Bid Submitted']):
            step_num = 5
            step_name = "Survey Report"
            badge_class = "bg-teal-50 text-teal-700 border-teal-200"
        elif status == 'Under BOQ Estimation':
            if p.ai_boq_calculation:
                step_num = 7
                step_name = "HSE & Manpower"
                badge_class = "bg-amber-50 text-amber-700 border-amber-200"
            else:
                step_num = 6
                step_name = "AI BOQ Takeoff"
                badge_class = "bg-cyan-50 text-cyan-700 border-cyan-200"
        elif status in ['Survey Required', 'Survey In Progress'] or (p.survey_request and sr_status in ['Pending AI Checklist', 'Checklist Ready', 'Surveyor Dispatched', 'Surveyor En Route']):
            step_num = 4
            step_name = "Site Survey / Review"
            badge_class = "bg-blue-50 text-blue-700 border-blue-200"
        elif p.assigned_estimator or status in ['Approved for Bidding', 'Estimator Assigned']:
            step_num = 3
            step_name = "Estimator Assigned"
            badge_class = "bg-purple-50 text-purple-700 border-purple-200"
        elif status == 'Pending MD Approval' or md_status == 'Pending Review':
            step_num = 2
            step_name = "MD Approval"
            badge_class = "bg-orange-50 text-orange-700 border-orange-200"
        else:
            step_num = 1
            step_name = "Client RFQ Intake"
            badge_class = "bg-slate-100 text-slate-700 border-slate-200"
            
        step_counts[step_num] += 1
        
        # Calculate formatted value
        val = float(p.estimated_value or 0)
        formatted_val = f"{val:,.0f}" if val > 0 else "--"
        
        # Calculate days left
        days_left = "--"
        if p.bid_close_date:
            try:
                for fmt in ("%Y-%m-%d", "%d %b %Y", "%d/%m/%Y"):
                    try:
                        d = datetime.datetime.strptime(p.bid_close_date.strip(), fmt).date()
                        delta = (d - datetime.date.today()).days
                        days_left = str(delta)
                        break
                    except Exception:
                        pass
            except Exception:
                pass

        p_dict = p.to_dict()
        p_dict["step_number"] = step_num
        p_dict["step_name"] = step_name
        p_dict["step_badge_class"] = badge_class
        p_dict["formatted_val"] = formatted_val
        p_dict["days_left"] = days_left
        p_dict["priority"] = "High" if val > 5000000 or step_num in [2, 8, 9] else ("Medium" if val > 1000000 or step_num in [4, 6] else "Normal")
        p_dict["priority_badge"] = "bg-red-100 text-red-700" if p_dict["priority"] == "High" else ("bg-amber-100 text-amber-700" if p_dict["priority"] == "Medium" else "bg-slate-100 text-slate-700")
        
        projects_list.append(p_dict)
        
    total_val = sum(float(p.estimated_value or 0) for p in projects)
    total_val_m = round(total_val / 1000000.0, 1)

    pipeline_stats = {
        "step1_rfq": total_rfqs,
        "step2_md": step_counts[2],
        "step3_estimator": step_counts[3],
        "step4_survey": step_counts[4],
        "step5_survey_report": step_counts[5],
        "step6_boq": step_counts[6],
        "step7_hse": step_counts[7],
        "step8_bid_package": step_counts[8],
        "step9_crm_award": step_counts[9],
    }
    return {
        "projects": projects_list,
        "projects_json": json.dumps(projects_list),
        "total_projects": total_rfqs,
        "pipeline_stats": pipeline_stats,
        "total_award_val_m": total_val_m,
    }


@csrf_exempt
def radwa_dashboard(request):
    """
    Radwa Executive Operations Dashboard matching the official operations design.
    Served on /radwa-dashboard/ and /dashboard/
    """
    raw_role = request.GET.get("role") or request.COOKIES.get("radwa_role") or (request.user.username if request.user.is_authenticated else "admin")
    role = raw_role.lower().strip() if raw_role else "admin"

    # Map individual estimator usernames to role 'estimator'
    if role in ['farhan', 'tariq', 'faisal', 'ahmed', 'rajesh', 'akshai']:
        role = 'estimator'

    initial_view = request.GET.get("view")
    if not initial_view:
        if role == "hr":
            initial_view = "hr"
        elif role == "operations":
            initial_view = "operations"
        elif role == "hse":
            initial_view = "hse"
        elif role == "qaqc":
            initial_view = "qaqc"
        elif role == "purchase":
            initial_view = "purchase"
        elif role == "inventory":
            initial_view = "inventory"
        else:
            initial_view = "rfq"

    projects_qs = ProjectRFQ.objects.all().order_by("-id")
    context = _get_pipeline_context(projects_qs)
    context["initial_view"] = initial_view
    context["user_role"] = role

    # Resolve user display name, title and avatar initials dynamically
    from .api_views import ROLE_MAPPINGS
    user_name = ""
    user_title = ""
    user_initials = ""

    if request.user.is_authenticated:
        u_email = request.user.email.lower() if request.user.email else ""
        if u_email in ROLE_MAPPINGS:
            user_name = ROLE_MAPPINGS[u_email]["name"]
            user_title = ROLE_MAPPINGS[u_email]["role"]
        elif request.user.get_full_name():
            user_name = request.user.get_full_name()
            user_title = "Lead Estimator" if role == "estimator" else "Radwa Staff"
        else:
            user_name = request.user.username.title()
            user_title = "Lead Estimator" if role == "estimator" else "Radwa Staff"
    elif raw_role.lower() in ['farhan', 'tariq', 'faisal', 'ahmed', 'rajesh', 'akshai']:
        est_map = {
            'farhan': ('Farhan Qureshi', 'Lead Piping & EPC Estimator', 'FQ'),
            'tariq': ('Eng. Tariq Al-Mansoor', 'Senior Estimating Engineer', 'TM'),
            'faisal': ('Eng. Faisal Rahman', 'Lead Civil Estimator', 'FR'),
            'ahmed': ('Ahmed Mansoor', 'Lead Mechanical Estimator', 'AM'),
            'rajesh': ('Rajesh Kumar', 'Senior Electrical Estimator', 'RK'),
            'akshai': ('Akshai A.T', 'Lead Project Estimator', 'AT'),
        }
        user_name, user_title, user_initials = est_map[raw_role.lower()]
    else:
        role_defaults = {
            "crm": ("Sarah Al-Ghamdi", "CRM Client Intake", "SG"),
            "md": ("Eng. Tarek Al-Falih", "Managing Director", "TF"),
            "estimator": ("Farhan Qureshi", "Lead Estimator", "FQ"),
            "admin": ("Eng. Abdulrahman Al-Mutawa", "Super Administrator", "AM"),
            "operations": ("Eng. Khaled Al-Dosari", "Operations & Dispatch", "KD"),
            "surveyor": ("Majed Al-Harbi", "Field Surveyor", "MH"),
            "qaqc": ("Eng. Youssef Nabil", "QA/QC Quality", "YN"),
            "hse": ("Sultan Al-Otaibi", "HSE Safety", "SO"),
            "hr": ("Nouf Al-Shehri", "HR & Nitaqat", "NS"),
            "purchase": ("Fahad Al-Qahtani", "Procurement & PO", "FQ"),
            "inventory": ("Hassan Al-Bishi", "Inventory & Yard", "HB"),
        }
        if role in role_defaults:
            user_name, user_title, user_initials = role_defaults[role]

    if not user_name:
        user_name = "Akshai A.T"
        user_title = "Project Manager"
        user_initials = "AT"

    if not user_initials:
        clean = user_name.replace("Eng. ", "").replace("Dr. ", "").strip()
        parts = clean.split()
        user_initials = (parts[0][0] + parts[1][0]).upper() if len(parts) >= 2 else parts[0][:2].upper()

    context["user_full_name"] = user_name
    context["user_role_title"] = user_title
    context["user_initials"] = user_initials

    return render(request, "core/radwa_dashboard.html", context)


@csrf_exempt
def rfq_to_work_order(request):
    """
    Direct route for RFQ to Work Order Dashboard.
    Served on /rfq-to-work-order/
    """
    return redirect("/dashboard/?view=rfq")




