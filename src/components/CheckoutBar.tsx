import React from 'react';
import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import type { Session } from 'next-auth';

interface CheckoutBarProps {
    totalQty: number;
    totalPrice: number;
    session: Session | null;
    isSubmitting: boolean;
    canSubmit: boolean;
    onSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function CheckoutBar({
    totalQty,
    totalPrice,
    session,
    isSubmitting,
    canSubmit,
    onSubmit
}: CheckoutBarProps) {
    const t = useTranslations();

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 safe-area-bottom">
            <div className="max-w-2xl mx-auto bg-slate-900/95 backdrop-blur-lg text-white p-2 pl-6 pr-2 rounded-[2rem] shadow-2xl flex items-center justify-between border border-white/10 animate-in slide-in-from-bottom-full duration-500">

                <div className="flex flex-col">
                    <span className="text-xs text-slate-400 font-medium">{totalQty} {t('checkout.items')}</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-orange-400">$</span>
                        <span className="text-2xl font-bold tracking-tight">{totalPrice}</span>
                    </div>
                </div>

                <AuthGuard
                    session={session}
                    fallback={
                        <button
                            disabled
                            className="h-12 px-6 rounded-full font-bold flex items-center gap-2 bg-slate-700 text-slate-400 cursor-not-allowed"
                        >
                            <span className="text-sm">Sign In Required</span>
                        </button>
                    }
                >
                    <button
                        onClick={onSubmit}
                        disabled={!canSubmit || isSubmitting}
                        className={`h-12 px-6 rounded-full font-bold flex items-center gap-2 transition-all transform ${(!canSubmit || isSubmitting)
                            ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-orange-500 to-red-600 hover:scale-105 active:scale-95 shadow-lg shadow-orange-900/50'
                            }`}
                    >
                        {isSubmitting ? (
                            <>
                                <span className="text-sm">Submitting...</span>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            </>
                        ) : (!canSubmit) ? (
                            <span className="text-sm">{t('checkout.fillForm')}</span>
                        ) : (
                            <>
                                <span className="text-sm">{t('checkout.checkout')}</span>
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </AuthGuard>
            </div>
        </div>
    );
}
