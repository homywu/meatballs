'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Save, Calendar, Clock, MapPin } from 'lucide-react';
import { upsertProductionSchedule, getDeliveryOptions } from '@/app/actions/admin';
import type { DeliveryOption, ProductionSchedule } from '@/types/admin';

// Known products constant (could be fetched from config or DB)
const KNOWN_PRODUCTS = [
    { id: 'beef', name: 'Nonna’s Beef Meatballs' },
    { id: 'pork', name: 'Spicy Pork Meatballs' },
];

/**
 * Formats a date string or object to local YYYY-MM-DDTHH:mm format
 * suitable for <input type="datetime-local">
 */
const formatToLocalDatetime = (dateValue: string | Date | null | undefined): string => {
    if (!dateValue) return '';
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return '';

    const pad = (n: number) => n.toString().padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());

    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

interface ScheduleFormProps {
    initialData?: ProductionSchedule;
    locale: string;
}

export default function ScheduleForm({ initialData, locale }: ScheduleFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);

    // Form State
    const [status, setStatus] = useState(initialData?.status || 'draft');
    const [notes, setNotes] = useState(initialData?.notes || '');

    // Products State
    const [products, setProducts] = useState<{ product_id: string, quantity: number }[]>(
        initialData?.products || KNOWN_PRODUCTS.map(p => ({ product_id: p.id, quantity: 0 }))
    );

    // Deliveries State
    // We maintain a list of delivery slots. For editing, we keep IDs.
    const [deliveries, setDeliveries] = useState(initialData?.deliveries || []);

    // Load options
    useEffect(() => {
        getDeliveryOptions().then(res => {
            if (res.success && res.data) setDeliveryOptions(res.data);
        });

        // If creating new, init products with known list
        if (!initialData) {
            setProducts(KNOWN_PRODUCTS.map(p => ({ product_id: p.id, quantity: 0 })));
        }
    }, [initialData]);

    const handleProductChange = (id: string, qty: number) => {
        setProducts(prev => {
            const exists = prev.find(p => p.product_id === id);
            if (exists) {
                return prev.map(p => p.product_id === id ? { ...p, quantity: qty } : p);
            }
            return [...prev, { product_id: id, quantity: qty }];
        });
    };

    const addDelivery = () => {
        // Find first option to default select
        const defaultOption = deliveryOptions[0]?.id || '';
        if (!defaultOption) {
            alert('Please create Delivery Options first!');
            return;
        }

        // Default tomorrow 10am
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0);

        setDeliveries([...deliveries, {
            id: undefined as unknown as string, // New items don't have ID yet
            schedule_id: initialData?.id || '',
            delivery_option_id: defaultOption,
            delivery_time: tomorrow.toISOString(),
            cutoff_time: null
        }]);
    };

    const updateDelivery = (index: number, field: string, value: any) => {
        const newDeliveries = [...deliveries];
        // Special handle for dates to ISO string if needed, 
        // simplified here assuming inputs return ISO or similar manageable strings
        newDeliveries[index] = { ...newDeliveries[index], [field]: value };
        setDeliveries(newDeliveries);
    };

    const removeDelivery = (index: number) => {
        const newDeliveries = [...deliveries];
        newDeliveries.splice(index, 1);
        setDeliveries(newDeliveries);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Sanitize delivery times (inputs give local time string like '2023-01-01T10:00')
        // We need to ensure they are ISO
        const safeDeliveries = deliveries.map(d => ({
            id: d.id, // Might be undefined for new
            delivery_option_id: d.delivery_option_id,
            // If input=datetime-local, it gives 'YYYY-MM-DDTHH:mm'. We need to add time zone or ensure it's treated as UTC?
            // Usually local time. Let's send as ISO string. 
            delivery_time: new Date(d.delivery_time).toISOString(),
            cutoff_time: d.cutoff_time ? new Date(d.cutoff_time).toISOString() : undefined
        }));

        const payload = {
            id: initialData?.id,
            status,
            notes,
            products: products.filter(p => p.quantity > 0),
            deliveries: safeDeliveries
        };

        const res = await upsertProductionSchedule(payload);
        setLoading(false);

        if (res.success) {
            router.push(`/${locale}/admin/schedules`);
            router.refresh();
        } else {
            alert('Error saving: ' + res.error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">{initialData ? 'Edit Schedule' : 'New Production Schedule'}</h2>
                <div className="flex gap-3">
                    <select
                        value={status}
                        onChange={e => setStatus(e.target.value as any)}
                        className="px-4 py-2 rounded-xl bg-white border border-slate-200 font-bold text-slate-900"
                    >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="completed">Completed</option>
                    </select>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-orange-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-orange-700 flex items-center gap-2"
                    >
                        <Save size={18} /> Save Schedule
                    </button>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Products Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Plus className="text-orange-500" /> Production Plan
                    </h3>
                    <div className="space-y-4">
                        {KNOWN_PRODUCTS.map(product => {
                            const current = products.find(p => p.product_id === product.id)?.quantity || 0;
                            return (
                                <div key={product.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                                    <label className="font-medium text-slate-700">{product.name}</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            min="0"
                                            value={current}
                                            onChange={e => handleProductChange(product.id, parseInt(e.target.value) || 0)}
                                            className="w-24 p-2 rounded-lg border border-slate-200 text-center font-bold bg-white text-slate-900"
                                        />
                                        <span className="text-xs text-slate-400 font-bold uppercase">Bags</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Delivery Slots Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Clock className="text-orange-500" /> Delivery Slots
                    </h3>

                    <div className="space-y-4 mb-4">
                        {deliveries.length === 0 && <p className="text-slate-400 italic text-sm">No delivery slots added.</p>}

                        {deliveries.map((slot, index) => (
                            <div key={index} className="bg-slate-50 p-4 rounded-xl border border-slate-200 relative group">
                                <button
                                    type="button"
                                    onClick={() => removeDelivery(index)}
                                    className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                                >
                                    <Trash2 size={16} />
                                </button>

                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Time</label>
                                        <input
                                            type="datetime-local"
                                            value={formatToLocalDatetime(slot.delivery_time)}
                                            onChange={e => updateDelivery(index, 'delivery_time', e.target.value)}
                                            className="w-full p-2 rounded-lg border border-slate-200 text-sm bg-white text-slate-900"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Location</label>
                                        <select
                                            value={slot.delivery_option_id}
                                            onChange={e => updateDelivery(index, 'delivery_option_id', e.target.value)}
                                            className="w-full p-2 rounded-lg border border-slate-200 text-sm bg-white text-slate-900"
                                        >
                                            {deliveryOptions.map(opt => (
                                                <option key={opt.id} value={opt.id}>{opt.label} ({opt.delivery_method})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Cutoff Time (Optional)</label>
                                        <input
                                            type="datetime-local"
                                            value={formatToLocalDatetime(slot.cutoff_time)}
                                            onChange={e => updateDelivery(index, 'cutoff_time', e.target.value)}
                                            className="w-full p-2 rounded-lg border border-slate-200 text-sm bg-white text-slate-900"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={addDelivery}
                        className="w-full py-2 bg-slate-100 text-slate-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition"
                    >
                        <Plus size={16} /> Add Slot
                    </button>
                </div>
            </div>

            <div>
                <label className="block font-bold text-slate-700 mb-2">Internal Notes</label>
                <textarea
                    value={notes || ''}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full p-4 rounded-2xl border border-slate-200 bg-white text-slate-900"
                    rows={3}
                    placeholder="Notes for production or logistics..."
                />
            </div>
        </form>
    );
}
