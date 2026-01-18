import React, { useEffect } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { History, Globe, User, LogIn, LogOut } from 'lucide-react';
import { signIn, signOut } from 'next-auth/react';
import type { Session } from 'next-auth';

interface MenuDropdownProps {
    isOpen: boolean;
    onClose: () => void;
    session: Session | null;
    locale: string;
    onSwitchLocale: (newLocale: string) => void;
    isScrolled: boolean;
    onNavigate: (path: string) => void;
}

export default function MenuDropdown({
    isOpen,
    onClose,
    session,
    locale,
    onSwitchLocale,
    isScrolled,
    onNavigate
}: MenuDropdownProps) {
    const t = useTranslations();

    // Click outside handler to close menu
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.menu-container') && !target.closest('.menu-button')) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="menu-container absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-4 space-y-3">
                {/* Status Badge */}
                <div className="flex items-center justify-center pb-3 border-b border-slate-100">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 ${isScrolled ? 'bg-green-100 text-green-700' : 'bg-green-100 text-green-700'}`}>
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        {t('common.status.accepting')}
                    </span>
                </div>

                {/* Order History (if logged in) */}
                {session && (
                    <button
                        onClick={() => {
                            onNavigate(`/${locale}/orders`);
                            onClose();
                        }}
                        className="w-full px-4 py-3 rounded-xl flex items-center gap-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        <History size={18} className="text-slate-500" />
                        <span>{t('common.orderHistory')}</span>
                    </button>
                )}

                {/* Language Switcher */}
                <button
                    onClick={() => onSwitchLocale(locale === 'zh' ? 'en' : 'zh')}
                    className="w-full px-4 py-3 rounded-xl flex items-center gap-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                    <Globe size={18} className="text-slate-500" />
                    <span>{locale === 'zh' ? '中文' : 'English'}</span>
                    <span className="ml-auto text-xs text-slate-400">{locale === 'zh' ? 'EN' : '中文'}</span>
                </button>

                {/* Auth Section */}
                <div className="pt-3 border-t border-slate-100">
                    {session?.user ? (
                        <>
                            <div className="px-4 py-2 mb-2 flex items-center gap-3">
                                {session.user.image ? (
                                    <Image
                                        src={session.user.image}
                                        alt={session.user.name || 'User'}
                                        width={32}
                                        height={32}
                                        className="rounded-full"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                                        <User size={18} className="text-slate-500" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-800 truncate">
                                        {session.user.name || session.user.email}
                                    </p>
                                    {session.user.email && session.user.name && (
                                        <p className="text-xs text-slate-500 truncate">{session.user.email}</p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    signOut();
                                    onClose();
                                }}
                                className="w-full px-4 py-3 rounded-xl flex items-center gap-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <LogOut size={18} />
                                <span>Sign Out</span>
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => {
                                signIn('google');
                                onClose();
                            }}
                            className="w-full px-4 py-3 rounded-xl flex items-center gap-3 text-left text-sm font-medium bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors"
                        >
                            <LogIn size={18} />
                            <span>Sign In</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
