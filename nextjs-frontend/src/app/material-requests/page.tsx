import { fetchProjectsServer } from "@/lib/crm-api";
import { MrDashboard } from "@/components/procurement/MrDashboard";
import { ProjectRFQ } from "@/types/crm";
import { PRESET_USERS } from "@/types/auth";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function MaterialRequestsPage() {
  let projects: ProjectRFQ[] = [];

  try {
    const fetchedProjects = await fetchProjectsServer();
    projects = fetchedProjects;
  } catch {
    // Graceful fallback to default mock state if API temporarily busy
  }

  const currentUser = PRESET_USERS.estimator;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition shadow-xs"
            >
              <div className="grid grid-cols-2 gap-0.5 w-3 h-3">
                <div className="bg-white rounded-2xs"></div>
                <div className="bg-cyan-400 rounded-2xs"></div>
                <div className="bg-cyan-400 rounded-2xs"></div>
                <div className="bg-white rounded-2xs"></div>
              </div>
              <span className="hidden sm:inline">← App Launcher</span>
            </Link>

            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                MR
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base tracking-tight text-slate-900">RADWA ERP</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                    Stage 2: Material Requests (MR)
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium">Project Shortfall Intake & QA Verification</div>
              </div>
            </div>

            <nav className="hidden lg:flex items-center gap-1.5 ml-2 text-xs font-semibold">
              <Link href="/estimator" className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition flex items-center gap-1.5">
                <span>Estimator Workspace</span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="http://127.0.0.1:8000/estimator/?view=mr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs transition"
            >
              <span>Django Backend (8000)</span>
            </a>
            <div className="h-8 w-px bg-slate-200 mx-1"></div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-blue-100 border border-blue-300 text-blue-800 flex items-center justify-center font-bold text-xs">
                FQ
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-900">Farhan Qureshi</div>
                <div className="text-[10px] text-slate-500">Lead Estimator & Verifying Officer</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <MrDashboard projects={projects} currentUser={currentUser} />
      </main>

      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
        RADWA CONTRACTING & TRADING ERP • STAGE 2: MATERIAL REQUESTS (MR) HUB • VERIFYING OFFICER: ENG. FARHAN QURESHI
      </footer>
    </div>
  );
}
