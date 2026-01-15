'use client';

import { useSession } from 'next-auth/react';
import { signIn } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { LogIn, Lock } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 p-3 rounded-full">
            <Lock className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Sign In Required</h3>
            <p className="text-sm text-slate-600">Please sign in with Google to place an order.</p>
          </div>
        </div>
        <button
          onClick={() => signIn('google', { callbackUrl: pathname })}
          className="w-full bg-orange-600 text-white py-3 px-4 rounded-xl font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
        >
          <LogIn size={20} />
          Sign In with Google
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
