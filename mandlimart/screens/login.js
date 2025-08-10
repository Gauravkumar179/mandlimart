import 'react-native-url-polyfill/auto';
import React, { useState, useContext } from 'react';
import {
  View,
  TextInput,
  Button,
  Text,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { supabase } from '../supabase';
import { UserContext } from '../context/userContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useContext(UserContext);

  const handleLogin = async () => {
    console.log('Attempting login...');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      console.log('Login data:', data);
      console.log('Login error:', error);

      if (error) {
        setTimeout(() => {
          Alert.alert('Login failed', error.message);
        }, 100);
      } else if (data?.session) {
        console.log('✅ Login success:', data.session);
        setUser(data.session.user);
        navigation.replace('Home');
      } else {
        setTimeout(() => {
          Alert.alert('Login failed', 'No session returned');
        }, 100);
      }
    } catch (e) {
      console.error('Exception during login:', e);
      setTimeout(() => {
        Alert.alert('Unexpected error', e.message);
      }, 100);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Login</Text>
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            style={styles.input}
            placeholderTextColor="#777"
          />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            placeholderTextColor="#777"
          />
          <View style={styles.buttonWrapper}>
            <Button title="Login" onPress={handleLogin} color="#007AFF" />
          </View>
          <Text style={styles.registerLink} onPress={() => navigation.replace('Register')}>
            Don't have an account? <Text style={{ fontWeight: 'bold' }}>Register</Text>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f0f0f0', // light background
  },
  card: {
    width: '100%',
    maxWidth: 380,
    padding: 24,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    padding: 12,
    marginVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    color: '#000',
  },
  buttonWrapper: {
    marginTop: 10,
    marginBottom: 20,
  },
  registerLink: {
    textAlign: 'center',
    color: '#444',
  },
});
