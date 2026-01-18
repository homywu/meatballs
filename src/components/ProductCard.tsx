import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Plus, Minus } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    desc: string;
    price: number;
    tag: string;
    image: string;
}

interface ProductCardProps {
    product: Product;
    quantity: number;
    onUpdateCart: (id: string, delta: number) => void;
}

export default function ProductCard({ product, quantity, onUpdateCart }: ProductCardProps) {
    const t = useTranslations();

    return (
        <div className="group bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100">
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
