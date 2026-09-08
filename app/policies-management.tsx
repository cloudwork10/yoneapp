import { useUser } from '@/contexts/UserContext';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import API_BASE_URL from '../config/api';
import { getLegalPageFallback } from '../utils/legalPageDefaults';
import { loadLegalPageLocal, saveLegalPageLocal } from '../utils/legalPages';
import { makeAuthenticatedRequest } from '../utils/tokenRefresh';

type SectionForm = {
  id?: string;
  title: string;
  body: string;
};

const PAGES = [
  { slug: 'privacy', label: 'Privacy', preview: '/privacy-policy' },
  { slug: 'terms', label: 'Terms', preview: '/terms-conditions' },
  { slug: 'refund', label: 'Refund', preview: '/refund-policy' },
  { slug: 'about', label: 'About Us', preview: '/about-us' },
] as const;

export default function PoliciesManagementScreen() {
  const { isAdmin } = useUser();
  const initialPage = getLegalPageFallback('privacy');
  const [slug, setSlug] = useState<(typeof PAGES)[number]['slug']>('privacy');
  const [title, setTitle] = useState(initialPage.title);
  const [subtitle, setSubtitle] = useState(initialPage.subtitle);
  const [sections, setSections] = useState<SectionForm[]>(initialPage.sections);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const dirtyRef = useRef(false);

  useEffect(() => {
    if (!isAdmin) {
      Alert.alert('Access Denied', 'Admin only', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  }, [isAdmin]);

  const applyPage = (page: { title?: string; subtitle?: string; sections?: SectionForm[] }) => {
    setTitle(page.title || '');
    setSubtitle(page.subtitle || '');
    setSections(
      Array.isArray(page.sections)
        ? page.sections.map((section) => ({
            id: section.id,
            title: section.title || '',
            body: section.body || '',
          }))
        : []
    );
    setDirty(false);
    dirtyRef.current = false;
  };

  const load = useCallback(async (nextSlug: (typeof PAGES)[number]['slug']) => {
    setSlug(nextSlug);
    setLoading(true);
    applyPage(getLegalPageFallback(nextSlug));

    const local = await loadLegalPageLocal(nextSlug);
    if (local && !dirtyRef.current) applyPage(local);

    try {
      const res = await makeAuthenticatedRequest(
        `${API_BASE_URL}/api/admin/legal-pages/${nextSlug}`
      );
      const data = await res.json();
      if (res.ok && data?.data?.page?.title && !dirtyRef.current) {
        applyPage(data.data.page);
        await saveLegalPageLocal(nextSlug, data.data.page);
      }
    } catch {
      // Keep the current written content so every section stays editable.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) load('privacy');
  }, [isAdmin, load]);

  const switchPage = (nextSlug: (typeof PAGES)[number]['slug']) => {
    if (nextSlug === slug) return;
    if (dirty) {
      Alert.alert('Unsaved changes', 'Save this page first, or discard the edits.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => load(nextSlug) },
      ]);
      return;
    }
    load(nextSlug);
  };

  const markDirty = () => {
    dirtyRef.current = true;
    setDirty(true);
  };

  const updateSection = (index: number, patch: Partial<SectionForm>) => {
    setSections((prev) => prev.map((section, i) => (i === index ? { ...section, ...patch } : section)));
    markDirty();
  };

  const addSection = () => {
    setSections((prev) => [...prev, { title: '', body: '' }]);
    markDirty();
  };

  const deleteSection = (index: number) => {
    Alert.alert('Delete section', 'Remove this block from the page?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setSections((prev) => prev.filter((_, i) => i !== index));
          markDirty();
        },
      },
    ]);
  };

  const save = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Page title is required');
      return;
    }
    const nextPage = {
      title: title.trim(),
      subtitle: subtitle.trim(),
      sections: sections.map((section) => ({
        title: section.title,
        body: section.body,
      })),
    };

    try {
      setSaving(true);
      await saveLegalPageLocal(slug, nextPage);
      applyPage(nextPage);

      const res = await makeAuthenticatedRequest(`${API_BASE_URL}/api/admin/legal-pages/${slug}`, {
        method: 'PUT',
        body: JSON.stringify(nextPage),
      });
      const data = await res.json();
      if (res.ok && data?.data?.page) {
        applyPage(data.data.page);
        await saveLegalPageLocal(slug, data.data.page);
      }
      Alert.alert('Saved', 'Open the public page to see the updated text.');
    } catch (error: any) {
      Alert.alert('Saved on this device', error?.message || 'The public page in the app is updated.');
    } finally {
      setSaving(false);
    }
  };

  const previewRoute = PAGES.find((page) => page.slug === slug)?.preview || '/about-us';

  if (!isAdmin) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={['#000000', '#1a1a1a', '#000000']} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Policies Management</Text>
          <Text style={styles.subtitle}>
            Every current section is loaded here. Edit any heading or paragraph, add a new
            block, or delete one.
          </Text>

          <View style={styles.chips}>
            {PAGES.map((page) => (
              <TouchableOpacity
                key={page.slug}
                style={[styles.chip, slug === page.slug && styles.chipActive]}
                onPress={() => switchPage(page.slug)}
              >
                <Text style={[styles.chipText, slug === page.slug && styles.chipTextActive]}>
                  {page.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {loading ? (
            <View style={styles.inlineLoad}>
              <ActivityIndicator color="#E50914" />
              <Text style={styles.muted}>Loading current text…</Text>
            </View>
          ) : null}

          <>
              <Text style={styles.label}>Page title</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={(value) => {
                  setTitle(value);
                  markDirty();
                }}
                placeholder="Page title"
                placeholderTextColor="#666"
              />

              <Text style={styles.label}>Subtitle</Text>
              <TextInput
                style={styles.input}
                value={subtitle}
                onChangeText={(value) => {
                  setSubtitle(value);
                  markDirty();
                }}
                placeholder="Short line under the title"
                placeholderTextColor="#666"
              />

              <View style={styles.sectionHead}>
                <Text style={styles.sectionTitle}>Sections</Text>
                <TouchableOpacity onPress={addSection}>
                  <Text style={styles.addLink}>+ Add section</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.hint}>
                Each block is a heading + text. Delete any block you do not want.
              </Text>

              {sections.length === 0 ? (
                <Text style={styles.muted}>No sections. Tap + Add section.</Text>
              ) : (
                sections.map((section, index) => (
                  <View key={section.id || `section-${index}`} style={styles.block}>
                    <Text style={styles.blockTitle}>Section {index + 1}</Text>
                    <TextInput
                      style={styles.input}
                      value={section.title}
                      onChangeText={(value) => updateSection(index, { title: value })}
                      placeholder="Heading"
                      placeholderTextColor="#666"
                    />
                    <TextInput
                      style={[styles.input, styles.textarea]}
                      value={section.body}
                      onChangeText={(value) => updateSection(index, { body: value })}
                      placeholder="Write any text here"
                      placeholderTextColor="#666"
                      multiline
                    />
                    <TouchableOpacity onPress={() => deleteSection(index)}>
                      <Text style={styles.deleteLink}>Delete this section</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}

              <TouchableOpacity style={styles.saveBtn} onPress={save} disabled={saving}>
                <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save page'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.previewBtn}
                onPress={() => router.push(previewRoute as any)}
              >
                <Text style={styles.previewBtnText}>Preview public page</Text>
              </TouchableOpacity>
          </>

          <View style={{ height: 40 }} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  flex: { flex: 1 },
  content: { padding: 20 },
  inlineLoad: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  back: { color: '#fff', fontSize: 16, marginBottom: 12 },
  title: { color: '#fff', fontSize: 26, fontWeight: '800' },
  subtitle: { color: '#888', marginBottom: 18, marginTop: 6, lineHeight: 20 },
  label: { color: '#bbb', marginBottom: 6, marginTop: 10, fontSize: 13 },
  hint: { color: '#666', fontSize: 12, marginBottom: 10, lineHeight: 18 },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 10,
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  textarea: { minHeight: 140, textAlignVertical: 'top' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chip: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActive: { backgroundColor: '#E50914', borderColor: '#E50914' },
  chipText: { color: '#aaa', fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  sectionHead: {
    marginTop: 18,
    marginBottom: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  addLink: { color: '#E50914', fontWeight: '700' },
  block: {
    backgroundColor: '#121212',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#222',
  },
  blockTitle: { color: '#E50914', fontWeight: '800', marginBottom: 8 },
  deleteLink: { color: '#ff6b6b', marginTop: 4, marginBottom: 4 },
  saveBtn: {
    backgroundColor: '#E50914',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  previewBtn: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  previewBtnText: { color: '#ddd', fontWeight: '600' },
  muted: { color: '#888' },
});
