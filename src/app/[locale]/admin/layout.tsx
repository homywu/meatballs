import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Package, Truck, LayoutDashboard, ShoppingCart } from 'lucide-react';

export default async function AdminLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const t = await getTranslations();

    return (
        <div className="flex min-h-screen bg-[#FDFBF7] pt-15">
            {/* Sidebar / Nav */}
            <aside className="w-64 bg-white border-r border-slate-200 hidden md:block fixed top-15 bottom-0 z-10 overflow-y-auto">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800">Admin Portal</h2>
                </div>
                <nav className="p-4 space-y-1">
                    <Link
                        href={`/${locale}/admin`}
                        className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-orange-50 hover:text-orange-700 rounded-xl transition-colors font-medium"
                    >
                        <LayoutDashboard size={20} />
                        Dashboard
                    </Link>
                    <Link
                        href={`/${locale}/admin/schedules`}
                        className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-orange-50 hover:text-orange-700 rounded-xl transition-colors font-medium"
                    >
                        <Package size={20} />
                        Production Schedules
                    </Link>
                    <Link
                        href={`/${locale}/admin/orders`}
                        className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-orange-50 hover:text-orange-700 rounded-xl transition-colors font-medium"
                    >
                        <ShoppingCart size={20} />
                        Orders
                    </Link>
                    <Link
                        href={`/${locale}/admin/delivery-options`}
                        className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-orange-50 hover:text-orange-700 rounded-xl transition-colors font-medium"
                    >
                        <Truck size={20} />
                        Delivery Options
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 md:ml-64">
                {children}
            </div>
        </div>
    );
}
