import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { supabaseAdmin } from './supabase/server';

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true, // Trust all hosts (required for Railway and other platforms)
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Sync user to Supabase users table on first sign-in
      if (user.email) {
        try {
          // Check if user exists
          const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', user.email)
            .single();

          if (!existingUser) {
            // Create new user in Supabase
            const { error } = await supabaseAdmin.from('users').insert([
              {
                email: user.email,
                name: user.name || null,
                image: user.image || null,
                role: 'user', // Default role for new users
              },
            ]);

            if (error) {
              console.error('Error creating user in Supabase:', error);
              // Still allow sign-in even if DB sync fails
            }
          } else {
            // Update user info if it changed
            await supabaseAdmin
              .from('users')
              .update({
                name: user.name || null,
                image: user.image || null,
              })
              .eq('email', user.email);
          }
        } catch (error) {
          console.error('Error syncing user to database:', error);
          // Still allow sign-in even if DB sync fails
        }
      }
      return true;
    },
    async session({ session, token }) {
      // Add user ID from database to session
      if (session.user?.email) {
        try {
          const { data: user } = await supabaseAdmin
            .from('users')
            .select('id, role')
            .eq('email', session.user.email)
            .single();

          if (user) {
            session.user.id = user.id;
            session.user.role = user.role as 'user' | 'admin';
          }
        } catch (error) {
          console.error('Error fetching user ID:', error);
        }
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.AUTH_SECRET,
});
