'use server';

import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/server';
// We use 'any' for incoming payload validation simplicity in this draft, 
// but proper types should be used in production.
import type { DeliveryOption, ProductionSchedule } from '@/types/admin';
import type { Order } from '@/types/order';

async function checkAdmin() {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
        return null;
    }
    return session;
}

// --- Delivery Options ---

export async function getDeliveryOptions() {
    const session = await checkAdmin();
    if (!session) return { success: false, error: 'Unauthorized' };

    const { data, error } = await supabaseAdmin
        .from('delivery_options')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as DeliveryOption[] };
}

export async function upsertDeliveryOption(option: Partial<DeliveryOption>) {
    const session = await checkAdmin();
    if (!session) return { success: false, error: 'Unauthorized' };

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
    const session = await checkAdmin();
    if (!session) return { success: false, error: 'Unauthorized' };

    const { error } = await supabaseAdmin
        .from('delivery_options')
        .delete()
        .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true };
}

// --- Production Schedules ---

export async function getProductionSchedules() {
    const session = await checkAdmin();
    if (!session) return { success: false, error: 'Unauthorized' };

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
    const session = await checkAdmin();
    if (!session) return { success: false, error: 'Unauthorized' };

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
    const session = await checkAdmin();
    if (!session) return { success: false, error: 'Unauthorized' };

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
    const session = await checkAdmin();
    if (!session) return { success: false, error: 'Unauthorized' };

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
    // To sync deletions, we find existing IDs and delete those not present in the payload.
    const { data: existingDeliveries } = await supabaseAdmin
        .from('schedule_deliveries')
        .select('id')
        .eq('schedule_id', scheduleId);

    const existingIds = (existingDeliveries || []).map(d => d.id);
    const newDeliveries = payload.deliveries;
    const incomingIds = newDeliveries.map(d => d.id).filter(id => !!id);

    const idsToDelete = existingIds.filter(id => !incomingIds.includes(id));

    if (idsToDelete.length > 0) {
        const { error: delErr } = await supabaseAdmin
            .from('schedule_deliveries')
            .delete()
            .in('id', idsToDelete);

        if (delErr) {
            // Likely a foreign key constraint (orders pointing to this slot)
            console.error('Failed to delete delivery slots:', delErr);
            return {
                success: false,
                error: 'Cannot delete delivery slots that already have orders. Please cancel the orders first.'
            };
        }
    }

    // Upsert the remaining/new ones
    for (const del of newDeliveries) {
        const { error: upsertErr } = await supabaseAdmin
            .from('schedule_deliveries')
            .upsert({
                id: del.id, // undefined means new
                schedule_id: scheduleId,
                delivery_option_id: del.delivery_option_id,
                delivery_time: del.delivery_time,
                cutoff_time: del.cutoff_time
            });

        if (upsertErr) return { success: false, error: upsertErr.message };
    }

    return { success: true, data: scheduleId };
}

export async function deleteScheduleDelivery(id: string) {
    const session = await checkAdmin();
    if (!session) return { success: false, error: 'Unauthorized' };

    const { error } = await supabaseAdmin
        .from('schedule_deliveries')
        .delete()
        .eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
}

// --- Orders ---

export async function getAdminOrders(statusFilter?: string) {
    const session = await checkAdmin();
    if (!session) return { success: false, error: 'Unauthorized' };

    let query = supabaseAdmin
        .from('orders')
        .select(`
            *,
            items:order_items(
                *,
                product:products(*)
            ),
            schedule_delivery:schedule_deliveries(
                *,
                delivery_option:delivery_options(*)
            )
        `)
        .order('created_at', { ascending: false });

    if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Order[] };
}

export async function getAdminOrder(id: string) {
    const session = await checkAdmin();
    if (!session) return { success: false, error: 'Unauthorized' };

    const { data, error } = await supabaseAdmin
        .from('orders')
        .select(`
            *,
            items:order_items(
                *,
                product:products(*)
            ),
            schedule_delivery:schedule_deliveries(
                *,
                delivery_option:delivery_options(*)
            )
        `)
        .eq('id', id)
        .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Order };
}

export async function updateOrderStatus(id: string, newStatus: string) {
    const session = await checkAdmin();
    if (!session) return { success: false, error: 'Unauthorized' };

    // Valid statuses
    const validStatuses = ['pending', 'paid', 'completed', 'waitlist', 'cancelled'];
    if (!validStatuses.includes(newStatus)) {
        return { success: false, error: 'Invalid status value' };
    }

    // Fetch current order to check if status change is allowed
    const { data: order, error: fetchError } = await supabaseAdmin
        .from('orders')
        .select('status')
        .eq('id', id)
        .single();

    if (fetchError) return { success: false, error: fetchError.message };

    // Only allow status updates for pending, waitlist, or cancelled orders
    const editableStatuses = ['pending', 'waitlist', 'cancelled'];
    if (!editableStatuses.includes(order.status)) {
        return {
            success: false,
            error: `Cannot change status of ${order.status} orders. Only pending, waitlist, or cancelled orders can be modified.`
        };
    }

    const { error } = await supabaseAdmin
        .from('orders')
        .update({ status: newStatus })
        .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true };
}

export async function deleteOrder(id: string) {
    const session = await checkAdmin();
    if (!session) return { success: false, error: 'Unauthorized' };

    // Fetch current order to check if deletion is allowed
    const { data: order, error: fetchError } = await supabaseAdmin
        .from('orders')
        .select('status')
        .eq('id', id)
        .single();

    if (fetchError) return { success: false, error: fetchError.message };

    // Only allow deletion for non-paid and non-completed orders
    const protectedStatuses = ['paid', 'completed'];
    if (protectedStatuses.includes(order.status)) {
        return {
            success: false,
            error: `Cannot delete ${order.status} orders. Only pending, waitlist, or cancelled orders can be deleted.`
        };
    }

    const { error } = await supabaseAdmin
        .from('orders')
        .delete()
        .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true };
}
