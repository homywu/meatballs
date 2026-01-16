'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { useSession } from 'next-auth/react';
import {
  Plus,
  Minus,
  MapPin,
  Store,
  Copy,
  CheckCircle,
  Flame,
  Star,
  Clock,
  ArrowRight,
  History,
  Menu,
  X,
  Globe,
  LogIn,
  LogOut,
  User
} from 'lucide-react';
import AuthButton from '@/components/AuthButton';
import AuthGuard from '@/components/AuthGuard';
import { submitOrder } from './actions';
import { signIn, signOut } from 'next-auth/react';
import { createNavigation } from 'next-intl/navigation';
import { routing } from '@/i18n/routing';
import type { OrderItem } from '@/types/order';

const navigation = createNavigation(routing);

export default function HomePage() {
  const t = useTranslations();
  const locale = useLocale();
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
  const [copySuccess, setCopySuccess] = useState(false);
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

  // Click outside handler to close menu
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.menu-container') && !target.closest('.menu-button')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  // Switch language function
  const switchLocale = (newLocale: string) => {
    router.push(pathname, { locale: newLocale });
    setIsMenuOpen(false);
  };

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

  const copyToClipboard = async () => {
    try {
      // Modern clipboard API
      await navigator.clipboard.writeText('carfield.ni@gmail.com');
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = 'carfield.ni@gmail.com';
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (fallbackErr) {
        console.error('Copy failed', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  // --- 視圖組件 ---

  // 1. 成功頁面 (Success View)
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-orange-50/50 flex flex-col items-center justify-center p-6 font-sans">
        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 text-center space-y-6 animate-in fade-in zoom-in duration-300 border border-orange-100">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-slate-800">{t('success.title')}</h2>
            <p className="text-slate-500 mt-2">{t('success.subtitle')}</p>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-100 dashed-border">
            <p className="text-sm font-medium text-slate-500 mb-1">{t('success.total')}</p>
            <p className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 font-serif">
              ${totalPrice.toFixed(2)}
            </p>
          </div>

          <div className="space-y-4 text-left">
            <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <span className="bg-slate-800 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">1</span>
              {t('success.step1')}
            </p>
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200 group hover:border-orange-300 transition-colors">
              <code className="text-slate-800 font-mono text-lg font-medium">carfield.ni@gmail.com</code>
              <button
                onClick={copyToClipboard}
                className="text-sm bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 text-slate-600 hover:text-orange-600 hover:border-orange-200 active:scale-95 transition flex items-center gap-1"
              >
                {copySuccess ? <CheckCircle size={14} /> : <Copy size={14} />}
                {copySuccess ? t('success.copied') : t('success.copy')}
              </button>
            </div>

            <p className="text-sm font-bold text-slate-700 flex items-center gap-2 mt-4">
              <span className="bg-slate-800 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">2</span>
              {t('success.step2')}
            </p>
            <div className="bg-red-50 p-3 rounded-xl border border-red-100 flex items-start gap-2">
              <div className="mt-0.5"><Star className="w-4 h-4 text-red-500 fill-red-500" /></div>
              <p className="text-sm text-red-700">
                {t('success.step2Note', { phone: formData.phone })}
              </p>
            </div>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition shadow-lg hover:shadow-xl translate-y-0 hover:-translate-y-1"
          >
            {t('success.backHome')}
          </button>
        </div>
      </div>
    );
  }

  // 2. 主下單頁面 (Order View)
  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-32 font-sans selection:bg-orange-200">

      {/* Immersive Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-4'
          }`}
      >
        <div className="max-w-md mx-auto px-4 flex justify-between items-center relative">
          <div className={`flex items-center space-x-2 transition-colors ${isScrolled ? 'text-slate-800' : 'text-white'}`}>
            <div>
              <Image
                src="/logo_192.png"
                alt="Logo"
                width={32}
                height={32}
                className="w-8 h-8 rounded-xl"
              />
            </div>
            <h1 className="text-lg font-bold tracking-wide">{t('common.appName')}</h1>
          </div>

          {/* Auth Button and Menu Button */}
          <div className="flex items-center gap-2">
            <AuthButton isScrolled={isScrolled} session={session} />

            {/* Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`menu-button px-3 py-2 rounded-lg flex items-center justify-center transition-colors ${isScrolled ? 'bg-slate-100 text-slate-800 hover:bg-slate-200' : 'bg-white/20 backdrop-blur text-white hover:bg-white/30'}`}
              aria-label="Menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Menu Dropdown */}
          {isMenuOpen && (
            <div className="menu-container absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 space-y-3">
                {/* Status Badge */}
                <div className="flex items-center justify-center pb-3 border-b border-slate-100">
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 ${isScrolled ? 'bg-green-100 text-green-700' : 'bg-green-100 text-green-700'}`}>
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    {t('common.status.accepting')}
                  </span>
                </div>

                {/* Order History (if logged in) */}
                {session && (
                  <button
                    onClick={() => {
                      router.push(`/${locale}/orders`);
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 rounded-xl flex items-center gap-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <History size={18} className="text-slate-500" />
                    <span>{t('common.orderHistory') || 'Order History'}</span>
                  </button>
                )}

                {/* Language Switcher */}
                <button
                  onClick={() => switchLocale(locale === 'zh' ? 'en' : 'zh')}
                  className="w-full px-4 py-3 rounded-xl flex items-center gap-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Globe size={18} className="text-slate-500" />
                  <span>{locale === 'zh' ? '中文' : 'English'}</span>
                  <span className="ml-auto text-xs text-slate-400">{locale === 'zh' ? 'EN' : '中文'}</span>
                </button>

                {/* Auth Section */}
                <div className="pt-3 border-t border-slate-100">
                  {session?.user ? (
                    <>
                      <div className="px-4 py-2 mb-2 flex items-center gap-3">
                        {session.user.image ? (
                          <Image
                            src={session.user.image}
                            alt={session.user.name || 'User'}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                            <User size={18} className="text-slate-500" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">
                            {session.user.name || session.user.email}
                          </p>
                          {session.user.email && session.user.name && (
                            <p className="text-xs text-slate-500 truncate">{session.user.email}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          signOut();
                          setIsMenuOpen(false);
                        }}
                        className="w-full px-4 py-3 rounded-xl flex items-center gap-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={18} />
                        <span>Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        signIn('google');
                        setIsMenuOpen(false);
                      }}
                      className="w-full px-4 py-3 rounded-xl flex items-center gap-3 text-left text-sm font-medium bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors"
                    >
                      <LogIn size={18} />
                      <span>Sign In</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section with Background Image */}
      <div className="relative h-[420px] w-full overflow-hidden">
        {/* Dark Overlay gradient - 修復：改為上下雙向漸變，確保 Header 和底部文字都清晰 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/10 to-black/80 z-10"></div>
        <Image
          src="/images/hero-meatballs.jpg"
          alt="Delicious Meatballs"
          fill
          className="object-cover object-center animate-in fade-in duration-1000 scale-105"
          priority
          sizes="100vw"
        />

        <div className="absolute bottom-0 left-0 right-0 z-20 p-6 pb-12 max-w-md mx-auto">
          <span className="inline-block px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-lg mb-3 shadow-lg">
            {t('hero.badge')}
          </span>
          <h2 className="text-4xl font-extrabold text-white leading-tight mb-2 drop-shadow-lg">
            {t('hero.title').split('\n').map((line: string, i: number, arr: string[]) => {
              const highlight = t('hero.highlight');
              const parts = line.split(highlight);
              return (
                <React.Fragment key={i}>
                  {parts.map((part: string, j: number) => (
                    <React.Fragment key={j}>
                      {part}
                      {j < parts.length - 1 && <span className="text-orange-400">{highlight}</span>}
                    </React.Fragment>
                  ))}
                  {i < arr.length - 1 && <br />}
                </React.Fragment>
              );
            })}
          </h2>
          <p className="text-slate-200 text-sm font-medium flex items-center gap-4 mt-4">
            <span className="flex items-center gap-1"><Clock size={14} /> {t('hero.features.fresh')}</span>
            <span className="flex items-center gap-1"><Star size={14} /> {t('hero.features.noPreservatives')}</span>
          </p>
        </div>

        {/* Curved Divider */}
        <div className="absolute bottom-[-1px] left-0 w-full overflow-hidden leading-[0] z-20">
          <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block h-[40px] w-full fill-[#FDFBF7] rotate-180">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
          </svg>
        </div>
      </div>

      {/* Main Content - Adjusted spacing and z-index */}
      <main className="max-w-md mx-auto px-4 mt-4 relative z-30 space-y-8">

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
            {PRODUCTS.map((product: { id: string; name: string; desc: string; price: number; tag: string; image: string }) => (
              <div key={product.id} className="group bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100">
                {/* Image Area */}
                <div className="relative h-48 overflow-hidden">
                  <div className="absolute top-3 left-3 z-10">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur text-orange-600 text-xs font-bold rounded-full shadow-sm flex items-center gap-1">
                      {product.tag}
                    </span>
                  </div>
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                  {/* Gradient Overlay for text readability if needed, but here we keep it clean */}
                </div>

                {/* Content Area */}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-bold text-slate-800">{product.name}</h4>
                    <span className="text-xl font-bold text-orange-600 font-serif">${product.price}</span>
                  </div>

                  <p className="text-sm text-slate-500 leading-relaxed mb-6">
                    {product.desc}
                  </p>

                  {/* Action Area */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="text-xs text-slate-400 font-medium">
                      {t('menu.unit')}
                    </div>

                    <div className="flex items-center gap-3">
                      {cart[product.id] > 0 ? (
                        <div className="flex items-center bg-slate-900 rounded-full p-1 shadow-lg">
                          <button
                            onClick={() => updateCart(product.id, -1)}
                            className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-full text-white hover:bg-slate-700 transition"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-10 text-center font-bold text-white text-sm">{cart[product.id]}</span>
                          <button
                            onClick={() => updateCart(product.id, 1)}
                            className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-slate-900 hover:scale-105 transition"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => updateCart(product.id, 1)}
                          className="flex items-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-700 px-5 py-2.5 rounded-full text-sm font-bold transition-colors active:scale-95"
                        >
                          <Plus size={16} />
                          {t('menu.addToCart')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Checkout Form Section */}
        {totalQty > 0 && (
          <AuthGuard session={session}>
            <section className="bg-white p-6 rounded-3xl shadow-lg border border-orange-100 space-y-6 animate-in slide-in-from-bottom-8 duration-700">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <MapPin className="text-orange-500" size={20} />
                {t('checkout.title')}
              </h3>

              {/* Custom Toggle */}
              <div className="bg-slate-100 p-1.5 rounded-2xl flex relative font-medium text-sm">
                <button
                  type="button"
                  onClick={() => setDeliveryType('pickup')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300 shadow-sm ${deliveryType === 'pickup' ? 'bg-white text-slate-900 shadow-md ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  <Store size={18} /> {t('checkout.pickup')}
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryType('delivery')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300 ${deliveryType === 'delivery' ? 'bg-white text-slate-900 shadow-md ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  <MapPin size={18} /> {t('checkout.delivery')}
                </button>
              </div>

              <div className="space-y-4">
                <div className="group">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block ml-1">{t('checkout.form.name')}</label>
                  <input
                    type="text"
                    name="name"
                    placeholder={t('checkout.form.namePlaceholder')}
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block ml-1">{t('checkout.form.phone')}</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder={t('checkout.form.phonePlaceholder')}
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                  />
                </div>

                {deliveryType === 'delivery' && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block ml-1">{t('checkout.form.address')}</label>
                    <textarea
                      name="address"
                      rows={2}
                      placeholder={t('checkout.form.addressPlaceholder')}
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all resize-none"
                    ></textarea>
                  </div>
                )}

                {submitError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <p className="text-sm text-red-700 font-medium">{submitError}</p>
                  </div>
                )}
              </div>
            </section>
          </AuthGuard>
        )}
      </main>

      {/* Sticky Checkout Bar */}
      {totalQty > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 safe-area-bottom">
          <div className="max-w-md mx-auto bg-slate-900/95 backdrop-blur-lg text-white p-2 pl-6 pr-2 rounded-[2rem] shadow-2xl flex items-center justify-between border border-white/10 animate-in slide-in-from-bottom-full duration-500">

            <div className="flex flex-col">
              <span className="text-xs text-slate-400 font-medium">{totalQty} {t('checkout.items')}</span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-orange-400">$</span>
                <span className="text-2xl font-bold tracking-tight">{totalPrice}</span>
              </div>
            </div>

            <AuthGuard
              session={session}
              fallback={
                <button
                  disabled
                  className="h-12 px-6 rounded-full font-bold flex items-center gap-2 bg-slate-700 text-slate-400 cursor-not-allowed"
                >
                  <span className="text-sm">Sign In Required</span>
                </button>
              }
            >
              <button
                onClick={handleSubmit}
                disabled={!formData.name || !formData.phone || isSubmitting}
                className={`h-12 px-6 rounded-full font-bold flex items-center gap-2 transition-all transform ${(!formData.name || !formData.phone || isSubmitting)
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-red-600 hover:scale-105 active:scale-95 shadow-lg shadow-orange-900/50'
                  }`}
              >
                {isSubmitting ? (
                  <>
                    <span className="text-sm">Submitting...</span>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </>
                ) : (!formData.name || !formData.phone) ? (
                  <span className="text-sm">{t('checkout.fillForm')}</span>
                ) : (
                  <>
                    <span className="text-sm">{t('checkout.checkout')}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </AuthGuard>
          </div>
        </div>
      )}
    </div>
  );
}