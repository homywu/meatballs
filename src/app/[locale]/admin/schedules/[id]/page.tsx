import ScheduleForm from '@/components/admin/ScheduleForm';
import { getProductionSchedule } from '@/app/actions/admin';

export default async function EditSchedulePage({ params }: { params: Promise<{ locale: string, id: string }> }) {
    const { locale, id } = await params;
    const res = await getProductionSchedule(id);

    if (!res.success || !res.data) {
        return (
            <div className="p-12 text-center">
                <h2 className="text-xl font-bold text-slate-800">Schedule not found</h2>
                <p className="text-slate-500">The requested production schedule could not be loaded.</p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <ScheduleForm locale={locale} initialData={res.data} />
        </div>
    );
}
