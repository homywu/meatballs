'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
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

    // Group slots by Date
    const groupedSlots: Record<string, DeliverySlot[]> = {};
    slots.forEach(slot => {
        const date = new Date(slot.delivery_time).toLocaleDateString(); // Local date string
        if (!groupedSlots[date]) groupedSlots[date] = [];
        groupedSlots[date].push(slot);
    });

    const selectedSlot = slots.find(s => s.id === selectedSlotId);

    return (
        <div className="space-y-4">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block ml-1">
                Pick up / Delivery Time
            </label>

            <div className="space-y-4 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                {Object.entries(groupedSlots).map(([date, dateSlots]) => (
                    <div key={date} className="space-y-2">
                        <h4 className="text-sm font-bold text-slate-700 sticky top-0 bg-white py-1 z-10 flex items-center gap-2">
                            <Calendar size={14} className="text-orange-500" />
                            {new Date(dateSlots[0].delivery_time).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        </h4>
                        <div className="grid gap-2">
                            {dateSlots.map(slot => {
                                const isSelected = selectedSlotId === slot.id;
                                const timeStr = new Date(slot.delivery_time).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
                                const cutoffStr = slot.cutoff_time ? new Date(slot.cutoff_time).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', month: 'short', day: 'numeric' }) : null;

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
                                                            <span className="block text-slate-400 font-light max-w-[200px] truncate">
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
                                                Order by {cutoffStr}
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {selectedSlot?.delivery_option?.map_url && (
                <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500 mt-4">
                    <iframe
                        src={selectedSlot.delivery_option.map_url}
                        width="100%"
                        height="200"
                        style={{ border: 0 }}
                        allowFullScreen={false}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                </div>
            )}
            {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        </div>
    );
}
