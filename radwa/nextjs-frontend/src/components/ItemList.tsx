import { Item } from "@/types/item";
import ItemCard from "./ItemCard";

interface ItemListProps {
  items: Item[];
}

export default function ItemList({ items }: ItemListProps) {
  if (!items || items.length === 0) {
    return (
      <div className="p-8 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30">
        <span className="text-3xl mb-2 block">📭</span>
        <h3 className="text-slate-300 font-semibold text-sm">No tasks found</h3>
        <p className="text-slate-500 text-xs mt-1">
          Add your first task above. It will be sent via Next.js Server Action to Django!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
