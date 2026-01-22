import ScheduleForm from '@/components/admin/ScheduleForm';

export default async function NewSchedulePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    return (
        <div className="p-8 max-w-5xl mx-auto">
            <ScheduleForm locale={locale} />
        </div>
    );
}
