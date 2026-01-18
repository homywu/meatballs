import React from 'react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { Menu, X } from 'lucide-react';
import AuthButton from '@/components/AuthButton';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import MenuDropdown from '@/components/MenuDropdown';
import { createNavigation } from 'next-intl/navigation';
import { routing } from '@/i18n/routing';
import type { Session } from 'next-auth';

interface HeaderProps {
    isScrolled: boolean;
    session: Session | null;
    isMenuOpen: boolean;
    setIsMenuOpen: (isOpen: boolean) => void;
}

const navigation = createNavigation(routing);

export default function Header({
    isScrolled,
    session,
    isMenuOpen,
    setIsMenuOpen
}: HeaderProps) {
    const t = useTranslations();
    const locale = useLocale();
    const router = navigation.useRouter();
    const pathname = navigation.usePathname();

    const switchLocale = (newLocale: string) => {
        router.push(pathname, { locale: newLocale });
        setIsMenuOpen(false);
    };

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

                {/* Auth Button, Language Switcher and Menu Button */}
                <div className="flex items-center gap-2">
                    <LanguageSwitcher currentLocale={locale} isScrolled={isScrolled} />
                    <AuthButton isScrolled={isScrolled} session={session} />

                    {/* Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className={`menu-button px-3 py-2 rounded-lg flex items-center justify-center transition-colors ${isScrolled ? 'bg-slate-100 text-slate-800 hover:bg-slate-200' : 'bg-white/20 backdrop-blur text-white hover:bg-white/30'}`}
                        aria-label="Menu"
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Menu Dropdown */}
                <MenuDropdown
                    isOpen={isMenuOpen}
                    onClose={() => setIsMenuOpen(false)}
                    session={session}
                    locale={locale}
                    onSwitchLocale={switchLocale}
                    isScrolled={isScrolled}
                    onNavigate={(path) => router.push(path)}
                />
            </div>
        </header>
    );
}
