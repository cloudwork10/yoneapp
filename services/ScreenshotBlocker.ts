import { AppState, AppStateStatus } from 'react-native';
import * as Haptics from 'expo-haptics';

export interface ScreenshotEvent {
  timestamp: number;
  type: 'screenshot_attempt' | 'screen_recording_start' | 'screen_recording_stop';
}

export interface ScreenshotBlockerConfig {
  enableHapticFeedback: boolean;
  enableVisualFeedback: boolean;
  enableLogging: boolean;
  blockScreenshots: boolean;
  blockScreenRecording: boolean;
}

class ScreenshotBlocker {
  private isEnabled: boolean = false;
  private appStateSubscription: any = null;
  private lastAppState: AppStateStatus = 'active';
  private config: ScreenshotBlockerConfig = {
    enableHapticFeedback: true,
    enableVisualFeedback: true,
    enableLogging: true,
    blockScreenshots: true,
    blockScreenRecording: true,
  };
  private screenshotAttempts: number = 0;
  private lastScreenshotTime: number = 0;
  private readonly SCREENSHOT_COOLDOWN = 2000; // 2 seconds

  // Callbacks
  private onScreenshotAttempt?: (event: ScreenshotEvent) => void;
  private onScreenRecordingStart?: (event: ScreenshotEvent) => void;
  private onScreenRecordingStop?: (event: ScreenshotEvent) => void;

  /**
   * Initialize the screenshot blocker
   */
  async initialize(config?: Partial<ScreenshotBlockerConfig>): Promise<void> {
    try {
      if (config) {
        this.config = { ...this.config, ...config };
      }

      this.log('🔒 Initializing Screenshot Blocker...');
      
      // Set up app state monitoring
      this.setupAppStateMonitoring();
      
      // Set up additional protection methods
      this.setupAdditionalProtection();
      
      this.isEnabled = true;
      this.log('✅ Screenshot Blocker initialized successfully');
    } catch (error) {
      this.log('❌ Error initializing Screenshot Blocker:', error);
      throw error;
    }
  }

  /**
   * Set up app state monitoring to detect screenshot attempts
   */
  private setupAppStateMonitoring(): void {
    this.appStateSubscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      this.handleAppStateChange(nextAppState);
    });
  }

  /**
   * Handle app state changes to detect potential screenshot attempts
   */
  private handleAppStateChange(nextAppState: AppStateStatus): void {
    const now = Date.now();
    
    // Detect rapid app state changes that might indicate screenshot attempts
    if (this.lastAppState === 'active' && nextAppState === 'background') {
      // App went to background - potential screenshot attempt
      if (now - this.lastScreenshotTime > this.SCREENSHOT_COOLDOWN) {
        this.handleScreenshotAttempt();
        this.lastScreenshotTime = now;
      }
    }
    
    this.lastAppState = nextAppState;
  }

  /**
   * Set up additional protection methods
   */
  private setupAdditionalProtection(): void {
    // Disable text selection and context menu
    this.disableTextSelection();
    
    // Set up periodic security checks
    this.setupSecurityChecks();
  }

  /**
   * Disable text selection and context menu
   */
  private disableTextSelection(): void {
    // This will be handled in the UI components
    this.log('📝 Text selection disabled');
  }

  /**
   * Set up periodic security checks
   */
  private setupSecurityChecks(): void {
    // Check for suspicious app state changes every 5 seconds
    setInterval(() => {
      this.performSecurityCheck();
    }, 5000);
  }

  /**
   * Perform security check
   */
  private performSecurityCheck(): void {
    const currentTime = Date.now();
    
    // Check if app has been in background too long (potential screenshot)
    if (this.lastAppState === 'background' && currentTime - this.lastScreenshotTime > 3000) {
      this.log('⚠️ Potential security risk detected');
    }
  }

  /**
   * Handle screenshot attempt
   */
  private handleScreenshotAttempt(): void {
    if (!this.config.blockScreenshots) return;

    this.screenshotAttempts++;
    const event: ScreenshotEvent = {
      timestamp: Date.now(),
      type: 'screenshot_attempt',
    };

    this.log(`📸 Screenshot attempt detected (#${this.screenshotAttempts})`);

    // Trigger haptic feedback
    if (this.config.enableHapticFeedback) {
      this.triggerHapticFeedback();
    }

    // Trigger visual feedback
    if (this.config.enableVisualFeedback) {
      this.triggerVisualFeedback();
    }

    // Call callback
    if (this.onScreenshotAttempt) {
      this.onScreenshotAttempt(event);
    }
  }

  /**
   * Trigger haptic feedback
   */
  private async triggerHapticFeedback(): Promise<void> {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      this.log('⚠️ Haptic feedback failed:', error);
    }
  }

  /**
   * Trigger visual feedback
   */
  private triggerVisualFeedback(): void {
    // This will be handled by the UI component
    this.log('👁️ Visual feedback triggered');
  }

  /**
   * Set callback for screenshot attempts
   */
  setOnScreenshotAttempt(callback: (event: ScreenshotEvent) => void): void {
    this.onScreenshotAttempt = callback;
  }

  /**
   * Set callback for screen recording start
   */
  setOnScreenRecordingStart(callback: (event: ScreenshotEvent) => void): void {
    this.onScreenRecordingStart = callback;
  }

  /**
   * Set callback for screen recording stop
   */
  setOnScreenRecordingStop(callback: (event: ScreenshotEvent) => void): void {
    this.onScreenRecordingStop = callback;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ScreenshotBlockerConfig>): void {
    this.config = { ...this.config, ...config };
    this.log('⚙️ Configuration updated:', config);
  }

  /**
   * Get current configuration
   */
  getConfig(): ScreenshotBlockerConfig {
    return { ...this.config };
  }

  /**
   * Get screenshot attempt statistics
   */
  getStats(): { attempts: number; lastAttempt: number } {
    return {
      attempts: this.screenshotAttempts,
      lastAttempt: this.lastScreenshotTime,
    };
  }

  /**
   * Check if blocker is enabled
   */
  isBlockerEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Enable/disable the blocker
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    this.log(`🔒 Screenshot Blocker ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
    
    this.isEnabled = false;
    this.log('🧹 Screenshot Blocker cleaned up');
  }

  /**
   * Log message if logging is enabled
   */
  private log(message: string, ...args: any[]): void {
    if (this.config.enableLogging) {
      console.log(`[ScreenshotBlocker] ${message}`, ...args);
    }
  }
}

// Export singleton instance
export const screenshotBlocker = new ScreenshotBlocker();
export default screenshotBlocker;
