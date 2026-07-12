import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
    Dimensions,
    ImageBackground,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Linking,
    Animated,
    Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface Specialization {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    gradient: string[];
}

// رقم الواتساب بصيغة دولية بدون +
const WHATSAPP_NUMBER = '201064663594';
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;

const specializations: Specialization[] = [
    { id: '1', title: 'Cyber Security', description: 'Network & application security, penetration testing', icon: '🛡️', color: '#6C5CE7', gradient: ['#6C5CE7', '#4E44CE'] },
    { id: '2', title: 'Front end', description: 'React, HTML, CSS, modern UI development', icon: '🎯', color: '#00D4FF', gradient: ['#00D4FF', '#00B2FF'] },
    { id: '3', title: 'Back end', description: 'APIs, databases, Node.js, system design', icon: '🧠', color: '#20C997', gradient: ['#20C997', '#17A589'] },
    { id: '4', title: 'Mobile apps', description: 'iOS/Android apps with React Native', icon: '📱', color: '#4ECDC4', gradient: ['#4ECDC4', '#44A08D'] },
    { id: '5', title: 'DevOps', description: 'CI/CD, Docker, Kubernetes, cloud deployments', icon: '⚙️', color: '#FF9F1C', gradient: ['#FF9F1C', '#FF7F50'] },
    { id: '6', title: 'Data Analysis', description: 'Excel, SQL, BI tools, dashboards & insights', icon: '🧮', color: '#FDD85D', gradient: ['#FDD85D', '#F4C430'] },
    { id: '7', title: 'Data Science', description: 'Python, statistics, modeling & predictions', icon: '📊', color: '#95E1D3', gradient: ['#95E1D3', '#6CBFBF'] },
    { id: '8', title: 'Ai , ML', description: 'Machine learning and AI foundations', icon: '🤖', color: '#A29BFE', gradient: ['#A29BFE', '#7F72F4'] },
    { id: '9', title: 'Ui Ux', description: 'User research, wireframes, prototypes & testing', icon: '🎨', color: '#FF6B6B', gradient: ['#FF6B6B', '#EE5A6F'] },
    { id: '10', title: 'Media Buying', description: 'Advertising strategies and paid campaigns', icon: '🛒', color: '#00C48C', gradient: ['#00C48C', '#02A676'] },
    { id: '11', title: 'Soft Skills', description: 'Communication, teamwork, leadership & growth', icon: '🌟', color: '#FFC371', gradient: ['#FFC371', '#FF5F6D'] },
];

