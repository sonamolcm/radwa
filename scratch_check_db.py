import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from core.models import ProjectRFQ, Estimator, Surveyor

print("--- PROJECTS ---")
for p in ProjectRFQ.objects.all():
    print(f"ID={p.id} WO={p.work_order_no} Status='{p.status}' MD='{p.md_status}' Est='{p.assigned_estimator.name if p.assigned_estimator else None}' Value={p.estimated_value}")

print("\n--- ESTIMATORS ---")
for e in Estimator.objects.all():
    print(f"ID={e.id} Name='{e.name}' Active={e.active_tenders} Cap='{e.capacity_status}'")

print("\n--- SURVEYORS ---")
for s in Surveyor.objects.all():
    print(f"ID={s.id} Name='{s.name}' Active={s.active_surveys} Zone='{s.assigned_zone}' Cap='{s.capacity_status}'")
