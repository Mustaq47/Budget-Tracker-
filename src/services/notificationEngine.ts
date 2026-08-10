import { LocalNotifications } from "@capacitor/local-notifications";
import { useBudgetStore, currencySymbols } from "../store/useBudgetStore";

export class NotificationEngine {
  static async requestPermissions() {
    try {
      const { display } = await LocalNotifications.requestPermissions();
      return display === "granted";
    } catch (error) {
      console.error("Error requesting notification permissions", error);
      return false;
    }
  }

  static async scheduleBudgetAlert(percentage: number, spent: number, currency: any) {
    if (percentage < 80) return;
    
    const id = percentage >= 100 ? 100 : 80;
    const title = percentage >= 100 ? "Budget Reached! ??" : "Approaching Limit ??";
    const symbol = currencySymbols[currency] || "";
    const body = percentage >= 100 
      ? `You have spent ${symbol}${spent}. You've hit your daily limit.` 
      : `You've spent ${percentage}% of your daily allowance. Consider slowing down.`;

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: id, // Use fixed IDs so they overwrite each other rather than spamming
            schedule: { at: new Date(Date.now() + 1000 * 5) }, // schedule in 5 seconds
            actionTypeId: "",
            extra: null
          }
        ]
      });
    } catch (e) {
      console.error("Failed to schedule notification", e);
    }
  }
}
