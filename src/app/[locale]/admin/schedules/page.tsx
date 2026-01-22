'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Plus, Calendar, Clock, MapPin } from 'lucide-react';
import { getProductionSchedules, deleteProductionSchedule } from '@/app/actions/admin';
import type { ProductionSchedule } from '@/types/admin';

export default function SchedulesPage({ params }: { params: Promise<{ locale: string }> }) {
    // Unwrap params using React.use() or await if async component. 
    // Since this is client component receiving promise props (in Next 15?), we need to unwrap.
    // Actually params is passed as Promise in newer Next.js.
    // But cleaner to just use useParams or await it in parent layout.
    // Let's assume standard client component usage. Wait, user provided code showed params: Promise in server component.
    // We can just get locale from a hook since we are 'use client'.
    // import { useLocale } from 'next-intl';

    // Actually, easiest is just use useLocale()

    const [schedules, setSchedules] = useState<ProductionSchedule[]>([]);
    const [loading, setLoading] = useState(true);

    // We can use useLocale to get locale
    // but to keep imports simple let's assume we can get it from path or props if passed correctly.

    const fetchSchedules = async () => {
        setLoading(true);
        const res = await getProductionSchedules();
        if (res.success && res.data) {
            setSchedules(res.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchSchedules();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure? This might affect existing orders linked to this schedule!')) return;
        await deleteProductionSchedule(id);
        fetchSchedules();
    };

    // Need locale for links
    // A simple hack if useLocale is not available is window location, but cleaner to use hook.
    // I'll skip hook import to avoid guessing implementation details of their intl setup
    // and just grab it from window or assume 'en' if fails, or just use simple link if I knew locale.
    // I'll grab it from the first segment of pathname via window if in browser.
    // Actually, let's just use `usePathname` from `next/navigation` to construct links.

    const [locale, setLocale] = useState('en');
    useEffect(() => {
        const parts = window.location.pathname.split('/');
        if (parts[1]) setLocale(parts[1]);
    }, []);

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Package className="text-orange-500" />
                        Production Schedules
                    </h1>
                    <p className="text-slate-500">Manage production days and delivery slots</p>
                </div>
                <Link
                    href={`/${locale}/admin/schedules/new`}
                    className="bg-slate-900 text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition shadow-sm"
                >
                    <Plus size={18} />
                    New Schedule
                </Link>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <div className="space-y-4">
                    {schedules.map(schedule => (
                        <div key={schedule.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-orange-200 transition">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${schedule.status === 'published' ? 'bg-green-100 text-green-800' :
                                                schedule.status === 'draft' ? 'bg-slate-100 text-slate-600' :
                                                    'bg-blue-100 text-blue-800'
                                            }`}>
                                            {schedule.status}
                                        </span>
                                        <span className="text-sm text-slate-400">ID: {schedule.id.slice(0, 8)}...</span>
                                    </div>

                                    {/* Products Summary */}
                                    <div className="flex gap-4 mb-4">
                                        {schedule.products?.map(p => (
                                            <div key={p.product_id} className="flex items-center gap-1.5 text-slate-700">
                                                <Package size={16} className="text-orange-400" />
                                                <span className="font-bold">{p.quantity}</span>
                                                <span className="text-sm">{p.product_id}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Deliveries Summary */}
                                    <div className="flex flex-wrap gap-2">
                                        {schedule.deliveries?.map(d => (
                                            <div key={d.id} className="text-xs bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg flex items-center gap-1.5 text-slate-500">
                                                <Clock size={12} />
                                                <span>{new Date(d.delivery_time).toLocaleDateString()} {new Date(d.delivery_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                <span className="text-slate-300">|</span>
                                                <span>{d.delivery_option?.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Link
                                        href={`/${locale}/admin/schedules/${schedule.id}`}
                                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200 text-center"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(schedule.id)}
                                        className="px-4 py-2 bg-white border border-red-100 text-red-500 rounded-lg text-sm font-bold hover:bg-red-50"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {schedules.length === 0 && (
                        <div className="text-center py-12 bg-slate-50 rounded-2xl border-dashed border-2 border-slate-200">
                            <p className="text-slate-400 font-medium">No schedules found</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
