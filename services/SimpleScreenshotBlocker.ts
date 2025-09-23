import { AppState, AppStateStatus, Platform } from 'react-native';

class SimpleScreenshotBlocker {
  private isProtectionEnabled = false;
  private appStateSubscription: any = null;
  private onScreenshotDetected: (() => void) | null = null;
  private lastAppStateChange = Date.now();
  private appStateChangeCount = 0;
  private lastDetectionTime = 0;
  private detectionCooldown = 10000; // 10 seconds cooldown

  /**
   * Enable simple screenshot blocking
   */
  async enableProtection(): Promise<void> {
    try {
      if (this.isProtectionEnabled) {
        console.log('🔒 Simple screenshot blocker already enabled');
        return;
      }

      this.isProtectionEnabled = true;
      console.log('🔒 Simple screenshot blocker enabled');

      // Listen for app state changes
      this.setupAppStateListener();

    } catch (error) {
      console.error('❌ Error enabling simple screenshot blocker:', error);
      throw error;
    }
  }

  /**
   * Disable simple screenshot blocking
   */
  async disableProtection(): Promise<void> {
    try {
      if (!this.isProtectionEnabled) {
        console.log('🔓 Simple screenshot blocker already disabled');
        return;
      }

      this.isProtectionEnabled = false;
      console.log('🔓 Simple screenshot blocker disabled');

      // Remove app state listener
      this.removeAppStateListener();

    } catch (error) {
      console.error('❌ Error disabling simple screenshot blocker:', error);
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
      if (timeSinceLastChange < 200) { // Less than 200ms
        this.appStateChangeCount++;
      } else {
        this.appStateChangeCount = 1;
      }
      
      this.lastAppStateChange = now;

      // Detect potential screenshot based on app state changes
      if (this.appStateChangeCount >= 2 && this.isProtectionEnabled) {
        console.log('🚫 Screenshot detected - showing black screen');
        this.handleScreenshotDetection();
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
   * Handle screenshot detection
   */
  private handleScreenshotDetection(): void {
    const now = Date.now();
    
    // Check cooldown period
    if (now - this.lastDetectionTime < this.detectionCooldown) {
      console.log('🚫 Screenshot detection on cooldown');
      return;
    }
    
    if (this.isProtectionEnabled && this.onScreenshotDetected) {
      console.log('🚫 Screenshot detected! Showing black screen...');
      this.onScreenshotDetected();
      
      // Update last detection time
      this.lastDetectionTime = now;
      
      // Reset counter
      this.appStateChangeCount = 0;
    }
  }

  /**
   * Simulate screenshot detection (for testing)
   */
  simulateScreenshotDetection(): void {
    const now = Date.now();
    
    if (now - this.lastDetectionTime < this.detectionCooldown) {
      console.log('🚫 Simulated screenshot detection on cooldown');
      return;
    }
    
    if (this.isProtectionEnabled && this.onScreenshotDetected) {
      console.log('🚫 Simulated screenshot detected!');
      this.onScreenshotDetected();
      this.lastDetectionTime = now;
    }
  }

  /**
   * Get protection status
   */
  getProtectionStatus(): { 
    enabled: boolean; 
    platform: string; 
    appStateChanges: number;
  } {
    return {
      enabled: this.isProtectionEnabled,
      platform: Platform.OS,
      appStateChanges: this.appStateChangeCount,
    };
  }

  /**
   * Cleanup all listeners and disable protection
   */
  async cleanup(): Promise<void> {
    try {
      await this.disableProtection();
      this.removeAppStateListener();
      this.appStateChangeCount = 0;
      this.lastDetectionTime = 0;
      console.log('🧹 Simple screenshot blocker cleaned up');
    } catch (error) {
      console.error('❌ Error cleaning up simple screenshot blocker:', error);
    }
  }
}

// Export singleton instance
export default new SimpleScreenshotBlocker();
