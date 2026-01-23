'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Trash2, MapPin, Truck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { getDeliveryOptions, upsertDeliveryOption, deleteDeliveryOption } from '@/app/actions/admin';
import type { DeliveryOption } from '@/types/admin';

export default function DeliveryOptionsPage() {
    const t = useTranslations();
    const [options, setOptions] = useState<DeliveryOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<Partial<DeliveryOption>>({ label: '', address: '', description: '', map_url: '', delivery_method: 'pickup' });

    // Fetch Options
    const fetchOptions = async () => {
        setLoading(true);
        try {
            const res = await getDeliveryOptions();
            if (res.success && res.data) {
                setOptions(res.data);
            } else if (res.error === 'Unauthorized') {
                // Determine locale from current path
                const parts = window.location.pathname.split('/');
                const currentLocale = parts[1] || 'en';
                window.location.href = `/${currentLocale}`;
            } else if (res.error) {
                console.error('Error fetching options:', res.error);
            }
        } catch (err) {
            console.error('Failed to fetch options:', err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchOptions();
    }, []);

    const handleEdit = (option?: DeliveryOption) => {
        if (option) {
            setEditForm(option);
        } else {
            setEditForm({ label: '', address: '', description: '', map_url: '', delivery_method: 'pickup' });
        }
        setIsEditing(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editForm.label) return;

        const res = await upsertDeliveryOption(editForm);
        if (res.success) {
            setIsEditing(false);
            fetchOptions();
        } else {
            alert('Failed to save: ' + res.error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this option?')) return;

        const res = await deleteDeliveryOption(id);
        if (res.success) {
            fetchOptions();
        } else {
            alert('Failed to delete: ' + res.error);
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Truck className="text-orange-500" />
                        Delivery Options
                    </h1>
                    <p className="text-slate-500">Manage pickup locations and delivery methods</p>
                </div>
                <button
                    onClick={() => handleEdit()}
                    className="bg-slate-900 text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition shadow-sm"
                >
                    <Plus size={18} />
                    New Option
                </button>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {options.map(option => (
                        <div key={option.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 group hover:border-orange-200 transition">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-orange-50 rounded-lg">
                                    <MapPin className="text-orange-600" size={24} />
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                    <button onClick={() => handleEdit(option)} className="text-slate-400 hover:text-slate-700">Edit</button>
                                    <button onClick={() => handleDelete(option.id)} className="text-red-400 hover:text-red-600"><Trash2 size={18} /></button>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-1">{option.label}</h3>
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase
                              ${option.delivery_method === 'pickup' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
                                    {option.delivery_method}
                                </span>
                            </div>
                            <p className="text-sm text-slate-800 font-bold">{option.address || 'No address'}</p>
                            <p className="text-xs text-slate-500 font-medium mt-1">{option.description || 'No description'}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Modal (Simple overlay for now) */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4 text-black">{editForm.id ? 'Edit Option' : 'New Delivery Option'}</h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Label (Internal Name)</label>
                                    <input
                                        className="w-full p-2 border rounded-lg bg-slate-50 text-slate-700"
                                        value={editForm.label}
                                        onChange={e => setEditForm({ ...editForm, label: e.target.value })}
                                        placeholder="e.g. Sage Hill HQ"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Method</label>
                                    <select
                                        className="w-full p-2 border rounded-lg bg-slate-50 text-slate-700"
                                        value={editForm.delivery_method || 'pickup'}
                                        onChange={e => setEditForm({ ...editForm, delivery_method: e.target.value })}
                                    >
                                        <option value="pickup">Pickup</option>
                                        <option value="delivery">Delivery</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Address</label>
                                <input
                                    className="w-full p-2 border rounded-lg bg-slate-50 text-slate-700"
                                    value={editForm.address || ''}
                                    onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                                    placeholder="Short address line"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                                <textarea
                                    className="w-full p-2 border rounded-lg bg-slate-50 text-slate-700"
                                    rows={2}
                                    value={editForm.description || ''}
                                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                    placeholder="Detailed description (e.g. Near the main entrance)"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Google maps embed URL (src)</label>
                                <input
                                    className="w-full p-2 border rounded-lg bg-slate-50 text-slate-700"
                                    value={editForm.map_url || ''}
                                    onChange={e => setEditForm({ ...editForm, map_url: e.target.value })}
                                    placeholder="https://www.google.com/maps/embed?..."
                                />
                            </div>

                            {editForm.map_url && (
                                <div className="rounded-lg overflow-hidden border border-slate-200 mt-2 h-32 relative group">
                                    <iframe
                                        src={editForm.map_url}
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        className="pointer-events-none"
                                        allowFullScreen={false}
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                    ></iframe>
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(editForm.address || editForm.label || '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="absolute inset-0 z-10 bg-transparent flex items-start justify-start p-2"
                                        title={t('orders.view_larger_map')}
                                    >
                                        <div className="bg-white/90 px-3 py-1.5 rounded shadow-sm text-blue-600 text-xs font-bold border border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {t('orders.view_larger_map')}
                                        </div>
                                    </a>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-slate-500 font-bold">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
