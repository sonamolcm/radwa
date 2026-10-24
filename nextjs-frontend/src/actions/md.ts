"use server";

import { revalidatePath } from "next/cache";
import { 
  approveForBiddingServer, 
  declineTenderServer, 
  assignEstimatorServer 
} from "@/lib/crm-api";

/**
 * Server Action: MD authorizes tender for commercial bidding
 */
export async function approveForBiddingAction(projectId: string, mdRemarks?: string) {
  try {
    const updated = await approveForBiddingServer(projectId, mdRemarks);
    revalidatePath("/");
    revalidatePath("/md");
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to approve tender." };
  }
}

/**
 * Server Action: MD declines tender
 */
export async function declineTenderAction(projectId: string, reason?: string) {
  try {
    const updated = await declineTenderServer(projectId, reason);
    revalidatePath("/");
    revalidatePath("/md");
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to decline tender." };
  }
}

/**
 * Server Action: MD reassigns estimator to tender
 */
export async function reassignEstimatorAction(projectId: string, estimatorId: string) {
  try {
    const updated = await assignEstimatorServer(projectId, estimatorId);
    revalidatePath("/");
    revalidatePath("/md");
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to reassign estimator." };
  }
}
