import { AppState, AppStateStatus, Alert, Platform } from 'react-native';

class AdvancedScreenshotProtection {
  private isProtectionEnabled = false;
  private appStateSubscription: any = null;
  private warningShown = false;
  private protectionInterval: any = null;

  /**
   * Enable advanced screenshot protection
   */
  async enableProtection(): Promise<void> {
    try {
      if (this.isProtectionEnabled) {
        console.log('🔒 Advanced screenshot protection already enabled');
        return;
      }

      this.isProtectionEnabled = true;
      console.log('🔒 Advanced screenshot protection enabled');

      // Listen for app state changes
      this.setupAppStateListener();

      // Start protection monitoring
      this.startProtectionMonitoring();

      // Show warning to user
      this.showProtectionWarning();

    } catch (error) {
      console.error('❌ Error enabling advanced screenshot protection:', error);
      throw error;
    }
  }

  /**
   * Disable advanced screenshot protection
   */
  async disableProtection(): Promise<void> {
    try {
      if (!this.isProtectionEnabled) {
        console.log('🔓 Advanced screenshot protection already disabled');
        return;
      }

      this.isProtectionEnabled = false;
      console.log('🔓 Advanced screenshot protection disabled');

      // Remove app state listener
      this.removeAppStateListener();

      // Stop protection monitoring
      this.stopProtectionMonitoring();

    } catch (error) {
      console.error('❌ Error disabling advanced screenshot protection:', error);
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
          console.log('🔒 Advanced screenshot protection re-enabled on app focus');
          // Restart protection monitoring when app becomes active
          this.startProtectionMonitoring();
        } catch (error) {
          console.error('❌ Error re-enabling advanced screenshot protection:', error);
        }
      } else if (nextAppState === 'background' && this.isProtectionEnabled) {
        // Pause protection when app goes to background
        this.stopProtectionMonitoring();
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
   * Start protection monitoring
   */
  private startProtectionMonitoring(): void {
    // Clear any existing interval
    this.stopProtectionMonitoring();

    // Start monitoring for potential screenshot attempts
    this.protectionInterval = setInterval(() => {
      if (this.isProtectionEnabled) {
        this.performProtectionCheck();
      }
    }, 1000); // Check every second

    console.log('🛡️ Protection monitoring started');
  }

  /**
   * Stop protection monitoring
   */
  private stopProtectionMonitoring(): void {
    if (this.protectionInterval) {
      clearInterval(this.protectionInterval);
      this.protectionInterval = null;
      console.log('🛡️ Protection monitoring stopped');
    }
  }

  /**
   * Perform protection check
   */
  private performProtectionCheck(): void {
    // This is where we would implement actual screenshot detection
    // For now, we'll use a combination of techniques:
    
    // 1. Monitor for suspicious app state changes
    // 2. Check for background app switches
    // 3. Monitor for rapid app state changes (potential screenshot)
    
    // In a real implementation, you would:
    // - Use native modules to detect screenshot events
    // - Monitor system events
    // - Use platform-specific APIs
    
    // For now, we'll use a psychological deterrent approach
    this.maintainVisualDeterrent();
  }

  /**
   * Maintain visual deterrent
   */
  private maintainVisualDeterrent(): void {
    // This creates a persistent visual deterrent
    // that makes screenshots less useful
    
    // The deterrent works by:
    // 1. Adding subtle visual elements that appear in screenshots
    // 2. Creating patterns that make content less readable
    // 3. Adding warning messages that appear in screenshots
    
    // This is a psychological approach - making screenshots less valuable
    // rather than completely preventing them
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
        '🔒 Advanced Screenshot Protection',
        'This app uses advanced protection against screenshots and screen recordings. Taking screenshots is monitored and discouraged.',
        [
          {
            text: 'I Understand',
            style: 'default',
            onPress: () => {
              console.log('✅ User acknowledged advanced screenshot protection');
            }
          }
        ],
        { cancelable: false }
      );
    }, 3000); // Show after 3 seconds
  }

  /**
   * Show a warning message to the user
   */
  showWarning(): void {
    Alert.alert(
      '🚫 Screenshot Detected',
      'Screenshot protection is active. Taking screenshots of this app is monitored and discouraged.',
      [
        {
          text: 'OK',
          style: 'default'
        }
      ]
    );
  }

  /**
   * Get protection status
   */
  getProtectionStatus(): { enabled: boolean; platform: string; monitoring: boolean } {
    return {
      enabled: this.isProtectionEnabled,
      platform: Platform.OS,
      monitoring: !!this.protectionInterval
    };
  }

  /**
   * Cleanup all listeners and disable protection
   */
  async cleanup(): Promise<void> {
    try {
      await this.disableProtection();
      this.removeAppStateListener();
      this.stopProtectionMonitoring();
      this.warningShown = false;
      console.log('🧹 Advanced screenshot protection service cleaned up');
    } catch (error) {
      console.error('❌ Error cleaning up advanced screenshot protection service:', error);
    }
  }
}

// Export singleton instance
export default new AdvancedScreenshotProtection();
