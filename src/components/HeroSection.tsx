import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Clock, Star } from 'lucide-react';

export default function HeroSection() {
    const t = useTranslations();

    return (
        <div className="relative h-[420px] w-full overflow-hidden">
            {/* Dark Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/10 to-black/80 z-10"></div>
            <Image
                src="/images/hero-meatballs.jpg"
                alt="Delicious Meatballs"
                fill
                className="object-cover object-center animate-in fade-in duration-1000 scale-105"
                priority
                sizes="100vw"
            />

            <div className="absolute bottom-0 left-0 right-0 z-20 p-6 pb-12 max-w-2xl mx-auto">
                <span className="inline-block px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-lg mb-3 shadow-lg">
                    {t('hero.badge')}
                </span>
                <h2 className="text-4xl font-extrabold text-white leading-tight mb-2 drop-shadow-lg">
                    {t('hero.title').split('\n').map((line: string, i: number, arr: string[]) => {
                        const highlight = t('hero.highlight');
                        const parts = line.split(highlight);
                        return (
                            <React.Fragment key={i}>
                                {parts.map((part: string, j: number) => (
                                    <React.Fragment key={j}>
                                        {part}
                                        {j < parts.length - 1 && <span className="text-orange-400">{highlight}</span>}
                                    </React.Fragment>
                                ))}
                                {i < arr.length - 1 && <br />}
                            </React.Fragment>
                        );
                    })}
                </h2>
                <p className="text-slate-200 text-sm font-medium flex items-center gap-4 mt-4">
                    <span className="flex items-center gap-1"><Clock size={14} /> {t('hero.features.fresh')}</span>
                    <span className="flex items-center gap-1"><Star size={14} /> {t('hero.features.noPreservatives')}</span>
                </p>
            </div>

            {/* Curved Divider */}
            <div className="absolute bottom-[-1px] left-0 w-full overflow-hidden leading-[0] z-20">
                <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block h-[40px] w-full fill-[#FDFBF7] rotate-180">
                    <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
                </svg>
            </div>
        </div>
    );
}
