'use server';

import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/server';
// We use 'any' for incoming payload validation simplicity in this draft, 
// but proper types should be used in production.
import type { DeliveryOption, ProductionSchedule } from '@/types/admin';

async function checkAdmin() {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
        throw new Error('Unauthorized');
    }
    return session;
}

// --- Delivery Options ---

export async function getDeliveryOptions() {
    await checkAdmin();
    const { data, error } = await supabaseAdmin
        .from('delivery_options')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as DeliveryOption[] };
}

export async function upsertDeliveryOption(option: Partial<DeliveryOption>) {
    await checkAdmin();
    const { data, error } = await supabaseAdmin
        .from('delivery_options')
        .upsert({
            id: option.id,
            label: option.label,
            address: option.address,
            description: option.description,
            map_url: option.map_url,
            delivery_method: option.delivery_method
        })
        .select()
        .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data };
}

export async function deleteDeliveryOption(id: string) {
    await checkAdmin();
    const { error } = await supabaseAdmin
        .from('delivery_options')
        .delete()
        .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true };
}

// --- Production Schedules ---

export async function getProductionSchedules() {
    await checkAdmin();
    // Fetch schedules with joined products and deliveries
    const { data, error } = await supabaseAdmin
        .from('production_schedules')
        .select(`
      *,
      products:schedule_products(*),
      deliveries:schedule_deliveries(
        *,
        delivery_option:delivery_options(*)
      )
    `)
        .order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as ProductionSchedule[] };
}

export async function getProductionSchedule(id: string) {
    await checkAdmin();
    const { data, error } = await supabaseAdmin
        .from('production_schedules')
        .select(`
      *,
      products:schedule_products(*),
      deliveries:schedule_deliveries(
        *,
        delivery_option:delivery_options(*)
      )
    `)
        .eq('id', id)
        .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as ProductionSchedule };
}

export async function deleteProductionSchedule(id: string) {
    await checkAdmin();
    const { error } = await supabaseAdmin
        .from('production_schedules')
        .delete()
        .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true };
}

// Upsert logic for Schedule is complex (nested).
// We'll handle it by upserting the schedule, then replacing lines.
export async function upsertProductionSchedule(payload: {
    id?: string;
    status: string;
    notes?: string;
    products: { product_id: string; quantity: number }[];
    deliveries: {
        id?: string;
        delivery_option_id: string;
        delivery_time: string; // ISO
        cutoff_time?: string; // ISO
    }[];
}) {
    await checkAdmin();

    // 1. Upsert Schedule
    const { data: schedule, error: schedError } = await supabaseAdmin
        .from('production_schedules')
        .upsert({
            id: payload.id, // If undefined, creates new
            status: payload.status,
            notes: payload.notes
        })
        .select()
        .single();

    if (schedError) return { success: false, error: schedError.message };

    const scheduleId = schedule.id;

    // 2. Handle Products (Delete all and re-insert is easiest for 'replace' semantics, 
    // or explicit diffing. Let's do delete-all-for-schedule for simplicity in this MVP, 
    // assuming concurrency isn't high on editing SAME schedule).
    const { error: delProdError } = await supabaseAdmin
        .from('schedule_products')
        .delete()
        .eq('schedule_id', scheduleId);

    if (delProdError) return { success: false, error: delProdError.message };

    if (payload.products.length > 0) {
        const { error: insProdError } = await supabaseAdmin
            .from('schedule_products')
            .insert(payload.products.map(p => ({
                schedule_id: scheduleId,
                product_id: p.product_id,
                quantity: p.quantity
            })));
        if (insProdError) return { success: false, error: insProdError.message };
    }

    // 3. Handle Deliveries
    // We can't just delete all because Orders might reference them!
    // We should upsert based on ID if provided, insert if new, and delete if missing from payload?
    // Or just allow adding/updating. Removing a delivery slot that has orders is dangerous.
    // For MVP: We will upsert provided ones. We won't auto-delete missing ones to prevent data loss on orders.
    // The UI should implement explicit delete for delivery slots.

    for (const del of payload.deliveries) {
        await supabaseAdmin
            .from('schedule_deliveries')
            .upsert({
                id: del.id, // undefined means new
                schedule_id: scheduleId,
                delivery_option_id: del.delivery_option_id,
                delivery_time: del.delivery_time,
                cutoff_time: del.cutoff_time
            });
    }

    // Note: If the user deleted a slot in UI, we haven't handled it here. 
    // We need a explicit deleteDeliverySlot action or handle it via diffing.
    // For now, let's assume we stick to upserting.

    return { success: true, data: scheduleId };
}

export async function deleteScheduleDelivery(id: string) {
    await checkAdmin();
    const { error } = await supabaseAdmin
        .from('schedule_deliveries')
        .delete()
        .eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
}
