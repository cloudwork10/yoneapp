import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Alert, Linking, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TopCVScreen() {
  const [selectedCV, setSelectedCV] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const cvTemplates = [
    { 
      id: 1, 
      name: 'Ahmed Hassan',
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

  const handleDownload = async (cv) => {
    try {
      const supported = await Linking.canOpenURL(cv.downloadUrl);
      if (supported) {
        await Linking.openURL(cv.downloadUrl);
        Alert.alert('Success', `Downloading ${cv.name}'s CV...`);
      } else {
        Alert.alert('Error', 'Cannot open download link');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to download CV');
    }
  };

  const openModal = (cv) => {
    setSelectedCV(cv);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
        <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Top CV Templates</Text>
          <Text style={styles.subtitle}>Professional templates for developers</Text>
        </View>

        <View style={styles.templatesContainer}>
          {cvTemplates.map((template) => (
            <TouchableOpacity 
              key={template.id} 
              style={styles.templateCard}
              onPress={() => openModal(template)}
            >
              <View style={styles.templateHeader}>
                <View style={styles.nameContainer}>
                  <Text style={styles.cvName}>{template.name}</Text>
                  <Text style={styles.templateTitle}>{template.title}</Text>
                </View>
                <View style={styles.ratingContainer}>
                  <Text style={styles.rating}>⭐ {template.rating}</Text>
                </View>
              </View>
              
              <Text style={styles.templateDescription}>{template.description}</Text>
              
              <View style={styles.templateFooter}>
                <View style={styles.statsContainer}>
                  <Text style={styles.downloads}>{template.downloads} downloads</Text>
                  <Text style={styles.experience}>{template.experience} experience</Text>
                </View>
                <TouchableOpacity 
                  style={styles.downloadButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleDownload(template);
                  }}
                >
                  <Text style={styles.downloadText}>📥 Download</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        </ScrollView>

        {/* CV Details Modal */}
        <Modal
          animationType="slide"
          transparent={false}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <SafeAreaView style={styles.modalOverlay}>
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
                        <Text style={styles.detailLabel}>Rating:</Text>
                        <Text style={styles.detailValue}>⭐ {selectedCV.rating}</Text>
                      </View>
                      
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Downloads:</Text>
                        <Text style={styles.detailValue}>{selectedCV.downloads}</Text>
                      </View>
                    </View>

                    <View style={styles.skillsSection}>
                      <Text style={styles.sectionTitle}>Skills</Text>
                      <View style={styles.skillsContainer}>
                        {selectedCV.skills.map((skill, index) => (
                          <View key={index} style={styles.skillTag}>
                            <Text style={styles.skillText}>{skill}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </ScrollView>

                  <View style={styles.modalFooter}>
                    <TouchableOpacity 
                      style={styles.downloadButtonLarge}
                      onPress={() => {
                        handleDownload(selectedCV);
                        setModalVisible(false);
                      }}
                    >
                      <Text style={styles.downloadButtonText}>📥 Download CV</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </SafeAreaView>
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
    marginBottom: 30,
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
  ratingContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rating: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '600',
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
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    flex: 1,
    width: '100%',
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
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  detailLabel: {
    fontSize: 14,
    color: '#999999',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
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
});
