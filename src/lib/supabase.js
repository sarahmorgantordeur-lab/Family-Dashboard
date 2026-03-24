import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://inqvsupobetnnecdohaq.supabase.co',
  'sb_publishable_tA0A9XMoYgZsQ_RdFp2tKA_9vtjUoVA',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
