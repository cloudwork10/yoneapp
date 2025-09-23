import * as ScreenCapture from 'expo-screen-capture';
import { AppState, AppStateStatus } from 'react-native';

class ScreenshotProtectionService {
  private isProtectionEnabled = false;
  private appStateSubscription: any = null;

  /**
   * Enable screenshot protection for the entire app
   */
  async enableProtection(): Promise<void> {
    try {
      if (this.isProtectionEnabled) {
        console.log('🔒 Screenshot protection already enabled');
        return;
      }

      // Enable screenshot protection
      await ScreenCapture.preventScreenCaptureAsync();
      this.isProtectionEnabled = true;
      console.log('🔒 Screenshot protection enabled');

      // Listen for app state changes to re-enable protection
      this.setupAppStateListener();

    } catch (error) {
      console.error('❌ Error enabling screenshot protection:', error);
      throw error;
    }
  }

  /**
   * Disable screenshot protection
   */
  async disableProtection(): Promise<void> {
    try {
      if (!this.isProtectionEnabled) {
        console.log('🔓 Screenshot protection already disabled');
        return;
      }

      // Disable screenshot protection
      await ScreenCapture.allowScreenCaptureAsync();
      this.isProtectionEnabled = false;
      console.log('🔓 Screenshot protection disabled');

      // Remove app state listener
      this.removeAppStateListener();

    } catch (error) {
      console.error('❌ Error disabling screenshot protection:', error);
      throw error;
    }
  }

  /**
   * Check if screenshot protection is currently enabled
   */
  isEnabled(): boolean {
    return this.isProtectionEnabled;
  }

  /**
   * Setup app state listener to re-enable protection when app becomes active
   */
  private setupAppStateListener(): void {
    this.appStateSubscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && this.isProtectionEnabled) {
        try {
          // Re-enable protection when app becomes active
          await ScreenCapture.preventScreenCaptureAsync();
          console.log('🔒 Screenshot protection re-enabled on app focus');
        } catch (error) {
          console.error('❌ Error re-enabling screenshot protection:', error);
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
   * Temporarily disable protection (useful for specific screens)
   */
  async temporarilyDisable(): Promise<void> {
    try {
      await ScreenCapture.allowScreenCaptureAsync();
      console.log('🔓 Screenshot protection temporarily disabled');
    } catch (error) {
      console.error('❌ Error temporarily disabling screenshot protection:', error);
    }
  }

  /**
   * Re-enable protection after temporary disable
   */
  async reEnable(): Promise<void> {
    try {
      if (this.isProtectionEnabled) {
        await ScreenCapture.preventScreenCaptureAsync();
        console.log('🔒 Screenshot protection re-enabled');
      }
    } catch (error) {
      console.error('❌ Error re-enabling screenshot protection:', error);
    }
  }

  /**
   * Cleanup all listeners and disable protection
   */
  async cleanup(): Promise<void> {
    try {
      await this.disableProtection();
      this.removeAppStateListener();
      console.log('🧹 Screenshot protection service cleaned up');
    } catch (error) {
      console.error('❌ Error cleaning up screenshot protection service:', error);
    }
  }
}

// Export singleton instance
export default new ScreenshotProtectionService();
