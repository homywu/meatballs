'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Clock, CheckCircle, XCircle, MapPin, Trash2 } from 'lucide-react';
import { useLocale } from 'next-intl';
import { getAdminOrders, deleteOrder } from '@/app/actions/admin';
import type { Order } from '@/types/order';

export default function OrdersPage() {
    const router = useRouter();
    const locale = useLocale();

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await getAdminOrders(statusFilter);
            if (res.success && res.data) {
                setOrders(res.data);
            } else if (res.error === 'Unauthorized') {
                router.push(`/${locale}`);
            } else if (res.error) {
                console.error('Error fetching orders:', res.error);
            }
        } catch (err) {
            console.error('Failed to fetch orders:', err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchOrders();
    }, [statusFilter]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this order?')) return;
        const res = await deleteOrder(id);
        if (res.success) {
            fetchOrders();
        } else {
            alert('Error: ' + res.error);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'paid':
                return <CheckCircle className="w-4 h-4 text-blue-600" />;
            case 'pending':
                return <Clock className="w-4 h-4 text-orange-600" />;
            case 'waitlist':
                return <Clock className="w-4 h-4 text-yellow-600" />;
            case 'cancelled':
                return <XCircle className="w-4 h-4 text-red-600" />;
            default:
                return <XCircle className="w-4 h-4 text-gray-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
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
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const canDelete = (status: string) => !['paid', 'completed'].includes(status);

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <ShoppingCart className="text-orange-500" />
                        Orders
                    </h1>
                    <p className="text-slate-500">View and manage customer orders</p>
                </div>
                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="px-4 py-2 rounded-xl bg-white border border-slate-200 font-medium text-slate-700"
                >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="completed">Completed</option>
                    <option value="waitlist">Waitlist</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            {loading ? (
                <div className="text-center py-12 text-slate-500">Loading...</div>
            ) : (
                <div className="space-y-4">
                    {orders.map(order => (
                        <div key={order.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-orange-200 transition">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    {/* Header */}
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                                            {getStatusIcon(order.status)}
                                            <span className="capitalize">{order.status}</span>
                                        </span>
                                        {order.reference_number && (
                                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-mono font-bold">
                                                {order.reference_number}
                                            </span>
                                        )}
                                        <span className="text-sm text-slate-400">
                                            {formatDate(order.created_at)}
                                        </span>
                                    </div>

                                    {/* Customer & Amount */}
                                    <div className="flex items-center gap-4 mb-3">
                                        <span className="font-bold text-slate-800">{order.customer_name}</span>
                                        <span className="text-xl font-bold text-orange-600">${order.total_amount.toFixed(2)}</span>
                                    </div>

                                    {/* Items Summary */}
                                    <div className="text-sm text-slate-600 mb-2">
                                        {order.items?.map((item, i) => (
                                            <span key={i}>
                                                {item.name} × {item.quantity}
                                                {i < order.items.length - 1 ? ', ' : ''}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Delivery Info */}
                                    {order.schedule_delivery ? (
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <Clock size={14} />
                                            <span>
                                                {new Date(order.schedule_delivery.delivery_time).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
                                                    weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                                                })}
                                            </span>
                                            {order.schedule_delivery.delivery_option && (
                                                <>
                                                    <MapPin size={14} />
                                                    <span>{order.schedule_delivery.delivery_option.label}</span>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-xs text-slate-400 italic">Private Chat</div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2 ml-4">
                                    <Link
                                        href={`/${locale}/admin/orders/${order.id}`}
                                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200 text-center"
                                    >
                                        View
                                    </Link>
                                    {canDelete(order.status) && (
                                        <button
                                            onClick={() => handleDelete(order.id)}
                                            className="px-4 py-2 bg-white border border-red-100 text-red-500 rounded-lg text-sm font-bold hover:bg-red-50 flex items-center justify-center gap-1"
                                        >
                                            <Trash2 size={14} />
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {orders.length === 0 && (
                        <div className="text-center py-12 bg-slate-50 rounded-2xl border-dashed border-2 border-slate-200">
                            <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                            <p className="text-slate-400 font-medium">No orders found</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
