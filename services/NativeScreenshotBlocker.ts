import { NativeModules, Platform } from 'react-native';

interface NativeScreenshotBlockerInterface {
  setSecureFlag(enabled: boolean): Promise<void>;
  isSecureFlagEnabled(): Promise<boolean>;
  preventScreenshots(): Promise<void>;
  allowScreenshots(): Promise<void>;
}

// This would be the native module interface
const { ScreenshotBlockerModule } = NativeModules as {
  ScreenshotBlockerModule?: NativeScreenshotBlockerInterface;
};

class NativeScreenshotBlocker {
  private isSecureFlagEnabled: boolean = false;

  /**
   * Initialize native screenshot blocking
   */
  async initialize(): Promise<void> {
    try {
      console.log('🔒 Initializing Native Screenshot Blocker...');
      
      if (Platform.OS === 'android') {
        await this.setupAndroidProtection();
      } else if (Platform.OS === 'ios') {
        await this.setupIOSProtection();
      }
      
      console.log('✅ Native Screenshot Blocker initialized');
    } catch (error) {
      console.error('❌ Error initializing Native Screenshot Blocker:', error);
      throw error;
    }
  }

  /**
   * Set up Android protection using FLAG_SECURE
   */
  private async setupAndroidProtection(): Promise<void> {
    try {
      if (ScreenshotBlockerModule) {
        await ScreenshotBlockerModule.setSecureFlag(true);
        this.isSecureFlagEnabled = true;
        console.log('✅ Android FLAG_SECURE enabled');
      } else {
        console.log('⚠️ Native module not available, using fallback methods');
        await this.setupFallbackProtection();
      }
    } catch (error) {
      console.error('❌ Error setting up Android protection:', error);
      await this.setupFallbackProtection();
    }
  }

  /**
   * Set up iOS protection
   */
  private async setupIOSProtection(): Promise<void> {
    try {
      if (ScreenshotBlockerModule) {
        await ScreenshotBlockerModule.preventScreenshots();
        this.isSecureFlagEnabled = true;
        console.log('✅ iOS screenshot protection enabled');
      } else {
        console.log('⚠️ Native module not available, using fallback methods');
        await this.setupFallbackProtection();
      }
    } catch (error) {
      console.error('❌ Error setting up iOS protection:', error);
      await this.setupFallbackProtection();
    }
  }

  /**
   * Set up fallback protection methods
   */
  private async setupFallbackProtection(): Promise<void> {
    console.log('🛡️ Setting up fallback protection methods...');
    
    // These are the methods we're already using in the other services
    // App state monitoring, content protection overlay, etc.
    
    this.isSecureFlagEnabled = false;
  }

  /**
   * Enable screenshot blocking
   */
  async enableScreenshotBlocking(): Promise<void> {
    try {
      if (ScreenshotBlockerModule) {
        if (Platform.OS === 'android') {
          await ScreenshotBlockerModule.setSecureFlag(true);
        } else if (Platform.OS === 'ios') {
          await ScreenshotBlockerModule.preventScreenshots();
        }
        this.isSecureFlagEnabled = true;
        console.log('✅ Screenshot blocking enabled');
      }
    } catch (error) {
      console.error('❌ Error enabling screenshot blocking:', error);
    }
  }

  /**
   * Disable screenshot blocking
   */
  async disableScreenshotBlocking(): Promise<void> {
    try {
      if (ScreenshotBlockerModule) {
        if (Platform.OS === 'android') {
          await ScreenshotBlockerModule.setSecureFlag(false);
        } else if (Platform.OS === 'ios') {
          await ScreenshotBlockerModule.allowScreenshots();
        }
        this.isSecureFlagEnabled = false;
        console.log('✅ Screenshot blocking disabled');
      }
    } catch (error) {
      console.error('❌ Error disabling screenshot blocking:', error);
    }
  }

  /**
   * Check if secure flag is enabled
   */
  async isSecureFlagActive(): Promise<boolean> {
    try {
      if (ScreenshotBlockerModule) {
        return await ScreenshotBlockerModule.isSecureFlagEnabled();
      }
      return this.isSecureFlagEnabled;
    } catch (error) {
      console.error('❌ Error checking secure flag status:', error);
      return this.isSecureFlagEnabled;
    }
  }

  /**
   * Get protection status
   */
  getProtectionStatus(): {
    isEnabled: boolean;
    platform: string;
    nativeModuleAvailable: boolean;
    secureFlagActive: boolean;
  } {
    return {
      isEnabled: this.isSecureFlagEnabled,
      platform: Platform.OS,
      nativeModuleAvailable: !!ScreenshotBlockerModule,
      secureFlagActive: this.isSecureFlagEnabled,
    };
  }

  /**
   * Clean up
   */
  async cleanup(): Promise<void> {
    try {
      if (ScreenshotBlockerModule) {
        await this.disableScreenshotBlocking();
      }
      this.isSecureFlagEnabled = false;
      console.log('🧹 Native Screenshot Blocker cleaned up');
    } catch (error) {
      console.error('❌ Error cleaning up Native Screenshot Blocker:', error);
    }
  }
}

// Export singleton instance
export const nativeScreenshotBlocker = new NativeScreenshotBlocker();
export default nativeScreenshotBlocker;
