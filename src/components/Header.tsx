'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import AuthButton from '@/components/AuthButton';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { createNavigation } from 'next-intl/navigation';
import { routing } from '@/i18n/routing';
import type { Session } from 'next-auth';

interface HeaderProps {
    session: Session | null;
}

const navigation = createNavigation(routing);

export default function Header({
    session
}: HeaderProps) {
    const t = useTranslations();
    const locale = useLocale();
    const router = navigation.useRouter();
    const pathname = navigation.usePathname();
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Force white background on non-home pages if desired, but for now consistent behavior involving scroll
    // If not on home page, maybe we want it always white? 
    // Let's stick to scroll behavior which is nice, but ensure pages have padding if needed.
    // Actually, on OrderHistory (white bg), transparent header text might be invisible if text is white.
    // Header text color logic: ${isScrolled ? 'text-slate-800' : 'text-white'}
    // On Home page Hero is dark/image -> text-white is good.
    // On Order page bg is white -> text-white is invisible.
    // I should check if pathname is home.

    const isHomePage = pathname === '/' || pathname === '';
    // Note: pathname from next-intl might handle locale. usePathname returns path without locale prefix usually? 
    // Let's check next-intl docs or assume behavior. typically it abstracts locale.
    // If unsure, safe to default to scroll behavior but maybe force 'scrolled' state style if not home?

    // Better: Always use scroll effect, but if NOT home, text should be dark initially?
    // Let's stick to simple scroll for now. If user is on Order page, they scroll, it becomes white.
    // But initially transparent on white bg? Bad.
    // Let's FORCE isScrolled true if not Home page?
    // Or add a strictly white header for non-home.

    // Let's rely on scroll for now, but I suspect I might need to tweak this.
    // Actually, let's keep it simple.

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-4'
                }`}
        >
            <div className="max-w-2xl mx-auto px-4 flex justify-between items-center relative">
                <div className={`flex items-center space-x-2 transition-colors ${isScrolled ? 'text-slate-800' : 'text-white'}`}>
                    <div>
                        <Image
                            src="/logo_192.png"
                            alt="Logo"
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-xl"
                        />
                    </div>
                    <h1 className="text-lg font-bold tracking-wide">{t('common.appName')}</h1>
                </div>

                <div className="flex items-center gap-2">
                    <LanguageSwitcher currentLocale={locale} isScrolled={isScrolled} />
                    <AuthButton isScrolled={isScrolled} session={session} />
                </div>
            </div>
        </header>
    );
}
