# Security Architecture

## Supabase Access Pattern

This application follows a **server-only** Supabase access pattern for maximum security.

### Architecture Overview

```
Frontend (Client Components)
    ↓
Server Actions (src/app/[locale]/actions.ts)
    ↓
Supabase Server Client (src/lib/supabase/server.ts)
    ↓
Supabase Database
```

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
