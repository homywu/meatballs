# Security Architecture

## Authentication & Database Access Pattern

This application uses **NextAuth.js** for authentication and follows a **server-only** Supabase access pattern for maximum security.

### Architecture Overview

```
Frontend (Client Components)
    ↓ (Auth requests)
NextAuth.js API Routes (/api/auth/*)
    ↓ (OAuth flow)
Google OAuth Provider
    ↓
NextAuth.js Session (JWT)
    ↓
Server Actions (get session from NextAuth)
    ↓
Supabase Server Client (src/lib/supabase/server.ts)
    ↓
Supabase Database
```

## Authentication (NextAuth.js)

### Key Security Principles

1. **JWT Sessions**: NextAuth.js uses secure HTTP-only cookies for session storage
2. **Server-Side Validation**: All session checks happen server-side in Server Actions
3. **OAuth Flow**: Google OAuth handled securely by NextAuth.js
4. **User Sync**: User data synced to Supabase `users` table for foreign key relationships

### File Structure

- ✅ `src/lib/auth.ts` - NextAuth.js configuration
- ✅ `src/app/api/auth/[...nextauth]/route.ts` - NextAuth.js API route handlers
- ✅ `src/components/AuthButton.tsx` - Client-side auth UI component
- ✅ `src/components/AuthGuard.tsx` - Client-side auth guard component
- ✅ `src/types/next-auth.d.ts` - TypeScript declarations for NextAuth session

### Environment Variables

**Required for Authentication:**

```bash
AUTH_SECRET=your_random_secret_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_URL=http://localhost:3000
```

## Supabase Access Pattern

This application follows a **server-only** Supabase access pattern for maximum security.

### Key Security Principles

1. **No Direct Frontend Access**: Frontend components NEVER directly access Supabase
2. **Server Actions Only**: All database operations go through Next.js Server Actions
3. **Service Role Key**: Only the service role key is used (stored server-side only)
4. **No Anon Key Exposure**: The anon key is not needed and should not be exposed

### File Structure

- ✅ `src/lib/supabase/server.ts` - Server-side Supabase client (uses service role key)
- ❌ `src/lib/supabase/client.ts` - **DISABLED** - Frontend client is intentionally disabled
- ✅ `src/app/[locale]/actions.ts` - Server Actions that use `supabaseAdmin`

### Environment Variables

**Required (Server-side only):**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Not Needed:**

- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Not required since frontend doesn't access Supabase directly

### Adding New Database Operations

When adding new database operations:

1. **Create a Server Action** in `src/app/[locale]/actions.ts`
2. **Use `supabaseAdmin`** from `@/lib/supabase/server`
3. **Call the Server Action** from your frontend component

**Example:**

```typescript
// ✅ CORRECT: Server Action
'use server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function getOrders() {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*');
  return { data, error };
}

// ❌ WRONG: Direct frontend access
import { supabase } from '@/lib/supabase/client'; // This is disabled!
```

### Benefits

- 🔒 **Security**: Service role key never exposed to client
- 🛡️ **RLS Bypass**: Service role key bypasses RLS when needed
- 🚀 **Performance**: Server-side operations are faster
- 📦 **Type Safety**: TypeScript ensures correct usage

### Verification

To verify the architecture is correct:

1. Search for `@/lib/supabase/client` - Should return no results in `src/app/` or `src/components/`
2. All Supabase imports should be from `@/lib/supabase/server`
3. All database operations should be in Server Actions (files with `'use server'`)
4. All authentication should use NextAuth.js (`auth()` function from `@/lib/auth`)
5. Session validation happens server-side before database operations

## Security Benefits

- 🔒 **Service Role Key**: Never exposed to client
- 🛡️ **JWT Sessions**: Secure HTTP-only cookies
- 🚀 **Server-Side Validation**: All auth checks happen server-side
- 📦 **Type Safety**: TypeScript ensures correct usage
- 🔐 **OAuth Security**: Google OAuth handled by NextAuth.js