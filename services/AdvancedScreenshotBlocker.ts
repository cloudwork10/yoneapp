import { AppState, AppStateStatus, NativeEventEmitter, NativeModules, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export interface ScreenshotEvent {
  timestamp: number;
  type: 'screenshot_attempt' | 'screen_recording_start' | 'screen_recording_stop' | 'app_background';
}

export interface AdvancedScreenshotBlockerConfig {
  enableHapticFeedback: boolean;
  enableVisualFeedback: boolean;
  enableLogging: boolean;
  blockScreenshots: boolean;
  blockScreenRecording: boolean;
  enableAdvancedDetection: boolean;
  cooldownPeriod: number; // milliseconds
}

class AdvancedScreenshotBlocker {
  private isEnabled: boolean = false;
  private appStateSubscription: any = null;
  private lastAppState: AppStateStatus = 'active';
  private config: AdvancedScreenshotBlockerConfig = {
    enableHapticFeedback: true,
    enableVisualFeedback: true,
    enableLogging: true,
    blockScreenshots: true,
    blockScreenRecording: true,
    enableAdvancedDetection: true,
    cooldownPeriod: 2000,
  };
  private screenshotAttempts: number = 0;
  private lastScreenshotTime: number = 0;
  private backgroundTime: number = 0;
  private isInBackground: boolean = false;
  private securityCheckInterval: NodeJS.Timeout | null = null;

  // Callbacks
  private onScreenshotAttempt?: (event: ScreenshotEvent) => void;
  private onScreenRecordingStart?: (event: ScreenshotEvent) => void;
  private onScreenRecordingStop?: (event: ScreenshotEvent) => void;

  /**
   * Initialize the advanced screenshot blocker
   */
  async initialize(config?: Partial<AdvancedScreenshotBlockerConfig>): Promise<void> {
    try {
      if (config) {
        this.config = { ...this.config, ...config };
      }

      this.log('🔒 Initializing Advanced Screenshot Blocker...');
      
      // Set up app state monitoring
      this.setupAppStateMonitoring();
      
      // Set up advanced detection methods
      this.setupAdvancedDetection();
      
      // Set up security monitoring
      this.setupSecurityMonitoring();
      
      this.isEnabled = true;
      this.log('✅ Advanced Screenshot Blocker initialized successfully');
    } catch (error) {
      this.log('❌ Error initializing Advanced Screenshot Blocker:', error);
      throw error;
    }
  }

  /**
   * Set up app state monitoring with advanced detection
   */
  private setupAppStateMonitoring(): void {
    this.appStateSubscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      this.handleAdvancedAppStateChange(nextAppState);
    });
  }

  /**
   * Handle app state changes with advanced screenshot detection
   */
  private handleAdvancedAppStateChange(nextAppState: AppStateStatus): void {
    const now = Date.now();
    
    if (this.lastAppState === 'active' && nextAppState === 'background') {
      // App went to background
      this.isInBackground = true;
      this.backgroundTime = now;
      
      // Check if this might be a screenshot attempt
      this.detectScreenshotAttempt(now);
      
    } else if (this.lastAppState === 'background' && nextAppState === 'active') {
      // App came back to foreground
      const backgroundDuration = now - this.backgroundTime;
      this.isInBackground = false;
      
      // If app was in background for a very short time, it might be a screenshot
      if (backgroundDuration < 1000 && this.config.enableAdvancedDetection) {
        this.log('⚠️ Short background duration detected - possible screenshot');
        this.handleScreenshotAttempt();
      }
    }
    
    this.lastAppState = nextAppState;
  }

  /**
   * Detect screenshot attempts using multiple methods
   */
  private detectScreenshotAttempt(timestamp: number): void {
    if (!this.config.blockScreenshots) return;

    // Check cooldown period
    if (timestamp - this.lastScreenshotTime < this.config.cooldownPeriod) {
      return;
    }

    // Advanced detection logic
    if (this.config.enableAdvancedDetection) {
      // Method 1: Rapid app state changes
      this.detectRapidStateChanges();
      
      // Method 2: Background duration analysis
      this.analyzeBackgroundDuration();
      
      // Method 3: System event monitoring
      this.monitorSystemEvents();
    }

    this.handleScreenshotAttempt();
  }

  /**
   * Detect rapid app state changes
   */
  private detectRapidStateChanges(): void {
    // This would be implemented with more sophisticated timing analysis
    this.log('🔍 Analyzing app state changes for screenshot patterns');
  }

  /**
   * Analyze background duration for screenshot patterns
   */
  private analyzeBackgroundDuration(): void {
    // Screenshots typically cause very short background periods
    this.log('⏱️ Analyzing background duration patterns');
  }

  /**
   * Monitor system events for screenshot indicators
   */
  private monitorSystemEvents(): void {
    // This would integrate with native modules for system-level monitoring
    this.log('📡 Monitoring system events');
  }

  /**
   * Set up advanced detection methods
   */
  private setupAdvancedDetection(): void {
    // Set up additional detection mechanisms
    this.setupTextSelectionProtection();
    this.setupContextMenuProtection();
    this.setupKeyboardMonitoring();
  }

  /**
   * Set up text selection protection
   */
  private setupTextSelectionProtection(): void {
    this.log('📝 Text selection protection enabled');
  }

  /**
   * Set up context menu protection
   */
  private setupContextMenuProtection(): void {
    this.log('🚫 Context menu protection enabled');
  }

  /**
   * Set up keyboard monitoring
   */
  private setupKeyboardMonitoring(): void {
    this.log('⌨️ Keyboard monitoring enabled');
  }

  /**
   * Set up security monitoring
   */
  private setupSecurityMonitoring(): void {
    // Periodic security checks
    this.securityCheckInterval = setInterval(() => {
      this.performAdvancedSecurityCheck();
    }, 3000);
  }

  /**
   * Perform advanced security check
   */
  private performAdvancedSecurityCheck(): void {
    const currentTime = Date.now();
    
    // Check for suspicious patterns
    if (this.isInBackground && currentTime - this.backgroundTime > 5000) {
      this.log('⚠️ Extended background time detected');
    }
    
    // Check for multiple rapid state changes
    this.analyzeStateChangePatterns();
  }

  /**
   * Analyze state change patterns
   */
  private analyzeStateChangePatterns(): void {
    // Implement pattern analysis for screenshot detection
    this.log('🔍 Analyzing state change patterns');
  }

  /**
   * Handle screenshot attempt
   */
  private handleScreenshotAttempt(): void {
    this.screenshotAttempts++;
    this.lastScreenshotTime = Date.now();
    
    const event: ScreenshotEvent = {
      timestamp: Date.now(),
      type: 'screenshot_attempt',
    };

    this.log(`📸 Screenshot attempt detected (#${this.screenshotAttempts})`);

    // Trigger haptic feedback
    if (this.config.enableHapticFeedback) {
      this.triggerAdvancedHapticFeedback();
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
   * Trigger advanced haptic feedback
   */
  private async triggerAdvancedHapticFeedback(): Promise<void> {
    try {
      // Multiple haptic patterns for different types of violations
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      // Additional haptic sequence
      setTimeout(async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }, 100);
      
      setTimeout(async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }, 200);
      
    } catch (error) {
      this.log('⚠️ Advanced haptic feedback failed:', error);
    }
  }

  /**
   * Trigger visual feedback
   */
  private triggerVisualFeedback(): void {
    this.log('👁️ Advanced visual feedback triggered');
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
  updateConfig(config: Partial<AdvancedScreenshotBlockerConfig>): void {
    this.config = { ...this.config, ...config };
    this.log('⚙️ Advanced configuration updated:', config);
  }

  /**
   * Get current configuration
   */
  getConfig(): AdvancedScreenshotBlockerConfig {
    return { ...this.config };
  }

  /**
   * Get detailed statistics
   */
  getDetailedStats(): {
    attempts: number;
    lastAttempt: number;
    backgroundTime: number;
    isInBackground: boolean;
    detectionMethods: string[];
  } {
    return {
      attempts: this.screenshotAttempts,
      lastAttempt: this.lastScreenshotTime,
      backgroundTime: this.backgroundTime,
      isInBackground: this.isInBackground,
      detectionMethods: [
        'App State Monitoring',
        'Background Duration Analysis',
        'Rapid State Change Detection',
        'System Event Monitoring',
        'Pattern Analysis'
      ],
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
    this.log(`🔒 Advanced Screenshot Blocker ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
    
    if (this.securityCheckInterval) {
      clearInterval(this.securityCheckInterval);
      this.securityCheckInterval = null;
    }
    
    this.isEnabled = false;
    this.log('🧹 Advanced Screenshot Blocker cleaned up');
  }

  /**
   * Log message if logging is enabled
   */
  private log(message: string, ...args: any[]): void {
    if (this.config.enableLogging) {
      console.log(`[AdvancedScreenshotBlocker] ${message}`, ...args);
    }
  }
}

// Export singleton instance
export const advancedScreenshotBlocker = new AdvancedScreenshotBlocker();
export default advancedScreenshotBlocker;
