from django.core.management.base import BaseCommand
from core.models import Item


class Command(BaseCommand):
    help = "Seed initial sample items for the Next.js frontend demonstration"

    def handle(self, *args, **options):
        initial_items = [
            {
                "title": "Configure Next.js Server Actions",
                "description": "Wire 'use server' mutations directly to Django endpoints.",
                "status": "completed",
                "priority": "high",
            },
            {
                "title": "Implement Server Component Data Fetching",
                "description": "Fetch items on the Next.js server with cache: 'no-store'.",
                "status": "in_progress",
                "priority": "high",
            },
            {
                "title": "Review CORS and Security Headers",
                "description": "Verify Django ALLOWED_HOSTS and corsheaders middleware.",
                "status": "pending",
                "priority": "medium",
            },
            {
                "title": "Deploy Full-Stack Stack to Production",
                "description": "Containerize Django backend and Next.js SSR server.",
                "status": "pending",
                "priority": "low",
            },
        ]

        created_count = 0
        for data in initial_items:
            _, created = Item.objects.get_or_create(title=data["title"], defaults=data)
            if created:
                created_count += 1

        self.stdout.write(self.style.SUCCESS(f"Successfully seeded {created_count} items (total: {Item.objects.count()})."))
