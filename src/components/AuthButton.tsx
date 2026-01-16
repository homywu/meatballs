'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { signIn, signOut } from 'next-auth/react';
import type { Session } from 'next-auth';
import { User, LogOut, LogIn, X } from 'lucide-react';
import Image from 'next/image';

interface AuthButtonProps {
  isScrolled?: boolean;
  session?: Session | null;
}

export default function AuthButton({ isScrolled = false, session: sessionProp }: AuthButtonProps) {
  // Only use useSession if session prop is not provided (fallback for other usages)
  const { data: sessionFromHook, status } = useSession();
  const session = sessionProp ?? sessionFromHook;
  // If session prop is provided, we assume it's ready (not loading)
  const isLoading = sessionProp === undefined ? status === 'loading' : false;
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  if (isLoading) {
    return (
      <div className={`px-3 py-1.5 rounded-lg ${isScrolled ? 'bg-slate-100' : 'bg-white/20 backdrop-blur'}`}>
        <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (session?.user) {
    return (
      <>
        <button
          onClick={() => setShowSignOutModal(true)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${isScrolled ? 'bg-slate-100 text-slate-800 hover:bg-slate-200' : 'bg-white/20 backdrop-blur text-white hover:bg-white/30'}`}
        >
          {session.user.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name || 'User'}
              width={24}
              height={24}
              className="rounded-full"
            />
          ) : (
            <User size={24} />
          )}
          <span className="text-sm font-medium hidden sm:inline">
            {session.user.name || session.user.email}
          </span>
        </button>

        {/* Sign Out Confirmation Modal */}
        {showSignOutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowSignOutModal(false)}
            />

            {/* Modal */}
            <div className={`relative z-10 w-full max-w-sm rounded-2xl shadow-2xl ${isScrolled ? 'bg-white' : 'bg-slate-900/95 backdrop-blur-lg border border-white/10'}`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold ${isScrolled ? 'text-slate-900' : 'text-white'}`}>
                    Sign Out
                  </h3>
                  <button
                    onClick={() => setShowSignOutModal(false)}
                    className={`p-1 rounded-lg transition-colors ${isScrolled ? 'text-slate-500 hover:bg-slate-100' : 'text-slate-400 hover:bg-white/10'}`}
                  >
                    <X size={20} />
                  </button>
                </div>

                <p className={`mb-6 ${isScrolled ? 'text-slate-600' : 'text-slate-300'}`}>
                  Are you sure you want to sign out?
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSignOutModal(false)}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${isScrolled ? 'bg-slate-100 text-slate-800 hover:bg-slate-200' : 'bg-white/10 text-white hover:bg-white/20'}`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowSignOutModal(false);
                      signOut();
                    }}
                    className="flex-1 px-4 py-2 rounded-lg font-medium bg-orange-600 text-white hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <button
      onClick={() => signIn('google')}
      className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${isScrolled ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-white/20 backdrop-blur text-white hover:bg-white/30 border border-white/30'}`}
    >
      <LogIn size={16} />
      <span>Sign In</span>
    </button>
  );
}
