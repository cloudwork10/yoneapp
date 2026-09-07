import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FixedBackBar from './FixedBackBar';
import { fetchLegalPage } from '../utils/legalPages';

export type LegalSection = {
  id?: string;
  title: string;
  body: string;
};

export type LegalPageData = {
  title: string;
  subtitle?: string;
  sections: LegalSection[];
};

const HERO_TITLES = ['brand name', 'arabic name', 'tagline', 'intro'];

function isHeroSection(title?: string) {
  return HERO_TITLES.includes(String(title || '').trim().toLowerCase());
}

function sectionBody(sections: LegalSection[] = [], title: string) {
  const match = sections.find(
    (section) => String(section.title || '').trim().toLowerCase() === title.toLowerCase()
  );
  return (match?.body || '').trim();
}

type Props = {
  slug: string;
  fallback: LegalPageData;
  showAboutHero?: boolean;
};

export default function LegalPageView({ slug, fallback, showAboutHero }: Props) {
  const [page, setPage] = useState<LegalPageData>(fallback);
  const heroName = sectionBody(page.sections, 'Brand name') || 'ELNADY';
  const heroArabic = sectionBody(page.sections, 'Arabic name');
  const heroTagline = sectionBody(page.sections, 'Tagline');
  const heroIntro = sectionBody(page.sections, 'Intro');
  const visibleSections = showAboutHero
    ? page.sections.filter((section) => !isHeroSection(section.title))
    : page.sections;

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      fetchLegalPage(slug, fallback).then((next) => {
        if (alive) setPage(next);
      });
      return () => {
        alive = false;
      };
    }, [slug])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#000000', '#1a1a1a', '#000000']} style={styles.container}>
        <FixedBackBar />
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>{page.title}</Text>
            {page.subtitle ? <Text style={styles.subtitle}>{page.subtitle}</Text> : null}
          </View>

          {showAboutHero ? (
            <View style={styles.heroSection}>
              <View style={styles.logoContainer}>
                <Text style={styles.logoText}>Y</Text>
              </View>
              <Text style={styles.appName}>{heroName}</Text>
              {heroArabic ? <Text style={styles.appNameArabic}>{heroArabic}</Text> : null}
              {heroTagline ? <Text style={styles.appTagline}>{heroTagline}</Text> : null}
              {heroIntro ? <Text style={styles.appDescription}>{heroIntro}</Text> : null}
            </View>
          ) : null}

          <View style={styles.content}>
            {visibleSections.map((section, index) => (
              <View key={section.id || `${section.title}-${index}`} style={styles.section}>
                {section.title ? <Text style={styles.sectionTitle}>{section.title}</Text> : null}
                {section.body ? <Text style={styles.sectionText}>{section.body}</Text> : null}
              </View>
            ))}
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000000' },
  container: { flex: 1 },
  scrollView: { flex: 1 },
  header: { padding: 20, paddingTop: 10 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#CCCCCC', marginBottom: 12 },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 24,
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.2)',
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E50914',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoText: { fontSize: 36, fontWeight: 'bold', color: '#FFFFFF' },
  appName: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', letterSpacing: 2 },
  appNameArabic: { fontSize: 16, color: '#CCCCCC', marginTop: 4 },
  appTagline: { fontSize: 16, color: '#E50914', marginTop: 10, fontWeight: '600' },
  appDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 16,
    lineHeight: 22,
  },
  content: { paddingHorizontal: 20, paddingBottom: 30 },
  section: {
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#E50914',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E50914',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 15,
    color: '#E8E8E8',
    lineHeight: 24,
    fontWeight: '400',
  },
});
