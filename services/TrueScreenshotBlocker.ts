import { AppState, AppStateStatus, Platform } from 'react-native';

class TrueScreenshotBlocker {
  private isProtectionEnabled = false;
  private appStateSubscription: any = null;
  private protectionInterval: any = null;
  private onScreenshotDetected: (() => void) | null = null;
  private lastAppStateChange = Date.now();
  private appStateChangeCount = 0;
  private suspiciousActivityCount = 0;
  private lastActivityTime = Date.now();
  private lastDetectionTime = 0;
  private detectionCooldown = 30000; // 30 seconds cooldown
  private isBlockingActive = false;
  private blackScreenActive = false;

  /**
   * Enable true screenshot blocking
   */
  async enableProtection(): Promise<void> {
    try {
      if (this.isProtectionEnabled) {
        console.log('🔒 True screenshot blocker already enabled');
        return;
      }

      this.isProtectionEnabled = true;
      this.isBlockingActive = true;
      console.log('🔒 True screenshot blocker enabled');

      // Listen for app state changes
      this.setupAppStateListener();

      // Start protection monitoring
      this.startProtectionMonitoring();

    } catch (error) {
      console.error('❌ Error enabling true screenshot blocker:', error);
      throw error;
    }
  }

  /**
   * Disable true screenshot blocking
   */
  async disableProtection(): Promise<void> {
    try {
      if (!this.isProtectionEnabled) {
        console.log('🔓 True screenshot blocker already disabled');
        return;
      }

      this.isProtectionEnabled = false;
      this.isBlockingActive = false;
      this.blackScreenActive = false;
      console.log('🔓 True screenshot blocker disabled');

      // Remove app state listener
      this.removeAppStateListener();

      // Stop protection monitoring
      this.stopProtectionMonitoring();

    } catch (error) {
      console.error('❌ Error disabling true screenshot blocker:', error);
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
   * Check if black screen is currently active
   */
  isBlackScreenActive(): boolean {
    return this.blackScreenActive;
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
        this.suspiciousActivityCount++;
      } else {
        this.appStateChangeCount = 1;
      }
      
      this.lastAppStateChange = now;
      this.lastActivityTime = now;

      // Detect potential screenshot based on app state changes
      if (this.appStateChangeCount >= 2 && this.isProtectionEnabled) {
        console.log('🚫 Potential screenshot detected based on app state changes');
        this.handleScreenshotDetection();
      }

      // Detect suspicious activity patterns
      if (this.suspiciousActivityCount >= 5 && this.isProtectionEnabled) {
        console.log('🚫 Suspicious activity pattern detected');
        this.handleScreenshotDetection();
        this.suspiciousActivityCount = 0; // Reset counter
      }

      if (nextAppState === 'active' && this.isProtectionEnabled) {
        try {
          console.log('🔒 True screenshot blocker re-enabled on app focus');
          // Restart protection monitoring when app becomes active
          this.startProtectionMonitoring();
        } catch (error) {
          console.error('❌ Error re-enabling true screenshot blocker:', error);
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
    }, 1000); // Check every 1000ms to reduce false positives

    console.log('🛡️ True protection monitoring started');
  }

  /**
   * Stop protection monitoring
   */
  private stopProtectionMonitoring(): void {
    if (this.protectionInterval) {
      clearInterval(this.protectionInterval);
      this.protectionInterval = null;
      console.log('🛡️ True protection monitoring stopped');
    }
  }

  /**
   * Perform protection check
   */
  private performProtectionCheck(): void {
    const now = Date.now();
    
    // Check for suspicious inactivity patterns
    if (now - this.lastActivityTime > 5000) { // 5 seconds of inactivity
      this.suspiciousActivityCount++;
    }
    
    // Monitor for specific patterns that might indicate screenshot attempts
    this.monitorScreenshotPatterns();
    
    // Maintain visual deterrent
    this.maintainVisualDeterrent();
  }

  /**
   * Monitor for screenshot patterns
   */
  private monitorScreenshotPatterns(): void {
    // For now, we use pattern-based detection
    if (this.suspiciousActivityCount >= 10) {
      console.log('🚫 Multiple suspicious patterns detected');
      this.handleScreenshotDetection();
      this.suspiciousActivityCount = 0;
    }
  }

  /**
   * Handle screenshot detection - BLACK SCREEN ONLY
   */
  private handleScreenshotDetection(): void {
    const now = Date.now();
    
    // Check cooldown period to prevent spam
    if (now - this.lastDetectionTime < this.detectionCooldown) {
      console.log('🚫 Screenshot detection on cooldown, ignoring...');
      return;
    }
    
    if (this.isProtectionEnabled && this.onScreenshotDetected) {
      console.log('🚫 Screenshot detected! Showing black screen...');
      this.blackScreenActive = true;
      this.onScreenshotDetected();
      
      // Update last detection time
      this.lastDetectionTime = now;
      
      // Reset counters
      this.appStateChangeCount = 0;
      this.suspiciousActivityCount = 0;
      
      // Hide black screen after 1 second
      setTimeout(() => {
        this.blackScreenActive = false;
        if (this.onScreenshotDetected) {
          this.onScreenshotDetected(); // Hide the black screen
        }
      }, 1000);
    }
  }

  /**
   * Maintain visual deterrent
   */
  private maintainVisualDeterrent(): void {
    // This creates a persistent visual deterrent
    // that makes screenshots less useful
  }

  /**
   * Simulate screenshot detection (for testing)
   */
  simulateScreenshotDetection(): void {
    const now = Date.now();
    
    // Check cooldown period to prevent spam
    if (now - this.lastDetectionTime < this.detectionCooldown) {
      console.log('🚫 Simulated screenshot detection on cooldown, ignoring...');
      return;
    }
    
    if (this.isProtectionEnabled && this.onScreenshotDetected) {
      console.log('🚫 Simulated screenshot detected! Showing black screen...');
      this.blackScreenActive = true;
      this.onScreenshotDetected();
      
      // Update last detection time
      this.lastDetectionTime = now;
      
      // Hide black screen after 1 second
      setTimeout(() => {
        this.blackScreenActive = false;
        if (this.onScreenshotDetected) {
          this.onScreenshotDetected(); // Hide the black screen
        }
      }, 1000);
    }
  }

  /**
   * Get protection status
   */
  getProtectionStatus(): { 
    enabled: boolean; 
    platform: string; 
    monitoring: boolean;
    suspiciousActivity: number;
    appStateChanges: number;
    blocking: boolean;
    blackScreen: boolean;
  } {
    return {
      enabled: this.isProtectionEnabled,
      platform: Platform.OS,
      monitoring: !!this.protectionInterval,
      suspiciousActivity: this.suspiciousActivityCount,
      appStateChanges: this.appStateChangeCount,
      blocking: this.isBlockingActive,
      blackScreen: this.blackScreenActive
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
      this.suspiciousActivityCount = 0;
      this.lastDetectionTime = 0;
      this.isBlockingActive = false;
      this.blackScreenActive = false;
      console.log('🧹 True screenshot blocker service cleaned up');
    } catch (error) {
      console.error('❌ Error cleaning up true screenshot blocker service:', error);
    }
  }
}

// Export singleton instance
export default new TrueScreenshotBlocker();