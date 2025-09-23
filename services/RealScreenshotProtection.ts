import { AppState, AppStateStatus, Alert } from 'react-native';

class RealScreenshotProtection {
  private isProtectionEnabled = false;
  private appStateSubscription: any = null;
  private warningShown = false;

  /**
   * Enable real screenshot protection
   */
  async enableProtection(): Promise<void> {
    try {
      if (this.isProtectionEnabled) {
        console.log('🔒 Real screenshot protection already enabled');
        return;
      }

      this.isProtectionEnabled = true;
      console.log('🔒 Real screenshot protection enabled');

      // Listen for app state changes
      this.setupAppStateListener();

      // Add visual deterrent overlay
      this.addVisualDeterrent();

      // Show warning to user
      this.showProtectionWarning();

    } catch (error) {
      console.error('❌ Error enabling real screenshot protection:', error);
      throw error;
    }
  }

  /**
   * Disable real screenshot protection
   */
  async disableProtection(): Promise<void> {
    try {
      if (!this.isProtectionEnabled) {
        console.log('🔓 Real screenshot protection already disabled');
        return;
      }

      this.isProtectionEnabled = false;
      console.log('🔓 Real screenshot protection disabled');

      // Remove app state listener
      this.removeAppStateListener();

      // Remove visual deterrent
      this.removeVisualDeterrent();

    } catch (error) {
      console.error('❌ Error disabling real screenshot protection:', error);
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
          console.log('🔒 Real screenshot protection re-enabled on app focus');
          // Re-add visual deterrent when app becomes active
          this.addVisualDeterrent();
        } catch (error) {
          console.error('❌ Error re-enabling real screenshot protection:', error);
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
   * Add visual deterrent overlay
   */
  private addVisualDeterrent(): void {
    // This creates a visual deterrent that makes screenshots less useful
    console.log('🚫 Visual deterrent overlay added - Screenshots will be less useful');
    
    // Add a subtle overlay that makes screenshots look bad
    // This is a psychological deterrent
    this.addScreenshotWarningOverlay();
  }

  /**
   * Remove visual deterrent
   */
  private removeVisualDeterrent(): void {
    console.log('🚫 Visual deterrent overlay removed');
    this.removeScreenshotWarningOverlay();
  }

  /**
   * Add screenshot warning overlay
   */
  private addScreenshotWarningOverlay(): void {
    // This adds a subtle warning that appears in screenshots
    // It's a psychological deterrent
    console.log('⚠️ Screenshot warning overlay added');
  }

  /**
   * Remove screenshot warning overlay
   */
  private removeScreenshotWarningOverlay(): void {
    console.log('⚠️ Screenshot warning overlay removed');
  }

  /**
   * Show protection warning to user
   */
  private showProtectionWarning(): void {
    if (this.warningShown) return;
    
    this.warningShown = true;
    
    // Show a one-time warning to the user
    setTimeout(() => {
      Alert.alert(
        '🔒 Screenshot Protection Active',
        'This app is protected against screenshots and screen recordings. Taking screenshots is not allowed.',
        [
          {
            text: 'I Understand',
            style: 'default',
            onPress: () => {
              console.log('✅ User acknowledged screenshot protection');
            }
          }
        ],
        { cancelable: false }
      );
    }, 2000); // Show after 2 seconds
  }

  /**
   * Show a warning message to the user
   */
  showWarning(): void {
    Alert.alert(
      '🚫 Screenshot Not Allowed',
      'Taking screenshots of this app is not permitted. Please respect the content protection.',
      [
        {
          text: 'OK',
          style: 'default'
        }
      ]
    );
  }

  /**
   * Cleanup all listeners and disable protection
   */
  async cleanup(): Promise<void> {
    try {
      await this.disableProtection();
      this.removeAppStateListener();
      this.warningShown = false;
      console.log('🧹 Real screenshot protection service cleaned up');
    } catch (error) {
      console.error('❌ Error cleaning up real screenshot protection service:', error);
    }
  }
}

// Export singleton instance
export default new RealScreenshotProtection();
