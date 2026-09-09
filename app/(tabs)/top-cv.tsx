import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Linking, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FixedBackBar from '../../components/FixedBackBar';
import API_BASE_URL from '../../config/api';
import { buildCvFilters, matchesCvFilter } from '../../utils/cvCategory';
import resolveMediaUrl from '../../utils/mediaUrl';

function toViewableCvUrl(raw?: string) {
  const resolved = resolveMediaUrl(raw || '');
  if (!resolved) return '';
  let url = String(resolved).trim();
  if (url.startsWith('www.')) url = `https://${url}`;
  if (!/^https?:\/\//i.test(url)) return '';

  const driveFile = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (driveFile) {
    return `https://drive.google.com/file/d/${driveFile[1]}/preview`;
  }
  const driveId = url.match(/[?&]id=([^&]+)/);
  if (/drive\.google\.com/i.test(url) && driveId) {
    return `https://drive.google.com/file/d/${driveId[1]}/preview`;
  }
  return url;
}

export default function TopCVScreen() {
  const [selectedCV, setSelectedCV] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [cvTemplates, setCvTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredTemplates = useMemo(
    () => cvTemplates.filter((cv) => matchesCvFilter(cv, selectedCategory)),
    [cvTemplates, selectedCategory]
  );
  const filters = useMemo(() => buildCvFilters(cvTemplates), [cvTemplates]);

  // Fetch CV templates from API
  useEffect(() => {
    fetchCVTemplates();
  }, []);

  const fetchCVTemplates = async (retryCount = 0) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/public/cv-templates`);
      
      if (response.ok) {
        const data = await response.json();
        setCvTemplates(
          (data.data.cvTemplates || []).map((cv) => ({
            ...cv,
            downloadUrl: resolveMediaUrl(cv.downloadUrl || ''),
          }))
        );
      } else if (response.status === 429 && retryCount < 3) {
        // Rate limited - retry after delay
        console.log(`Rate limited, retrying in ${(retryCount + 1) * 2} seconds...`);
        setTimeout(() => {
          fetchCVTemplates(retryCount + 1);
        }, (retryCount + 1) * 2000);
        return;
      } else {
        console.error('Failed to fetch CV templates:', response.status);
        // Fallback to sample data if API fails
        setCvTemplates(getSampleCVTemplates());
      }
    } catch (error) {
      console.error('Error fetching CV templates:', error);
      // Fallback to sample data if API fails
      setCvTemplates(getSampleCVTemplates());
    } finally {
      if (retryCount === 0) {
        setLoading(false);
      }
    }
  };

  const getSampleCVTemplates = () => [
    { 
      id: 1, 
      name: 'Ahmed Hassan',
      category: 'Frontend Developer',
      title: 'Frontend Developer CV', 
      description: 'Modern and clean design for frontend developers',
      downloads: 1250,
      rating: 4.8,
      price: 'Free',
      experience: '5+ years',
      skills: ['React', 'JavaScript', 'TypeScript', 'CSS', 'HTML'],
      education: 'Computer Science - Cairo University',
      downloadUrl: 'https://example.com/cv1.pdf'
    },
    { 
      id: 2, 
      name: 'Sarah Mohamed',
      category: 'Full Stack Developer',
      title: 'Full Stack Developer CV', 
      description: 'Comprehensive template for full stack developers',
      downloads: 980,
      rating: 4.7,
      price: 'Free',
      experience: '7+ years',
      skills: ['Node.js', 'React', 'MongoDB', 'Express', 'PostgreSQL'],
      education: 'Software Engineering - Alexandria University',
      downloadUrl: 'https://example.com/cv2.pdf'
    },
    { 
      id: 3, 
      name: 'Omar Ali',
      category: 'Mobile Developer',
      title: 'Mobile Developer CV', 
      description: 'Professional template for mobile app developers',
      downloads: 750,
      rating: 4.9,
      price: 'Free',
      experience: '4+ years',
      skills: ['React Native', 'Flutter', 'iOS', 'Android', 'Firebase'],
      education: 'Information Technology - Ain Shams University',
      downloadUrl: 'https://example.com/cv3.pdf'
    },
    { 
      id: 4, 
      name: 'Fatma Ibrahim',
      category: 'Backend Developer',
      title: 'Backend Developer CV', 
      description: 'Technical and detailed template for backend developers',
      downloads: 650,
      rating: 4.6,
      price: 'Free',
      experience: '6+ years',
      skills: ['Python', 'Django', 'PostgreSQL', 'Docker', 'AWS'],
      education: 'Computer Engineering - Mansoura University',
      downloadUrl: 'https://example.com/cv4.pdf'
    },
    { 
      id: 5, 
      name: 'Mahmoud Khalil',
      category: 'DevOps Engineer',
      title: 'DevOps Engineer CV', 
      description: 'Specialized template for DevOps professionals',
      downloads: 420,
      rating: 4.8,
      price: 'Free',
      experience: '8+ years',
      skills: ['Kubernetes', 'Docker', 'AWS', 'Jenkins', 'Terraform'],
      education: 'Systems Engineering - Helwan University',
      downloadUrl: 'https://example.com/cv5.pdf'
    },
    { 
      id: 6, 
      name: 'Nour El-Din',
      category: 'UI/UX Designer',
      title: 'UI/UX Designer CV', 
      description: 'Creative and visual template for designers',
      downloads: 890,
      rating: 4.9,
      price: 'Free',
      experience: '5+ years',
      skills: ['Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator'],
      education: 'Graphic Design - American University in Cairo',
      downloadUrl: 'https://example.com/cv6.pdf'
    },
  ];

  const handleViewCv = async (cv) => {
    const url = toViewableCvUrl(cv?.downloadUrl);
    if (!url) {
      if (!modalVisible) openModal(cv);
      Alert.alert(
        'No CV file',
        'This template has no PDF attached yet. Ask an admin to edit it and upload the file.'
      );
      return;
    }

    try {
      await WebBrowser.openBrowserAsync(url, {
        controlsColor: '#E50914',
        dismissButtonStyle: 'close',
        enableBarCollapsing: true,
        showInRecents: true,
        ...(Platform.OS === 'ios'
          ? { presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN }
          : { toolbarColor: '#111111' }),
      });
    } catch (error) {
      console.error('View CV error:', error);
      try {
        await Linking.openURL(url);
      } catch {
        Alert.alert('Error', 'Failed to open CV');
      }
    }
  };

  const openModal = (cv) => {
    setSelectedCV(cv);
    setModalVisible(true);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading CV templates...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
        <FixedBackBar returnToLastTab />
        <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Top CV Templates</Text>
          <Text style={styles.subtitle}>Professional templates for developers</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filters}
          contentContainerStyle={styles.filtersContent}
        >
          {filters.map((item) => (
            <TouchableOpacity
              key={item.value}
              style={[
                styles.filterChip,
                selectedCategory === item.value && styles.filterChipActive,
              ]}
              onPress={() => setSelectedCategory(item.value)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedCategory === item.value && styles.filterChipTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.templatesContainer}>
          {filteredTemplates.length === 0 ? (
            <Text style={styles.emptyText}>No CVs in this specialty yet.</Text>
          ) : null}
          {filteredTemplates.map((template, index) => (
            <View
              key={template._id || template.id || `cv-${index}`}
              style={styles.templateCard}
            >
              <TouchableOpacity onPress={() => openModal(template)} activeOpacity={0.85}>
                <View style={styles.templateHeader}>
                  <View style={styles.nameContainer}>
                    <Text style={styles.cvName}>{template.name}</Text>
                    <Text style={styles.templateTitle}>{template.title}</Text>
                  </View>
                </View>
                
                <Text style={styles.templateDescription}>{template.description}</Text>
              </TouchableOpacity>
              
              <View style={styles.templateFooter}>
                <View style={styles.statsContainer}>
                  <Text style={styles.experience}>{template.experience} experience</Text>
                  <Text style={styles.location}>📍 Cairo, Egypt</Text>
                </View>
                <TouchableOpacity 
                  style={styles.downloadButton}
                  onPress={() => handleViewCv(template)}
                >
                  <Text style={styles.downloadText}>View CV</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
        </ScrollView>

        {/* CV Details Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {selectedCV && (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>CV Details</Text>
                    <TouchableOpacity 
                      style={styles.closeButton}
                      onPress={() => setModalVisible(false)}
                    >
                      <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.modalBody}>
                    <View style={styles.cvInfoSection}>
                      <Text style={styles.cvNameLarge}>{selectedCV.name}</Text>
                      <Text style={styles.cvTitleLarge}>{selectedCV.title}</Text>
                      <Text style={styles.cvDescription}>{selectedCV.description}</Text>
                    </View>

                    <View style={styles.detailsSection}>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Experience:</Text>
                        <Text style={styles.detailValue}>{selectedCV.experience}</Text>
                      </View>
                      
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Education:</Text>
                        <Text style={styles.detailValue}>{selectedCV.education}</Text>
                      </View>
                      
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Location:</Text>
                        <Text style={styles.detailValue}>Cairo, Egypt</Text>
                      </View>
                      
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Availability:</Text>
                        <Text style={styles.detailValue}>Open to work</Text>
                      </View>
                    </View>

                    <View style={styles.skillsSection}>
                      <Text style={styles.sectionTitle}>Skills</Text>
                      <View style={styles.skillsContainer}>
                        {(selectedCV.skills || []).map((skill, index) => (
                          <View key={`skill-${index}-${skill}`} style={styles.skillTag}>
                            <Text style={styles.skillText}>{skill}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </ScrollView>

                  <View style={styles.modalFooter}>
                    <TouchableOpacity 
                      style={styles.downloadButtonLarge}
                      onPress={() => handleViewCv(selectedCV)}
                    >
                      <Text style={styles.downloadButtonText}>View CV</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 16,
  },
  filters: {
    marginBottom: 20,
    flexGrow: 0,
  },
  filtersContent: {
    paddingRight: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterChipActive: {
    backgroundColor: '#E50914',
    borderColor: '#E50914',
  },
  filterChipText: {
    color: '#CCCCCC',
    fontSize: 13,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  emptyText: {
    color: '#888888',
    textAlign: 'center',
    paddingVertical: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#CCCCCC',
  },
  templatesContainer: {
    gap: 20,
  },
  templateCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  nameContainer: {
    flex: 1,
  },
  cvName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E50914',
    marginBottom: 4,
  },
  templateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  templateDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 15,
    lineHeight: 20,
  },
  templateFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsContainer: {
    flex: 1,
  },
  downloads: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 2,
  },
  experience: {
    fontSize: 12,
    color: '#CCCCCC',
    fontWeight: '500',
    marginBottom: 2,
  },
  location: {
    fontSize: 12,
    color: '#999999',
  },
  downloadButton: {
    backgroundColor: '#E50914',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  downloadText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    width: '95%',
    height: '85%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  cvInfoSection: {
    marginBottom: 20,
  },
  cvNameLarge: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E50914',
    marginBottom: 8,
  },
  cvTitleLarge: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  cvDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  detailsSection: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  detailLabel: {
    fontSize: 14,
    color: '#999999',
    fontWeight: '500',
    flexShrink: 0,
    paddingTop: 1,
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'right',
    flexShrink: 1,
  },
  skillsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    backgroundColor: 'rgba(229, 9, 20, 0.2)',
    borderWidth: 1,
    borderColor: '#E50914',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  skillText: {
    color: '#E50914',
    fontSize: 12,
    fontWeight: '600',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  downloadButtonLarge: {
    backgroundColor: '#E50914',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  downloadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  // Disabled button styles
  downloadButtonDisabled: {
    backgroundColor: '#666666',
    opacity: 0.6,
  },
  downloadTextDisabled: {
    color: '#CCCCCC',
  },
});
