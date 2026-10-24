import { fetchProjectsServer, fetchEstimatorsServer } from "@/lib/crm-api";
import CrmDashboardContainer from "@/components/crm/CrmDashboardContainer";
import { Estimator, ProjectRFQ } from "@/types/crm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CrmPage() {
  let projects: ProjectRFQ[] = [];
  let estimators: Estimator[] = [];
  let error: string | null = null;

  try {
    const [fetchedProjects, fetchedEstimators] = await Promise.all([
      fetchProjectsServer(),
      fetchEstimatorsServer(),
    ]);
    projects = fetchedProjects;
    estimators = fetchedEstimators;
  } catch (err: any) {
    error = err.message || "Unable to connect to Django backend.";
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition shadow-xs">
              <span>← App Launcher</span>
            </Link>

            <Link href="/crm" className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-base tracking-wider shadow-sm">
                R
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base tracking-tight text-slate-900">RADWA ERP</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                    CRM Intake Desk
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium">Enterprise Commercial Management Suite</div>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1.5 ml-4 text-xs font-semibold">
              <Link href="/crm" className="px-3 py-1.5 rounded-lg bg-blue-600 text-white shadow-xs">
                CRM Intake Desk
              </Link>
              <Link href="/md" className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition flex items-center gap-1">
                <span>MD Console</span>
              </Link>
              <Link href="/estimator" className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition flex items-center gap-1">
                <span>Estimator Workspace</span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="http://127.0.0.1:8000/crm/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs transition"
            >
              <span>Backend CRM (8000)</span>
            </a>
            <div className="h-8 w-px bg-slate-200 mx-1"></div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-blue-100 border border-blue-300 text-blue-800 flex items-center justify-center font-bold text-xs">
                FA
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-900">Fatima Ali</div>
                <div className="text-[10px] text-slate-500">CRM Administrator</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error ? (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between text-sm">
            <div>
              <strong>Backend Connection Note:</strong> {error}. Serving cached data.
            </div>
            <span className="text-xs font-mono bg-white px-2 py-1 rounded border border-amber-200">
              Django API: 127.0.0.1:8000
            </span>
          </div>
        ) : null}

        <CrmDashboardContainer initialProjects={projects} estimators={estimators} />
      </main>
    </div>
  );
}
