import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { getAdminStats } from '../actions';
import { Package, ShieldAlert } from 'lucide-react';

export default async function AdminPage({
    params
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const session = await auth();
    const t = await getTranslations();

    // Redirect to sign-in if not authenticated
    if (!session?.user) {
        redirect(`/${locale}`);
    }

    // Check admin role
    if (session.user.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] p-4">
                <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center space-y-4 border border-red-100">
                    <div className="flex justify-center">
                        <div className="bg-red-50 p-4 rounded-full">
                            <ShieldAlert className="w-12 h-12 text-red-500" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">Access Denied</h1>
                    <p className="text-slate-500">You do not have permission to view this page.</p>
                </div>
            </div>
        );
    }

    // Fetch stats
    const statsResult = await getAdminStats(locale);

    return (
        <div className="min-h-screen bg-[#FDFBF7] pb-8 font-sans">
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <ShieldAlert className="text-orange-600" size={24} />
                        Admin Dashboard
                    </h1>
                    <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                        {session.user.email}
                    </span>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Package className="text-orange-500" />
                        Unfulfilled Inventory Requirements
                    </h2>

                    {!statsResult.success ? (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
                            {statsResult.error || 'Failed to load statistics'}
                        </div>
                    ) : statsResult.data && statsResult.data.length > 0 ? (
                        <div className="space-y-4">
                            {statsResult.data.map((item: { name: string; quantity: number }, index: number) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <span className="font-medium text-slate-700 text-lg">{item.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-3xl font-bold text-orange-600">{item.quantity}</span>
                                        <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Bags</span>
                                    </div>
                                </div>
                            ))}
                            <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between items-center">
                                <span className="font-bold text-slate-600">Total Bags Needed</span>
                                <span className="text-4xl font-black text-slate-800">
                                    {statsResult.data.reduce((acc: number, item: { quantity: number }) => acc + item.quantity, 0)}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-slate-400">
                            <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No pending orders requiring fulfillment.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
