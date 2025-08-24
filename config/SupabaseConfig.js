// In config/SupabaseConfig.js

import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cmvzaqzvhhyxgnuvghbb.supabase.co'; // Paste your URL here
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtdnphcXp2aGh5eGdudXZnaGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNDkzNjIsImV4cCI6MjA3MTYyNTM2Mn0.NRKJd5TDniFaJZIly8D5B7PldfKuhUdm_PISz2Siv2U'; // Paste your anon key here

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});