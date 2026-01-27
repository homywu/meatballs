import { getTranslations } from 'next-intl/server';
import AdminSidebarLinks from '@/components/admin/AdminSidebarLinks';
import MobileAdminNav from '@/components/admin/MobileAdminNav';

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
            {/* Desktop Sidebar / Nav */}
            <aside className="w-64 bg-white border-r border-slate-200 hidden md:block fixed top-15 bottom-0 z-10 overflow-y-auto">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800">Admin Portal</h2>
                </div>
                <AdminSidebarLinks locale={locale} />
            </aside>

            {/* Mobile Nav */}
            <MobileAdminNav locale={locale} />

            {/* Main Content */}
            <div className="flex-1 md:ml-64 mt-14 md:mt-0">
                {children}
            </div>
        </div>
    );
}