export default function ScholarshipScreen() {
    // Animated background values
    const circle1Y = useRef(new Animated.Value(0)).current;
    const circle2Y = useRef(new Animated.Value(0)).current;
    const circle3Scale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const float = (val: Animated.Value, distance: number, duration: number) => {
            return Animated.loop(
                Animated.sequence([
                    Animated.timing(val, {
                        toValue: distance,
                        duration,
                        easing: Easing.inOut(Easing.quad),
                        useNativeDriver: true,
                    }),
                    Animated.timing(val, {
                        toValue: -distance,
                        duration,
                        easing: Easing.inOut(Easing.quad),
                        useNativeDriver: true,
                    }),
                    Animated.timing(val, {
                        toValue: 0,
                        duration,
                        easing: Easing.inOut(Easing.quad),
                        useNativeDriver: true,
                    }),
                ])
            );
        };

        const pulse = (val: Animated.Value, min: number, max: number, duration: number) => {
            return Animated.loop(
                Animated.sequence([
                    Animated.timing(val, {
                        toValue: max,
                        duration,
                        easing: Easing.inOut(Easing.quad),
                        useNativeDriver: true,
                    }),
                    Animated.timing(val, {
                        toValue: min,
                        duration,
                        easing: Easing.inOut(Easing.quad),
                        useNativeDriver: true,
                    }),
                ])
            );
        };

        const a1 = float(circle1Y, 18, 4000);
        const a2 = float(circle2Y, 14, 5000);
        const a3 = pulse(circle3Scale, 0.95, 1.08, 3500);

        a1.start();
        a2.start();
        a3.start();

        return () => {
            a1.stop();
            a2.stop();
            a3.stop();
        };
    }, [circle1Y, circle2Y, circle3Scale]);

    const handleApply = () => {
        // Navigate to courses or application form
        router.push('/(tabs)/courses');
    };

    const handleSpecializationPress = (specialization: Specialization) => {
        // Navigate to courses filtered by specialization
        router.push('/(tabs)/courses');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView 
                style={styles.container}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <LinearGradient
                        colors={['#E50914', '#B20710', '#8B0000']}
                        style={styles.heroGradient}
                    >
                        {/* Animated background elements */}
                        <View style={styles.heroBackground}>
                            <Animated.View 
                                style={[
                                    styles.floatingCircle, 
                                    styles.circle1,
                                    { transform: [{ translateY: circle1Y }] }
                                ]} 
                            />
                            <Animated.View 
                                style={[
                                    styles.floatingCircle, 
                                    styles.circle2,
                                    { transform: [{ translateY: circle2Y }] }
                                ]} 
                            />
                            <Animated.View 
                                style={[
                                    styles.floatingCircle, 
                                    styles.circle3,
                                    { transform: [{ scale: circle3Scale }] }
                                ]} 
                            />
                        </View>

                        <View style={styles.heroContent}>
                            <View style={styles.badgesRow}>
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>🎓 LIVE SCHOLARSHIP</Text>
                                </View>
                                <View style={[styles.badge, styles.priceBadge]}>
                                    <Text style={styles.priceBadgeText}>Only 250 EGP</Text>
                                </View>
                            </View>
                            
                            <Text style={styles.heroTitle}>Scholarship Program</Text>
                            
                            <Text style={styles.heroSubtitle}>
                                Transform your career with our live scholarship program
                            </Text>

                            <Text style={styles.heroDescription}>
                                Not completely free. Program fee is 250 EGP to unlock premium live content, mentorship,
                                and certification support across multiple specializations.
                            </Text>

                            <TouchableOpacity 
                                style={styles.applyButton}
                                onPress={handleApply}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={['#FFFFFF', '#F5F5F5']}
                                    style={styles.applyButtonGradient}
                                >
                                    <Text style={styles.applyButtonText}>Apply Now →</Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.whatsappButton}
                                onPress={() => Linking.openURL(WHATSAPP_LINK)}
                                activeOpacity={0.9}
                            >
                                <LinearGradient
                                    colors={['#25D366', '#1EBE5D']}
                                    style={styles.whatsappButtonGradient}
                                >
                                    <View style={styles.whatsappContentRow}>
                                        <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" style={styles.whatsappRNIcon} />
                                        <Text style={styles.whatsappButtonText}>Contact via WhatsApp</Text>
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </View>

                {/* What's Included Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>What's Included</Text>
                    <View style={styles.benefitsGrid}>
                        <View style={styles.benefitCard}>
                            <Text style={styles.benefitIcon}>📚</Text>
                            <Text style={styles.benefitTitle}>Premium Courses</Text>
                            <Text style={styles.benefitText}>Access to all courses</Text>
                        </View>
                        <View style={styles.benefitCard}>
                            <Text style={styles.benefitIcon}>👨‍🏫</Text>
                            <Text style={styles.benefitTitle}>Live Sessions</Text>
                            <Text style={styles.benefitText}>Interactive live classes</Text>
                        </View>
                        <View style={styles.benefitCard}>
                            <Text style={styles.benefitIcon}>🎓</Text>
                            <Text style={styles.benefitTitle}>Certificates</Text>
                            <Text style={styles.benefitText}>Get certified upon completion</Text>
                        </View>
                        <View style={styles.benefitCard}>
                            <Text style={styles.benefitIcon}>💼</Text>
                            <Text style={styles.benefitTitle}>Career Support</Text>
                            <Text style={styles.benefitText}>Job placement assistance</Text>
                        </View>
                    </View>
                </View>

                {/* Specializations Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Available Specializations</Text>
                    <Text style={styles.sectionSubtitle}>
                        Choose your path and start your learning journey
                    </Text>

                    <View style={styles.specializationsContainer}>
                        {specializations.map((specialization, index) => (
                            <TouchableOpacity
                                key={specialization.id}
                                style={styles.specializationCard}
                                onPress={() => handleSpecializationPress(specialization)}
                                activeOpacity={0.8}
                            >
                                <ImageBackground
                                    source={{ uri: `https://picsum.photos/400/200?random=${index + 10}` }}
                                    style={styles.specializationImage}
                                    imageStyle={styles.specializationImageStyle}
                                >
                                    <LinearGradient
                                        colors={['transparent', 'rgba(0,0,0,0.9)']}
                                        style={styles.specializationGradient}
                                    >
                                        <View style={styles.specializationContent}>
                                            <View style={styles.specializationIconContainer}>
                                                <Text style={styles.specializationIcon}>
                                                    {specialization.icon}
                                                </Text>
                                            </View>
                                            <Text style={styles.specializationTitle}>
                                                {specialization.title}
                                            </Text>
                                            <Text style={styles.specializationDescription}>
                                                {specialization.description}
                                            </Text>
                                            <View style={styles.specializationButton}>
                                                <Text style={styles.specializationButtonText}>
                                                    Explore →
                                                </Text>
                                            </View>
                                        </View>
                                    </LinearGradient>
                                </ImageBackground>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* CTA Section */}
                <View style={styles.ctaSection}>
                    <LinearGradient
                        colors={['#1a1a1a', '#2d1b1b', '#1a1a1a']}
                        style={styles.ctaGradient}
                    >
                        <Text style={styles.ctaTitle}>Ready to Transform Your Career?</Text>
                        <Text style={styles.ctaSubtitle}>
                            Don't miss this opportunity. Apply now and start learning today!
                        </Text>
                        <TouchableOpacity 
                            style={styles.ctaButton}
                            onPress={handleApply}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={['#E50914', '#B20710']}
                                style={styles.ctaButtonGradient}
                            >
                                <Text style={styles.ctaButtonText}>Apply for Scholarship</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>
            </ScrollView>
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
    scrollContent: {
        paddingBottom: 100,
    },
    // Hero Section
    heroSection: {
        width: '100%',
        minHeight: height * 0.6,
    },
    heroGradient: {
        width: '100%',
        minHeight: height * 0.6,
        paddingTop: 40,
        paddingBottom: 40,
        paddingHorizontal: 20,
        position: 'relative',
        overflow: 'hidden',
    },
    heroBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    floatingCircle: {
        position: 'absolute',
        borderRadius: 100,
        opacity: 0.1,
    },
    circle1: {
        width: 200,
        height: 200,
        backgroundColor: '#FFFFFF',
        top: -50,
        right: -50,
    },
    circle2: {
        width: 150,
        height: 150,
        backgroundColor: '#FFFFFF',
        bottom: -30,
        left: -30,
    },
    circle3: {
        width: 100,
        height: 100,
        backgroundColor: '#FFFFFF',
        top: '50%',
        right: 50,
    },
    heroContent: {
        zIndex: 1,
        alignItems: 'center',
        marginTop: 20,
    },
    badgesRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 20,
    },
    badge: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        textAlign: 'center',
    },
    priceBadge: {
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderColor: 'rgba(255,255,255,0.25)',
        borderWidth: 1,
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    priceBadgeText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 0.5,
        textAlign: 'center',
    },
    heroTitle: {
        fontSize: 42,
        fontWeight: '900',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 16,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    heroSubtitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 12,
        opacity: 0.95,
    },
    heroDescription: {
        fontSize: 16,
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 32,
        paddingHorizontal: 20,
        opacity: 0.9,
        lineHeight: 24,
    },
    applyButton: {
        width: width - 80,
        height: 56,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    applyButtonGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    applyButtonText: {
        color: '#E50914',
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    // WhatsApp Button
    whatsappButton: {
        width: width - 80,
        height: 56,
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
    },
    whatsappButtonGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    whatsappContentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    whatsappRNIcon: {
        marginRight: 10,
    },
    whatsappButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
    // Section Styles
    section: {
        paddingHorizontal: 20,
        paddingVertical: 32,
    },
    sectionTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    sectionSubtitle: {
        fontSize: 16,
        color: '#CCCCCC',
        marginBottom: 24,
    },
    // Benefits Grid
    benefitsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    benefitCard: {
        width: (width - 60) / 2,
        backgroundColor: '#1a1a1a',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#2d2d2d',
        alignItems: 'center',
    },
    benefitIcon: {
        fontSize: 40,
        marginBottom: 12,
    },
    benefitTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 8,
        textAlign: 'center',
    },
    benefitText: {
        fontSize: 13,
        color: '#CCCCCC',
        textAlign: 'center',
    },
    // Specializations
    specializationsContainer: {
        marginTop: 16,
    },
    specializationCard: {
        width: '100%',
        height: 200,
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
    },
    specializationImage: {
        width: '100%',
        height: '100%',
    },
    specializationImageStyle: {
        borderRadius: 16,
    },
    specializationGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'flex-end',
        padding: 20,
    },
    specializationContent: {
        alignItems: 'flex-start',
    },
    specializationIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    specializationIcon: {
        fontSize: 28,
    },
    specializationTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    specializationDescription: {
        fontSize: 14,
        color: '#FFFFFF',
        opacity: 0.9,
        marginBottom: 12,
        lineHeight: 20,
    },
    specializationButton: {
        backgroundColor: '#E50914',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    specializationButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    // CTA Section
    ctaSection: {
        marginTop: 32,
        marginHorizontal: 20,
        marginBottom: 32,
        borderRadius: 20,
        overflow: 'hidden',
    },
    ctaGradient: {
        padding: 32,
        alignItems: 'center',
    },
    ctaTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 12,
    },
    ctaSubtitle: {
        fontSize: 16,
        color: '#CCCCCC',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 24,
    },
    ctaButton: {
        width: '100%',
        height: 56,
        borderRadius: 12,
        overflow: 'hidden',
    },
    ctaButtonGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    ctaButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});
