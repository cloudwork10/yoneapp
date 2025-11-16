import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import API_BASE_URL from '../config/api';
import { useUser } from '../contexts/UserContext';
import { makeAuthenticatedRequest } from '../utils/tokenRefresh';

const { width } = Dimensions.get('window');

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: number;
  discount: number;
  originalPrice: number;
}

export default function SubscriptionScreen() {
  const { user } = useUser();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);

  useEffect(() => {
    fetchPlans();
    fetchCurrentSubscription();
  }, []);

  const fetchPlans = async () => {
    try {
      console.log('Fetching subscription plans...');
      const response = await fetch(`${API_BASE_URL}/api/payments/plans`);
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Plans data received:', data);
      
      if (data.status === 'success') {
        setPlans(data.data.plans);
        console.log('Plans set successfully:', data.data.plans);
      } else {
        console.error('API returned error status:', data);
        Alert.alert('Error', data.message || 'Failed to fetch subscription plans');
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      Alert.alert('Error', 'Failed to fetch subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentSubscription = async () => {
    try {
      console.log('Fetching current subscription...');
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/payments/subscription`);
      console.log('Subscription response status:', response.status);
      
      if (!response.ok) {
        console.log('Subscription response not ok, status:', response.status);
        return;
      }
      
      const data = await response.json();
      console.log('Subscription data received:', data);
      
      if (data.status === 'success') {
        setCurrentSubscription(data.data.subscription);
        console.log('Current subscription set:', data.data.subscription);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) {
      Alert.alert('Error', 'Please select a subscription plan');
      return;
    }

    setSubscribing(true);

    try {
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: selectedPlan,
          paymentMethod: 'visa' // Default payment method
        }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        // Navigate to payment screen
        router.push({
          pathname: '/payment',
          params: {
            orderId: data.data.orderId,
            paymentKey: data.data.paymentKey,
            amount: data.data.amount,
            currency: data.data.currency,
            paymentMethod: data.data.paymentMethod,
            redirectUrl: data.data.redirectUrl
          }
        });
      } else {
        Alert.alert('Error', data.message || 'Failed to create payment order');
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      Alert.alert('Error', 'Failed to create subscription');
    } finally {
      setSubscribing(false);
    }
  };

  const renderPlanCard = (plan: SubscriptionPlan) => {
    const isSelected = selectedPlan === plan.id;
    const isPopular = plan.id === 'quarterly';

    return (
      <TouchableOpacity
        key={plan.id}
        style={[
          styles.planCard,
          isSelected && styles.selectedPlanCard,
          isPopular && styles.popularPlanCard
        ]}
        onPress={() => handlePlanSelect(plan.id)}
      >
        {isPopular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
          </View>
        )}
        
        <View style={styles.planHeader}>
          <Text style={styles.planName}>{plan.name}</Text>
          {plan.discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{plan.discount}%</Text>
            </View>
          )}
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>EGP {plan.price}</Text>
          <Text style={styles.priceUSD}>${Math.round(plan.price / 50)}</Text>
          {plan.discount > 0 && (
            <Text style={styles.originalPrice}>EGP {plan.originalPrice}</Text>
          )}
        </View>

        <Text style={styles.duration}>{plan.duration} days</Text>

        <View style={styles.featuresContainer}>
          <Text style={styles.featureText}>✅ All Premium Content</Text>
          <Text style={styles.featureText}>✅ Unlimited Access</Text>
          <Text style={styles.featureText}>✅ Priority Support</Text>
          <Text style={styles.featureText}>✅ No Ads</Text>
        </View>

        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Text style={styles.selectedText}>✓ Selected</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };


  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#E50914" />
            <Text style={styles.loadingText}>Loading subscription plans...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Choose Your Plan</Text>
            <Text style={styles.headerSubtitle}>Unlock all premium content</Text>
          </View>

          {/* Current Subscription Status */}
          {currentSubscription && (
            <View style={styles.currentSubscriptionContainer}>
              <Text style={styles.currentSubscriptionTitle}>Current Subscription</Text>
              <Text style={styles.currentSubscriptionText}>
                {currentSubscription.plan} - Active until {new Date(currentSubscription.endDate).toLocaleDateString()}
              </Text>
            </View>
          )}

          {/* Free Plan Info */}
          <View style={styles.freePlanContainer}>
            <Text style={styles.freePlanTitle}>Free Plan</Text>
            <Text style={styles.freePlanText}>
              • Limited access to content{'\n'}
              • Basic features only{'\n'}
              • Ad-supported experience
            </Text>
          </View>

          {/* Subscription Plans */}
          <View style={styles.plansContainer}>
            <Text style={styles.plansTitle}>Premium Plans</Text>
            {plans.map(renderPlanCard)}
          </View>

          {/* Subscribe Button */}
          <TouchableOpacity
            style={[
              styles.subscribeButton,
              !selectedPlan && styles.disabledButton
            ]}
            onPress={handleSubscribe}
            disabled={!selectedPlan || subscribing}
          >
            {subscribing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.subscribeButtonText}>
                {selectedPlan ? 'Continue to Payment' : 'Select a Plan'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Payment Methods */}
          <View style={styles.paymentMethodsContainer}>
            <Text style={styles.paymentMethodsTitle}>Payment Methods</Text>
            <View style={styles.paymentMethods}>
              <Text style={styles.paymentMethod}>💳 Visa/Mastercard</Text>
              <Text style={styles.paymentMethod}>📱 Vodafone Cash</Text>
              <Text style={styles.paymentMethod}>🏪 Fawry</Text>
              <Text style={styles.paymentMethod}>💰 Valu</Text>
            </View>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    color: '#E50914',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#CCCCCC',
  },
  currentSubscriptionContainer: {
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  currentSubscriptionTitle: {
    color: '#4ECDC4',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  currentSubscriptionText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  freePlanContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 20,
    marginBottom: 30,
    padding: 20,
    borderRadius: 15,
  },
  freePlanTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  freePlanText: {
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 20,
  },
  plansContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  plansTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  selectedPlanCard: {
    borderColor: '#E50914',
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
  },
  popularPlanCard: {
    borderColor: '#4ECDC4',
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
  },
  popularBadgeText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  planName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  discountBadge: {
    backgroundColor: '#E50914',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  price: {
    color: '#E50914',
    fontSize: 28,
    fontWeight: 'bold',
    marginRight: 10,
  },
  priceUSD: {
    color: '#4ECDC4',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  originalPrice: {
    color: '#CCCCCC',
    fontSize: 16,
    textDecorationLine: 'line-through',
  },
  duration: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 20,
  },
  featuresContainer: {
    marginBottom: 15,
  },
  featureText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 5,
  },
  selectedIndicator: {
    backgroundColor: '#E50914',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: 'center',
  },
  selectedText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  subscribeButton: {
    backgroundColor: '#E50914',
    marginHorizontal: 20,
    marginBottom: 30,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#666666',
  },
  subscribeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  paymentMethodsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  paymentMethodsTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  paymentMethods: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  paymentMethod: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 10,
    width: '48%',
  },
});
