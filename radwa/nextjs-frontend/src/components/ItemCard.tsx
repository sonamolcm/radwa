"use client";

import { useTransition } from "react";
import { Item } from "@/types/item";
import { toggleItemStatusAction, deleteItemAction } from "@/actions/items";

interface ItemCardProps {
  item: Item;
}

export default function ItemCard({ item }: ItemCardProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      await toggleItemStatusAction(item.id, item.status);
    });
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${item.title}"?`)) {
      startTransition(async () => {
        await deleteItemAction(item.id);
      });
    }
  };

  const priorityColors = {
    high: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  }[item.priority];

  const isCompleted = item.status === "completed";

  return (
    <div
      className={`p-4 rounded-xl border transition-all duration-200 ${
        isPending ? "opacity-50 scale-[0.99]" : "opacity-100"
      } ${
        isCompleted
          ? "bg-slate-950/40 border-slate-800/60"
          : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <button
            type="button"
            onClick={handleToggle}
            disabled={isPending}
            title={isCompleted ? "Mark as pending" : "Mark as completed"}
            className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
              isCompleted
                ? "bg-emerald-500 border-emerald-400 text-white"
                : "border-slate-600 hover:border-blue-400 bg-slate-950/50"
            }`}
          >
            {isCompleted && (
              <svg className="w-3.5 h-3.5 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>

          <div className="flex-1 min-w-0">
            <h3
              className={`text-sm font-semibold truncate ${
                isCompleted ? "line-through text-slate-500" : "text-white"
              }`}
            >
              {item.title}
            </h3>

            {item.description && (
              <p
                className={`text-xs mt-1 line-clamp-2 ${
                  isCompleted ? "text-slate-600" : "text-slate-400"
                }`}
              >
                {item.description}
              </p>
            )}

            <div className="flex items-center gap-2 mt-2.5">
              <span
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${priorityColors}`}
              >
                {item.priority}
              </span>

              <span className="text-[11px] text-slate-500">
                {new Date(item.created_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          title="Delete task"
          className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-rose-500/10 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
