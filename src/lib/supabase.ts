import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return (
    typeof supabaseUrl === 'string' &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('your-project') &&
    !supabaseUrl.includes('YOUR_PROJECT') &&
    typeof supabaseAnonKey === 'string' &&
    supabaseAnonKey.length > 20 &&
    !supabaseAnonKey.includes('YOUR_PUBLISHABLE_KEY')
  );
};

// Safe client instantiation: falls back to dummy client if unconfigured so imports never crash
export const supabase: SupabaseClient = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : createClient('https://placeholder-aiml.supabase.co', 'placeholder-anon-key-aiml-hub-sec-a', {
      auth: {
        persistSession: false,
      },
    });

export const BUCKET_NAME = 'aiml-resources';

export function getPublicStorageUrl(storagePath: string): string {
  if (!isSupabaseConfigured()) {
    // Return sample/dummy link for preview
    return 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
  }
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath);
  return data.publicUrl;
}
