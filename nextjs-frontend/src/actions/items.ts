"use server";

import { revalidatePath } from "next/cache";
import { createItemServer, updateItemServer, deleteItemServer } from "@/lib/django-api";
import { ItemStatus, ItemPriority } from "@/types/item";

export interface ActionResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Server Action: Create Item
 * Invoked by form action or client submit without exposing Django endpoints.
 */
export async function createItemAction(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  try {
    const title = (formData.get("title") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() || "";
    const priority = (formData.get("priority") as ItemPriority) || "medium";
    const status = (formData.get("status") as ItemStatus) || "pending";

    if (!title) {
      return { success: false, error: "Task title is required." };
    }

    await createItemServer({
      title,
      description,
      priority,
      status,
    });

    // Revalidate the server component page so fresh data is rendered immediately
    revalidatePath("/");

    return {
      success: true,
      message: `Task "${title}" created successfully!`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to create item on Django server.",
    };
  }
}

/**
 * Server Action: Toggle item completion status
 */
export async function toggleItemStatusAction(
  id: number,
  currentStatus: ItemStatus
): Promise<ActionResponse> {
  try {
    const nextStatus: ItemStatus =
      currentStatus === "completed" ? "pending" : "completed";

    await updateItemServer(id, { status: nextStatus });
    revalidatePath("/");

    return {
      success: true,
      message: `Status updated to ${nextStatus}`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to update item on Django server.",
    };
  }
}

/**
 * Server Action: Delete an item
 */
export async function deleteItemAction(id: number): Promise<ActionResponse> {
  try {
    await deleteItemServer(id);
    revalidatePath("/");

    return {
      success: true,
      message: "Item deleted successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to delete item on Django server.",
    };
  }
}
