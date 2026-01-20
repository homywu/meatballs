
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

        // 3. Parse Amount logic
        // Example:
        // Funds Deposited!
        // $20.00
        const amountRegex = /Funds Deposited!\s*\$([\d,]+\.\d{2})/;
        const amountMatch = body_plain.match(amountRegex);

        if (!amountMatch) {
            console.log('Could not find amount in email body');
            // If we can't find amount, maybe we shouldn't fail immediately but warn?
            // For security, if we can't verify amount, we probably shouldn't verify payment?
            // Or maybe fallback to payload.amount if available?
            // Let's rely on body parsing as requested.
            return NextResponse.json({ error: 'Could not parse amount from email' }, { status: 400 });
        }

        const parsedAmountStr = amountMatch[1].replace(/,/g, ''); // Remove commas
        const parsedAmount = parseFloat(parsedAmountStr);

        console.log(`Parsed amount: ${parsedAmount}`);

        if (Math.abs(order.total_amount - parsedAmount) > 0.01) {
            console.log(`Amount mismatch. Order: ${order.total_amount}, Email: ${parsedAmount}`);
            return NextResponse.json({ error: 'Order amount does not match deposited amount' }, { status: 400 });
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
