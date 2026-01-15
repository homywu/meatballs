/**
 * ⚠️ SECURITY: This client is DISABLED for frontend use.
 * 
 * All Supabase operations MUST go through Server Actions to ensure security.
 * Frontend should NEVER directly access Supabase.
 * 
 * Use Server Actions instead:
 * - src/app/[locale]/actions.ts
 * 
 * This file is kept for potential future server-side use only.
 * If you need client-side Supabase access, reconsider your architecture.
 */

// Frontend Supabase client is intentionally disabled
// All database operations must go through Server Actions
export const supabase = null as any;

// Original implementation (disabled):
// import { createClient } from '@supabase/supabase-js';
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// if (!supabaseUrl || !supabaseAnonKey) {
//   throw new Error('Missing Supabase environment variables');
// }
// export const supabase = createClient(supabaseUrl, supabaseAnonKey);
