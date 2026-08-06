// Admin Revenue Service
// Fetches from Firestore `revenue` collection
// Returns { value: 0, source: 'no_data' } when collection is empty
// Zero hardcoded dollar values — production-ready stubs

import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import type { RevenueMetrics, RevenueValue, Platform } from "../types/admin.types";

const ZERO: RevenueValue = { value: 0, currency: "USD", source: "no_data" };

function makeRevenue(value: number, currency = "USD"): RevenueValue {
  return { value, currency, source: "firestore" };
}

/**
 * Fetch revenue metrics from Firestore `revenue` collection
 * Returns zeros if collection doesn't exist yet (pre-payment integration)
 */
export async function getRevenueMetrics(): Promise<RevenueMetrics> {
  try {
    // Try fetching the summary document
    const summaryDoc = await getDoc(doc(db, "revenue", "summary"));

    if (!summaryDoc.exists()) {
      // Collection not yet seeded — return zeros with no_data source
      return buildEmptyRevenue();
    }

    const data = summaryDoc.data();
    const currency = data.currency || "USD";

    // Country breakdown
    let countryBreakdown: RevenueMetrics["countryBreakdown"] = [];
    try {
      const countrySnap = await getDocs(collection(db, "revenue", "summary", "countries"));
      countrySnap.forEach((d) => {
        const cd = d.data();
        countryBreakdown.push({ country: d.id, amount: cd.amount || 0, currency });
      });
      countryBreakdown.sort((a, b) => b.amount - a.amount);
    } catch (_) {
      countryBreakdown = [];
    }

    // Platform breakdown
    const platforms: Platform[] = ["Android", "Web", "iOS"];
    const platformAmounts = platforms.map((p) => ({
      platform: p,
      amount: data[`revenue_${p.toLowerCase()}`] || 0,
    }));
    const totalPlatformRevenue = platformAmounts.reduce((s, p) => s + p.amount, 0);
    const platformBreakdown = platformAmounts.map((p) => ({
      ...p,
      percent: totalPlatformRevenue > 0 ? Math.round((p.amount / totalPlatformRevenue) * 100) : 0,
    }));

    return {
      today: makeRevenue(data.today || 0, currency),
      thisMonth: makeRevenue(data.thisMonth || 0, currency),
      thisYear: makeRevenue(data.thisYear || 0, currency),
      mrr: makeRevenue(data.mrr || 0, currency),
      arr: makeRevenue(data.arr || 0, currency),
      arpu: makeRevenue(data.arpu || 0, currency),
      ltv: makeRevenue(data.ltv || 0, currency),
      churnRate: makeRevenue(data.churnRate || 0, "%"),
      activeSubscriptions: data.activeSubscriptions || 0,
      trialUsers: data.trialUsers || 0,
      countryBreakdown,
      platformBreakdown,
    };
  } catch (e) {
    console.warn("[AdminRevenue] Revenue collection not available:", e);
    return buildEmptyRevenue();
  }
}

function buildEmptyRevenue(): RevenueMetrics {
  return {
    today: ZERO,
    thisMonth: ZERO,
    thisYear: ZERO,
    mrr: ZERO,
    arr: ZERO,
    arpu: ZERO,
    ltv: ZERO,
    churnRate: { value: 0, currency: "%", source: "no_data" },
    activeSubscriptions: 0,
    trialUsers: 0,
    countryBreakdown: [],
    platformBreakdown: [],
  };
}
