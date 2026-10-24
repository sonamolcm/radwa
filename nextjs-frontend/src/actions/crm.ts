"use server";

import { revalidatePath } from "next/cache";
import { 
  createProjectServer, 
  assignEstimatorServer, 
  updateProjectStatusServer 
} from "@/lib/crm-api";
import { ProjectRFQ, ProjectStatus } from "@/types/crm";

/**
 * Server Action: Register new client tender project
 */
export async function registerClientAction(projectData: Partial<ProjectRFQ>) {
  try {
    const createdProject = await createProjectServer(projectData);
    revalidatePath("/");
    revalidatePath("/crm");
    return { success: true, data: createdProject };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to register project on Django server." };
  }
}

/**
 * Server Action: Assign estimator to project
 */
export async function assignEstimatorAction(projectId: string, estimatorId: string) {
  try {
    const updatedProject = await assignEstimatorServer(projectId, estimatorId);
    revalidatePath("/");
    revalidatePath("/crm");
    return { success: true, data: updatedProject };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to assign estimator on Django server." };
  }
}

/**
 * Server Action: Update project tender status
 */
export async function updateProjectStatusAction(projectId: string, newStatus: ProjectStatus) {
  try {
    const updatedProject = await updateProjectStatusServer(projectId, newStatus);
    revalidatePath("/");
    revalidatePath("/crm");
    return { success: true, data: updatedProject };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update project status on Django server." };
  }
}
