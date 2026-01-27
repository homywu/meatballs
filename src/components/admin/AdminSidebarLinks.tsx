'use client';

import React from 'react';
import Link from 'next/link';
import { Package, Truck, LayoutDashboard, ShoppingCart } from 'lucide-react';

interface AdminSidebarLinksProps {
    locale: string;
    onLinkClick?: () => void;
}

export default function AdminSidebarLinks({ locale, onLinkClick }: AdminSidebarLinksProps) {
    const links = [
        {
            href: `/${locale}/admin`,
            label: 'Dashboard',
            icon: <LayoutDashboard size={20} />
        },
        {
            href: `/${locale}/admin/schedules`,
            label: 'Production Schedules',
            icon: <Package size={20} />
        },
        {
            href: `/${locale}/admin/orders`,
            label: 'Orders',
            icon: <ShoppingCart size={20} />
        },
        {
            href: `/${locale}/admin/delivery-options`,
            label: 'Delivery Options',
            icon: <Truck size={20} />
        }
    ];

    return (
        <nav className="p-4 space-y-1">
            {links.map((link) => (
                <Link
                    key={link.href}
                    href={link.href}
                    onClick={onLinkClick}
                    className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-orange-50 hover:text-orange-700 rounded-xl transition-colors font-medium text-sm md:text-base"
                >
                    {link.icon}
                    {link.label}
                </Link>
            ))}
        </nav>
    );
}
