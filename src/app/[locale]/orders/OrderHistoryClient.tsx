'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Package, Calendar, DollarSign, MapPin, Store, CheckCircle, Clock, XCircle } from 'lucide-react';
// Footer removed
import type { Order } from '@/types/order';

interface OrderHistoryClientProps {
  orders: Order[];
  error?: string;
  locale: string;
}

export default function OrderHistoryClient({ orders, error, locale }: OrderHistoryClientProps) {
  const t = useTranslations();
  const router = useRouter();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-orange-600" />;
      default:
        return <XCircle className="w-5 h-5 text-gray-600" />;
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
    <div className="min-h-screen bg-[#FDFBF7] pb-8">
      {/* Header */}
      {/* Content */}
      <main className="max-w-md mx-auto px-4 py-6 pt-24">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Order History</h1>
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center space-y-4 border border-slate-200">
            <div className="flex justify-center">
              <div className="bg-slate-100 p-6 rounded-full">
                <Package className="w-12 h-12 text-slate-400" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">No Orders Yet</h2>
              <p className="text-slate-500">You haven't placed any orders yet.</p>
            </div>
            <button
              onClick={() => router.push(`/${locale}`)}
              className="mt-6 bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4"
              >
                {/* Order Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-5 h-5 text-slate-400" />
                      <span className="text-sm font-mono text-slate-500">
                        {order.id.slice(0, 8)}...
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(order.created_at)}</span>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="capitalize">{order.status}</span>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="flex items-start gap-2 text-sm">
                  {order.delivery_method === 'pickup_sage_hill' ? (
                    <>
                      <Store className="w-4 h-4 text-slate-400 mt-0.5" />
                      <span className="text-slate-600">Pickup at Sage Hill</span>
                    </>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                      <span className="text-slate-600">{order.delivery_address}</span>
                    </>
                  )}
                </div>

                {/* Order Items */}
                <div className="space-y-2 pt-4 border-t border-slate-100">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-slate-700">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="font-medium text-slate-800">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-orange-600" />
                    <span className="font-bold text-slate-800">Total</span>
                  </div>
                  <span className="text-2xl font-bold text-orange-600">
                    ${order.total_amount.toFixed(2)}
                  </span>
                </div>

                {/* Notes */}
                {order.notes && (
                  <div className="pt-2 text-sm text-slate-600 italic">
                    Note: {order.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
