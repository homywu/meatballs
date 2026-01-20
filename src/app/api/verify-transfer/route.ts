
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    try {
        // 1. Verify Secret Token (Simple security)
        const authHeader = request.headers.get('Authorization');
        const SECRET_TOKEN = process.env.ETRANSFER_VERIFY_TOKEN || 'test-secret-token';

        if (authHeader !== `Bearer ${SECRET_TOKEN}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await request.json();
        const { body_plain, sender } = payload;
        console.log(`Received transfer notification from ${body_plain}`);

        // 2. Parse Reference Number from body
        // Expecting something like "Ref: CRAFT_ABC123" or just searching for the code with prefix
        // Let's search for the pattern.
        // Our pattern is 6 chars, uppercase alphanumeric (excluding I, O, 0, 1, Q as per generator)
        // Regex: \bCRAFT_[A-HJ-NP-Z2-9]{6}\b

        const refRegex = /\bCRAFT_[A-HJ-NP-Z2-9]{6}\b/;
        const match = body_plain.match(refRegex);

        if (!match) {
            console.log('No reference number found in email body');
            return NextResponse.json({ error: 'No reference number found' }, { status: 400 });
        }

        const referenceNumber = match[0];
        console.log(`Found reference number: ${referenceNumber} from sender: ${sender}`);

        // 3. Find Order
        const { data: order, error: findError } = await supabaseAdmin
            .from('orders')
            .select('id, status, total_amount')
            .eq('reference_number', referenceNumber)
            .single();

        if (findError || !order) {
            console.log(`Order not found for ref: ${referenceNumber}`);
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (order.status === 'paid' || order.status === 'completed') {
            return NextResponse.json({ message: 'Order already paid', order_id: order.id });
        }

        if (order.total_amount !== Number(payload.amount)) {
            return NextResponse.json({ error: 'Order amount does not match' }, { status: 400 });
        }

        // 4. Update Order Status
        const { error: updateError } = await supabaseAdmin
            .from('orders')
            .update({ status: 'paid' })
            .eq('id', order.id);

        if (updateError) {
            console.error('Failed to update order status:', updateError);
            return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Order verified and updated',
            order_id: order.id,
            new_status: 'paid'
        });

    } catch (error) {
        console.error('Error processing webhook:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
