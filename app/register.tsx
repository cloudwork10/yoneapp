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

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneDial, setPhoneDial] = useState('20');
  const [phoneLocal, setPhoneLocal] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isGmailAddress = (value: string) =>
    /^[a-z0-9._%+-]+@(gmail|googlemail)\.com$/i.test(String(value || '').trim());

  const handleRegister = async () => {
    if (!name || !email || !phoneLocal || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (name.trim().length < 2) {
      Alert.alert('Error', 'Name must be at least 2 characters');
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!isGmailAddress(normalizedEmail)) {
      Alert.alert(
        'Gmail required',
        'لازم تستخدم إيميل Gmail حقيقي ينتهي بـ @gmail.com\nمثال: yourname@gmail.com'
      );
      return;
    }

    if (!isValidPhone(phoneLocal, phoneDial)) {
      Alert.alert(
        'Phone required',
        'Choose your country code and enter a valid mobile number'
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    // Check for strong password (optional)
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      Alert.alert(
        'Weak Password', 
        'For better security, use a password with uppercase, lowercase, and numbers',
        [
          { text: 'Use Anyway', onPress: () => proceedWithRegistration() },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
      return;
    }

    proceedWithRegistration();
  };

  const proceedWithRegistration = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: normalizePhone(phoneLocal, phoneDial),
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Account created successfully!', [
          { text: 'OK', onPress: () => router.replace('/login') }
        ]);
      } else {
        if (data.errors && data.errors.length > 0) {
          // Show specific validation errors
          const errorMessages = data.errors.map((error: any) => error.msg).join('\n');
          Alert.alert('Registration Failed', errorMessages);
        } else {
          Alert.alert('Registration Failed', data.message || 'Registration failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#000000', '#1a1a1a', '#000000']}
        style={styles.container}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Text style={styles.logo}>ELNADY</Text>
            <Text style={styles.logoArabic}>النادي</Text>
            <Text style={styles.subtitle}>Create your account</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#666"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Gmail</Text>
              <TextInput
                style={styles.input}
                placeholder="yourname@gmail.com"
                placeholderTextColor="#666"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={styles.hint}>يجب استخدام إيميل Gmail حقيقي فقط</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Mobile number</Text>
              <PhoneField
                dial={phoneDial}
                local={phoneLocal}
                onDialChange={setPhoneDial}
                onLocalChange={setPhoneLocal}
              />
              <Text style={styles.hint}>اختار كود الدولة. هنستخدم الرقم لو نسيت الباسورد</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  placeholderTextColor="#666"
                  value={password}
                  onChangeText={(text) => {
                    // Block iOS/Safari "Strong Password" overlay junk value
                    if (/strong password|cover view/i.test(text)) return;
                    setPassword(text);
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  spellCheck={false}
                  textContentType="oneTimeCode"
                  autoComplete="off"
                  importantForAutofill="no"
                  passwordRules=""
                  blurOnSubmit={false}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.eyeIcon}>
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Dummy field breaks iOS Strong Password when 2 secure fields are adjacent */}
            <TextInput
              value=""
              style={styles.autofillTrap}
              importantForAutofill="no"
              textContentType="oneTimeCode"
              autoComplete="off"
            />

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirm your password"
                  placeholderTextColor="#666"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    if (/strong password|cover view/i.test(text)) return;
                    setConfirmPassword(text);
                  }}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  spellCheck={false}
                  textContentType="oneTimeCode"
                  autoComplete="off"
                  importantForAutofill="no"
                  passwordRules=""
                  blurOnSubmit={false}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Text style={styles.eyeIcon}>
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.registerButton, loading && styles.disabledButton]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.registerButtonText}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={navigateToLogin}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#E50914',
    letterSpacing: 4,
    marginBottom: 4,
  },
  logoArabic: {
    fontSize: 18,
    color: '#CCCCCC',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 15,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  hint: {
    color: '#999',
    fontSize: 12,
    marginTop: 8,
    lineHeight: 18,
  },
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
  passwordInput: {
    flex: 1,
    padding: 15,
    color: '#FFFFFF',
    fontSize: 16,
  },
  eyeButton: {
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  registerButton: {
    backgroundColor: '#E50914',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  loginText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  loginLink: {
    color: '#E50914',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
