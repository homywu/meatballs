'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Save, CheckCircle, Package, Clock, MapPin,
    User, Phone, ArrowLeft, Trash2, AlertCircle
} from 'lucide-react';
import { updateOrderStatus, deleteOrder } from '@/app/actions/admin';
import type { Order } from '@/types/order';

interface OrderFormProps {
    order: Order;
    locale: string;
}

export default function OrderForm({ order, locale }: OrderFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [status, setStatus] = useState(order.status);
    const [error, setError] = useState<string | null>(null);

    // Determine if order is editable (pending, waitlist, or cancelled)
    const editableStatuses = ['pending', 'waitlist', 'cancelled'];
    const isEditable = editableStatuses.includes(order.status);
    const canDelete = !['paid', 'completed'].includes(order.status);

    const handleSave = async () => {
        if (status === order.status) {
            // No change
            return;
        }

        setLoading(true);
        setError(null);

        const res = await updateOrderStatus(order.id, status);
        setLoading(false);

        if (res.success) {
            setShowSuccess(true);
            setTimeout(() => {
                router.push(`/${locale}/admin/orders`);
                router.refresh();
            }, 1500);
        } else {
            setError(res.error || 'Failed to update order');
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
            return;
        }

        setLoading(true);
        setError(null);

        const res = await deleteOrder(order.id);
        setLoading(false);

        if (res.success) {
            router.push(`/${locale}/admin/orders`);
            router.refresh();
        } else {
            setError(res.error || 'Failed to delete order');
        }
    };

    const getStatusColor = (s: string) => {
        switch (s) {
            case 'completed':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'paid':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'pending':
                return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'waitlist':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'cancelled':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/${locale}/admin/orders`}
                        className="p-2 hover:bg-slate-100 rounded-xl transition"
                    >
                        <ArrowLeft size={20} className="text-slate-600" />
                    </Link>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Order Details</h2>
                        {order.reference_number && (
                            <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-mono font-bold">
                                {order.reference_number}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex gap-3">
                    {canDelete && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={loading}
                            className="bg-red-50 text-red-600 px-4 py-2 rounded-xl font-bold hover:bg-red-100 flex items-center gap-2 border border-red-200"
                        >
                            <Trash2 size={18} /> Delete
                        </button>
                    )}
                    {isEditable && status !== order.status && (
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={loading}
                            className="bg-orange-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-orange-700 flex items-center gap-2"
                        >
                            <Save size={18} /> Save Changes
                        </button>
                    )}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
                {/* Customer Info */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <User className="text-orange-500" size={20} />
                        Customer Information
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Name</label>
                            <p className="text-slate-800 font-medium">{order.customer_name}</p>
                        </div>
                        {order.phone_number && (
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Phone</label>
                                <p className="text-slate-800 font-medium flex items-center gap-2">
                                    <Phone size={14} className="text-slate-400" />
                                    {order.phone_number}
                                </p>
                            </div>
                        )}
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Order Date</label>
                            <p className="text-slate-600">{formatDate(order.created_at)}</p>
                        </div>
                    </div>
                </div>

                {/* Status & Actions */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-4">Order Status</h3>

                    {isEditable ? (
                        <div className="space-y-3">
                            <select
                                value={status}
                                onChange={e => setStatus(e.target.value as Order['status'])}
                                className={`w-full p-3 rounded-xl border-2 font-bold text-center ${getStatusColor(status)}`}
                            >
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                                <option value="completed">Completed</option>
                                <option value="waitlist">Waitlist</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <p className="text-xs text-slate-500 text-center">
                                Select a new status and click "Save Changes"
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className={`w-full p-3 rounded-xl border-2 font-bold text-center capitalize ${getStatusColor(order.status)}`}>
                                {order.status}
                            </div>
                            <p className="text-xs text-slate-500 text-center">
                                This order cannot be modified (status: {order.status})
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <MapPin className="text-orange-500" size={20} />
                    Delivery Information
                </h3>

                {order.schedule_delivery ? (
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Delivery Time</label>
                            <p className="text-slate-800 font-medium flex items-center gap-2">
                                <Clock size={16} className="text-orange-500" />
                                {formatDate(order.schedule_delivery.delivery_time)}
                            </p>
                        </div>
                        {order.schedule_delivery.delivery_option && (
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Location</label>
                                <p className="text-slate-800 font-medium">{order.schedule_delivery.delivery_option.label}</p>
                                {order.schedule_delivery.delivery_option.address && (
                                    <p className="text-sm text-slate-600">{order.schedule_delivery.delivery_option.address}</p>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-slate-500 italic">Private Chat (no scheduled delivery)</p>
                )}
            </div>

            {/* Order Items */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Package className="text-orange-500" size={20} />
                    Order Items
                </h3>
                <div className="space-y-3">
                    {order.items?.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                            <div>
                                <span className="font-medium text-slate-800">
                                    {(item.product?.name as any)?.[locale] || (item.product?.name as any)?.en || item.name}
                                </span>
                                <span className="text-slate-500 ml-2">× {item.quantity}</span>
                            </div>
                            <span className="font-bold text-slate-800">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                    <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                        <span className="font-bold text-slate-600">Total</span>
                        <span className="text-2xl font-bold text-orange-600">${order.total_amount.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Notes */}
            {order.notes && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-2">Notes</h3>
                    <p className="text-slate-600 italic">{order.notes}</p>
                </div>
            )}

            {/* Success Notification Overlay */}
            {showSuccess && (
                <div className="fixed inset-0 flex items-center justify-center z-[100] bg-white/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white border border-slate-100 shadow-2xl rounded-3xl p-8 flex flex-col items-center gap-4 animate-in zoom-in duration-500 transform scale-110">
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 shadow-inner">
                            <CheckCircle size={40} strokeWidth={2.5} />
                        </div>
                        <div className="text-center">
                            <h3 className="font-bold text-slate-900 text-2xl mb-1">Order Updated!</h3>
                            <p className="text-slate-400 font-medium">Redirecting you back...</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
