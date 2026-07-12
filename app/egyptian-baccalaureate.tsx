import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SUBJECTS = [
  { name: 'Programming Fundamentals', ar: 'أساسيات البرمجة', icon: '💻' },
  { name: 'Algorithms & Logic', ar: 'الخوارزميات والمنطق', icon: '🧠' },
  { name: 'Problem Solving', ar: 'حل المشكلات', icon: '🧩' },
  { name: 'Data & Structures', ar: 'البيانات والهياكل', icon: '🗂️' },
];

export default function EgyptianBaccalaureateScreen() {
  const pulse = useRef(new Animated.Value(1)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 650, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 650, useNativeDriver: true }),
    ]).start();

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.06, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [fade, slide, pulse]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <LinearGradient
          colors={['#05070d', '#0b1220', '#121a2e', '#05070d']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.glowOrb} />
        <View style={[styles.glowOrb, styles.glowOrbSecondary]} />

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>

          <Animated.View
            style={[
              styles.hero,
              { opacity: fade, transform: [{ translateY: slide }] },
            ]}
          >
            <View style={styles.badgeRow}>
              <View style={styles.ageBadge}>
                <Text style={styles.ageBadgeText}>Ages 16–18</Text>
              </View>
              <View style={styles.trackBadge}>
                <Text style={styles.trackBadgeText}>Programming Only</Text>
              </View>
            </View>

            <Text style={styles.kicker}>Thanaweya Amma</Text>
            <Text style={styles.title}>Egyptian{'\n'}Baccalaureate</Text>
            <Text style={styles.titleAr}>نظام الثانوية العامة المصرية</Text>
            <Text style={styles.subtitle}>
              We'll focus only on programming subjects taught in Egyptian Thanaweya Amma — for ages 16–18.
            </Text>

            <Animated.View style={[styles.comingCard, { transform: [{ scale: pulse }] }]}>
              <LinearGradient
                colors={['rgba(229,9,20,0.95)', 'rgba(140,10,25,0.95)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.comingGradient}
              >
                <Text style={styles.comingLabel}>COMING SOON</Text>
                <Text style={styles.comingHint}>Programming lessons for Thanaweya Amma are on the way</Text>
              </LinearGradient>
            </Animated.View>
          </Animated.View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Programming track</Text>
            <Text style={styles.sectionSubtitle}>
              Only programming subjects from Egyptian Baccalaureate
            </Text>

            <View style={styles.subjectsGrid}>
              {SUBJECTS.map((subject) => (
                <View key={subject.name} style={styles.subjectCard}>
                  <Text style={styles.subjectIcon}>{subject.icon}</Text>
                  <Text style={styles.subjectName}>{subject.name}</Text>
                  <Text style={styles.subjectAr}>{subject.ar}</Text>
                  <View style={styles.lockPill}>
                    <Text style={styles.lockPillText}>Soon</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.footerNote}>
            <Text style={styles.footerText}>
              This section will cover programming subjects in Egyptian Thanaweya Amma only — no science materials.
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#05070d',
  },
  container: {
    flex: 1,
  },
  glowOrb: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(229, 9, 20, 0.14)',
    top: -40,
    right: -60,
  },
  glowOrbSecondary: {
    backgroundColor: 'rgba(78, 140, 255, 0.10)',
    top: '42%',
    left: -80,
    right: undefined,
  },
  scroll: {
    padding: 20,
    paddingBottom: 48,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: 18,
  },
  backText: {
    color: '#C8D0E0',
    fontSize: 17,
    fontWeight: '500',
  },
  hero: {
    marginBottom: 34,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  ageBadge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  ageBadgeText: {
    color: '#E8EEF8',
    fontSize: 12,
    fontWeight: '600',
  },
  trackBadge: {
    backgroundColor: 'rgba(78, 140, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(78, 140, 255, 0.28)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  trackBadgeText: {
    color: '#9CBCFF',
    fontSize: 12,
    fontWeight: '600',
  },
  kicker: {
    color: '#E50914',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '800',
    lineHeight: 42,
    letterSpacing: -0.8,
    marginBottom: 8,
  },
  titleAr: {
    color: '#B7C0D0',
    fontSize: 16,
    marginBottom: 12,
  },
  subtitle: {
    color: '#8B95A8',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 22,
    maxWidth: 340,
  },
  comingCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  comingGradient: {
    paddingVertical: 18,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  comingLabel: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 4,
  },
  comingHint: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 13,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: '#7E8899',
    fontSize: 13,
    marginBottom: 14,
  },
  subjectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  subjectCard: {
    width: '48.5%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 14,
    minHeight: 118,
  },
  subjectIcon: {
    fontSize: 22,
    marginBottom: 8,
  },
  subjectName: {
    color: '#F2F5FA',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  subjectAr: {
    color: '#8A93A5',
    fontSize: 12,
    marginBottom: 10,
  },
  lockPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(229, 9, 20, 0.14)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  lockPillText: {
    color: '#FF7A84',
    fontSize: 10,
    fontWeight: '700',
  },
  footerNote: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingTop: 16,
  },
  footerText: {
    color: '#6F788A',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});
