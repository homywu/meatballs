import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables for server');
}

/**
 * Server-side Supabase client with service role key.
 * 
 * ⚠️ SECURITY: This client bypasses Row Level Security (RLS) and should ONLY be used in:
 * - Server Actions (src/app/[locale]/actions.ts)
 * - API Routes
 * - Server Components
 * 
 * NEVER expose this client to the frontend or use it in client components.
 * All frontend database operations must go through Server Actions.
 * 
 * The service role key has full database access and should be kept secret.
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
