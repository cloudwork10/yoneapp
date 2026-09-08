import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PhoneField from '../components/PhoneField';
import API_BASE_URL from '../config/api';
import { isValidPhone, normalizePhone } from '../utils/phone';

type Step = 'account' | 'reset';

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<Step>('account');
  const [email, setEmail] = useState('');
  const [phoneDial, setPhoneDial] = useState('20');
  const [phoneLocal, setPhoneLocal] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const requestCode = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    if (!isValidPhone(phoneLocal, phoneDial)) {
      Alert.alert('Error', 'Enter the mobile number on this account');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmed,
          phone: normalizePhone(phoneLocal, phoneDial),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Error', data.message || 'Could not send reset code');
        return;
      }

      setStep('reset');

      if (data?.data?.resetCode) {
        setCode(String(data.data.resetCode));
        Alert.alert(
          'Reset code ready',
          `Your code is ${data.data.resetCode}\n\nIt expires in 15 minutes.`
        );
      } else {
        Alert.alert(
          'Check your email',
          data.message || 'If an account exists, a reset code was sent.'
        );
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedCode = code.trim();

    if (trimmedCode.length !== 6) {
      Alert.alert('Error', 'Enter the 6-digit reset code');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmedEmail,
          phone: normalizePhone(phoneLocal, phoneDial),
          code: trimmedCode,
          newPassword,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Reset failed', data.message || 'Invalid or expired code');
        return;
      }

      Alert.alert('Success', 'Password updated. You can sign in now.', [
        { text: 'Sign In', onPress: () => router.replace('/login') },
      ]);
    } catch (error) {
      console.error('Reset password error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#000000', '#1a1a1a', '#000000']} style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Text style={styles.backText}>‹ Back</Text>
            </TouchableOpacity>

            <View style={styles.header}>
              <Text style={styles.logo}>ELNADY</Text>
              <Text style={styles.logoArabic}>النادي</Text>
              <Text style={styles.subtitle}>
                {step === 'account' ? 'Forgot password?' : 'Set new password'}
              </Text>
            </View>

            <View style={styles.form}>
              {step === 'account' ? (
                <>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your email"
                      placeholderTextColor="#666"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Mobile number</Text>
                    <PhoneField
                      dial={phoneDial}
                      local={phoneLocal}
                      onDialChange={setPhoneDial}
                      onLocalChange={setPhoneLocal}
                    />
                  </View>

                  <TouchableOpacity
                    style={[styles.primaryButton, loading && styles.disabledButton]}
                    onPress={requestCode}
                    disabled={loading}
                  >
                    <Text style={styles.primaryButtonText}>
                      {loading ? 'Sending...' : 'Send Reset Code'}
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                      style={[styles.input, styles.inputReadonly]}
                      value={email}
                      editable={false}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Mobile number</Text>
                    <PhoneField
                      dial={phoneDial}
                      local={phoneLocal}
                      onDialChange={setPhoneDial}
                      onLocalChange={setPhoneLocal}
                      editable={false}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Reset Code</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="6-digit code"
                      placeholderTextColor="#666"
                      value={code}
                      onChangeText={setCode}
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>New Password</Text>
                    <View style={styles.passwordContainer}>
                      <TextInput
                        style={styles.passwordInput}
                        placeholder="At least 6 characters"
                        placeholderTextColor="#666"
                        value={newPassword}
                        onChangeText={(text) => {
                          if (/strong password|cover view/i.test(text)) return;
                          setNewPassword(text);
                        }}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        textContentType="oneTimeCode"
                        autoComplete="off"
                        importantForAutofill="no"
                        passwordRules=""
                      />
                      <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setShowPassword(!showPassword)}
                      >
                        <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TextInput
                    value=""
                    style={styles.autofillTrap}
                    importantForAutofill="no"
                    textContentType="oneTimeCode"
                    autoComplete="off"
                  />

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Confirm Password</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Re-enter new password"
                      placeholderTextColor="#666"
                      value={confirmPassword}
                      onChangeText={(text) => {
                        if (/strong password|cover view/i.test(text)) return;
                        setConfirmPassword(text);
                      }}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      textContentType="oneTimeCode"
                      autoComplete="off"
                      importantForAutofill="no"
                      passwordRules=""
                    />
                  </View>

                  <TouchableOpacity
                    style={[styles.primaryButton, loading && styles.disabledButton]}
                    onPress={resetPassword}
                    disabled={loading}
                  >
                    <Text style={styles.primaryButtonText}>
                      {loading ? 'Updating...' : 'Reset Password'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.secondaryButton}
                    disabled={loading}
                    onPress={() => {
                      setStep('account');
                      setCode('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                  >
                    <Text style={styles.secondaryButtonText}>Use different details</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000000' },
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  backBtn: { alignSelf: 'flex-start', marginBottom: 10 },
  backText: { color: '#CCCCCC', fontSize: 18 },
  header: { alignItems: 'center', marginBottom: 36 },
  logo: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#E50914',
    letterSpacing: 4,
    marginBottom: 4,
  },
  logoArabic: { fontSize: 16, color: '#CCCCCC', marginBottom: 12 },
  subtitle: { fontSize: 24, color: '#FFFFFF', fontWeight: '300', marginBottom: 8 },
  hint: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  form: { width: '100%' },
  inputContainer: { marginBottom: 18 },
  label: { color: '#FFFFFF', fontSize: 16, marginBottom: 8, fontWeight: '500' },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 15,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  inputReadonly: { opacity: 0.7 },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  autofillTrap: {
    height: 1,
    width: 1,
    opacity: 0,
    position: 'absolute',
    left: -1000,
  },
  passwordInput: { flex: 1, padding: 15, color: '#FFFFFF', fontSize: 16 },
  eyeButton: { padding: 15 },
  eyeIcon: { fontSize: 20, color: '#FFFFFF' },
  primaryButton: {
    backgroundColor: '#E50914',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: { opacity: 0.6 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: 'bold' },
  secondaryButton: { alignItems: 'center', marginTop: 18 },
  secondaryButtonText: { color: '#E50914', fontSize: 15, fontWeight: '600' },
});
