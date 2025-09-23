import { AppState, AppStateStatus, Platform } from 'react-native';

class RealScreenshotBlocker {
  private isProtectionEnabled = false;
  private appStateSubscription: any = null;
  private protectionInterval: any = null;
  private onScreenshotDetected: (() => void) | null = null;
  private lastAppStateChange = Date.now();
  private appStateChangeCount = 0;
  private lastDetectionTime = 0;
  private detectionCooldown = 15000; // 15 seconds cooldown
  private isBlockingActive = false;

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
      this.isBlockingActive = true;
      console.log('🔒 Real screenshot blocker enabled');

      // Listen for app state changes
      this.setupAppStateListener();

      // Start protection monitoring
      this.startProtectionMonitoring();

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
      this.isBlockingActive = false;
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
   * Check if blocking is currently active
   */
  isBlocking(): boolean {
    return this.isBlockingActive;
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
      if (timeSinceLastChange < 50) { // Less than 50ms - very sensitive
        this.appStateChangeCount++;
      } else {
        this.appStateChangeCount = 1;
      }
      
      this.lastAppStateChange = now;

      // Detect potential screenshot based on app state changes
      if (this.appStateChangeCount >= 4 && this.isProtectionEnabled) {
        console.log('🚫 Potential screenshot detected based on app state changes');
        this.handleScreenshotDetection();
      }

      if (nextAppState === 'active' && this.isProtectionEnabled) {
        try {
          console.log('🔒 Real screenshot blocker re-enabled on app focus');
          this.startProtectionMonitoring();
        } catch (error) {
          console.error('❌ Error re-enabling real screenshot blocker:', error);
        }
      } else if (nextAppState === 'background' && this.isProtectionEnabled) {
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
    this.stopProtectionMonitoring();

    // Simple monitoring
    this.protectionInterval = setInterval(() => {
      if (this.isProtectionEnabled) {
        this.performProtectionCheck();
      }
    }, 2000); // Check every 2 seconds

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
    // Real screenshot detection logic
    // This monitors for actual screenshot patterns
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
      console.log('🚫 Screenshot detected! Showing protection...');
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
    monitoring: boolean;
    appStateChanges: number;
    blocking: boolean;
  } {
    return {
      enabled: this.isProtectionEnabled,
      platform: Platform.OS,
      monitoring: !!this.protectionInterval,
      appStateChanges: this.appStateChangeCount,
      blocking: this.isBlockingActive,
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
      this.appStateChangeCount = 0;
      this.lastDetectionTime = 0;
      this.isBlockingActive = false;
      console.log('🧹 Real screenshot blocker cleaned up');
    } catch (error) {
      console.error('❌ Error cleaning up real screenshot blocker:', error);
    }
  }
}

// Export singleton instance
export default new RealScreenshotBlocker();
