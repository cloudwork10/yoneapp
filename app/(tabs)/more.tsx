import { CONTACT_EMAIL } from '@/config/legal';
import { useUser } from '@/contexts/UserContext';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import resolveMediaUrl from '../../utils/mediaUrl';

type MenuItem = {
  id: number;
  title: string;
  description: string;
  icon: string;
  route: string;
  adminOnly?: boolean;
  pulse?: boolean;
};

type MenuSection = {
  id: string;
  title: string;
  items: MenuItem[];
  adminOnly?: boolean;
};

const ACCOUNT_SECTION: MenuSection = {
  id: 'account',
  title: 'Account',
  items: [
    {
      id: 1,
      title: 'Profile',
      description: 'View and edit your profile',
      icon: '👤',
      route: '/profile',
    },
    {
      id: 2,
      title: 'Subscription',
      description: 'Choose your premium plan',
      icon: '💎',
      route: '/subscription',
    },
    {
      id: 30,
      title: 'My Jobs',
      description: 'Jobs you posted · applicants',
      icon: '💼',
      route: '/my-jobs',
    },
  ],
};

const DISCOVER_SECTION: MenuSection = {
  id: 'discover',
  title: 'Discover',
  items: [
    {
      id: 25,
      title: 'Tech News',
      description: 'AI · frameworks · releases',
      icon: '📰',
      route: '/tech-news',
    },
    {
      id: 24,
      title: 'Egyptian Baccalaureate',
      description: 'Programming subjects · Coming soon',
      icon: '🏫',
      route: '/egyptian-baccalaureate',
    },
    {
      id: 29,
      title: 'Jobs',
      description: 'وظائف · قدّم من جوه التطبيق',
      icon: '💼',
      route: '/jobs',
    },
    {
      id: 23,
      title: 'Top CV',
      description: 'Professional CV templates',
      icon: '📄',
      route: '/(tabs)/top-cv',
    },
    {
      id: 26,
      title: 'Roadmaps',
      description: 'Clear learning paths step by step',
      icon: '🗺️',
      route: '/(tabs)/roadmaps',
    },
    {
      id: 28,
      title: 'Live',
      description: 'Community live',
      icon: '🔴',
      route: '/mubasher',
      pulse: true,
    },
  ],
};

const LIBRARY_SECTION: MenuSection = {
  id: 'library',
  title: 'Library',
  items: [
    {
      id: 21,
      title: 'Advices',
      description: 'Career tips and guidance',
      icon: '💡',
      route: '/(tabs)/advices',
    },
    {
      id: 22,
      title: 'Programming Terms',
      description: 'Searchable coding dictionary',
      icon: '📖',
      route: '/(tabs)/programming-terms',
    },
    {
      id: 27,
      title: 'Articles',
      description: 'Guides and long-form learning',
      icon: '📄',
      route: '/(tabs)/articles',
    },
    {
      id: 3,
      title: 'برنامج خواطر مبرمج',
      description: '10 حلقات من التجارب البرمجية',
      icon: '💭',
      route: '/programmer-thoughts',
    },
    {
      id: 4,
      title: 'مواعيد الصلاة',
      description: 'Prayer times and notifications',
      icon: '🕌',
      route: '/prayer-times',
    },
    {
      id: 5,
      title: 'Movies',
      description: 'Programming & coding films',
      icon: '🎬',
      route: '/movies',
    },
  ],
};

const SETTINGS_SECTION: MenuSection = {
  id: 'settings',
  title: 'Settings & Support',
  items: [
    {
      id: 7,
      title: 'Notification Settings',
      description: 'Manage notification preferences',
      icon: '🔔',
      route: '/notification-settings',
    },
    {
      id: 8,
      title: 'Contact · Support',
      description: CONTACT_EMAIL,
      icon: '📞',
      route: '/contact',
    },
  ],
};

const POLICIES_SECTION: MenuSection = {
  id: 'policies',
  title: 'Policies',
  items: [
    {
      id: 91,
      title: 'Privacy Policy',
      description: 'How we handle your data',
      icon: '🔒',
      route: '/privacy-policy',
    },
    {
      id: 92,
      title: 'Terms & Conditions',
      description: 'Rules for using ELNADY',
      icon: '📋',
      route: '/terms-conditions',
    },
    {
      id: 93,
      title: 'Refund Policy',
      description: 'Payments and refunds',
      icon: '💰',
      route: '/refund-policy',
    },
    {
      id: 94,
      title: 'About Us',
      description: 'Learn more about ELNADY',
      icon: '👥',
      route: '/about-us',
    },
  ],
};

