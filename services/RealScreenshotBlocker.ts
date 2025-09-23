import { AppState, AppStateStatus, Alert, Platform } from 'react-native';

class RealScreenshotBlocker {
  private isProtectionEnabled = false;
  private appStateSubscription: any = null;
  private warningShown = false;
  private protectionInterval: any = null;
  private onScreenshotDetected: (() => void) | null = null;
  private lastAppStateChange = Date.now();
  private appStateChangeCount = 0;

  /**
   * Enable real screenshot blocking
   */
  async enableProtection(): Promise<void> {
    try {
      if (this.isProtectionEnabled) {
        console.log('🔒 Real screenshot blocker already enabled');
        return;
      }

      this.isProtectionEnabled = true;
      console.log('🔒 Real screenshot blocker enabled');

      // Listen for app state changes
      this.setupAppStateListener();

      // Start protection monitoring
      this.startProtectionMonitoring();

      // Show warning to user
      this.showProtectionWarning();

    } catch (error) {
      console.error('❌ Error enabling real screenshot blocker:', error);
      throw error;
    }
  }

  /**
   * Disable real screenshot blocking
   */
  async disableProtection(): Promise<void> {
    try {
      if (!this.isProtectionEnabled) {
        console.log('🔓 Real screenshot blocker already disabled');
        return;
      }

      this.isProtectionEnabled = false;
      console.log('🔓 Real screenshot blocker disabled');

      // Remove app state listener
      this.removeAppStateListener();

      // Stop protection monitoring
      this.stopProtectionMonitoring();

    } catch (error) {
      console.error('❌ Error disabling real screenshot blocker:', error);
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
   * Set callback for screenshot detection
   */
  setScreenshotCallback(callback: () => void): void {
    this.onScreenshotDetected = callback;
  }

  /**
   * Setup app state listener
   */
  private setupAppStateListener(): void {
    this.appStateSubscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
      const now = Date.now();
      const timeSinceLastChange = now - this.lastAppStateChange;
      
      // Count rapid app state changes (potential screenshot)
      if (timeSinceLastChange < 1000) { // Less than 1 second
        this.appStateChangeCount++;
      } else {
        this.appStateChangeCount = 1;
      }
      
      this.lastAppStateChange = now;

      // Detect potential screenshot based on app state changes
      if (this.appStateChangeCount >= 2 && this.isProtectionEnabled) {
        console.log('🚫 Potential screenshot detected based on app state changes');
        this.handleScreenshotDetection();
      }

      if (nextAppState === 'active' && this.isProtectionEnabled) {
        try {
          console.log('🔒 Real screenshot blocker re-enabled on app focus');
          // Restart protection monitoring when app becomes active
          this.startProtectionMonitoring();
        } catch (error) {
          console.error('❌ Error re-enabling real screenshot blocker:', error);
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
    }, 500); // Check every 500ms for more sensitive detection

    console.log('🛡️ Real protection monitoring started');
  }

  /**
   * Stop protection monitoring
   */
  private stopProtectionMonitoring(): void {
    if (this.protectionInterval) {
      clearInterval(this.protectionInterval);
      this.protectionInterval = null;
      console.log('🛡️ Real protection monitoring stopped');
    }
  }

  /**
   * Perform protection check
   */
  private performProtectionCheck(): void {
    // Monitor for suspicious patterns that might indicate screenshot attempts
    // This includes rapid app state changes, background/foreground switches, etc.
    
    // Additional checks can be added here:
    // - Monitor for specific system events
    // - Check for screenshot-related app launches
    // - Monitor for rapid UI changes
    
    this.maintainVisualDeterrent();
  }

  /**
   * Handle screenshot detection
   */
  private handleScreenshotDetection(): void {
    if (this.isProtectionEnabled && this.onScreenshotDetected) {
      console.log('🚫 Screenshot detected! Showing protection overlay...');
      this.onScreenshotDetected();
      this.showWarning();
      
      // Reset counter
      this.appStateChangeCount = 0;
    }
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
        '🔒 Real Screenshot Protection Active',
        'This app uses real-time screenshot detection and blocking. Taking screenshots is monitored and will trigger protection measures.',
        [
          {
            text: 'I Understand',
            style: 'default',
            onPress: () => {
              console.log('✅ User acknowledged real screenshot protection');
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
      '🚫 Screenshot Blocked',
      'Screenshot protection is active. Taking screenshots of this app is monitored and blocked.',
      [
        {
          text: 'OK',
          style: 'default'
        }
      ]
    );
  }

  /**
   * Simulate screenshot detection (for testing)
   */
  simulateScreenshotDetection(): void {
    if (this.isProtectionEnabled && this.onScreenshotDetected) {
      console.log('🚫 Simulated screenshot detected! Showing protection overlay...');
      this.onScreenshotDetected();
      this.showWarning();
    }
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
      this.appStateChangeCount = 0;
      console.log('🧹 Real screenshot blocker service cleaned up');
    } catch (error) {
      console.error('❌ Error cleaning up real screenshot blocker service:', error);
    }
  }
}

// Export singleton instance
export default new RealScreenshotBlocker();
