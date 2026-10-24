"use server";

import { revalidatePath } from "next/cache";
import { 
  saveEstimationServer, 
  saveSiteReviewServer, 
  requestSurveyServer,
  updateProjectStatusServer 
} from "@/lib/crm-api";
import { 
  SiteReviewDetails, 
  AiBoqCalculation, 
  SiteSurveyRequest, 
  ProjectStatus 
} from "@/types/crm";

/**
 * Server Action: Estimator saves BOQ Line Takeoff & Pricing
 */
export async function saveEstimationAction(
  projectId: string,
  estimatedValue: number,
  boqNotes?: string,
  calculation?: AiBoqCalculation
) {
  try {
    const updated = await saveEstimationServer(projectId, estimatedValue, boqNotes, calculation);
    revalidatePath("/");
    revalidatePath("/md");
    revalidatePath("/estimator");
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to save BOQ estimation." };
  }
}

/**
 * Server Action: Estimator saves site review details
 */
export async function saveSiteReviewAction(
  projectId: string,
  siteReview: SiteReviewDetails
) {
  try {
    const updated = await saveSiteReviewServer(projectId, siteReview);
    revalidatePath("/");
    revalidatePath("/md");
    revalidatePath("/estimator");
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to save site review." };
  }
}

/**
 * Server Action: Estimator dispatches site survey request to operations
 */
export async function requestSurveyAction(
  projectId: string,
  surveyRequest: SiteSurveyRequest
) {
  try {
    const updated = await requestSurveyServer(projectId, surveyRequest);
    revalidatePath("/");
    revalidatePath("/md");
    revalidatePath("/estimator");
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to request survey." };
  }
}

/**
 * Server Action: Estimator updates tender workflow status (e.g. 'Bid Submitted')
 */
export async function updateEstimatorProjectStatusAction(
  projectId: string,
  status: ProjectStatus
) {
  try {
    const updated = await updateProjectStatusServer(projectId, status);
    revalidatePath("/");
    revalidatePath("/md");
    revalidatePath("/estimator");
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update project status." };
  }
}
