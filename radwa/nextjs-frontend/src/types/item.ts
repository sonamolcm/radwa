export type ItemStatus = "pending" | "in_progress" | "completed";
export type ItemPriority = "low" | "medium" | "high";

export interface Item {
  id: number;
  title: string;
  description: string;
  status: ItemStatus;
  priority: ItemPriority;
  created_at: string;
  updated_at: string;
}

export interface ItemsResponse {
  items: Item[];
  count: number;
}
