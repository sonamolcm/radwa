from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from core.models import Client, Estimator


class Command(BaseCommand):
    help = "Seed Radwa ERP test users and client directory"

    def handle(self, *args, **options):
        # 1. Seed Radwa Test Users (Section 6)
        users_data = [
            {
                "username": "admin@radwa.sa",
                "email": "admin@radwa.sa",
                "first_name": "Super",
                "last_name": "Admin",
                "is_staff": True,
                "is_superuser": True,
            },
            {
                "username": "crm@radwa.sa",
                "email": "crm@radwa.sa",
                "first_name": "CRM",
                "last_name": "Administrator",
                "is_staff": True,
                "is_superuser": False,
            },
            {
                "username": "md@radwa.sa",
                "email": "md@radwa.sa",
                "first_name": "Managing",
                "last_name": "Director",
                "is_staff": True,
                "is_superuser": False,
            },
            {
                "username": "estimator@radwa.sa",
                "email": "estimator@radwa.sa",
                "first_name": "Lead",
                "last_name": "Estimator",
                "is_staff": False,
                "is_superuser": False,
            },
        ]

        for u_data in users_data:
            user = User.objects.filter(username=u_data["username"]).first()
            if not user:
                user = User.objects.create_user(**u_data)
            user.set_password("radwa123")
            user.save()

        # 2. Seed Client Directory (Section 4)
        clients_data = [
            {
                "company_name": "Saudi Arabian Mining Company",
                "short_code": "MA'ADEN",
                "cr_number": "1010164145",
                "vat_number": "300001234500003",
                "contact_person": "Eng. Tariq Al-Otaibi",
                "contact_email": "procurement@maaden.com.sa",
                "contact_phone": "+966 11 874 1234",
                "city": "Ras Al-Khair",
                "headquarters": "Riyadh, KSA",
            },
            {
                "company_name": "Royal Commission for Jubail and Yanbu",
                "short_code": "RCJY",
                "cr_number": "2050012988",
                "vat_number": "300004567800003",
                "contact_person": "Mr. Abdullah Al-Ghamdi",
                "contact_email": "tenders@rcjy.gov.sa",
                "contact_phone": "+966 13 341 4500",
                "city": "Jubail Industrial City",
                "headquarters": "Jubail, KSA",
            },
            {
                "company_name": "Saudi Basic Industries Corporation",
                "short_code": "SABIC",
                "cr_number": "1010008536",
                "vat_number": "300009876500003",
                "contact_person": "Eng. Omar Al-Shehri",
                "contact_email": "contracting@sabic.com",
                "contact_phone": "+966 11 225 8000",
                "city": "Jubail Industrial City",
                "headquarters": "Riyadh, KSA",
            },
            {
                "company_name": "Saudi Aramco Oil Company",
                "short_code": "ARAMCO",
                "cr_number": "2052101150",
                "vat_number": "300005555500003",
                "contact_person": "Vendor Relations Desk",
                "contact_email": "vendor-relations@aramco.com",
                "contact_phone": "+966 13 872 0115",
                "city": "Dhahran",
                "headquarters": "Dhahran, KSA",
            },
        ]

        for c in clients_data:
            Client.objects.get_or_create(company_name=c["company_name"], defaults=c)

        self.stdout.write(self.style.SUCCESS("Successfully seeded 4 Radwa ERP users and 4 client records."))
