import { AppState, AppStateStatus, Platform } from 'react-native';

class VisualContentProtection {
  private isProtectionEnabled = false;
  private appStateSubscription: any = null;
  private protectionInterval: any = null;
  private onScreenshotDetected: (() => void) | null = null;
  private lastAppStateChange = Date.now();
  private appStateChangeCount = 0;
  private lastDetectionTime = 0;
  private detectionCooldown = 30000; // 30 seconds cooldown
  private isBlockingActive = false;
  private lastActivityTime = Date.now();
  private inactivityCount = 0;

  /**
   * Enable visual content protection
   */
  async enableProtection(): Promise<void> {
    try {
      if (this.isProtectionEnabled) {
        console.log('🔒 Visual content protection already enabled');
        return;
      }

      this.isProtectionEnabled = true;
      this.isBlockingActive = true;
      console.log('🔒 Visual content protection enabled');

      // Listen for app state changes
      this.setupAppStateListener();

      // Start protection monitoring
      this.startProtectionMonitoring();

    } catch (error) {
      console.error('❌ Error enabling visual content protection:', error);
      throw error;
    }
  }

  /**
   * Disable visual content protection
   */
  async disableProtection(): Promise<void> {
    try {
      if (!this.isProtectionEnabled) {
        console.log('🔓 Visual content protection already disabled');
        return;
      }

      this.isProtectionEnabled = false;
      this.isBlockingActive = false;
      console.log('🔓 Visual content protection disabled');

      // Remove app state listener
      this.removeAppStateListener();

      // Stop protection monitoring
      this.stopProtectionMonitoring();

    } catch (error) {
      console.error('❌ Error disabling visual content protection:', error);
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
      if (timeSinceLastChange < 100) { // Less than 100ms - more sensitive
        this.appStateChangeCount++;
      } else {
        this.appStateChangeCount = 1;
      }
      
      this.lastAppStateChange = now;
      this.lastActivityTime = now;

      // Detect potential screenshot based on app state changes
      if (this.appStateChangeCount >= 3 && this.isProtectionEnabled) {
        console.log('🚫 Potential screenshot detected - showing protection overlay');
        this.handleScreenshotDetection();
      }

      if (nextAppState === 'active' && this.isProtectionEnabled) {
        try {
          console.log('🔒 Visual content protection re-enabled on app focus');
          this.startProtectionMonitoring();
        } catch (error) {
          console.error('❌ Error re-enabling visual content protection:', error);
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

    console.log('🛡️ Visual content protection monitoring started');
  }

  /**
   * Stop protection monitoring
   */
  private stopProtectionMonitoring(): void {
    if (this.protectionInterval) {
      clearInterval(this.protectionInterval);
      this.protectionInterval = null;
      console.log('🛡️ Visual content protection monitoring stopped');
    }
  }

  /**
   * Perform protection check
   */
  private performProtectionCheck(): void {
    // Visual content protection logic
    const now = Date.now();
    
    // Check for inactivity patterns that might indicate screenshot
    if (now - this.lastActivityTime > 5000) { // 5 seconds of inactivity
      this.inactivityCount++;
      
      // If user is inactive for too long, might be taking screenshot
      if (this.inactivityCount >= 5) {
        console.log('🚫 Inactivity pattern detected - showing protection overlay');
        this.handleScreenshotDetection();
        this.inactivityCount = 0;
      }
    } else {
      this.inactivityCount = 0;
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
      console.log('🚫 Screenshot detected! Showing visual protection...');
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
      this.inactivityCount = 0;
      console.log('🧹 Visual content protection cleaned up');
    } catch (error) {
      console.error('❌ Error cleaning up visual content protection:', error);
    }
  }
}

// Export singleton instance
export default new VisualContentProtection();
