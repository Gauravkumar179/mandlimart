// supabase.js
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://yvmqqdmrimavhjpcjxut.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bXFxZG1yaW1hdmhqcGNqeHV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MDA3MDcsImV4cCI6MjA2ODA3NjcwN30.1iZ0MqGdaNmq41zrBSm6Tt6mHvmDPzf0ED02FnvBrbs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Required for React Native
  },
});
