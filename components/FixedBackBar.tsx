import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { goBackOr } from '../utils/navigation';

type FixedBackBarProps = {
  label?: string;
  fallbackHref?: string;
};

export default function FixedBackBar({
  label = '← Back',
  fallbackHref = '/(tabs)/more',
}: FixedBackBarProps) {
  return (
    <View style={styles.bar}>
      <TouchableOpacity style={styles.backButton} onPress={() => goBackOr(fallbackHref)} activeOpacity={0.75}>
        <Text style={styles.backText}>{label}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 10,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    zIndex: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingRight: 12,
  },
  backText: {
    color: '#E50914',
    fontSize: 16,
    fontWeight: '600',
  },
});
