import { fetchProjectsServer } from "@/lib/crm-api";
import HomeLauncherContainer from "@/components/home/HomeLauncherContainer";
import { ProjectRFQ } from "@/types/crm";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let projects: ProjectRFQ[] = [];

  try {
    const fetchedProjects = await fetchProjectsServer();
    projects = fetchedProjects;
  } catch {
    // Graceful fallback to default mock state if API temporarily busy
  }

  return <HomeLauncherContainer initialProjects={projects} />;
}
