import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from './src/store/authStore';
import { useLocationStore } from './src/store/locationStore';
import { authApi } from './src/services/api/auth';
import { locationService } from './src/services/location/locationService';
import { TrackingButton } from './src/components/tracking/TrackingButton';
import { StatusIndicator } from './src/components/tracking/StatusIndicator';

export default function App() {
  const { user, setUser, clearUser } = useAuthStore();
  const { isTracking, lastSync, queuedCount } = useLocationStore();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTogglingTracking, setIsTogglingTracking] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.register({ name, email, password });
      setUser(response.user);
      Alert.alert('Success', 'Registration successful!');
      // Clear form
      setName('');
      setEmail('');
      setPassword('');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Please try again');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.login({ email, password });
      setUser(response.user);
      Alert.alert('Success', 'Login successful!');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
      clearUser();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleToggleTracking = async () => {
    setIsTogglingTracking(true);
    try {
      if (isTracking) {
        await locationService.stopTracking();
      } else {
        await locationService.startTracking();
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to toggle tracking');
    } finally {
      setIsTogglingTracking(false);
    }
  };

  // Login/Register Screen
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="auto" />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.loginContainer}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.loginCard}>
              <Text style={styles.title}>Employee Tracker</Text>
              <Text style={styles.subtitle}>
                {isRegisterMode ? 'Create an account' : 'Login to continue'}
              </Text>

              {isRegisterMode && (
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  editable={!isLoading}
                />
              )}

              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />

              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!isLoading}
              />

              <TouchableOpacity
                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                onPress={isRegisterMode ? handleRegister : handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.loginButtonText}>
                    {isRegisterMode ? 'REGISTER' : 'LOGIN'}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.switchButton}
                onPress={() => {
                  setIsRegisterMode(!isRegisterMode);
                  setName('');
                  setEmail('');
                  setPassword('');
                }}
                disabled={isLoading}
              >
                <Text style={styles.switchButtonText}>
                  {isRegisterMode
                    ? 'Already have an account? Login'
                    : "Don't have an account? Register"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Tracking Screen
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.trackingContainer}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome, {user.name}!</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <StatusIndicator
          status={isTracking ? 'active' : 'inactive'}
          lastSync={lastSync}
          queuedLocations={queuedCount}
        />

        <View style={styles.trackingButtonContainer}>
          <TrackingButton
            isTracking={isTracking}
            isLoading={isTogglingTracking}
            onToggle={handleToggleTracking}
          />
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            {isTracking
              ? '📍 Your location is being tracked'
              : '⏸️ Tracking is paused'}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loginContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  loginCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  loginButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchButton: {
    marginTop: 16,
    padding: 8,
  },
  switchButtonText: {
    color: '#2196F3',
    fontSize: 14,
    textAlign: 'center',
  },
  trackingContainer: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: '600',
  },
  trackingButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginTop: 20,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
