import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '../contexts/UserContext';

interface PaymentParams {
  orderId: string;
  paymentKey: string;
  amount: string;
  currency: string;
  paymentMethod: string;
  redirectUrl: string;
}

export default function PaymentScreen() {
  const { user } = useUser();
  const params = useLocalSearchParams<PaymentParams>();
  const [loading, setLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(params.paymentMethod || 'visa');

  const paymentMethods = [
    {
      id: 'visa',
      name: 'Visa/Mastercard',
      icon: '💳',
      description: 'Pay with your credit or debit card'
    },
    {
      id: 'vodafone_cash',
      name: 'Vodafone Cash',
      icon: '📱',
      description: 'Pay using your Vodafone Cash wallet'
    },
    {
      id: 'fawry',
      name: 'Fawry',
      icon: '🏪',
      description: 'Pay at any Fawry outlet'
    },
    {
      id: 'valu',
      name: 'Valu',
      icon: '💰',
      description: 'Pay with Valu installment service'
    }
  ];

  const handlePayment = async () => {
    setLoading(true);

    try {
      // Open external browser to Paymob iframe
      const WebBrowser = await import('expo-web-browser');
      await WebBrowser.openBrowserAsync(String(params.redirectUrl));
      // After user returns, ask backend or show confirmation
      Alert.alert(
        'Complete Payment',
        'If you completed the payment, tap Continue to refresh your subscription.',
        [
          { text: 'Not Yet', style: 'cancel', onPress: () => setLoading(false) },
          { text: 'Continue', onPress: () => handlePaymentSuccess() },
        ]
      );
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'Payment failed. Please try again.');
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setLoading(false);
    Alert.alert(
      'Payment Successful! 🎉',
      'Your subscription has been activated. You now have access to all premium content.',
      [
        {
          text: 'Continue',
          onPress: () => {
            router.replace('/(tabs)');
          }
        }
      ]
    );
  };

  const renderPaymentMethod = (method: any) => {
    const isSelected = selectedPaymentMethod === method.id;

    return (
      <TouchableOpacity
        key={method.id}
        style={[
          styles.paymentMethodCard,
          isSelected && styles.selectedPaymentMethodCard
        ]}
        onPress={() => setSelectedPaymentMethod(method.id)}
      >
        <View style={styles.paymentMethodHeader}>
          <Text style={styles.paymentMethodIcon}>{method.icon}</Text>
          <View style={styles.paymentMethodInfo}>
            <Text style={styles.paymentMethodName}>{method.name}</Text>
            <Text style={styles.paymentMethodDescription}>{method.description}</Text>
          </View>
          {isSelected && (
            <View style={styles.selectedIndicator}>
              <Text style={styles.selectedIndicatorText}>✓</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Payment</Text>
          </View>

          {/* Order Summary */}
          <View style={styles.orderSummaryContainer}>
            <Text style={styles.orderSummaryTitle}>Order Summary</Text>
            <View style={styles.orderDetails}>
              <View style={styles.orderRow}>
                <Text style={styles.orderLabel}>Order ID:</Text>
                <Text style={styles.orderValue}>{params.orderId}</Text>
              </View>
              <View style={styles.orderRow}>
                <Text style={styles.orderLabel}>Amount:</Text>
                <Text style={styles.orderValue}>{params.currency} {params.amount}</Text>
              </View>
              <View style={styles.orderRow}>
                <Text style={styles.orderLabel}>User:</Text>
                <Text style={styles.orderValue}>{user?.name}</Text>
              </View>
            </View>
          </View>

          {/* Payment Methods */}
          <View style={styles.paymentMethodsContainer}>
            <Text style={styles.paymentMethodsTitle}>Select Payment Method</Text>
            {paymentMethods.map(renderPaymentMethod)}
          </View>

          {/* Payment Button */}
          <TouchableOpacity
            style={[
              styles.payButton,
              loading && styles.disabledButton
            ]}
            onPress={handlePayment}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.payButtonText}>
                Pay {params.currency} {params.amount}
              </Text>
            )}
          </TouchableOpacity>

          {/* Security Notice */}
          <View style={styles.securityNotice}>
            <Text style={styles.securityIcon}>🔒</Text>
            <Text style={styles.securityText}>
              Your payment information is secure and encrypted. We use industry-standard security measures to protect your data.
            </Text>
          </View>
        </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
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
  },
  orderSummaryContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },
  orderSummaryTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  orderDetails: {
    gap: 10,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderLabel: {
    color: '#CCCCCC',
    fontSize: 16,
  },
  orderValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  paymentMethodsContainer: {
    marginBottom: 30,
  },
  paymentMethodsTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  paymentMethodCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedPaymentMethodCard: {
    borderColor: '#E50914',
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
  },
  paymentMethodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodIcon: {
    fontSize: 30,
    marginRight: 15,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  paymentMethodDescription: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  selectedIndicator: {
    backgroundColor: '#E50914',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicatorText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  payButton: {
    backgroundColor: '#E50914',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 30,
  },
  disabledButton: {
    backgroundColor: '#666666',
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  securityIcon: {
    fontSize: 20,
    marginRight: 10,
    marginTop: 2,
  },
  securityText: {
    color: '#CCCCCC',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
});



