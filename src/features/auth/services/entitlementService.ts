export type UserRole = 'user' | 'admin';
export type UserPlan = 'free' | 'premium';
export type SubscriptionStatus = 'none' | 'trial' | 'active' | 'expired' | 'cancelled';

export interface UserEntitlements {
  role: UserRole;
  plan: UserPlan;
  subscriptionStatus: SubscriptionStatus;
}

export type FeatureFlag = 'ADVANCED_ANALYTICS' | 'SMART_SAFE_TO_SPEND' | 'AI_FINANCIAL_INSIGHTS';

/**
 * Entitlement Service for coZify
 * Evaluates feature access based on user role, plan, and trial state.
 * Never trust client-only state for critical backend protections.
 */
export class EntitlementService {
  public static getUserEntitlements(user: { uid?: string; email?: string } | null): UserEntitlements {
    if (!user) {
      return { role: 'user', plan: 'free', subscriptionStatus: 'none' };
    }

    // Trial users get trial access
    if (user.uid?.startsWith('trial_')) {
      return { role: 'user', plan: 'free', subscriptionStatus: 'trial' };
    }

    // Admin email override
    if (user.email === 'support@cozify.app' || user.email === 'mustaqsk47@gmail.com') {
      return { role: 'admin', plan: 'premium', subscriptionStatus: 'active' };
    }

    // Authenticated users get default active free/premium status
    return { role: 'user', plan: 'premium', subscriptionStatus: 'active' };
  }

  public static isFeatureEnabled(feature: FeatureFlag, entitlements: UserEntitlements): boolean {
    if (entitlements.role === 'admin') return true;

    switch (feature) {
      case 'SMART_SAFE_TO_SPEND':
        // Safe-to-Spend is accessible to free and premium users
        return true;
      case 'ADVANCED_ANALYTICS':
        return entitlements.plan === 'premium' || entitlements.subscriptionStatus === 'trial' || entitlements.subscriptionStatus === 'active';
      case 'AI_FINANCIAL_INSIGHTS':
        return entitlements.plan === 'premium' || entitlements.subscriptionStatus === 'trial' || entitlements.subscriptionStatus === 'active';
      default:
        return false;
    }
  }
}
