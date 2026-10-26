from django.urls import path
from . import views
from . import api_views

app_name = "core"

urlpatterns = [
    path("", views.login_view, name="login-root"),
    path("login/", views.login_view, name="login"),
    path("logout/", views.logout_view, name="logout"),
    path("menu/", views.main_menu, name="menu"),
    path("crm/", views.home, name="home"),
    path("crm-desk/", views.home, name="home-crm"),
    path("crm/register/", views.crm_register_view, name="crm-register"),
    path("md/", views.md_console, name="md-console"),
    path("estimator/", views.estimator_console, name="estimator-console"),
    path("material-requests/", views.material_requests_view, name="material-requests"),
    path("operations/", views.operations_console, name="operations-console"),
    path("surveyor/", views.surveyor_portal, name="surveyor-portal"),
    path("qaqc/", views.qaqc_portal, name="qaqc-portal"),
    path("hse/", views.hse_portal, name="hse-portal"),
    path("hr/", views.hr_portal, name="hr-portal"),
    path("inventory/", views.inventory_portal, name="inventory-portal"),
    path("purchase/", views.purchase_portal, name="purchase-portal"),
    path("download/credentials-pdf/", views.download_credentials_pdf, name="download-credentials-pdf"),
    path("radwa-dashboard/", views.radwa_dashboard, name="radwa-dashboard"),
    path("dashboard/", views.radwa_dashboard, name="dashboard"),
    path("rfq-to-work-order/", views.rfq_to_work_order, name="rfq-to-work-order"),

    # Radwa ERP Authentication (Standard & v1)
    path("api/auth/login/", api_views.auth_login, name="api-auth-login"),
    path("api/v1/auth/login/", api_views.auth_login, name="api-v1-auth-login"),
    path("api/auth/forgot-password/", api_views.auth_forgot_password, name="api-auth-forgot-password"),
    path("api/v1/auth/forgot-password/", api_views.auth_forgot_password, name="api-v1-auth-forgot-password"),
    path("api/auth/reset-password/", api_views.auth_reset_password, name="api-auth-reset-password"),
    path("api/v1/auth/reset-password/", api_views.auth_reset_password, name="api-v1-auth-reset-password"),

    # Client Directory API
    path("api/clients/", api_views.clients_list_create, name="api-clients-list-create"),
    path("api/v1/clients/", api_views.clients_list_create, name="api-v1-clients-list-create"),

    # CRM Estimators API
    path("api/estimators/", api_views.estimators_list, name="api-estimators-list"),
    path("api/v1/estimators/", api_views.estimators_list, name="api-v1-estimators-list"),

    # Field Surveyors API
    path("api/surveyors/", api_views.surveyors_list, name="api-surveyors-list"),
    path("api/v1/surveyors/", api_views.surveyors_list, name="api-v1-surveyors-list"),

    # CRM Tender Projects API (Standard /api/projects/)
    path("api/projects/", api_views.projects_list_create, name="api-projects-list-create"),
    path("api/projects/<int:project_id>/", api_views.project_detail, name="api-project-detail"),
    path("api/projects/<int:project_id>/assign-estimator/", api_views.project_assign_estimator, name="api-project-assign-estimator"),
    path("api/projects/<int:project_id>/status/", api_views.project_update_status, name="api-project-update-status"),
    path("api/projects/<int:project_id>/approve/", api_views.md_approve_project, name="api-project-approve"),
    path("api/projects/<int:project_id>/decline/", api_views.md_decline_project, name="api-project-decline"),
    path("api/projects/<int:project_id>/estimation/", api_views.estimator_save_estimation, name="api-project-estimation"),
    path("api/projects/<int:project_id>/site-review/", api_views.estimator_save_site_review, name="api-project-site-review"),
    path("api/projects/<int:project_id>/survey-request/", api_views.estimator_save_survey_request, name="api-project-survey-request"),
    path("api/projects/<int:project_id>/bid-package/", api_views.estimator_save_bid_package, name="api-project-bid-package"),
    path("api/projects/<int:project_id>/boq-comparison/", api_views.estimator_save_boq_comparison, name="api-project-boq-comparison"),

    # CRM Tender Projects API (v1 /api/v1/crm/rfq/ and /api/v1/md/)
    path("api/v1/crm/rfq/", api_views.projects_list_create, name="api-v1-crm-rfq-list-create"),
    path("api/v1/crm/rfq/<int:project_id>/", api_views.project_detail, name="api-v1-crm-rfq-detail"),
    path("api/v1/crm/rfq/<int:project_id>/assign-estimator/", api_views.project_assign_estimator, name="api-v1-crm-rfq-assign-estimator"),
    path("api/v1/crm/rfq/<int:project_id>/status/", api_views.project_update_status, name="api-v1-crm-rfq-update-status"),
    path("api/v1/md/projects/<int:project_id>/approve/", api_views.md_approve_project, name="api-v1-md-project-approve"),
    path("api/v1/md/projects/<int:project_id>/decline/", api_views.md_decline_project, name="api-v1-md-project-decline"),
    path("api/v1/estimator/projects/<int:project_id>/estimation/", api_views.estimator_save_estimation, name="api-v1-estimator-project-estimation"),
    path("api/v1/estimator/projects/<int:project_id>/site-review/", api_views.estimator_save_site_review, name="api-v1-estimator-project-site-review"),
    path("api/v1/estimator/projects/<int:project_id>/survey-request/", api_views.estimator_save_survey_request, name="api-v1-estimator-project-survey-request"),
    path("api/v1/estimator/projects/<int:project_id>/bid-package/", api_views.estimator_save_bid_package, name="api-v1-estimator-project-bid-package"),
    path("api/v1/estimator/projects/<int:project_id>/boq-comparison/", api_views.estimator_save_boq_comparison, name="api-v1-estimator-project-boq-comparison"),

    # Pipeline Metrics
    path("api/dashboard/metrics/", api_views.crm_dashboard_metrics, name="api-crm-metrics"),
    path("api/v1/crm/metrics/", api_views.crm_dashboard_metrics, name="api-v1-crm-metrics"),

    # AI BOQ & Resources Generation Engine
    path("api/generate-boq/", api_views.generate_boq_api, name="api-generate-boq"),
    path("api/generate-boq", api_views.generate_boq_api, name="api-generate-boq-noslash"),
    path("api/v1/generate-boq/", api_views.generate_boq_api, name="api-v1-generate-boq"),
    path("api/v1/generate-boq", api_views.generate_boq_api, name="api-v1-generate-boq-noslash"),
    path("api/v1/estimator/tenders/<int:project_id>/generate-boq/", api_views.generate_boq_api, name="api-v1-estimator-tender-generate-boq"),

    # Tender PDF Upload & Drawing Extraction Engine
    path("api/upload-tender-pdf/", api_views.upload_tender_pdf_api, name="api-upload-tender-pdf"),
    path("api/upload-tender-pdf", api_views.upload_tender_pdf_api, name="api-upload-tender-pdf-noslash"),
    path("api/v1/upload-tender-pdf/", api_views.upload_tender_pdf_api, name="api-v1-upload-tender-pdf"),
    path("api/v1/estimator/tenders/<int:project_id>/upload-pdf/", api_views.upload_tender_pdf_api, name="api-v1-estimator-tender-upload-pdf"),

    # AI BOQ Comparison Engine
    path("api/compare-boq/", api_views.compare_boq_api, name="api-compare-boq"),
    path("api/compare-boq", api_views.compare_boq_api, name="api-compare-boq-noslash"),
    path("api/v1/compare-boq/", api_views.compare_boq_api, name="api-v1-compare-boq"),
    path("api/v1/compare-boq", api_views.compare_boq_api, name="api-v1-compare-boq-noslash"),
    path("api/v1/estimator/tenders/<int:project_id>/compare-boq/", api_views.compare_boq_api, name="api-v1-estimator-tender-compare-boq"),

    # AI Configuration Test Endpoint
    path("api/test-ai-connection/", views.test_ai_connection, name="test-ai-connection"),

    # Legacy Items API
    path("api/items/", api_views.items_list_create, name="api-items-list-create"),
    path("api/items/<int:item_id>/", api_views.item_detail_update_delete, name="api-item-detail"),
]
