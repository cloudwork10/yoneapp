import { AppState, AppStateStatus } from 'react-native';
import * as Haptics from 'expo-haptics';

class SimpleScreenshotBlocker {
  private isEnabled: boolean = false;
  private appStateSubscription: any = null;
  private lastAppState: AppStateStatus = 'active';
  private lastBackgroundTime: number = 0;

  /**
   * تفعيل منع لقطات الشاشة
   */
  enable(): void {
    if (this.isEnabled) return;

    console.log('🔒 تفعيل منع لقطات الشاشة...');
    
    this.appStateSubscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      this.handleAppStateChange(nextAppState);
    });
    
    this.isEnabled = true;
    console.log('✅ تم تفعيل منع لقطات الشاشة');
  }

  /**
   * إلغاء تفعيل منع لقطات الشاشة
   */
  disable(): void {
    if (!this.isEnabled) return;

    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
    
    this.isEnabled = false;
    console.log('❌ تم إلغاء تفعيل منع لقطات الشاشة');
  }

  /**
   * التعامل مع تغيير حالة التطبيق
   */
  private handleAppStateChange(nextAppState: AppStateStatus): void {
    const now = Date.now();
    
    // إذا التطبيق ذهب للخلفية
    if (this.lastAppState === 'active' && nextAppState === 'background') {
      this.lastBackgroundTime = now;
    }
    
    // إذا التطبيق عاد للمقدمة
    if (this.lastAppState === 'background' && nextAppState === 'active') {
      const backgroundDuration = now - this.lastBackgroundTime;
      
      // إذا كان في الخلفية أقل من ثانية = محاولة لقطة شاشة
      if (backgroundDuration < 1000) {
        this.blockScreenshot();
      }
    }
    
    this.lastAppState = nextAppState;
  }

  /**
   * منع لقطة الشاشة
   */
  private async blockScreenshot(): Promise<void> {
    console.log('📸 تم اكتشاف محاولة لقطة شاشة!');
    
    // اهتزاز قوي
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      console.log('خطأ في الاهتزاز:', error);
    }
  }

  /**
   * التحقق من حالة التفعيل
   */
  isActive(): boolean {
    return this.isEnabled;
  }
}

// تصدير نسخة واحدة
export const simpleScreenshotBlocker = new SimpleScreenshotBlocker();
export default simpleScreenshotBlocker;
