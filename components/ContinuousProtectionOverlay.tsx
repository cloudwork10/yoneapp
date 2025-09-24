import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import RealScreenshotBlocker from '../services/RealScreenshotBlocker';

const { width, height } = Dimensions.get('window');

interface ContinuousProtectionOverlayProps {
  visible: boolean;
  onToggle?: (enabled: boolean) => void;
}

export default function ContinuousProtectionOverlay({ visible, onToggle }: ContinuousProtectionOverlayProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (visible) {
      showOverlay();
    } else {
      hideOverlay();
    }
  }, [visible]);

  const showOverlay = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsActive(true);
  };

  const hideOverlay = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsActive(false);
    });
  };

  const toggleProtection = () => {
    const newState = !isActive;
    setIsActive(newState);
    
    if (onToggle) {
      onToggle(newState);
    }
    
    if (newState) {
      showOverlay();
    } else {
      hideOverlay();
    }
  };

  if (!visible) return null;

  return (
    <Animated.View 
      style={[
        styles.overlay,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      {/* Semi-transparent protection layer */}
      <View style={styles.protectionLayer}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🛡️</Text>
          </View>
          
          <Text style={styles.title}>Content Protection Active</Text>
          <Text style={styles.subtitle}>
            Screenshots and recordings are blocked
          </Text>
          
          <TouchableOpacity 
            style={styles.toggleButton}
            onPress={toggleProtection}
          >
            <Text style={styles.toggleButtonText}>
              {isActive ? 'Disable Protection' : 'Enable Protection'}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.statusBar}>
            <View style={[styles.statusIndicator, { backgroundColor: isActive ? '#E50914' : '#666' }]} />
            <Text style={styles.statusText}>
              {isActive ? 'Protection Active' : 'Protection Inactive'}
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99998,
  },
  protectionLayer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E50914',
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
    minWidth: width * 0.8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(229, 9, 20, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#E50914',
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E50914',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  toggleButton: {
    backgroundColor: '#E50914',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  toggleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});
