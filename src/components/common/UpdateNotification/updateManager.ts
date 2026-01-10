/**
 * UPDATE NOTIFICATION MANAGER
 *
 * Utility functions to manage update notifications programmatically
 * Use these functions when you need to:
 * - Clear all dismissed updates (for testing)
 * - Mark specific updates as read
 * - Check if user has seen certain updates
 * - Get statistics about update engagement
 */

const STORAGE_KEY = "kalp-ai-dismissed-updates";

export class UpdateManager {
  /**
   * Get all dismissed update IDs
   */
  static getDismissedUpdates(): string[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  }

  /**
   * Mark an update as dismissed
   */
  static dismissUpdate(updateId: string): void {
    const dismissed = this.getDismissedUpdates();
    if (!dismissed.includes(updateId)) {
      dismissed.push(updateId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dismissed));
    }
  }

  /**
   * Check if an update has been dismissed
   */
  static isUpdateDismissed(updateId: string): boolean {
    return this.getDismissedUpdates().includes(updateId);
  }

  /**
   * Clear all dismissed updates (useful for testing or reset)
   */
  static clearAllDismissed(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Clear specific dismissed updates
   */
  static clearSpecificUpdates(updateIds: string[]): void {
    const dismissed = this.getDismissedUpdates();
    const filtered = dismissed.filter((id) => !updateIds.includes(id));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }

  /**
   * Get update engagement statistics
   */
  static getEngagementStats() {
    const dismissed = this.getDismissedUpdates();
    return {
      totalDismissed: dismissed.length,
      dismissedToday: dismissed.filter((id) => {
        // Extract date from update ID if it follows the pattern
        const dateMatch = id.match(/update-(\d{4}-\d{2}-\d{2})/);
        if (dateMatch) {
          const updateDate = new Date(dateMatch[1]);
          const today = new Date();
          return updateDate.toDateString() === today.toDateString();
        }
        return false;
      }).length,
      lastDismissedId: dismissed[dismissed.length - 1] || null,
    };
  }
}

// For debugging in development
if (process.env.NODE_ENV === "development") {
  // @ts-ignore - Add to window for debugging
  window.UpdateManager = UpdateManager;
  console.log("UpdateManager available at window.UpdateManager for debugging");
}
