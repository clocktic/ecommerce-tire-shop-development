"use server"

import { revalidatePath } from "next/cache"
import { isAdmin } from "@/lib/admin-auth"
import {
  createUsStandardShoppingCampaign,
  fetchGoogleAdsOverview,
  saveGoogleAdsSettings,
  setGoogleAdsCampaignStatus,
  updateGoogleAdsCampaignBudget,
} from "@/lib/google-ads"

export async function saveGoogleAdsConfigAction(formData: FormData) {
  if (!(await isAdmin())) throw new Error("Unauthorized")

  const customerId = String(formData.get("customerId") ?? "")
  const loginCustomerId = String(formData.get("loginCustomerId") ?? "")
  const developerToken = String(formData.get("developerToken") ?? "")
  const merchantId = String(formData.get("merchantId") ?? "5900416726")
  const refreshToken = String(formData.get("refreshToken") ?? "")

  await saveGoogleAdsSettings({
    customerId,
    loginCustomerId,
    developerToken,
    merchantId,
    ...(refreshToken.trim() ? { refreshToken } : {}),
  })

  revalidatePath("/admin/google-ads")
  revalidatePath("/admin")
  return { ok: true }
}

export async function testGoogleAdsConnectionAction() {
  if (!(await isAdmin())) throw new Error("Unauthorized")
  try {
    const overview = await fetchGoogleAdsOverview()
    revalidatePath("/admin/google-ads")
    return {
      ok: true,
      message: `Подключено: ${overview.accountName} (${overview.customerId}), кампаний: ${overview.campaigns.length}`,
    }
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Ошибка подключения к Google Ads API",
    }
  }
}

export async function toggleGoogleAdsCampaignStatusAction(
  campaignResourceName: string,
  nextStatus: "ENABLED" | "PAUSED",
) {
  if (!(await isAdmin())) throw new Error("Unauthorized")
  await setGoogleAdsCampaignStatus(campaignResourceName, nextStatus)
  revalidatePath("/admin/google-ads")
}

export async function updateGoogleAdsBudgetAction(
  budgetResourceName: string,
  dailyBudgetDollars: number,
) {
  if (!(await isAdmin())) throw new Error("Unauthorized")
  await updateGoogleAdsCampaignBudget(budgetResourceName, dailyBudgetDollars)
  revalidatePath("/admin/google-ads")
}

export async function createGoogleAdsShoppingCampaignAction(formData: FormData) {
  if (!(await isAdmin())) throw new Error("Unauthorized")
  const name =
    String(formData.get("name") ?? "").trim() || "TiresShop · US Standard Shopping"
  const dailyBudgetDollars = Number(formData.get("dailyBudgetDollars") ?? 25)
  const cpcBidDollars = Number(formData.get("cpcBidDollars") ?? 0.85)
  const startPaused = formData.get("startPaused") === "on"

  await createUsStandardShoppingCampaign({
    name,
    dailyBudgetDollars: Number.isFinite(dailyBudgetDollars) ? dailyBudgetDollars : 25,
    cpcBidDollars: Number.isFinite(cpcBidDollars) ? cpcBidDollars : 0.85,
    startPaused,
  })
  revalidatePath("/admin/google-ads")
}
