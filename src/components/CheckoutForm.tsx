import React from 'react';
import { useTranslations } from 'next-intl';
import { MapPin, Store } from 'lucide-react';

interface FormData {
    name: string;
    phone: string;
    address: string;
    notes: string;
}

interface CheckoutFormProps {
    formData: FormData;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    deliveryType: string;
    setDeliveryType: (type: string) => void;
    submitError: string | null;
}

export default function CheckoutForm({
    formData,
    handleInputChange,
    deliveryType,
    setDeliveryType,
    submitError
}: CheckoutFormProps) {
    const t = useTranslations();

    return (
        <section className="bg-white p-6 rounded-3xl shadow-lg border border-orange-100 space-y-6 animate-in slide-in-from-bottom-8 duration-700">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <MapPin className="text-orange-500" size={20} />
                {t('checkout.title')}
            </h3>

            {/* Custom Toggle */}
            <div className="bg-slate-100 p-1.5 rounded-2xl flex relative font-medium text-sm">
                <button
                    type="button"
                    onClick={() => setDeliveryType('pickup')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300 shadow-sm ${deliveryType === 'pickup' ? 'bg-white text-slate-900 shadow-md ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <Store size={18} /> {t('checkout.pickup')}
                </button>
                <button
                    type="button"
                    onClick={() => setDeliveryType('delivery')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300 ${deliveryType === 'delivery' ? 'bg-white text-slate-900 shadow-md ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <MapPin size={18} /> {t('checkout.delivery')}
                </button>
            </div>

            <div className="space-y-4">
                <div className="group">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block ml-1">{t('checkout.form.name')}</label>
                    <input
                        type="text"
                        name="name"
                        placeholder={t('checkout.form.namePlaceholder')}
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                    />
                </div>

                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block ml-1">{t('checkout.form.phone')}</label>
                    <input
                        type="tel"
                        name="phone"
                        placeholder={t('checkout.form.phonePlaceholder')}
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                    />
                </div>

                {deliveryType === 'delivery' && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block ml-1">{t('checkout.form.address')}</label>
                        <textarea
                            name="address"
                            rows={2}
                            placeholder={t('checkout.form.addressPlaceholder')}
                            value={formData.address}
                            onChange={handleInputChange}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all resize-none"
                        ></textarea>
                    </div>
                )}

                {submitError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <p className="text-sm text-red-700 font-medium">{submitError}</p>
                    </div>
                )}
            </div>
        </section>
    );
}
