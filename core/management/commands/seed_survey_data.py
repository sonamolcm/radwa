from django.core.management.base import BaseCommand
from core.models import Estimator, ProjectRFQ, Surveyor


class Command(BaseCommand):
    help = "Seed realistic site survey projects and surveyors matching Next.js Surveyor Dashboard"

    def handle(self, *args, **options):
        # 1. Surveyors
        surveyors_data = [
            {
                "name": "Tariq Al-Ghamdi",
                "initials": "TG",
                "role": "Senior Field Surveyor & HSE Inspector",
                "assigned_zone": "Western & Eastern Industrial Provinces",
                "phone": "+966 55 987 6543",
                "email": "tariq.ghamdi@radwa.sa",
                "active_surveys": 3,
                "capacity_status": "Available",
                "avatar_bg": "bg-teal-100 text-teal-800",
                "specialty": "GPS RTK Topography & GPR Utility Scanning",
            },
            {
                "name": "Saeed Al-Otaibi",
                "initials": "SO",
                "role": "Senior Topographical Surveyor",
                "assigned_zone": "Jubail Industrial City",
                "phone": "+966 50 123 4567",
                "email": "saeed.otaibi@radwa.sa",
                "active_surveys": 1,
                "capacity_status": "Available",
                "avatar_bg": "bg-teal-100 text-teal-800",
                "specialty": "GPS RTK Topography & GPR Utility Scanning",
            },
            {
                "name": "Ibrahim Khalil",
                "initials": "IK",
                "role": "Civil & Route Inspection Surveyor",
                "assigned_zone": "Yanbu Industrial Zone",
                "phone": "+966 55 987 6543",
                "email": "ibrahim.khalil@radwa.sa",
                "active_surveys": 0,
                "capacity_status": "Available",
                "avatar_bg": "bg-amber-100 text-amber-800",
                "specialty": "Right-of-Way Clashes & Elevation Surveys",
            },
        ]

        for s in surveyors_data:
            Surveyor.objects.update_or_create(name=s["name"], defaults=s)

        est = Estimator.objects.filter(role__icontains="Piping").first() or Estimator.objects.first()

        # 2. Sample Survey Projects
        samples = [
            {
                "enquiry_serial_no": "RGC-RFQ-2026-0101",
                "work_order_no": "WO-2026-101",
                "client_name": "Saudi Aramco",
                "client_short_name": "ARAMCO",
                "proposed_project_name": "Aramco Safaniya Offshore Pipeline Sector 4 Expansion",
                "project_location": "Safaniya Offshore Platform Zone B",
                "submission_deadline": "2026-11-05",
                "bid_close_date": "2026-11-05",
                "nature_of_work": "Pipelines",
                "sow_scopes": ["Pipelines", "Civil & Infra"],
                "status": "Survey In Progress",
                "assigned_estimator": est,
                "survey_request": {
                    "id": "sr-01",
                    "projectId": "1",
                    "requestedByEstimatorId": "est-farhan",
                    "requestedByEstimatorName": "Farhan Qureshi",
                    "requestedAt": "2026-10-18",
                    "urgency": "Critical 48h",
                    "surveyReason": "Ground verification of tie-in manifold coordinates, splash zone corrosion, and high-pressure crane barge access channel clearance.",
                    "accessRestrictions": "Aramco Marine Offshore Permit & H2S Level 2 Certified PPE required for all personnel.",
                    "targetSurveyDate": "2026-10-24",
                    "status": "Surveyor Dispatched",
                    "assignedSurveyorId": "surv-01",
                    "assignedSurveyorName": "Tariq Al-Ghamdi",
                    "dispatchedAt": "2026-10-19 09:30 AM",
                    "checklist": [
                        {
                            "id": "cl-01",
                            "category": "Civil & Access",
                            "item": "Heavy Barge Laydown & Crane Access Clearance",
                            "description": "Inspect sea approach water depth at low tide and crane barge spud grounding safety.",
                            "status": "Compliant / Verified",
                            "findings": "Minimum depth 6.2m confirmed; north approach channel clear of obstructions.",
                            "photoRequired": True,
                            "riskLevel": "Medium",
                        },
                        {
                            "id": "cl-02",
                            "category": "Mechanical / Piping",
                            "item": "Tie-In Nozzle Flange ASME Class 300# Rating",
                            "description": "Ultrasonic thickness measurement and flange face pitting inspection.",
                            "status": "Compliant / Verified",
                            "findings": "Zero corrosion or pitting detected; 18.5mm nominal wall thickness verified.",
                            "photoRequired": True,
                            "riskLevel": "Low",
                        },
                        {
                            "id": "cl-03",
                            "category": "Safety & Environmental",
                            "item": "H2S Detector Spacing & Marine Emergency Evacuation Route",
                            "description": "Verify wind direction sock visibility and sea survival craft muster clearance.",
                            "status": "Pending Verification",
                            "findings": "",
                            "photoRequired": True,
                            "riskLevel": "High",
                        },
                    ],
                    "surveyorObservations": "• Field walkthrough executed on site with GPS RTK positioning.\n• Tie-in nozzle flange condition inspected: ASME B16.5 Class 300# confirmed with zero pitting or corrosion.\n• Laydown area is graded and ready for barge mobilization.",
                    "uploadedSurveyDocuments": [
                        {
                            "id": "doc-scan-01",
                            "name": "Signed_Field_Checklist_Safaniya_WO-2026-101.pdf",
                            "size": "2.8 MB",
                            "type": "application/pdf",
                            "uploadedAt": "2026-10-20",
                        }
                    ],
                },
            },
            {
                "enquiry_serial_no": "RGC-RFQ-2026-0102",
                "work_order_no": "WO-2026-102",
                "client_name": "SABIC Jubail",
                "client_short_name": "SABIC",
                "proposed_project_name": "Sabic Jubail Chemical Tank Farm Internal Shell Refurbishment",
                "project_location": "Jubail Industrial City II",
                "submission_deadline": "2026-10-30",
                "bid_close_date": "2026-10-30",
                "nature_of_work": "Mechanical",
                "sow_scopes": ["Mechanical", "Civil & Infra"],
                "status": "Approved for Bidding",
                "assigned_estimator": est,
                "survey_request": {
                    "id": "sr-02",
                    "projectId": "2",
                    "requestedByEstimatorId": "est-farhan",
                    "requestedByEstimatorName": "Farhan Qureshi",
                    "requestedAt": "2026-10-17",
                    "urgency": "Urgent",
                    "surveyReason": "Inspect Tank TK-401 bottom shell plate settlement, verify scaffolding anchoring pads and confined space ventilation ports.",
                    "accessRestrictions": "SABIC Confined Space Entry Permit & Multi-gas continuous monitoring mandatory.",
                    "targetSurveyDate": "2026-10-22",
                    "status": "Checklist Ready",
                    "assignedSurveyorId": "surv-01",
                    "assignedSurveyorName": "Tariq Al-Ghamdi",
                    "checklist": [
                        {
                            "id": "cl-11",
                            "category": "Civil Foundations",
                            "item": "Tank Ringwall Foundation Settlement & Levelness",
                            "description": "Survey 360-degree perimeter elevation markers against API 653 tolerance limits.",
                            "status": "Compliant / Verified",
                            "findings": "Max differential deflection is 8mm, well within 15mm API allowable limit.",
                            "photoRequired": True,
                            "riskLevel": "Medium",
                        },
                        {
                            "id": "cl-12",
                            "category": "Mechanical Integrity",
                            "item": "Internal Sump Nozzle & Bottom Shell Weld Seams",
                            "description": "Inspect bottom annular plates for localized pitting or corrosion grooving.",
                            "status": "Compliant / Verified",
                            "findings": "Plate thickness average 11.8mm. Weld seams free of visible cracks.",
                            "photoRequired": True,
                            "riskLevel": "Low",
                        },
                        {
                            "id": "cl-13",
                            "category": "Safety & Access",
                            "item": "Confined Space Forced Ventilation & Exhaust Duct Routing",
                            "description": "Verify external 24\" manway clearance for 5000 CFM blower deployment.",
                            "status": "Compliant / Verified",
                            "findings": "East manway clear; 380V 3-phase power point available at 25m distance.",
                            "photoRequired": False,
                            "riskLevel": "Low",
                        },
                    ],
                    "surveyorObservations": "• Foundation laser leveling completed.\n• Annular plates intact. Scaffolding anchor positions marked in green spray.\n• Ready for contractor crew mobilization.",
                    "uploadedSurveyDocuments": [
                        {
                            "id": "doc-scan-02",
                            "name": "Sabic_TK401_Settlement_Level_Survey.pdf",
                            "size": "3.1 MB",
                            "type": "application/pdf",
                            "uploadedAt": "2026-10-19",
                        }
                    ],
                },
            },
            {
                "enquiry_serial_no": "RGC-RFQ-2026-0103",
                "work_order_no": "WO-2026-103",
                "client_name": "NEOM Industrial City",
                "client_short_name": "NEOM",
                "proposed_project_name": "NEOM Oxagon Seawater Intake Ducting & Pump Station Site Survey",
                "project_location": "Oxagon Coastal Sector 2",
                "submission_deadline": "2026-11-12",
                "bid_close_date": "2026-11-12",
                "nature_of_work": "Turnkey EPC",
                "sow_scopes": ["Turnkey EPC", "Civil & Infra"],
                "status": "Survey In Progress",
                "assigned_estimator": est,
                "survey_request": {
                    "id": "sr-03",
                    "projectId": "3",
                    "requestedByEstimatorId": "est-farhan",
                    "requestedByEstimatorName": "Farhan Qureshi",
                    "requestedAt": "2026-10-19",
                    "urgency": "Critical 48h",
                    "surveyReason": "Ground soil bearing capacity, coastal high-tide waterline demarcation, and GPR utility scan for buried desalination lines.",
                    "accessRestrictions": "Oxagon Security Access Badge & Coastal Environmental Protection Plan adherence.",
                    "targetSurveyDate": "2026-10-25",
                    "status": "Surveyor En Route",
                    "assignedSurveyorId": "surv-01",
                    "assignedSurveyorName": "Tariq Al-Ghamdi",
                    "surveyorDepartedAt": "08:15 AM",
                    "checklist": [
                        {
                            "id": "cl-21",
                            "category": "Geotechnical",
                            "item": "Plate Load Bearing Capacity & Coastal Ground Table",
                            "description": "Verify 200 kPa soil bearing capacity at 2.5m foundation depth.",
                            "status": "Compliant / Verified",
                            "findings": "Dynamic cone penetrometer confirms dense coral sand layer; 215 kPa achieved.",
                            "photoRequired": True,
                            "riskLevel": "Medium",
                        },
                        {
                            "id": "cl-22",
                            "category": "Underground Utilities",
                            "item": "GPR Subsurface Utility Mapping (3m Depth)",
                            "description": "Locate buried fiber optic and high-voltage feeder cables crossing corridor.",
                            "status": "Risk / Hazard Detected",
                            "findings": "⚠️ Uncharted 13.8kV electrical cable detected at Station 0+185 at depth 1.2m.",
                            "photoRequired": True,
                            "riskLevel": "High",
                        },
                    ],
                    "surveyorObservations": "• GPS RTK benchmarks established.\n• Warning: Uncharted 13.8kV cable identified. Recommending 2m manual excavation buffer zone for estimator contingency.",
                    "uploadedSurveyDocuments": [
                        {
                            "id": "doc-scan-03",
                            "name": "NEOM_Oxagon_GPR_Utility_Scan_Report.pdf",
                            "size": "4.5 MB",
                            "type": "application/pdf",
                            "uploadedAt": "2026-10-20",
                        }
                    ],
                },
            },
        ]

        for s in samples:
            p, created = ProjectRFQ.objects.update_or_create(
                work_order_no=s["work_order_no"],
                defaults=s,
            )
            self.stdout.write(f"Survey Project {p.work_order_no}: {'Created' if created else 'Updated'}")

        self.stdout.write(self.style.SUCCESS("Successfully seeded site survey sample projects."))
