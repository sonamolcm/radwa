"use client";

import { useActionState, useEffect, useRef } from "react";
import { createItemAction, ActionResponse } from "@/actions/items";

const initialState: ActionResponse = {
  success: false,
};

export default function CreateItemForm() {
  const [state, formAction, isPending] = useActionState(createItemAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success && formRef.current) {
      formRef.current.reset();
    }
  }, [state.success]);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="p-2 rounded-lg bg-blue-500/10 text-blue-400 text-lg">⚡</span>
        <div>
          <h2 className="text-lg font-semibold text-white">Create New Task</h2>
          <p className="text-xs text-slate-400">
            Powered by Next.js <code className="text-blue-400 font-mono">Server Actions ('use server')</code>
          </p>
        </div>
      </div>

      {state.error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-2">
          <span>⚠️</span>
          <span>{state.error}</span>
        </div>
      )}

      {state.success && state.message && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
          <span>✓</span>
          <span>{state.message}</span>
        </div>
      )}

      <form ref={formRef} action={formAction} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-xs font-medium text-slate-300 mb-1.5">
            Title <span className="text-rose-400">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            placeholder="e.g., Integrate Django ORM models"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-xs font-medium text-slate-300 mb-1.5">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={2}
            placeholder="Optional task details or notes..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="priority" className="block text-xs font-medium text-slate-300 mb-1.5">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              defaultValue="medium"
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            >
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-xs font-medium text-slate-300 mb-1.5">
              Initial Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue="pending"
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            >
              <option value="pending">⏳ Pending</option>
              <option value="in_progress">🔄 In Progress</option>
              <option value="completed">✅ Completed</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 px-4 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span>Dispatching Server Action...</span>
            </>
          ) : (
            <>
              <span>+ Add Task to Django</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
