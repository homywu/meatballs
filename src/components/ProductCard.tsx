import React from 'react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { Plus, Minus } from 'lucide-react';
import type { Product } from '@/types/product';

interface ProductCardProps {
    product: Product;
    quantity: number;
    onUpdateCart: (id: string, delta: number) => void;
    remaining?: number;
}

export default function ProductCard({ product, quantity, onUpdateCart, remaining = 0 }: ProductCardProps) {
    const t = useTranslations();
    const locale = useLocale() as 'en' | 'zh';

    const productName = product.name[locale] || product.name.en;
    const productDesc = product.description[locale] || product.description.en;

    return (
        <div className="group bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100">
            {/* Image Area */}
            <div className="relative h-48 overflow-hidden">
                <div className="absolute top-3 left-3 right-3 z-10 flex justify-between items-center">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur text-orange-600 text-xs font-bold rounded-full shadow-sm flex items-center gap-1">
                        {product.tag[locale] || product.tag.en}
                    </span>
                    {remaining > 0 ? (
                        <span className="px-3 py-1 bg-green-100/90 backdrop-blur text-green-700 text-xs font-bold rounded-full shadow-sm">
                            {t('menu.remaining', { count: remaining })}
                        </span>
                    ) : (
                        <span className="px-3 py-1 bg-red-100/90 backdrop-blur text-red-700 text-xs font-bold rounded-full shadow-sm">
                            {t('menu.joinWaitlist')}
                        </span>
                    )}
                </div>
                <Image
                    src={product.image}
                    alt={productName}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 400px"
                />
            </div>

            {/* Content Area */}
            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-bold text-slate-800">{productName}</h4>
                    <span className="text-xl font-bold text-orange-600 font-serif">${product.price}</span>
                </div>

                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                    {productDesc}
                </p>

                {/* Action Area */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="text-xs text-slate-400 font-medium">
                        {t('menu.unit')}
                    </div>

                    <div className="flex items-center gap-3">
                        {quantity > 0 ? (
                            <div className="flex items-center bg-slate-900 rounded-full p-1 shadow-lg">
                                <button
                                    onClick={() => onUpdateCart(product.id, -1)}
                                    className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-full text-white hover:bg-slate-700 transition"
                                >
                                    <Minus size={14} />
                                </button>
                                <span className="w-10 text-center font-bold text-white text-sm">{quantity}</span>
                                <button
                                    onClick={() => onUpdateCart(product.id, 1)}
                                    className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-slate-900 hover:scale-105 transition"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => onUpdateCart(product.id, 1)}
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
    );
}
