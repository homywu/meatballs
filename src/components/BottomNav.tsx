'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { createNavigation } from 'next-intl/navigation';
import { routing } from '@/i18n/routing';
import { Home, ClipboardList } from 'lucide-react';

const { Link, usePathname } = createNavigation(routing);

export default function BottomNav() {
    const t = useTranslations('common'); // Assuming 'common' namespace has 'home' and 'orders'
    const pathname = usePathname();

    // Helper to determine if link is active
    const isActive = (path: string) => {
        if (path === '/' && pathname === '/') return true;
        if (path !== '/' && pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 pb-safe">
            <nav className="max-w-md mx-auto grid grid-cols-2">
                <Link
                    href="/"
                    className={`flex flex-col items-center justify-center py-3 transition-colors ${isActive('/')
                        ? 'text-orange-600'
                        : 'text-slate-400 hover:text-slate-600'
                        }`}
                >
                    <Home size={24} strokeWidth={isActive('/') ? 2.5 : 2} className={isActive('/') ? "fill-orange-500/10" : ""} />
                    <span className="text-[10px] mt-1 font-medium">{t('home')}</span>
                </Link>

                <Link
                    href="/orders"
                    className={`flex flex-col items-center justify-center py-3 transition-colors ${isActive('/orders')
                        ? 'text-orange-600'
                        : 'text-slate-400 hover:text-slate-600'
                        }`}
                >
                    <ClipboardList size={24} strokeWidth={isActive('/orders') ? 2.5 : 2} className={isActive('/orders') ? "fill-orange-500/10" : ""} />
                    <span className="text-[10px] mt-1 font-medium">{t('orders')}</span>
                </Link>
            </nav>
        </div>
    );
}
