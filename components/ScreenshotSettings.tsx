import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import RealScreenshotBlocker from '../services/RealScreenshotBlocker';
import ScreenshotTestButton from './ScreenshotTestButton';

interface ScreenshotSettingsProps {
  onConfigChange?: (config: any) => void;
}

export default function ScreenshotSettings({ onConfigChange }: ScreenshotSettingsProps) {
  const [config, setConfig] = useState({
    enableHapticFeedback: true,
    enableVisualFeedback: true,
    enableLogging: true,
    blockScreenshots: true,
    blockScreenRecording: true,
    enableAdvancedDetection: true,
  });

  useEffect(() => {
    // Load current configuration
    const currentConfig = RealScreenshotBlocker.getConfig();
    setConfig({
      enableHapticFeedback: currentConfig.enableHapticFeedback,
      enableVisualFeedback: currentConfig.enableVisualFeedback,
      enableLogging: currentConfig.enableLogging,
      blockScreenshots: currentConfig.blockScreenshots,
      blockScreenRecording: currentConfig.blockScreenRecording,
      enableAdvancedDetection: currentConfig.enableSecureFlag,
    });
  }, []);

  const updateConfig = (key: string, value: boolean) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    
    // Update the blocker configuration
    RealScreenshotBlocker.updateConfig({ [key]: value });
    
    // Notify parent component
    if (onConfigChange) {
      onConfigChange(newConfig);
    }
  };

  const showStats = () => {
    const stats = RealScreenshotBlocker.getStats();
    Alert.alert(
      'Screenshot Protection Stats',
      `Attempts Blocked: ${stats.attempts}\n` +
      `Last Attempt: ${stats.lastAttempt ? new Date(stats.lastAttempt).toLocaleString() : 'Never'}\n` +
      `Overlay Active: ${stats.overlayActive ? 'Yes' : 'No'}\n` +
      `Status: ${RealScreenshotBlocker.isBlockerEnabled() ? 'Active' : 'Inactive'}`,
      [{ text: 'OK' }]
    );
  };

  const testProtection = () => {
    Alert.alert(
      'Test Protection',
      'To test screenshot protection, try taking a screenshot of this app. The protection will detect the attempt and show a warning.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔒 Screenshot Protection</Text>
      <Text style={styles.subtitle}>
        Configure screenshot and screen recording protection
      </Text>

      <View style={styles.section}>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Block Screenshots</Text>
            <Text style={styles.settingDescription}>
              Prevent users from taking screenshots of the app
            </Text>
          </View>
          <Switch
            value={config.blockScreenshots}
            onValueChange={(value) => updateConfig('blockScreenshots', value)}
            trackColor={{ false: '#767577', true: '#E50914' }}
            thumbColor={config.blockScreenshots ? '#FFFFFF' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Block Screen Recording</Text>
            <Text style={styles.settingDescription}>
              Prevent users from recording the app screen
            </Text>
          </View>
          <Switch
            value={config.blockScreenRecording}
            onValueChange={(value) => updateConfig('blockScreenRecording', value)}
            trackColor={{ false: '#767577', true: '#E50914' }}
            thumbColor={config.blockScreenRecording ? '#FFFFFF' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Advanced Detection</Text>
            <Text style={styles.settingDescription}>
              Use advanced algorithms to detect screenshot attempts
            </Text>
          </View>
          <Switch
            value={config.enableAdvancedDetection}
            onValueChange={(value) => updateConfig('enableAdvancedDetection', value)}
            trackColor={{ false: '#767577', true: '#E50914' }}
            thumbColor={config.enableAdvancedDetection ? '#FFFFFF' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Feedback Settings</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Haptic Feedback</Text>
            <Text style={styles.settingDescription}>
              Provide vibration feedback when screenshot is attempted
            </Text>
          </View>
          <Switch
            value={config.enableHapticFeedback}
            onValueChange={(value) => updateConfig('enableHapticFeedback', value)}
            trackColor={{ false: '#767577', true: '#E50914' }}
            thumbColor={config.enableHapticFeedback ? '#FFFFFF' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Visual Warning</Text>
            <Text style={styles.settingDescription}>
              Show visual warning when screenshot is attempted
            </Text>
          </View>
          <Switch
            value={config.enableVisualFeedback}
            onValueChange={(value) => updateConfig('enableVisualFeedback', value)}
            trackColor={{ false: '#767577', true: '#E50914' }}
            thumbColor={config.enableVisualFeedback ? '#FFFFFF' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Debug Logging</Text>
            <Text style={styles.settingDescription}>
              Enable detailed logging for debugging purposes
            </Text>
          </View>
          <Switch
            value={config.enableLogging}
            onValueChange={(value) => updateConfig('enableLogging', value)}
            trackColor={{ false: '#767577', true: '#E50914' }}
            thumbColor={config.enableLogging ? '#FFFFFF' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.actionsSection}>
        <TouchableOpacity style={styles.actionButton} onPress={showStats}>
          <Text style={styles.actionButtonText}>📊 View Statistics</Text>
        </TouchableOpacity>
        
        <ScreenshotTestButton onScreenshotAttempt={testProtection} />
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>ℹ️ How It Works</Text>
        <Text style={styles.infoText}>
          • Monitors app state changes to detect screenshot attempts{'\n'}
          • Uses advanced algorithms to identify suspicious patterns{'\n'}
          • Provides immediate feedback when violations are detected{'\n'}
          • Works on both iOS and Android platforms{'\n'}
          • Respects user privacy and device security
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E50914',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2a2a2a',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#444',
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 18,
  },
  actionsSection: {
    marginBottom: 30,
  },
  actionButton: {
    backgroundColor: '#E50914',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.3)',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E50914',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
});
