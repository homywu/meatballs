import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle, Copy, Star } from 'lucide-react';

interface SuccessViewProps {
    totalPrice: number;
    phone: string;
}

export default function SuccessView({ totalPrice, phone }: SuccessViewProps) {
    const t = useTranslations();
    const [copySuccess, setCopySuccess] = useState(false);

    const copyToClipboard = async () => {
        try {
            // Modern clipboard API
            await navigator.clipboard.writeText('carfield.ni@gmail.com');
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = 'carfield.ni@gmail.com';
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000);
            } catch (fallbackErr) {
                console.error('Copy failed', fallbackErr);
            }
            document.body.removeChild(textArea);
        }
    };

    return (
        <div className="min-h-screen bg-orange-50/50 flex flex-col items-center justify-center p-6 font-sans">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-8 text-center space-y-6 animate-in fade-in zoom-in duration-300 border border-orange-100">
                <div className="flex justify-center mb-4">
                    <div className="bg-green-100 p-4 rounded-full">
                        <CheckCircle className="w-16 h-16 text-green-600" />
                    </div>
                </div>

                <div>
                    <h2 className="text-2xl font-extrabold text-slate-800">{t('success.title')}</h2>
                    <p className="text-slate-500 mt-2">{t('success.subtitle')}</p>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-100 dashed-border">
                    <p className="text-sm font-medium text-slate-500 mb-1">{t('success.total')}</p>
                    <p className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 font-serif">
                        ${totalPrice.toFixed(2)}
                    </p>
                </div>

                <div className="space-y-4 text-left">
                    <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <span className="bg-slate-800 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">1</span>
                        {t('success.step1')}
                    </p>
                    <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200 group hover:border-orange-300 transition-colors">
                        <code className="text-slate-800 font-mono text-lg font-medium">carfield.ni@gmail.com</code>
                        <button
                            onClick={copyToClipboard}
                            className="text-sm bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 text-slate-600 hover:text-orange-600 hover:border-orange-200 active:scale-95 transition flex items-center gap-1"
                        >
                            {copySuccess ? <CheckCircle size={14} /> : <Copy size={14} />}
                            {copySuccess ? t('success.copied') : t('success.copy')}
                        </button>
                    </div>

                    <p className="text-sm font-bold text-slate-700 flex items-center gap-2 mt-4">
                        <span className="bg-slate-800 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">2</span>
                        {t('success.step2')}
                    </p>
                    <div className="bg-red-50 p-3 rounded-xl border border-red-100 flex items-start gap-2">
                        <div className="mt-0.5"><Star className="w-4 h-4 text-red-500 fill-red-500" /></div>
                        <p className="text-sm text-red-700">
                            {t('success.step2Note', { phone })}
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => window.location.reload()}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition shadow-lg hover:shadow-xl translate-y-0 hover:-translate-y-1"
                >
                    {t('success.backHome')}
                </button>
            </div>
        </div>
    );
}
