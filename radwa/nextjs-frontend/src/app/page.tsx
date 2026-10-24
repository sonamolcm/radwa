import { fetchItemsServer } from "@/lib/django-api";
import CreateItemForm from "@/components/CreateItemForm";
import ItemList from "@/components/ItemList";

export const dynamic = "force-dynamic";

export default async function Page() {
  let items = [];
  let error: string | null = null;

  try {
    // 🚀 Server-to-Server Fetch: Happens entirely on Node.js/Next.js server
    const data = await fetchItemsServer();
    items = data.items;
  } catch (err: any) {
    error = err.message || "Could not reach Django backend.";
  }

  const completedCount = items.filter((i) => i.status === "completed").length;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Banner */}
        <header className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
            <span>🛡️ Server-to-Server Architecture</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            <span>Zero Browser-to-Django API Calls</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Next.js &bull; Django Full-Stack
          </h1>

          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Rendered with Next.js <strong>Server Components</strong> and mutated securely via{" "}
            <strong>Server Actions</strong> directly to the Python Django backend.
          </p>
        </header>

        {/* Status Tracker */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs text-slate-400">Total Tasks</span>
            <p className="text-2xl font-bold text-white mt-1">{items.length}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs text-slate-400">Completed</span>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{completedCount}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs text-slate-400">Django Connection</span>
            <p className="text-sm font-semibold mt-1 flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  error ? "bg-rose-500 animate-pulse" : "bg-emerald-500"
                }`}
              ></span>
              <span className={error ? "text-rose-400" : "text-emerald-400"}>
                {error ? "Disconnected" : "Connected (Server-Side)"}
              </span>
            </p>
          </div>
        </section>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
            <p className="font-semibold">Backend Connection Alert</p>
            <p className="text-xs mt-1 text-rose-400">{error}</p>
            <p className="text-xs mt-2 text-slate-400">
              Ensure your Django backend is running at{" "}
              <code className="text-white">http://localhost:8000</code>.
            </p>
          </div>
        )}

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-2">
            <CreateItemForm />
          </div>

          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="text-lg font-semibold text-white">Tasks List</h2>
              <span className="text-xs text-slate-400">Fetched via Server Component</span>
            </div>

            <ItemList items={items} />
          </div>
        </div>
      </div>
    </main>
  );
}
