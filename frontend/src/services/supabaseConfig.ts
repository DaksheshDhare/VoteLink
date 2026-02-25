import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    'Supabase credentials not configured. Email OTP features may not work. ' +
    'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
  );
}

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Export helper functions
export const supabaseConfig = {
  url: supabaseUrl,
  key: supabaseKey,
  isConfigured: !!supabaseUrl && !!supabaseKey
};

export default supabase;