const ADMIN_SECTION: MenuSection = {
  id: 'admin',
  title: '👑 Admin Panel',
  adminOnly: true,
  items: [
    {
      id: 10,
      title: 'Admin Dashboard',
      description: 'Users and system stats',
      icon: '👑',
      route: '/dashboard',
      adminOnly: true,
    },
    {
      id: 11,
      title: 'Content Management',
      description: 'Courses, articles, content',
      icon: '📝',
      route: '/content-management',
      adminOnly: true,
    },
    {
      id: 12,
      title: 'Club Management',
      description: 'دفعة · مسارات · لايف',
      icon: '🏟️',
      route: '/club-management',
      adminOnly: true,
    },
    {
      id: 14,
      title: 'Jobs Management',
      description: 'Approve and publish jobs',
      icon: '💼',
      route: '/jobs-management',
      adminOnly: true,
    },
    {
      id: 13,
      title: 'Tech News Admin',
      description: 'Refresh · pin · hide news',
      icon: '📰',
      route: '/tech-news',
      adminOnly: true,
    },
    {
      id: 15,
      title: 'Splash Preview',
      description: 'Preview app loading screen',
      icon: '🎬',
      route: '/app-loading?preview=1',
      adminOnly: true,
    },
  ],
};

function MenuRow({
  item,
  onPress,
  accent,
  compact,
}: {
  item: MenuItem;
  onPress: () => void;
  accent?: boolean;
  compact?: boolean;
}) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!item.pulse) return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.28,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [item.pulse, pulse]);

  return (
    <TouchableOpacity
      style={[
        styles.menuItem,
        accent && styles.menuItemAccent,
        compact && styles.menuItemCompact,
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View
        style={[
          styles.menuIcon,
          accent && styles.menuIconAccent,
          compact && styles.menuIconCompact,
          item.pulse && styles.menuIconLive,
        ]}
      >
        <Animated.Text
          style={[
            styles.iconText,
            compact && styles.iconTextCompact,
            item.pulse && { transform: [{ scale: pulse }], opacity: pulse.interpolate({
              inputRange: [1, 1.28],
              outputRange: [0.75, 1],
            }) },
          ]}
        >
          {item.icon}
        </Animated.Text>
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuTitle, compact && styles.menuTitleCompact]}>{item.title}</Text>
        <Text
          style={[styles.menuDescription, compact && styles.menuDescriptionCompact]}
          numberOfLines={2}
        >
          {item.description}
        </Text>
      </View>
      <Text style={[styles.arrow, compact && styles.arrowCompact]}>›</Text>
    </TouchableOpacity>
  );
}

