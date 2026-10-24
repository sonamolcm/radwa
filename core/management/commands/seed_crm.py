from django.core.management.base import BaseCommand
from core.models import Estimator, ProjectRFQ


class Command(BaseCommand):
    help = "Seed the 5 Estimators from mockCrmData.ts and realistic sample Project RFQs"

    def handle(self, *args, **options):
        # 1. 5 Estimators from mockCrmData.ts
        estimators_data = [
            {
                "name": "Ahmed Mansoor",
                "initials": "AH",
                "role": "Lead Mechanical Estimator",
                "active_tenders": 0,
                "capacity_status": "Optimal Capacity",
                "avatar_bg": "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
                "email": "ahmed.mansoor@radwa-contracting.sa",
                "phone": "+966 11 498 1021",
                "specialty": "HVAC, Firefighting, Plumbing & District Cooling",
            },
            {
                "name": "Farhan Qureshi",
                "initials": "FA",
                "role": "Lead Piping & EPC Estimator",
                "active_tenders": 0,
                "capacity_status": "Optimal Capacity",
                "avatar_bg": "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
                "email": "farhan.qureshi@radwa-contracting.sa",
                "phone": "+966 11 498 1022",
                "specialty": "Industrial Piping, Pressure Vessels, Refineries & Tanks",
            },
            {
                "name": "Rajesh Kumar",
                "initials": "RA",
                "role": "Senior Electrical Estimator",
                "active_tenders": 0,
                "capacity_status": "Optimal Capacity",
                "avatar_bg": "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
                "email": "rajesh.kumar@radwa-contracting.sa",
                "phone": "+966 11 498 1023",
                "specialty": "High Voltage Substations, Switchgear & Instrumentation",
            },
            {
                "name": "Salman Al-Dosari",
                "initials": "SA",
                "role": "Junior Cost Estimator",
                "active_tenders": 0,
                "capacity_status": "Optimal Capacity",
                "avatar_bg": "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
                "email": "salman.dosari@radwa-contracting.sa",
                "phone": "+966 11 498 1024",
                "specialty": "Civil Quantities, Earthworks, Foundations & Takeoffs",
            },
            {
                "name": "Tariq Al-Ghamdi",
                "initials": "TA",
                "role": "Lead Civil Estimator",
                "active_tenders": 0,
                "capacity_status": "Optimal Capacity",
                "avatar_bg": "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300",
                "email": "tariq.ghamdi@radwa-contracting.sa",
                "phone": "+966 11 498 1025",
                "specialty": "Reinforced Concrete, Post-Tensioning, Structural Steel & Roads",
            },
        ]

        est_objs = []
        for d in estimators_data:
            obj, _ = Estimator.objects.update_or_create(
                name=d["name"],
                defaults=d,
            )
            est_objs.append(obj)

        self.stdout.write(self.style.SUCCESS(f"Successfully seeded {len(est_objs)} Estimators matching mockCrmData.ts."))
