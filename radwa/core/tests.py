import json
from django.test import TestCase
from django.urls import reverse
from .models import Item


class CoreViewAndApiTests(TestCase):
    def test_home_page_status_code(self):
        response = self.client.get(reverse("core:home"))
        self.assertEqual(response.status_code, 200)

    def test_api_items_empty_list(self):
        response = self.client.get(reverse("core:api-items-list-create"))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["count"], 0)
        self.assertEqual(data["items"], [])

    def test_api_create_item(self):
        payload = {
            "title": "Design Database Schema",
            "description": "Establish models and relations",
            "priority": "high",
            "status": "in_progress",
        }
        response = self.client.post(
            reverse("core:api-items-list-create"),
            data=json.dumps(payload),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertEqual(data["title"], "Design Database Schema")
        self.assertEqual(data["priority"], "high")
        self.assertEqual(Item.objects.count(), 1)

    def test_api_update_item(self):
        item = Item.objects.create(title="Initial Task", priority="low", status="pending")
        url = reverse("core:api-item-detail", kwargs={"item_id": item.id})
        update_payload = {"status": "completed"}
        response = self.client.patch(
            url,
            data=json.dumps(update_payload),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        item.refresh_from_db()
        self.assertEqual(item.status, "completed")

    def test_api_delete_item(self):
        item = Item.objects.create(title="To be deleted")
        url = reverse("core:api-item-detail", kwargs={"item_id": item.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Item.objects.count(), 0)
