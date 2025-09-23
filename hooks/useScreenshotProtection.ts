import { useEffect, useRef } from 'react';
import ScreenshotProtectionService from '../services/ScreenshotProtectionService';

/**
 * Custom hook for managing screenshot protection
 * @param enabled - Whether to enable screenshot protection (default: true)
 * @param autoCleanup - Whether to automatically cleanup on unmount (default: true)
 */
export const useScreenshotProtection = (enabled: boolean = true, autoCleanup: boolean = true) => {
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const initializeProtection = async () => {
      try {
        if (!isInitialized.current) {
          await ScreenshotProtectionService.enableProtection();
          isInitialized.current = true;
          console.log('🔒 Screenshot protection enabled via hook');
        }
      } catch (error) {
        console.error('❌ Error enabling screenshot protection via hook:', error);
      }
    };

    initializeProtection();

    // Cleanup function
    return () => {
      if (autoCleanup && isInitialized.current) {
        ScreenshotProtectionService.cleanup();
        isInitialized.current = false;
        console.log('🔓 Screenshot protection disabled via hook cleanup');
      }
    };
  }, [enabled, autoCleanup]);

  // Return control functions
  return {
    enable: async () => {
      try {
        await ScreenshotProtectionService.enableProtection();
        isInitialized.current = true;
        console.log('🔒 Screenshot protection manually enabled');
      } catch (error) {
        console.error('❌ Error manually enabling screenshot protection:', error);
      }
    },
    disable: async () => {
      try {
        await ScreenshotProtectionService.disableProtection();
        isInitialized.current = false;
        console.log('🔓 Screenshot protection manually disabled');
      } catch (error) {
        console.error('❌ Error manually disabling screenshot protection:', error);
      }
    },
    temporarilyDisable: async () => {
      try {
        await ScreenshotProtectionService.temporarilyDisable();
        console.log('🔓 Screenshot protection temporarily disabled');
      } catch (error) {
        console.error('❌ Error temporarily disabling screenshot protection:', error);
      }
    },
    reEnable: async () => {
      try {
        await ScreenshotProtectionService.reEnable();
        console.log('🔒 Screenshot protection re-enabled');
      } catch (error) {
        console.error('❌ Error re-enabling screenshot protection:', error);
      }
    },
    isEnabled: () => ScreenshotProtectionService.isEnabled(),
  };
};

export default useScreenshotProtection;
