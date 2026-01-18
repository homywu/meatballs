'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import {
  Flame,
} from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import { submitOrder } from './actions';
import { createNavigation } from 'next-intl/navigation';
import { routing } from '@/i18n/routing';
import type { OrderItem } from '@/types/order';

// Components
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ProductCard from '@/components/ProductCard';
import CheckoutForm from '@/components/CheckoutForm';
import CheckoutBar from '@/components/CheckoutBar';
import SuccessView from '@/components/SuccessView';

const navigation = createNavigation(routing);

export default function HomePage() {
  const t = useTranslations();
  const { data: session } = useSession();

  // 產品數據 - 使用翻譯
  const PRODUCTS = useMemo(() => [
    {
      id: 'beef',
      name: t('menu.products.beef.name'),
      desc: t('menu.products.beef.desc'),
      price: 20,
      tag: t('menu.products.beef.tag'),
      image: '/images/beef-meatballs.jpg'
    },
    {
      id: 'pork',
      name: t('menu.products.pork.name'),
      desc: t('menu.products.pork.desc'),
      price: 18,
      tag: t('menu.products.pork.tag'),
      image: '/images/pork-meatballs.jpg'
    },
    {
      id: 'fish',
      name: t('menu.products.fish.name'),
      desc: t('menu.products.fish.desc'),
      price: 22,
      tag: t('menu.products.fish.tag'),
      image: '/images/fish-meatballs.jpg'
    }
  ], [t]);

  // 狀態管理
  const [cart, setCart] = useState<Record<string, number>>({});
  const [step, setStep] = useState('menu');
  const [deliveryType, setDeliveryType] = useState('pickup');
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', notes: '' });
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = navigation.useRouter();
  const pathname = navigation.usePathname();

  // 監聽滾動以改變 Header 樣式
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // 計算總價與總數量
  const totalQty: number = (Object.values(cart) as number[]).reduce((a: number, b: number) => a + b, 0);
  const totalPrice: number = (Object.entries(cart) as [string, number][]).reduce((total: number, [id, qty]: [string, number]) => {
    const product = PRODUCTS.find((p: { id: string }) => p.id === id);
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
    setFormData((prev: { name: string; phone: string; address: string; notes: string }) => ({ ...prev, [name]: value }));
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
          const product = PRODUCTS.find((p: { id: string }) => p.id === id);
          if (!product) return null;
          return {
            id: product.id,
            name: product.name,
            quantity,
            price: product.price
          };
        })
        .filter((item): item is OrderItem => item !== null);

      // Prepare order data
      const orderData = {
        customer_name: formData.name,
        phone_number: formData.phone,
        delivery_method: deliveryType === 'pickup' ? 'pickup_sage_hill' as const : 'delivery' as const,
        delivery_address: deliveryType === 'delivery' ? formData.address : undefined,
        items,
        total_amount: totalPrice,
        notes: formData.notes || undefined
      };

      // Submit order via Server Action
      const result = await submitOrder(orderData);

      if (result.success) {
        // Only show success page if order was successfully saved
        setStep('success');
        window.scrollTo(0, 0);
      } else {
        // Show error message
        setSubmitError(result.error || 'Failed to submit order. Please try again.');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      setSubmitError(error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  // 1. 成功頁面 (Success View)
  if (step === 'success') {
    return (
      <SuccessView totalPrice={totalPrice} phone={formData.phone} />
    );
  }

  // 2. 主下單頁面 (Order View)
  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-32 font-sans selection:bg-orange-200">

      {/* Immersive Header */}
      <Header
        isScrolled={isScrolled}
        session={session}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
      />

      {/* Hero Section */}
      <HeroSection />

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 mt-4 relative z-30 space-y-8">

        {/* Menu Section */}
        <section className="space-y-6">
          {/* Enhanced Header Design */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              🍽️ {t('menu.title')}
            </h3>
            <span className="text-xs font-bold text-orange-700 bg-orange-50 px-3 py-1.5 rounded-full flex items-center gap-1 border border-orange-100">
              <Flame size={12} className="fill-orange-500 text-orange-500" />
              {t('menu.lowStock')}
            </span>
          </div>

          <div className="grid gap-6">
            {PRODUCTS.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                quantity={cart[product.id] || 0}
                onUpdateCart={updateCart}
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
              deliveryType={deliveryType}
              setDeliveryType={setDeliveryType}
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
          canSubmit={!!(formData.name && formData.phone)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}