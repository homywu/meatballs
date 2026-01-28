'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { getAvailableDeliverySlots } from '@/app/[locale]/actions';

interface DeliverySlot {
    id: string;
    delivery_time: string;
    cutoff_time: string | null;
    schedule_id: string;
    delivery_option: {
        id: string;
        label: string;
        address: string | null;
        description: string | null;
        map_url: string | null;
        delivery_method: string | null;
    };
}

interface DeliverySlotSelectorProps {
    selectedSlotId: string | undefined;
    onSelectSlot: (slotId: string) => void;
    error?: string | null;
}

export default function DeliverySlotSelector({ selectedSlotId, onSelectSlot, error }: DeliverySlotSelectorProps) {
    const t = useTranslations();
    const locale = useLocale();
    const [slots, setSlots] = useState<DeliverySlot[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchSlots() {
            try {
                const res = await getAvailableDeliverySlots();
                if (res.success && res.data) {
                    // Cast the data because the action return type logic is implicit
                    setSlots(res.data as unknown as DeliverySlot[]);
                } else {
                    setFetchError(res.error || 'Failed to load schedule');
                }
            } catch (e) {
                setFetchError('Failed to load schedule');
            } finally {
                setLoading(false);
            }
        }
        fetchSlots();
    }, []);

    if (loading) {
        return <div className="p-4 text-center text-slate-400 text-sm animate-pulse">{t('common.loading')}</div>;
    }

    if (fetchError) {
        return <div className="p-4 text-center text-red-500 text-sm">{fetchError}</div>;
    }

    if (slots.length === 0) {
        return <div className="p-4 text-center text-slate-500 italic bg-slate-50 rounded-xl border border-slate-100">
            No delivery slots available at the moment.
        </div>;
    }

    // Group slots by Date using a consistent key format (ISO date)
    const groupedSlots: Record<string, DeliverySlot[]> = {};
    slots.forEach(slot => {
        const date = new Date(slot.delivery_time).toISOString().split('T')[0];
        if (!groupedSlots[date]) groupedSlots[date] = [];
        groupedSlots[date].push(slot);
    });

    const sortedDates = Object.keys(groupedSlots).sort();
    const selectedSlot = slots.find(s => s.id === selectedSlotId);

    return (
        <div className="space-y-4">
            <div className="space-y-4 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                {/* 1. Normal Date Groups */}
                {sortedDates.map(date => {
                    const dateSlots = groupedSlots[date];
                    return (
                        <div key={date} className="space-y-2">
                            <h4 className="text-sm font-bold text-slate-700 sticky top-0 bg-white py-1 z-10 flex items-center gap-2">
                                <Calendar size={14} className="text-orange-500" />
                                {new Date(dateSlots[0].delivery_time).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </h4>
                            <div className="grid gap-2">
                                {dateSlots.map(slot => {
                                    const isSelected = selectedSlotId === slot.id;
                                    const dateObj = new Date(slot.delivery_time);
                                    const timeStr = dateObj.toLocaleTimeString(locale === 'zh' ? 'zh-CN' : 'en-US', { hour: 'numeric', minute: '2-digit' });
                                    const cutoffStr = slot.cutoff_time ? new Date(slot.cutoff_time).toLocaleTimeString(locale === 'zh' ? 'zh-CN' : 'en-US', { hour: 'numeric', minute: '2-digit', month: 'short', day: 'numeric' }) : null;

                                    return (
                                        <button
                                            key={slot.id}
                                            type="button"
                                            onClick={() => onSelectSlot(slot.id)}
                                            className={`w-full text-left p-3 rounded-xl border transition-all duration-200 relative overflow-hidden
                                            ${isSelected
                                                    ? 'bg-orange-50 border-orange-500 shadow-sm ring-1 ring-orange-500'
                                                    : 'bg-white border-slate-200 hover:border-orange-200 hover:bg-slate-50'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="font-bold text-slate-800 flex items-center gap-2">
                                                        <Clock size={14} className={isSelected ? 'text-orange-600' : 'text-slate-400'} />
                                                        {timeStr}
                                                    </div>
                                                    <div className="text-xs text-slate-500 mt-1 flex items-start gap-1.5">
                                                        <MapPin size={12} className="mt-0.5 shrink-0" />
                                                        <span>
                                                            <strong className="text-slate-700">{slot.delivery_option.label}</strong>
                                                            {slot.delivery_option.address && (
                                                                <span className="block text-slate-800 font-bold max-w-[200px] truncate">
                                                                    {slot.delivery_option.address}
                                                                </span>
                                                            )}
                                                            {slot.delivery_option.description && (
                                                                <span className="block text-slate-400 font-light max-w-[300px]">
                                                                    {slot.delivery_option.description}
                                                                </span>
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                                {/* Status / Selection Indicator */}
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-1
                                                ${isSelected ? 'border-orange-500 bg-orange-500' : 'border-slate-300'}
                                            `}>
                                                    {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                                </div>
                                            </div>
                                            {cutoffStr && (
                                                <div className="mt-2 text-[10px] text-red-500 bg-red-50 inline-block px-2 py-0.5 rounded-full border border-red-100">
                                                    {t('orders.order_by')} {cutoffStr}
                                                </div>
                                            )}
                                            {slot.delivery_option.map_url && (
                                                <div className="mt-3 rounded-xl overflow-hidden border border-slate-100 relative group h-32">
                                                    <iframe
                                                        src={slot.delivery_option.map_url}
                                                        width="100%"
                                                        height="100%"
                                                        style={{ border: 0 }}
                                                        className="pointer-events-none"
                                                        allowFullScreen={false}
                                                        loading="lazy"
                                                        referrerPolicy="no-referrer-when-downgrade"
                                                    ></iframe>
                                                    <div className="absolute inset-0 z-10 bg-transparent flex items-start justify-start p-2">
                                                        <div className="bg-white/90 px-2 py-1 rounded shadow-sm text-blue-600 text-[10px] font-bold border border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {t('orders.view_larger_map')}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}

                {/* 2. Empty State (Only if no dates AND not loading) */}
                {slots.length === 0 && !loading && (
                    <div className="p-8 text-center text-slate-500 italic bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                        <Calendar size={24} className="mx-auto text-slate-300 mb-2 opacity-50" />
                        <p className="text-sm">{t('orders.no_slots_available') || 'No delivery slots available at the moment.'}</p>
                    </div>
                )}

                {/* 3. Hardcoded Private Chat Option (Always at the bottom) */}
                <div className="pt-2">
                    <button
                        type="button"
                        onClick={() => onSelectSlot('PRIVATE_CHAT')}
                        className={`w-full text-left p-3 rounded-xl border transition-all duration-200 relative overflow-hidden
                        ${selectedSlotId === 'PRIVATE_CHAT'
                                ? 'bg-orange-50 border-orange-500 shadow-sm ring-1 ring-orange-500'
                                : 'bg-white border-slate-200 hover:border-orange-200 hover:bg-slate-50'
                            }`}
                    >
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${selectedSlotId === 'PRIVATE_CHAT' ? 'bg-orange-100' : 'bg-slate-100'}`}>
                                    <Clock size={16} className={selectedSlotId === 'PRIVATE_CHAT' ? 'text-orange-600' : 'text-slate-500'} />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-800">{t('orders.private_chat')}</div>
                                    <div className="text-[10px] text-slate-500">{t('checkout.form.privateChatDescription')}</div>
                                </div>
                            </div>
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                                ${selectedSlotId === 'PRIVATE_CHAT' ? 'border-orange-500 bg-orange-500' : 'border-slate-300'}
                            `}>
                                {selectedSlotId === 'PRIVATE_CHAT' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                            </div>
                        </div>
                    </button>
                </div>
            </div>
            {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        </div>
    );
}
