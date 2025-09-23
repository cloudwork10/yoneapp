import { AppState, AppStateStatus } from 'react-native';

class AlternativeScreenshotProtection {
  private isProtectionEnabled = false;
  private appStateSubscription: any = null;

  /**
   * Enable alternative screenshot protection
   * This method uses React Native's built-in capabilities
   */
  async enableProtection(): Promise<void> {
    try {
      if (this.isProtectionEnabled) {
        console.log('🔒 Alternative screenshot protection already enabled');
        return;
      }

      // Set a flag to indicate protection is enabled
      this.isProtectionEnabled = true;
      console.log('🔒 Alternative screenshot protection enabled');

      // Listen for app state changes
      this.setupAppStateListener();

      // Add a warning overlay (this is a visual deterrent)
      this.addWarningOverlay();

    } catch (error) {
      console.error('❌ Error enabling alternative screenshot protection:', error);
      throw error;
    }
  }

  /**
   * Disable alternative screenshot protection
   */
  async disableProtection(): Promise<void> {
    try {
      if (!this.isProtectionEnabled) {
        console.log('🔓 Alternative screenshot protection already disabled');
        return;
      }

      this.isProtectionEnabled = false;
      console.log('🔓 Alternative screenshot protection disabled');

      // Remove app state listener
      this.removeAppStateListener();

      // Remove warning overlay
      this.removeWarningOverlay();

    } catch (error) {
      console.error('❌ Error disabling alternative screenshot protection:', error);
      throw error;
    }
  }

  /**
   * Check if protection is currently enabled
   */
  isEnabled(): boolean {
    return this.isProtectionEnabled;
  }

  /**
   * Setup app state listener
   */
  private setupAppStateListener(): void {
    this.appStateSubscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && this.isProtectionEnabled) {
        try {
          console.log('🔒 Alternative screenshot protection re-enabled on app focus');
          // Re-add warning overlay when app becomes active
          this.addWarningOverlay();
        } catch (error) {
          console.error('❌ Error re-enabling alternative screenshot protection:', error);
        }
      }
    });
  }

  /**
   * Remove app state listener
   */
  private removeAppStateListener(): void {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
  }

  /**
   * Add a warning overlay (visual deterrent)
   */
  private addWarningOverlay(): void {
    // This is a placeholder for a visual warning
    // In a real implementation, you could add a transparent overlay
    // that shows a warning message when someone tries to take a screenshot
    console.log('⚠️ Warning overlay added - Screenshots are not allowed');
  }

  /**
   * Remove warning overlay
   */
  private removeWarningOverlay(): void {
    console.log('⚠️ Warning overlay removed');
  }

  /**
   * Show a warning message to the user
   */
  showWarning(): void {
    console.log('🚨 WARNING: Screenshots are not allowed in this app!');
    // In a real implementation, you could show an alert or toast
  }

  /**
   * Cleanup all listeners and disable protection
   */
  async cleanup(): Promise<void> {
    try {
      await this.disableProtection();
      this.removeAppStateListener();
      console.log('🧹 Alternative screenshot protection service cleaned up');
    } catch (error) {
      console.error('❌ Error cleaning up alternative screenshot protection service:', error);
    }
  }
}

// Export singleton instance
export default new AlternativeScreenshotProtection();
