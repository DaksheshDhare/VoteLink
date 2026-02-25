const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with admin privileges
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not fully configured. Email OTP features may be limited.');
}

// Anon client for user operations
const supabaseAnon = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Service role client for admin operations (use with caution)
const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl || '', supabaseServiceKey)
  : null;

module.exports = {
  supabaseAnon,
  supabaseAdmin,
  supabaseUrl,
  supabaseAnonKey,
  supabaseServiceKey
};