function MenuSectionBlock({
  section,
  onItemPress,
  defaultExpanded,
}: {
  section: MenuSection;
  onItemPress: (route: string, adminOnly?: boolean) => void;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded ?? true);
  const isAdminSection = section.adminOnly;
  const isCompact = section.id === 'settings' || section.id === 'policies';

  return (
    <View style={[styles.sectionBlock, isAdminSection && styles.adminSectionBlock]}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => setExpanded((value) => !value)}
        activeOpacity={0.8}
      >
        <View style={styles.sectionHeaderText}>
          <Text style={[styles.sectionTitle, isAdminSection && styles.adminSectionTitle]}>
            {section.title}
          </Text>
          <Text style={styles.sectionHint}>{expanded ? 'Tap to collapse' : 'Tap to expand'}</Text>
        </View>
        <Text style={styles.sectionChevron}>{expanded ? '▾' : '▸'}</Text>
      </TouchableOpacity>

      {expanded ? (
        <View style={[styles.sectionItems, isCompact && styles.sectionItemsCompact]}>
          {section.items.map((item) => (
            <MenuRow
              key={item.id}
              item={item}
              accent={isAdminSection}
              compact={isCompact}
              onPress={() => onItemPress(item.route, item.adminOnly)}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

export default function MoreScreen() {
  const { user, isAdmin, logout } = useUser();

  const sections: MenuSection[] = [
    ACCOUNT_SECTION,
    DISCOVER_SECTION,
    LIBRARY_SECTION,
    SETTINGS_SECTION,
    POLICIES_SECTION,
    ...(isAdmin ? [ADMIN_SECTION] : []),
  ];

  const handleItemPress = (route: string, adminOnly?: boolean) => {
    if (adminOnly && !isAdmin) {
      Alert.alert('Access Denied', 'You need admin privileges.');
      return;
    }

    if (route === '/dashboard' || route === '/content-management' || route === '/club-management') {
      if (!isAdmin) {
        Alert.alert('Access Denied', 'You need admin privileges.');
        return;
      }
    }

    if (route.includes('?')) {
      const [pathname, query = ''] = route.split('?');
      const params = Object.fromEntries(
        query.split('&').filter(Boolean).map((pair) => {
          const [key, value = ''] = pair.split('=');
          return [key, decodeURIComponent(value)];
        })
      );
      router.push({ pathname: pathname as any, params });
      return;
    }

    router.push(route as any);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/app-loading');
        },
      },
    ]);
  };

  const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() || 'E';

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>More</Text>
            <Text style={styles.subtitle}>Account · settings · support</Text>
          </View>

          <TouchableOpacity
            style={styles.profileCard}
            onPress={() => router.push('/profile')}
            activeOpacity={0.85}
          >
            {user?.avatar ? (
              <Image
                source={{ uri: resolveMediaUrl(user.avatar) }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initial}</Text>
              </View>
            )}
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name || 'Guest'}</Text>
              <Text style={styles.profileMeta}>
                {isAdmin ? '👑 Admin account · tap for profile' : 'Tap for profile'}
              </Text>
            </View>
            {isAdmin ? (
              <View style={styles.adminBadge}>
                <Text style={styles.adminText}>👑 Admin</Text>
              </View>
            ) : null}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.subscribeBanner}
            onPress={() => router.push('/subscription')}
            activeOpacity={0.85}
          >
            <Text style={styles.subscribeBannerText}>Premium · Subscribe</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          {sections.map((section) => (
            <MenuSectionBlock
              key={section.id}
              section={section}
              onItemPress={handleItemPress}
              defaultExpanded={section.id !== 'admin'}
            />
          ))}

          <View style={styles.footer}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
            <Text style={styles.footerText}>ELNADY Learning Platform</Text>
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>
        </ScrollView>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#AAAAAA',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    gap: 10,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#E50914',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#222222',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
    minWidth: 0,
  },
  profileName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  profileMeta: {
    color: '#AAAAAA',
    fontSize: 12,
    marginTop: 2,
  },
  adminBadge: {
    backgroundColor: 'rgba(229, 9, 20, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.35)',
  },
  adminText: {
    color: '#E50914',
    fontSize: 11,
    fontWeight: '700',
  },
  subscribeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(229, 9, 20, 0.12)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.28)',
  },
  subscribeBannerText: {
    color: '#FF8A8A',
    fontSize: 14,
    fontWeight: '700',
  },
  sectionBlock: {
    marginBottom: 18,
  },
  adminSectionBlock: {
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.35)',
    borderRadius: 14,
    padding: 10,
    backgroundColor: 'rgba(229, 9, 20, 0.06)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E50914',
    letterSpacing: 0.3,
  },
  adminSectionTitle: {
    color: '#FF6B6B',
  },
  sectionHint: {
    fontSize: 11,
    color: '#777777',
    marginTop: 2,
  },
  sectionChevron: {
    color: '#888888',
    fontSize: 16,
    marginLeft: 8,
  },
  sectionItems: {
    gap: 10,
  },
  sectionItemsCompact: {
    marginHorizontal: 14,
    gap: 8,
    paddingBottom: 4,
  },
  menuItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemCompact: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  menuItemAccent: {
    backgroundColor: 'rgba(229, 9, 20, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.25)',
  },
  menuIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(229, 9, 20, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuIconCompact: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  menuIconAccent: {
    backgroundColor: 'rgba(229, 9, 20, 0.28)',
  },
  menuIconLive: {
    backgroundColor: 'rgba(229, 9, 20, 0.28)',
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.45)',
  },
  iconText: {
    fontSize: 20,
  },
  iconTextCompact: {
    fontSize: 17,
  },
  menuContent: {
    flex: 1,
    minWidth: 0,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  menuTitleCompact: {
    fontSize: 15,
    marginBottom: 1,
  },
  menuDescription: {
    fontSize: 12,
    color: '#AAAAAA',
    lineHeight: 17,
  },
  menuDescriptionCompact: {
    fontSize: 11,
    color: '#999999',
    lineHeight: 15,
  },
  arrow: {
    color: '#888888',
    fontSize: 22,
    fontWeight: '600',
    marginLeft: 6,
  },
  arrowCompact: {
    color: '#777777',
    fontSize: 18,
    marginLeft: 4,
  },
  footer: {
    marginTop: 8,
    alignItems: 'center',
    paddingVertical: 16,
  },
  logoutButton: {
    backgroundColor: 'rgba(229, 9, 20, 0.18)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.35)',
    marginBottom: 16,
    minWidth: 160,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#E50914',
    fontSize: 16,
    fontWeight: '700',
  },
  footerText: {
    fontSize: 14,
    color: '#CCCCCC',
    fontWeight: '600',
  },
  versionText: {
    fontSize: 12,
    color: '#777777',
    marginTop: 4,
  },
});
