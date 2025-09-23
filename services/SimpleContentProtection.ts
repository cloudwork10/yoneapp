import { AppState, AppStateStatus, Platform } from 'react-native';

class SimpleContentProtection {
  private isProtectionEnabled = false;
  private appStateSubscription: any = null;
  private protectionInterval: any = null;
  private onScreenshotDetected: (() => void) | null = null;
  private lastAppStateChange = Date.now();
  private appStateChangeCount = 0;
  private lastDetectionTime = 0;
  private detectionCooldown = 2000; // 2 seconds cooldown
  private screenshotAttempts = 0;

  /**
   * Enable simple content protection
   */
  async enableProtection(): Promise<void> {
    try {
      if (this.isProtectionEnabled) {
        console.log('🔒 Simple content protection already enabled');
        return;
      }

      this.isProtectionEnabled = true;
      console.log('🔒 Simple content protection enabled');

      // Listen for app state changes
      this.setupAppStateListener();

      // Start protection monitoring
      this.startProtectionMonitoring();

    } catch (error) {
      console.error('❌ Error enabling simple content protection:', error);
      throw error;
    }
  }

  /**
   * Disable simple content protection
   */
  async disableProtection(): Promise<void> {
    try {
      if (!this.isProtectionEnabled) {
        console.log('🔓 Simple content protection already disabled');
        return;
      }

      this.isProtectionEnabled = false;
      console.log('🔓 Simple content protection disabled');

      // Remove app state listener
      this.removeAppStateListener();

      // Stop protection monitoring
      this.stopProtectionMonitoring();

    } catch (error) {
      console.error('❌ Error disabling simple content protection:', error);
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
      if (timeSinceLastChange < 100) { // Less than 100ms - more sensitive
        this.appStateChangeCount++;
      } else {
        this.appStateChangeCount = 1;
      }
      
      this.lastAppStateChange = now;

      // Detect potential screenshot based on app state changes
      if (this.appStateChangeCount >= 2 && this.isProtectionEnabled) {
        console.log('🚫 Potential screenshot detected');
        this.handleScreenshotDetection();
      }

      if (nextAppState === 'active' && this.isProtectionEnabled) {
        try {
          console.log('🔒 Simple content protection re-enabled on app focus');
          this.startProtectionMonitoring();
        } catch (error) {
          console.error('❌ Error re-enabling simple content protection:', error);
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
    }, 500); // Check every 500ms - more frequent

    console.log('🛡️ Simple protection monitoring started');
  }

  /**
   * Stop protection monitoring
   */
  private stopProtectionMonitoring(): void {
    if (this.protectionInterval) {
      clearInterval(this.protectionInterval);
      this.protectionInterval = null;
      console.log('🛡️ Simple protection monitoring stopped');
    }
  }

  /**
   * Perform protection check
   */
  private performProtectionCheck(): void {
    // Simulate screenshot detection for testing
    // In real implementation, this would check for actual screenshot patterns
    const now = Date.now();
    
    // Simulate screenshot detection more frequently for testing
    this.screenshotAttempts++;
    
    // Trigger detection every 10 checks (5 seconds)
    if (this.screenshotAttempts >= 10) {
      console.log('🚫 Simulated screenshot detection for testing');
      this.handleScreenshotDetection();
      this.screenshotAttempts = 0;
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
  } {
    return {
      enabled: this.isProtectionEnabled,
      platform: Platform.OS,
      monitoring: !!this.protectionInterval,
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
      this.stopProtectionMonitoring();
      this.appStateChangeCount = 0;
      this.lastDetectionTime = 0;
      console.log('🧹 Simple content protection cleaned up');
    } catch (error) {
      console.error('❌ Error cleaning up simple content protection:', error);
    }
  }
}

// Export singleton instance
export default new SimpleContentProtection();
