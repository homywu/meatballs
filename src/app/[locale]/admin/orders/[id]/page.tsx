import OrderForm from '@/components/admin/OrderForm';
import { getAdminOrder } from '@/app/actions/admin';

export default async function OrderDetailPage({ params }: { params: Promise<{ locale: string, id: string }> }) {
    const { locale, id } = await params;
    const res = await getAdminOrder(id);

    if (!res.success || !res.data) {
        return (
            <div className="p-12 text-center">
                <h2 className="text-xl font-bold text-slate-800">Order not found</h2>
                <p className="text-slate-500">The requested order could not be loaded.</p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <OrderForm locale={locale} order={res.data} />
        </div>
    );
}
