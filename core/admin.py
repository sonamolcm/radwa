from django.contrib import admin
from .models import Item, Estimator, ProjectRFQ, Client, Surveyor


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ("company_name", "short_code", "contact_person", "contact_email", "city")
    search_fields = ("company_name", "short_code", "cr_number")


@admin.register(Estimator)
class EstimatorAdmin(admin.ModelAdmin):
    list_display = ("name", "initials", "specialty", "role", "active_tenders", "capacity_status")
    list_filter = ("capacity_status", "specialty")
    search_fields = ("name", "initials", "email")


@admin.register(Surveyor)
class SurveyorAdmin(admin.ModelAdmin):
    list_display = ("name", "initials", "assigned_zone", "role", "active_surveys", "capacity_status", "phone")
    list_filter = ("capacity_status", "assigned_zone")
    search_fields = ("name", "initials", "email", "assigned_zone")


@admin.register(ProjectRFQ)
class ProjectRFQAdmin(admin.ModelAdmin):
    list_display = (
        "work_order_no",
        "enquiry_serial_no",
        "proposed_project_name",
        "client_name",
        "nature_of_work",
        "status",
        "assigned_estimator",
        "bid_close_date",
    )
    list_filter = ("status", "nature_of_work", "md_status", "assigned_estimator")
    search_fields = ("work_order_no", "enquiry_serial_no", "proposed_project_name", "client_name")


@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = ("title", "status", "priority", "created_at")
    list_filter = ("status", "priority")
