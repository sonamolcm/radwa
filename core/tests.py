import json
from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User
from .models import Estimator, ProjectRFQ, Client


class RadwaErpTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="admin@radwa.sa",
            email="admin@radwa.sa",
            password="radwa123",
        )
        self.estimator = Estimator.objects.create(
            name="Eng. Tariq",
            initials="TM",
            role="Estimator",
            specialty="Civil & Infrastructure",
            active_tenders=0,
            capacity_status="Optimal Capacity",
        )
        self.client_obj = Client.objects.create(
            company_name="Saudi Aramco",
            short_code="ARAMCO",
            city="Dhahran",
        )
        self.project = ProjectRFQ.objects.create(
            work_order_no="WO-RADWA-TEST-01",
            enquiry_serial_no="RFQ-2026-TEST-01",
            client_name="Saudi Aramco",
            proposed_project_name="Pipeline Construction Sector 4",
            received_date="2026-10-15",
            bid_close_date="2026-11-01",
            status="New RFQ",
        )

    def test_auth_login_success(self):
        response = self.client.post(
            reverse("core:api-auth-login"),
            data=json.dumps({"email": "admin@radwa.sa", "password": "radwa123"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["user"]["role"], "Super Administrator")
        self.assertIn("crm", data["user"]["allowedApps"])

    def test_auth_login_invalid(self):
        response = self.client.post(
            reverse("core:api-auth-login"),
            data=json.dumps({"email": "admin@radwa.sa", "password": "wrongpassword"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 401)

    def test_clients_list_and_create(self):
        # List
        get_res = self.client.get(reverse("core:api-clients-list-create"))
        self.assertEqual(get_res.status_code, 200)
        self.assertGreaterEqual(get_res.json()["count"], 1)

        # Create
        post_res = self.client.post(
            reverse("core:api-clients-list-create"),
            data=json.dumps({"companyName": "Sabic Agri-Nutrients", "shortCode": "SAN"}),
            content_type="application/json",
        )
        self.assertEqual(post_res.status_code, 201)
        self.assertEqual(post_res.json()["companyName"], "Sabic Agri-Nutrients")

    def test_estimators_list(self):
        response = self.client.get(reverse("core:api-estimators-list"))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertGreaterEqual(data["count"], 1)
        self.assertEqual(data["estimators"][0]["name"], "Eng. Tariq")

    def test_projects_list_and_search(self):
        response = self.client.get(reverse("core:api-projects-list-create") + "?search=Pipeline")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["count"], 1)
        self.assertEqual(data["projects"][0]["workOrderNo"], "WO-RADWA-TEST-01")

    def test_assign_estimator(self):
        url = reverse("core:api-project-assign-estimator", kwargs={"project_id": self.project.id})
        response = self.client.patch(
            url,
            data=json.dumps({"estimator_id": self.estimator.id}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["assignedEstimatorId"], str(self.estimator.id))

    def test_update_project_status(self):
        url = reverse("core:api-project-update-status", kwargs={"project_id": self.project.id})
        response = self.client.patch(
            url,
            data=json.dumps({"status": "Under BOQ Estimation"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "Under BOQ Estimation")

    def test_dashboard_metrics(self):
        response = self.client.get(reverse("core:api-crm-metrics"))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("totalProjectsCount", data)
        self.assertIn("inEstimationCount", data)

    def test_estimator_console_page(self):
        response = self.client.get(reverse("core:estimator-console"))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "core/estimator_dashboard.html")
        self.assertContains(response, "Estimator Workspace")
        self.assertContains(response, "BOQ Comparison &amp; Variance Audit")
        self.assertContains(response, "40-Document Bid Package Dossier")

    def test_estimator_save_estimation(self):
        url = reverse("core:api-project-estimation", kwargs={"project_id": self.project.id})
        response = self.client.post(
            url,
            data=json.dumps({
                "estimatedValue": 1450000.0,
                "boqNotes": "Piping and excavation rates validated."
            }),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["estimatedValue"], 1450000.0)

    def test_estimator_save_site_review(self):
        url = reverse("core:api-project-site-review", kwargs={"project_id": self.project.id})
        response = self.client.post(
            url,
            data=json.dumps({
                "siteReview": {
                    "required": True,
                    "status": "Scheduled",
                    "inspectorName": "Eng. Tariq",
                    "scheduledDate": "2026-10-24"
                }
            }),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["siteReview"]["inspectorName"], "Eng. Tariq")

    def test_estimator_save_bid_package(self):
        url = reverse("core:api-project-bid-package", kwargs={"project_id": self.project.id})
        response = self.client.post(
            url,
            data=json.dumps({
                "bidPackage": {
                    "status": "Sent for Approval",
                    "documents": []
                },
                "sendToCrm": True
            }),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["bidPackage"]["status"], "Sent for Approval")
        self.assertEqual(data["status"], "Bid Submitted")

    def test_estimator_save_boq_comparison(self):
        url = reverse("core:api-project-boq-comparison", kwargs={"project_id": self.project.id})
        response = self.client.post(
            url,
            data=json.dumps({
                "boqComparison": {
                    "aiGrandTotal": 1200000,
                    "manualGrandTotal": 1250000,
                    "items": []
                }
            }),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["boqComparison"]["manualGrandTotal"], 1250000)

    def test_all_enterprise_portals_render_success(self):
        # 1. Main Menu
        res = self.client.get(reverse("core:main-menu"))
        self.assertEqual(res.status_code, 200)
        self.assertContains(res, "RADWA ERP")

        # 2. Login Page
        res = self.client.get(reverse("core:login"))
        self.assertIn(res.status_code, [200, 302])

        # 3. CRM Desk
        res = self.client.get(reverse("core:home"))
        self.assertEqual(res.status_code, 200)

        # 4. MD Console
        res = self.client.get(reverse("core:md-console"))
        self.assertEqual(res.status_code, 200)

        # 5. Estimator Console
        res = self.client.get(reverse("core:estimator-console"))
        self.assertEqual(res.status_code, 200)

        # 6. Material Requests Hub
        res = self.client.get(reverse("core:material-requests"))
        self.assertEqual(res.status_code, 200)
        self.assertContains(res, "Material Requests")

        # 7. Operations Console
        res = self.client.get(reverse("core:operations-console"))
        self.assertEqual(res.status_code, 200)
        self.assertContains(res, "Radwa Operations")

        # 8. Surveyor Portal
        res = self.client.get(reverse("core:surveyor-portal"))
        self.assertEqual(res.status_code, 200)
        self.assertContains(res, "Field Surveyor Portal")

        # 9. QA/QC Portal
        res = self.client.get(reverse("core:qaqc-portal"))
        self.assertEqual(res.status_code, 200)
        self.assertContains(res, "Radwa QA/QC")

        # 10. HSE Safety Portal
        res = self.client.get(reverse("core:hse-portal"))
        self.assertEqual(res.status_code, 200)
        self.assertContains(res, "Radwa HSE Safety")

        # 11. HR & Personnel Portal
        res = self.client.get(reverse("core:hr-portal"))
        self.assertEqual(res.status_code, 200)
        self.assertContains(res, "Radwa HR & Personnel")

        # 12. Inventory Portal
        res = self.client.get(reverse("core:inventory-portal"))
        self.assertEqual(res.status_code, 200)
        self.assertContains(res, "Radwa Inventory")

        # 13. Purchase Portal
        res = self.client.get(reverse("core:purchase-portal"))
        self.assertEqual(res.status_code, 200)
        self.assertContains(res, "Radwa Purchase")


