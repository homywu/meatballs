'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import {
  Flame,
} from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import type { OrderItem } from '@/types/order';
import type { Product } from '@/types/product';
import { getProducts, submitOrder } from './actions';
import { useLocale } from 'next-intl';
import { createNavigation } from 'next-intl/navigation';
import { routing } from '@/i18n/routing';

// Components
import HeroSection from '@/components/HeroSection';
import ProductCard from '@/components/ProductCard';
import CheckoutForm from '@/components/CheckoutForm';
import CheckoutBar from '@/components/CheckoutBar';
import SuccessView from '@/components/SuccessView';


const navigation = createNavigation(routing);

export default function HomePage() {
  const t = useTranslations();
  const { data: session } = useSession();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const locale = useLocale() as 'en' | 'zh';

  // Fetch Products from DB
  useEffect(() => {
    getProducts().then((res) => {
      if (res.success && res.data) {
        setProducts(res.data);
      }
      setIsLoadingProducts(false);
    });
  }, []);

  // 狀態管理
  const [cart, setCart] = useState<Record<string, number>>({});
  const [step, setStep] = useState('menu');
  const [selectedSlotId, setSelectedSlotId] = useState<string | undefined>(undefined);
  const [formData, setFormData] = useState({ name: '', phone: '', notes: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lastOrderRef, setLastOrderRef] = useState<string | undefined>(undefined);
  const [inventory, setInventory] = useState<Record<string, { total: number; remaining: number }>>({});
  const [successMessage, setSuccessMessage] = useState<string | undefined>(undefined);

  const router = navigation.useRouter();
  const pathname = navigation.usePathname();

  // Scroll listener removed


  // Switch language function handled in Header now
  // removed switchLocale

  // Pre-fill form with user info when session is available
  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || session.user?.name || '',
      }));
    }
  }, [session]);

  // Fetch Inventory
  useEffect(() => {
    // Import here to avoid server-action issues if any, though declared at top is fine.
    // But we need to use the imported function.
    import('./actions').then(({ getInventoryStatus }) => {
      getInventoryStatus().then((res) => {
        if (res.success && res.data) {
          setInventory(res.data);
        }
      });
    });
  }, []); // Run once on mount

  // Calculate Low Stock Status (< 30% remaining globally)
  const isLowStock = useMemo(() => {
    const totalCapacity = Object.values(inventory).reduce((acc, curr) => acc + curr.total, 0);
    const totalRemaining = Object.values(inventory).reduce((acc, curr) => acc + curr.remaining, 0);
    if (totalCapacity === 0) return false;
    return (totalRemaining / totalCapacity) < 0.3;
  }, [inventory]);

  // 計算總價與總數量
  const totalQty: number = (Object.values(cart) as number[]).reduce((a: number, b: number) => a + b, 0);
  const totalPrice: number = (Object.entries(cart) as [string, number][]).reduce((total: number, [id, qty]: [string, number]) => {
    const product = products.find((p: { id: string }) => p.id === id);
    return total + (product ? product.price * qty : 0);
  }, 0);

  // 處理加減購物車
  const updateCart = (id: string, delta: number) => {
    setCart((prev: Record<string, number>) => {
      const currentQty = prev[id] || 0;
      const newQty = Math.max(0, currentQty + delta);
      if (newQty === 0) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: newQty };
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    // Reset error state
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      // Transform cart data into OrderItem format
      const items: OrderItem[] = Object.entries(cart)
        .map(([id, quantity]) => {
          const product = products.find((p: { id: string }) => p.id === id);
          if (!product) return null;
          return {
            id: product.id,
            product_id: product.id,
            name: product.name[locale] || product.name.en,
            quantity,
            price: product.price
          };
        })
        .filter((item): item is OrderItem => item !== null);

      if (!selectedSlotId) {
        setSubmitError("Please select a delivery time.");
        setIsSubmitting(false);
        return;
      }

      // Prepare order data
      const orderData = {
        customer_name: formData.name,
        phone_number: formData.phone,
        schedule_delivery_id: selectedSlotId,
        items,
        total_amount: totalPrice,
        notes: formData.notes || undefined
      };

      // Submit order via Server Action
      const result = await submitOrder(orderData);

      if (result.success && result.data) {
        // Handle new response format: { orders: [], message: string }
        // Concatenate reference numbers if multiple orders
        const orders = result.data.orders as { type: string; order: { reference_number: string } }[];
        const refs = orders.map((o) => o.order.reference_number).join(', ');
        const msg = result.data.message as string;

        setLastOrderRef(refs);
        setSuccessMessage(msg);
        setStep('success');
        window.scrollTo(0, 0);
      } else {
        // Show error message
        setSubmitError(result.error || t('checkout.errors.submit'));
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      setSubmitError(error instanceof Error ? error.message : t('checkout.errors.unexpected'));
      setIsSubmitting(false);
    }
  };

  // 1. 成功頁面 (Success View)
  if (step === 'success') {
    return (
      <SuccessView
        totalPrice={totalPrice}
        phone={formData.phone}
        referenceNumber={lastOrderRef}
        message={successMessage}
      />
    );
  }

  // 2. 主下單頁面 (Order View)
  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-32 font-sans selection:bg-orange-200">

      {/* Immersive Header */}
      {/* Header removed - in Layout */}

      {/* Hero Section */}
      <HeroSection />

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 mt-4 relative z-30 space-y-8">

        {/* Menu Section */}
        <section className="space-y-6">
          {/* Enhanced Header Design */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              🍽️ {t('menu.title')}
            </h3>
            {isLowStock && (
              <span className="text-xs font-bold text-orange-700 bg-orange-50 px-3 py-1.5 rounded-full flex items-center gap-1 border border-orange-100 animate-pulse">
                <Flame size={12} className="fill-orange-500 text-orange-500" />
                {t('menu.lowStock')}
              </span>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {isLoadingProducts ? (
              <div className="text-center py-12 text-slate-400">
                {t('common.loading')}
              </div>
            ) : products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                quantity={cart[product.id] || 0}
                onUpdateCart={updateCart}
                remaining={inventory[product.id]?.remaining || 0}
                priority={index < 2}
              />
            ))}
          </div>
        </section>

        {/* Checkout Form Section */}
        {totalQty > 0 && (
          <AuthGuard session={session}>
            <CheckoutForm
              formData={formData}
              handleInputChange={handleInputChange}
              selectedSlotId={selectedSlotId}
              setSelectedSlotId={setSelectedSlotId}
              submitError={submitError}
            />
          </AuthGuard>
        )}
      </main>
      {/* Sticky Checkout Bar */}
      {totalQty > 0 && (
        <CheckoutBar
          totalQty={totalQty}
          totalPrice={totalPrice}
          session={session}
          isSubmitting={isSubmitting}
          canSubmit={!!(formData.name && formData.phone && selectedSlotId)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}